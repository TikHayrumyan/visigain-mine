import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FRONTEND_FORWARD_KEY signs the visitor's address on this server's calls (src/api/visitor.ts). Neither the key nor
 * its name may reach the browser: every source file that names it is server-only, and the built browser files
 * (.next/static, after `pnpm build`) do not contain the name.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const NAME = "FRONTEND_FORWARD_KEY";

function files(dir: string, keep: (f: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full, keep) : keep(full) ? [full] : [];
  });
}

describe("the forward key stays on the server", () => {
  it("every source file that names it imports server-only, and none is a client component or a NEXT_PUBLIC_ variable", () => {
    const naming = files(path.join(ROOT, "src"), (f) => /\.(ts|tsx)$/.test(f)).filter((f) =>
      readFileSync(f, "utf8").includes(NAME),
    );
    expect(naming.map((f) => path.relative(ROOT, f).replace(/\\/g, "/")).sort()).toEqual([
      "src/api/server.ts",
      "src/api/visitor.ts",
    ]);
    for (const f of naming) {
      const text = readFileSync(f, "utf8");
      expect(text, f).toMatch(/^import "server-only";$/m);
      expect(text, f).not.toMatch(/^["']use client["'];?$/m);
    }
    expect(readFileSync(path.join(ROOT, "next.config.ts"), "utf8")).not.toContain(NAME);
    for (const f of files(path.join(ROOT, "src"), (x) => /\.(ts|tsx)$/.test(x)))
      expect(readFileSync(f, "utf8"), f).not.toContain(`NEXT_PUBLIC_${NAME}`);
  });

  const built = path.join(ROOT, ".next", "static");
  it.skipIf(!existsSync(built))(
    "the built browser files (.next/static, after pnpm build) do not contain its name",
    () => {
      const all = files(built, (f) => /\.(js|mjs|css|html|json|map)$/.test(f));
      expect(all.length).toBeGreaterThan(0);
      for (const f of all) expect(readFileSync(f, "utf8").includes(NAME), path.relative(ROOT, f)).toBe(false);
      // The header's name neither: the browser never signs or sends it.
      for (const f of all)
        expect(readFileSync(f, "utf8").includes("x-visigain-visitor"), path.relative(ROOT, f)).toBe(false);
    },
  );
});
