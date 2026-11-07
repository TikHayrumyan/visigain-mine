import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appOrigin, DEFAULT_APP_ORIGIN, isAppHref, referralCode, withReferral } from "@/site/referral";

const jar = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.cookies.has(name) ? { name, value: jar.cookies.get(name)! } : undefined),
  }),
}));

const APP = DEFAULT_APP_ORIGIN;

afterEach(() => {
  jar.cookies.clear();
  vi.unstubAllEnvs();
});

describe("the referral code, checked as the backend checks it", () => {
  // The backend's own examples (tests/security/host-redirects.test.ts, src/server/referrals/carry.ts).
  it("keeps a code in upper case", () => {
    expect(referralCode("abcd2345")).toBe("ABCD2345");
    expect(referralCode("ABCD2345")).toBe("ABCD2345");
    expect(referralCode("ABCDEFGH")).toBe("ABCDEFGH");
    expect(referralCode("ZZZZ9999")).toBe("ZZZZ9999");
  });
  it("refuses anything that is not one: empty, short, long, escaped, or a letter growth's alphabet leaves out", () => {
    for (const v of [
      null,
      undefined,
      "",
      "abc",
      "ABC",
      "ABCD2345%3Cx%3E",
      "ABCD1345",
      "ABCD0345",
      "ABCDO345",
      "ABCDI345",
      "ABCDL345",
      "ABCD23456",
      " ABCD2345",
    ])
      expect(referralCode(v), String(v)).toBeNull();
  });
});

describe("a link to the app carries ?vg_ref=", () => {
  it("adds the code to an address on the app's host, keeping the rest of it", () => {
    expect(withReferral(`${APP}/checkout/full-report?scan=abc`, "abcd2345", APP)).toBe(
      `${APP}/checkout/full-report?scan=abc&vg_ref=ABCD2345`,
    );
    expect(withReferral(`${APP}/dashboard`, "ABCD2345", APP)).toBe(`${APP}/dashboard?vg_ref=ABCD2345`);
    expect(withReferral(`${APP}/checkout/monitoring#pay`, "ABCD2345", APP)).toBe(
      `${APP}/checkout/monitoring?vg_ref=ABCD2345#pay`,
    );
  });
  it("replaces a vg_ref the address already had with the visitor's own", () => {
    expect(withReferral(`${APP}/signin?vg_ref=ZZZZ9999`, "ABCD2345", APP)).toBe(`${APP}/signin?vg_ref=ABCD2345`);
  });
  it("leaves the address as it is without a valid code, and for any address not on the app's host", () => {
    for (const code of [null, "", "abc", "ABCD2345%3Cx%3E", "ABCD1345"])
      expect(withReferral(`${APP}/checkout/full-report`, code, APP)).toBe(`${APP}/checkout/full-report`);
    for (const href of [
      "/pricing",
      "https://visigain.com/scan",
      "https://app.visigain.com.example.test/checkout",
      "http://app.visigain.com/checkout",
      "mailto:hello@visigain.com",
      "not a url",
    ])
      expect(withReferral(href, "ABCD2345", APP)).toBe(href);
  });
  it("takes the app's origin from APP_ORIGIN (staging, a laptop), else app.visigain.com", () => {
    expect(appOrigin({})).toBe(APP);
    expect(appOrigin({ APP_ORIGIN: "http://127.0.0.1:3202/" })).toBe("http://127.0.0.1:3202");
    expect(appOrigin({ APP_ORIGIN: "javascript:alert(1)" })).toBe(APP);
    expect(appOrigin({ APP_ORIGIN: "nonsense" })).toBe(APP);
    expect(isAppHref("http://127.0.0.1:3202/checkout", appOrigin({ APP_ORIGIN: "http://127.0.0.1:3202" }))).toBe(true);
  });
});

describe("AppLink: the visitor's own cookie, read on the server", () => {
  const render = async (href: string) => {
    const { AppLink } = await import("@/components/app-link");
    return renderToStaticMarkup(await AppLink({ href, className: "button", children: "x" }));
  };
  it("adds a valid vg_ref cookie's code, upper case", async () => {
    jar.cookies.set("vg_ref", "abcd2345");
    expect(await render(`${APP}/checkout/full-report?scan=t0k3n`)).toBe(
      `<a href="${APP}/checkout/full-report?scan=t0k3n&amp;vg_ref=ABCD2345" class="button">x</a>`,
    );
  });
  it("adds nothing without the cookie, or with one that is not a code", async () => {
    expect(await render(`${APP}/dashboard`)).toBe(`<a href="${APP}/dashboard" class="button">x</a>`);
    jar.cookies.set("vg_ref", "ABCD1345");
    expect(await render(`${APP}/dashboard`)).toBe(`<a href="${APP}/dashboard" class="button">x</a>`);
  });
  it("follows APP_ORIGIN", async () => {
    vi.stubEnv("APP_ORIGIN", "http://127.0.0.1:3202");
    jar.cookies.set("vg_ref", "ABCD2345");
    expect(await render("http://127.0.0.1:3202/checkout/monitoring")).toBe(
      '<a href="http://127.0.0.1:3202/checkout/monitoring?vg_ref=ABCD2345" class="button">x</a>',
    );
    expect(await render(`${APP}/checkout/monitoring`)).toBe(
      `<a href="${APP}/checkout/monitoring" class="button">x</a>`,
    );
  });
});

describe("every link to the app goes through AppLink", () => {
  const SRC = path.resolve(import.meta.dirname, "../src");
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) =>
      statSync(path.join(dir, n)).isDirectory() ? files(path.join(dir, n)) : [path.join(dir, n)],
    );
  it("no file of src but src/site/referral.ts writes the app's address (the generated contract's comments aside)", () => {
    const writers = files(SRC)
      .filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes(`${path.sep}generated${path.sep}`))
      .filter((f) => /app\.visigain\.com/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC, f).split(path.sep).join("/"));
    expect(writers).toEqual(["site/referral.ts"]);
  });
});
