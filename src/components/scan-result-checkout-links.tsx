import type { Schemas } from "@/api/client";
import { AppLink } from "@/components/app-link";
import { formatMoney } from "@/lib/money";
import { fullReportCheckoutHref, monitoringCheckoutHref, type CheckoutScan } from "@/site/checkout-links";
import type { T } from "@/wordings/t";

/**
 * The scan result's two buttons to the app's checkout (src/site/checkout-links.ts), for the developer to drop into
 * /scan/[token] once the grade is ready. Both are AppLinks, so each carries the visitor's `?vg_ref=`.
 *
 * The words are the backend's own scan result's and pricing's keys, nothing new: "Get the Full Report ({price})"
 * (site.scan.get_the_full_report, the price from GET /pricing, never typed) and "Start monitoring"
 * (site.offer.start_monitoring). Monitoring shows only when GET /pricing shows its price (`monitoring.priceShown`),
 * as the backend's pricing cards do. Unstyled apart from tokens: the report's is the view's one green button.
 */
export function ScanResultCheckoutLinks({
  scan,
  pricing,
  t,
}: {
  scan: CheckoutScan;
  pricing: Schemas["Pricing"];
  t: T;
}) {
  return (
    <div className="flex flex-wrap gap-stack" data-testid="scan-checkout-links">
      <AppLink
        href={fullReportCheckoutHref(scan)}
        className="rounded-button bg-green px-4 py-2 text-ink"
        data-testid="checkout-full-report"
      >
        {t("site.scan.get_the_full_report", { price: formatMoney(pricing.fullReport.amountCents, pricing.currency) })}
      </AppLink>
      {pricing.monitoring.priceShown ? (
        <AppLink
          href={monitoringCheckoutHref(scan)}
          className="rounded-button border border-line-strong px-4 py-2 text-fg"
          data-testid="checkout-monitoring"
        >
          {t("site.offer.start_monitoring")}
        </AppLink>
      ) : null}
    </div>
  );
}
