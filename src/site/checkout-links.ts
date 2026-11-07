/**
 * The scan result's two links to the app's checkout, as the backend's own scan result builds them today
 * (src/app/(site)/scan/[token]/page.tsx and src/server/checkout/pay-first.ts, backend main 4c2c190d): the business's
 * domain as `?domain=`, which both pay pages read to fill their Website field. Not the scan token: the pay pages do
 * not read one. `/checkout/**` is on the app's host (the backend's deploy/host-paths.mjs).
 *
 *   Full Report  <app>/checkout/report?domain=<lead.domain>
 *   Monitoring   <app>/checkout/monitoring?domain=<lead.domain>
 *
 * Plus `?vg_ref=<code>` when a valid code is given (`withReferral`); AppLink adds the visitor's own the same way, so a
 * page passes the bare address to AppLink and the code only matters to a caller outside a render. Pure: no Next import.
 */
import type { Schemas } from "@/api/client";
import { appOrigin, withReferral } from "./referral";

/** What the links need of GET /scans/{token}'s answer: the business's domain. */
export type CheckoutScan = Pick<Schemas["FreeScanView"], "lead">;

export interface CheckoutHrefOptions {
  /** The app's origin; appOrigin(process.env)'s when left out. */
  app?: string;
  /** A referral code to add as `?vg_ref=`; anything that is not a valid code adds nothing. */
  ref?: string | null;
}

/** The pay pages' entry paths on the app's host. */
export const CHECKOUT_PATHS = { report: "/checkout/report", monitoring: "/checkout/monitoring" } as const;

function checkoutHref(path: string, scan: CheckoutScan, opts: CheckoutHrefOptions): string {
  const app = opts.app ?? appOrigin(process.env);
  const u = new URL(path, app);
  if (scan.lead.domain) u.searchParams.set("domain", scan.lead.domain);
  return withReferral(u.toString(), opts.ref, app);
}

/** The scan result's "Get the Full Report" button: <app>/checkout/report?domain=<domain>[&vg_ref=<code>]. */
export function fullReportCheckoutHref(scan: CheckoutScan, opts: CheckoutHrefOptions = {}): string {
  return checkoutHref(CHECKOUT_PATHS.report, scan, opts);
}

/** The scan result's Monitoring button: <app>/checkout/monitoring?domain=<domain>[&vg_ref=<code>]. */
export function monitoringCheckoutHref(scan: CheckoutScan, opts: CheckoutHrefOptions = {}): string {
  return checkoutHref(CHECKOUT_PATHS.monitoring, scan, opts);
}
