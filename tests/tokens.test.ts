import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as tokens from "@/styles/tokens";
// @ts-expect-error: a plain .mjs script, without types.
import { generatedCss } from "../scripts/tokens-build.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(ts|tsx|css)$/.test(e.name) ? [p] : [];
  });
}

describe("tokens", () => {
  it("the stylesheet's generated regions match src/styles/tokens.ts (run `pnpm tokens`)", () => {
    const css = readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8").replace(/\r\n/g, "\n");
    expect((generatedCss as (c: string, t: unknown) => string)(css, tokens)).toBe(css);
  });

  it("writes a colour value only in the token file and the stylesheet it generates", () => {
    const allowed = new Set([path.join(ROOT, "src/styles/tokens.ts"), path.join(ROOT, "src/app/globals.css")]);
    const offenders = files(path.join(ROOT, "src"))
      .filter((f) => !allowed.has(f))
      .filter((f) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });
});
