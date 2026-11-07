import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Schemas } from "@/api/client";
import { DEFAULT_APP_ORIGIN } from "@/site/referral";
import { fullReportCheckoutHref, monitoringCheckoutHref } from "@/site/checkout-links";
import { createT } from "@/wordings/t";
import catalogue from "../api/examples/wordings.en.json";
import pricingExample from "../api/examples/pricing.json";

/**
 * The scan result's links to the app's checkout (src/site/checkout-links.ts): the backend's scan result's own paths
 * and query (/checkout/report?domain=, /checkout/monitoring?domain=), plus ?vg_ref= only for a valid code. Invented
 * domains and codes.
 */
const jar = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.cookies.has(name) ? { name, value: jar.cookies.get(name)! } : undefined),
  }),
}));

const APP = DEFAULT_APP_ORIGIN;
const scan = { lead: { domain: "example-spa.test", category: null, createdAt: "2026-11-05T17:58:00Z" } };

afterEach(() => {
  jar.cookies.clear();
  vi.unstubAllEnvs();
});

describe("the two checkout addresses", () => {
  it("are the backend's pay pages on the app's host, with the business's domain", () => {
    expect(fullReportCheckoutHref(scan)).toBe(`${APP}/checkout/report?domain=example-spa.test`);
    expect(monitoringCheckoutHref(scan)).toBe(`${APP}/checkout/monitoring?domain=example-spa.test`);
  });
  it("encode the domain as a query value", () => {
    const odd = { lead: { ...scan.lead, domain: "example-spa.test/a b&c" } };
    expect(fullReportCheckoutHref(odd)).toBe(`${APP}/checkout/report?domain=example-spa.test%2Fa+b%26c`);
  });
  it("leave the query out without a domain", () => {
    const none = { lead: { ...scan.lead, domain: "" } };
    expect(fullReportCheckoutHref(none)).toBe(`${APP}/checkout/report`);
    expect(monitoringCheckoutHref(none)).toBe(`${APP}/checkout/monitoring`);
  });
  it("add ?vg_ref= for a valid code, upper case", () => {
    expect(fullReportCheckoutHref(scan, { ref: "abcd2345" })).toBe(
      `${APP}/checkout/report?domain=example-spa.test&vg_ref=ABCD2345`,
    );
    expect(monitoringCheckoutHref(scan, { ref: "ABCD2345" })).toBe(
      `${APP}/checkout/monitoring?domain=example-spa.test&vg_ref=ABCD2345`,
    );
  });
  it("drop a code that is not one", () => {
    for (const ref of [null, undefined, "", "abc", "ABCD1345", "ABCD2345%3Cx%3E"]) {
      expect(fullReportCheckoutHref(scan, { ref }), String(ref)).toBe(`${APP}/checkout/report?domain=example-spa.test`);
      expect(monitoringCheckoutHref(scan, { ref }), String(ref)).toBe(
        `${APP}/checkout/monitoring?domain=example-spa.test`,
      );
    }
  });
  it("follow APP_ORIGIN, or the origin given", () => {
    vi.stubEnv("APP_ORIGIN", "http://127.0.0.1:3202");
    expect(fullReportCheckoutHref(scan)).toBe("http://127.0.0.1:3202/checkout/report?domain=example-spa.test");
    expect(monitoringCheckoutHref(scan, { app: "http://127.0.0.1:3002", ref: "ABCD2345" })).toBe(
      "http://127.0.0.1:3002/checkout/monitoring?domain=example-spa.test&vg_ref=ABCD2345",
    );
  });
});

describe("ScanResultCheckoutLinks", () => {
  const t = createT(catalogue.value.entries as Record<string, string>);
  const render = async (pricing: Schemas["Pricing"]) => {
    const { ScanResultCheckoutLinks } = await import("@/components/scan-result-checkout-links");
    const stream = await renderToReadableStream(<ScanResultCheckoutLinks scan={scan} pricing={pricing} t={t} />);
    await stream.allReady;
    return new Response(stream).text();
  };
  const pricing = pricingExample.value as Schemas["Pricing"];

  it("draws the two buttons by their keys, each an AppLink carrying the visitor's vg_ref", async () => {
    jar.cookies.set("vg_ref", "abcd2345");
    const html = await render(pricing);
    expect(html).toContain(`href="${APP}/checkout/report?domain=example-spa.test&amp;vg_ref=ABCD2345"`);
    expect(html).toContain(`href="${APP}/checkout/monitoring?domain=example-spa.test&amp;vg_ref=ABCD2345"`);
    expect(html).toContain(`>${t("site.scan.get_the_full_report", { price: "$99" })}</a>`);
    expect(html).toContain(`>${t("site.offer.start_monitoring")}</a>`);
  });
  it("adds nothing without a valid cookie", async () => {
    jar.cookies.set("vg_ref", "ABCD1345");
    const html = await render(pricing);
    expect(html).not.toContain("vg_ref");
  });
  it("leaves Monitoring out while its price is hidden", async () => {
    const html = await render({ ...pricing, monitoring: { ...pricing.monitoring, priceShown: false } });
    expect(html).toContain("/checkout/report?");
    expect(html).not.toContain("/checkout/monitoring");
  });
});
