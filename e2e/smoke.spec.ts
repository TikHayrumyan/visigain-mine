import { expect, test } from "@playwright/test";
import { THEME } from "../src/brand/tokens";
import { readFileSync } from "node:fs";

const example = <T>(name: string): T =>
  (JSON.parse(readFileSync(`api/examples/${name}.json`, "utf8")) as { value: T }).value;
const words = example<{ entries: Record<string, string> }>("wordings.en").entries;
const pricing = example<{ fullReport: { amountCents: number }; monitoring: { amountCents: number } }>("pricing");

/** "#FAF6EE" -> "rgb(250, 246, 238)", as getComputedStyle writes it. */
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const money = (cents: number) => `$${cents / 100}`;

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 375, height: 812 },
] as const;

for (const scheme of ["light", "dark"] as const) {
  for (const vp of VIEWPORTS) {
    test(`the example page renders from the mock: ${scheme}, ${vp.width} px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize(vp);
      const res = await page.goto("/example");
      expect(res?.status()).toBe(200);

      // The words come from the wordings API by key.
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(words["site.home.get_your_free_grade"]!);
      await expect(page.getByText(words["site.home.see_how_your_business_shows_up"]!)).toBeVisible();
      await expect(page.getByRole("group", { name: words["common.theme_toggle.theme"]! })).toBeVisible();

      // The prices come from GET /pricing.
      await expect(page.getByTestId("price-report")).toContainText(money(pricing.fullReport.amountCents));
      await expect(page.getByTestId("price-monitoring")).toContainText(
        words["dashboard.overview.a_month"]!.replace("{price}", money(pricing.monitoring.amountCents)),
      );

      // The theme follows the device, with the tokens' colours.
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg).toBe(rgb(THEME[scheme].bg));
      const fg = await page.evaluate(() => getComputedStyle(document.body).color);
      expect(fg).toBe(rgb(THEME[scheme].fg));

      // Self-hosted Poppins (next/font names it after the family), and no sideways scroll.
      expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/poppins/i);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

test("the theme switch stores the choice and the page comes back in it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/example");
  await page.locator('[data-theme-option="dark"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page).toHaveURL(/\/example$/);
  await expect(page.locator('[data-theme-option="dark"]')).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(rgb(THEME.dark.bg));

  await page.locator('[data-theme-option="system"]').click();
  await expect(page.locator('[data-theme-option="system"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(rgb(THEME.light.bg));
});

test("the footer carries Your Privacy Choices and Cookie settings, by their keys, to /privacy-choices", async ({
  page,
}) => {
  await page.goto("/example");
  const footer = page.getByTestId("privacy-footer");
  for (const key of ["common.legal_links.your_privacy_choices", "common.legal_links.cookie_settings"]) {
    const link = footer.locator(`a[data-footer-link="${key}"]`);
    await expect(link).toHaveText(words[key]!);
    await expect(link).toHaveAttribute("href", "/privacy-choices");
  }
});

test("API calls from the browser stay on the page's own origin", async ({ page }) => {
  await page.goto("/example");
  const answer = await page.evaluate(async () => {
    const r = await fetch("/api/v1/site");
    return { status: r.status, holding: ((await r.json()) as { holding: boolean }).holding };
  });
  expect(answer).toEqual({ status: 200, holding: false });
});

test("Next's files load from /fe/_next (the asset prefix) and every answer says x-served-by: frontend", async ({
  page,
}) => {
  const files: { url: string; status: number }[] = [];
  page.on("response", (r) => {
    if (new URL(r.url()).pathname.includes("/_next/")) files.push({ url: r.url(), status: r.status() });
  });
  const res = await page.goto("/example");
  expect(res?.headers()["x-served-by"]).toBe("frontend");
  await page.waitForLoadState("networkidle");

  const paths = files.map((f) => new URL(f.url).pathname);
  expect(paths.length).toBeGreaterThan(0);
  // Not one file from the bare /_next/: the load balancer sends that to the backend.
  expect(paths.filter((p) => !p.startsWith("/fe/_next/"))).toEqual([]);
  expect(files.filter((f) => f.status !== 200)).toEqual([]);

  const one = await page.request.get(paths.find((p) => p.startsWith("/fe/_next/static/"))!);
  expect(one.status()).toBe(200);
  expect(one.headers()["x-served-by"]).toBe("frontend");
});
