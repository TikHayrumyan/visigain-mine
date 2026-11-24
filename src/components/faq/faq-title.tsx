import { HeroSurface } from "@/components/home/hero/hero-surface";

const TITLE = "Frequently asked questions";

/** Characters finish inside the first 0.65s; the subtitle rises over the rest of the first second. */
const TYPE_WINDOW_MS = 650;

/** The page's only new block: the dark panel, the typed H1 and the subtitle. The compact header watches it. */
export function FaqTitle() {
  return (
    <HeroSurface
      aria-labelledby="faq-title"
      className="relative mx-2 mt-2 overflow-hidden rounded-panel-sm lg:m-0 lg:overflow-visible lg:rounded-none"
      panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:rounded-panel"
    >
      <div
        data-theme="dark"
        className="relative z-10 flex min-h-full flex-col items-start px-4 pt-22.5 pb-12 lg:mx-auto lg:min-h-87.5 lg:w-full lg:max-w-360 lg:px-30 lg:pt-41 lg:pb-0"
      >
        <div className="flex w-full max-w-200 flex-col gap-4">
          <h1
            id="faq-title"
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
            Answers about your grade, the free scan, the full report and monitoring.
          </p>
        </div>
      </div>
    </HeroSurface>
  );
}
