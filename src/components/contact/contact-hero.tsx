import Image from "next/image";
import { HeroSurface } from "@/components/home/hero/hero-surface";
import { LosAngelesTime } from "./los-angeles-time";

const TITLE = "Contact";

/** Characters finish inside the first 0.65s; the subtitle rises over the rest of the first second. */
const TYPE_WINDOW_MS = 650;

/**
 * The dark panel, the typed title and the reply line. The panel is 334px on a wide screen and 304px on a phone.
 * The compact header watches it.
 */
export function ContactHero() {
  return (
    <HeroSurface
      aria-labelledby="contact-title"
      className="relative mx-2 mt-2 min-h-[304px] overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:h-[334px] lg:min-h-0 lg:w-full lg:overflow-visible lg:rounded-none"
      panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:rounded-panel"
    >
      <div
        data-theme="dark"
        className="relative z-10 flex flex-col items-start px-4 pt-26.5 pb-10 lg:mx-auto lg:h-full lg:w-full lg:max-w-360 lg:px-30 lg:pt-35 lg:pb-0"
      >
        <h1
          id="contact-title"
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
        <div className="mt-4 flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="faq-subtitle text-body-l text-muted">
            Write to us and a person will answer, usually within one working day.
          </p>
          <p className="faq-subtitle flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-label-m text-muted lg:shrink-0 lg:flex-nowrap">
            <span className="inline-flex items-center gap-2.5">
              <Image src="/icons/contact-live.svg" alt="" width={16} height={16} />
              Usually replies within 1 business day
              <span className="opacity-50" aria-hidden>
                ·
              </span>
            </span>
            <LosAngelesTime />
          </p>
        </div>
      </div>
    </HeroSurface>
  );
}
