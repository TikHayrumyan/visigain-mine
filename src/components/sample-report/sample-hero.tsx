import { HeroSurface } from "@/components/home/hero/hero-surface";

const TITLE = "A sample report";

/** Characters finish inside the first 0.65s; the subtitle rises over the rest of the first second. */
const TYPE_WINDOW_MS = 650;

/**
 * The dark panel and the typed title. The panel is 350px on a wide screen and 250px on a phone.
 * The compact header watches it.
 */
export function SampleHero() {
  return (
    <HeroSurface
      aria-labelledby="sample-title"
      className="relative mx-2 mt-2 min-h-62.5 overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:h-87.5 lg:min-h-0 lg:w-full lg:overflow-visible lg:rounded-none"
      panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:rounded-panel"
    >
      <div
        data-theme="dark"
        className="relative z-10 px-4 pt-26.5 pb-10 lg:mx-auto lg:w-full lg:max-w-360 lg:px-30 lg:pt-40 lg:pb-0"
      >
        <div className="flex w-full max-w-200 flex-col gap-4">
          <h1
            id="sample-title"
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
          <p className="faq-subtitle text-body-l text-muted">
            What a full Visibility Grade report looks like, using an invented business.
          </p>
        </div>
      </div>
    </HeroSurface>
  );
}
