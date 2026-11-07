import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/money";
import { showsHoldingPage, SITE_UNREACHABLE } from "@/site/holding";
import { parseTheme, safeBack } from "@/theme/theme";
import holding from "../api/examples/site-holding.json";
import open from "../api/examples/site-open.json";

describe("the holding switch (GET /site)", () => {
  it("shows nothing different while the site is open", () => {
    expect(showsHoldingPage(open.value, "/example")).toBe(false);
  });

  it("while holding, serves only holdingPages and shows the holding page everywhere else", () => {
    expect(showsHoldingPage(holding.value, "/")).toBe(false);
    expect(showsHoldingPage(holding.value, "/pricing")).toBe(false);
    expect(showsHoldingPage(holding.value, "/pricing/")).toBe(false);
    expect(showsHoldingPage(holding.value, "/terms?x=1")).toBe(false);
    expect(showsHoldingPage(holding.value, "/example")).toBe(true);
    expect(showsHoldingPage(holding.value, "/dashboard")).toBe(true);
  });

  it("fails closed when the switches cannot be read", () => {
    expect(showsHoldingPage(SITE_UNREACHABLE, "/")).toBe(true);
  });
});

describe("the theme", () => {
  it("reads only light or dark from the cookie; anything else is the system's", () => {
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("blue")).toBe("system");
    expect(parseTheme(undefined)).toBe("system");
  });

  it("returns only to a path on this site", () => {
    expect(safeBack("/example")).toBe("/example");
    expect(safeBack("//evil.test")).toBe("/");
    expect(safeBack("/\\evil.test")).toBe("/");
    expect(safeBack("https://evil.test")).toBe("/");
    expect(safeBack(null)).toBe("/");
  });
});

describe("money", () => {
  it("writes cents as the locale writes money", () => {
    expect(formatMoney(9900, "usd")).toBe("$99");
    expect(formatMoney(14950, "usd")).toBe("$149.50");
  });
});
