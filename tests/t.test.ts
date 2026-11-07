import { afterEach, describe, expect, it } from "vitest";
import { createT, defaultShowMissingKeys, fill, setMissingKeyHandler } from "@/wordings/t";
import catalogue from "../api/examples/wordings.en.json";

const entries: Record<string, string> = catalogue.value.entries;

describe("t()", () => {
  afterEach(() => {
    // tests/setup.ts makes a missing key throw; a test that swaps the handler puts it back.
    setMissingKeyHandler((key) => {
      throw new Error(`missing wording key "${key}"`);
    });
  });

  it("draws a sentence by its key", () => {
    const t = createT(entries);
    expect(t("site.home.get_your_free_grade")).toBe(entries["site.home.get_your_free_grade"]);
  });

  it("fills {name} and [name] placeholders, formatting numbers for the locale", () => {
    const t = createT({ "x.count": "[n] of {total} in [city]" }, { locale: "en-US" });
    expect(t("x.count", { n: 3, total: 12000, city: "Austin" })).toBe("3 of 12,000 in Austin");
    expect(createT(entries)("dashboard.overview.a_month", { price: "$149" })).toBe("$149 a month.");
  });

  it("takes a Wording from an API response, key alone or with its params", () => {
    const t = createT(entries);
    const line = t({ key: "site.pricing.limits_line", params: { locations: 1, chat: 200, pages: 4, posts: 2 } });
    expect(line).toContain("200");
    expect(line).not.toMatch(/\[|\{/);
    expect(t("site.home.see_how_your_business_shows_up")).toBe(entries["site.home.see_how_your_business_shows_up"]);
  });

  it("leaves a placeholder without a value as it is", () => {
    expect(fill("number [n] in line", {})).toBe("number [n] in line");
    expect(fill("number [n] in line", undefined)).toBe("number [n] in line");
  });

  it("fails a test on a missing key", () => {
    const t = createT(entries);
    expect(() => t("site.no_such_key")).toThrow(/missing wording key "site.no_such_key"/);
  });

  it("renders a missing key as the key in development and with the mock, and as nothing in production", () => {
    const missing: string[] = [];
    setMissingKeyHandler((key) => missing.push(key));
    expect(createT(entries, { showMissingKeys: true })("site.absent")).toBe("site.absent");
    expect(createT(entries, { showMissingKeys: false })("site.absent")).toBe("");
    expect(missing).toEqual(["site.absent", "site.absent"]);
    expect(defaultShowMissingKeys({ NODE_ENV: "development" })).toBe(true);
    expect(defaultShowMissingKeys({ NODE_ENV: "production", MOCK: "1" })).toBe(true);
    expect(defaultShowMissingKeys({ NODE_ENV: "production" })).toBe(false);
  });
});
