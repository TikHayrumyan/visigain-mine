import { publicApi } from "@/api/server";
import { formatMoney } from "@/lib/money";
import { getT } from "@/wordings/server";

/**
 * The wiring proof, not a designed page: a few wordings by key, and the prices from GET /api/v1/pricing (never typed).
 * Delete it once the first real page exists.
 */
export default async function ExamplePage() {
  const [t, pricing] = await Promise.all([getT(), publicApi().GET("/api/v1/pricing")]);
  const prices = pricing.data;
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-site px-4 pb-section">
      <h1 className="text-title">{t("site.home.get_your_free_grade")}</h1>
      <p className="mt-stack text-lead text-muted">{t("site.home.see_how_your_business_shows_up")}</p>

      {prices ? (
        <section className="mt-section grid gap-stack sm:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-panel" data-testid="price-report">
            <p className="text-label">{t("common.shared.full_report")}</p>
            <p className="text-figure-large">{formatMoney(prices.fullReport.amountCents, prices.currency)}</p>
          </div>
          <div className="rounded-card border border-line bg-surface p-panel" data-testid="price-monitoring">
            <p className="text-label">{t("common.shared.monitoring")}</p>
            {prices.monitoring.priceShown ? (
              <p className="text-figure-large">
                {t("dashboard.overview.a_month", {
                  price: formatMoney(prices.monitoring.amountCents, prices.currency),
                })}
              </p>
            ) : null}
          </div>
          {prices.fairUse ? (
            <ul aria-label={t(prices.fairUse.title)} className="text-body text-muted sm:col-span-2">
              {prices.fairUse.lines.map((line, i) => (
                <li key={i}>{t(line)}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : (
        <p role="alert" className="mt-section text-danger">
          {t(pricing.error.error.message_key)}
        </p>
      )}
    </main>
  );
}
