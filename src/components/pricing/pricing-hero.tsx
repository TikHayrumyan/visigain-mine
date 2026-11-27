import { HeroSurface } from "@/components/home/hero/hero-surface";
import { PAGE_PLANS, withApiPrices } from "@/components/home/plans/catalog";
import { Plans } from "@/components/home/plans/plans";
import type { LivePricing } from "@/lib/api/pricing";

const TITLE = "Pick how far you want to go";

/** Characters finish inside the first 0.65s; the subtitle rises over the rest of the first second. */
const TYPE_WINDOW_MS = 650;

function prepaidNote(pricing: LivePricing | null): string {
  const monthly = pricing?.monitoring ?? "$149";
  const six = pricing?.sixMonths ?? "$790";
  const year = pricing?.year ?? "$1,490";

  return `Also available paid in advance: ${six} for 6 months or ${year} for 12 months, plus tax if tax applies. At the end of a prepaid term the plan continues monthly at the then-current price, currently ${monthly} a month, until you cancel. You can cancel online at visigain.com/account.`;
}

/**
 * The dark panel, the typed title and the four plan cards. The panel is 549px, so the cards
 * finish on the page background, the same way the frame draws them. The compact header watches it.
 */
export function PricingHero({ pricing }: { pricing: LivePricing | null }) {
  const plans = pricing ? withApiPrices(PAGE_PLANS, pricing) : PAGE_PLANS;
  return (
    <section className="bg-bg">
      <HeroSurface
        aria-labelledby="pricing-title"
        className="relative mx-2 mt-2 overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:w-full lg:overflow-visible lg:rounded-none"
        panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:bottom-auto lg:h-[549px] lg:rounded-panel"
      >
        <div
          data-theme="dark"
          className="relative z-10 flex flex-col items-start px-4 pt-26.5 pb-12 text-left lg:mx-auto lg:w-full lg:max-w-200 lg:items-center lg:px-0 lg:pt-44 lg:pb-0 lg:text-center"
        >
          <h1
            id="pricing-title"
            aria-label={TITLE}
            className="font-display text-display-s whitespace-pre-wrap text-fg lg:text-display-m"
          >
            <span aria-hidden>
              {[...TITLE].map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  className="faq-char"
                  style={{ animationDelay: `${(index / TITLE.length) * TYPE_WINDOW_MS}ms` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>
          <p className="faq-subtitle mt-4 text-body-l text-muted">
            Start free. Upgrade when you want the full report or someone to do the work.
          </p>
        </div>
        <div className="relative z-10 mx-auto lg:max-w-360 hidden w-full px-30 lg:mt-14 lg:block">
          <Plans plans={plans} bare />
        </div>
      </HeroSurface>
      <div className="mx-auto mt-10 w-full max-w-360 px-5 lg:hidden">
        <Plans plans={plans} bare />
      </div>
      <div className="mx-auto mt-7 w-full max-w-360 px-5 lg:mt-14 lg:px-30">
        <p className="mx-auto max-w-200  lg:text-center text-body-l text-muted">{prepaidNote(pricing)}</p>
      </div>
    </section>
  );
}
