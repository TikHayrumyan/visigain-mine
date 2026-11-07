import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AWAITING_BACKEND } from "@/wordings/awaiting-backend";

/**
 * Every wording key written in src must exist in the catalogue: here, the contract's catalogue examples
 * (api/examples/wordings*.json: the backend's real approved export, refreshed by `pnpm api:sync`), or be listed in src/wordings/awaiting-backend.ts as
 * asked of Backend. A key is any string literal of the form `<namespace>.<rest>`.
 */
const ROOT = path.resolve(import.meta.dirname, "..");
const NAMESPACES = ["site", "dashboard", "checkout", "account", "auth", "common", "errors"];
const KEY = new RegExp(`["'\`]((?:${NAMESPACES.join("|")})\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*)["'\`]`, "g");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "api" && dir.endsWith("src") ? [] : files(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

function catalogueKeys(): Set<string> {
  const dir = path.join(ROOT, "api/examples");
  const keys = new Set<string>();
  for (const f of readdirSync(dir).filter((n) => /^wordings[.-].*\.json$/.test(n))) {
    const example = JSON.parse(readFileSync(path.join(dir, f), "utf8")) as {
      value: { entries: Record<string, string> };
    };
    for (const k of Object.keys(example.value.entries)) keys.add(k);
  }
  return keys;
}

function usedKeys(): Map<string, string> {
  const used = new Map<string, string>();
  for (const f of files(path.join(ROOT, "src"))) {
    if (f.endsWith(path.join("wordings", "awaiting-backend.ts"))) continue;
    // Comments name keys as examples; only code counts.
    const code = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    for (const m of code.matchAll(KEY)) used.set(m[1]!, path.relative(ROOT, f));
  }
  return used;
}

describe("wording keys", () => {
  const known = catalogueKeys();
  const awaiting = new Set(AWAITING_BACKEND);

  it("finds the catalogue examples and the keys the app uses", () => {
    expect(known.size).toBeGreaterThan(0);
    expect(usedKeys().size).toBeGreaterThan(0);
  });

  it("uses no key the catalogue lacks, unless it is asked of Backend", () => {
    const missing = [...usedKeys()].filter(([k]) => !known.has(k) && !awaiting.has(k)).map(([k, f]) => `${k} (${f})`);
    expect(
      missing,
      "missing wording keys: ask Backend, add them to awaiting-backend.ts, never type the sentence",
    ).toEqual([]);
  });

  it("lists as awaiting only keys the catalogue does not have yet, and only keys still used", () => {
    const used = usedKeys();
    expect(
      AWAITING_BACKEND.filter((k) => known.has(k)),
      "now in the catalogue: remove from awaiting-backend.ts",
    ).toEqual([]);
    expect(
      AWAITING_BACKEND.filter((k) => !used.has(k)),
      "no longer used: remove from awaiting-backend.ts",
    ).toEqual([]);
  });
});
