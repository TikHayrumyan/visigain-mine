import Link from "next/link";
import { LEGAL_LINKS } from "@/config/navigation";

const LINK = "cursor-pointer text-muted underline decoration-current decoration-1 underline-offset-2";

const TERMS = LEGAL_LINKS.find((link) => link.href === "/terms");
const PRIVACY = LEGAL_LINKS.find((link) => link.href === "/privacy");

/** The grade letter, the score, the local average, and the legal lines. */
export function GradeCard() {
  return (
    <article className="flex flex-col justify-between rounded-card-lg bg-surface p-5 lg:h-103 lg:p-7">
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-headline-s text-fg">Visibility Grade</h2>
        <div className="flex items-center gap-3.5">
          <span className="grid size-18 place-items-center rounded-2xl bg-grade-c font-display text-[32px] leading-9 tracking-[-0.03em] text-ink">
            C
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-body-s text-fg">Grade</p>
            <p className="font-display text-[48px] leading-12 tracking-[-0.04em] text-fg">58.4</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <p className="flex items-baseline gap-2">
            <span className="text-body-m text-muted">Los Angeles dentists average</span>
            <span className="font-display text-headline-s text-fg">56</span>
          </p>
          <span className="inline-flex h-6.5 items-center rounded-full bg-chip-ok px-2.5 text-label-s text-ok">
            2.4 above
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-6 text-body-s text-muted">
        <p>Visigain Standard 1.8.1, scanned Oct 6, 2026, 10:00 AM PT.</p>
        <p>
          The Visibility Grade is an opinion produced by an automated engine applying Visigain’s standard to publicly
          available information as of the scan date.
        </p>
        <p>
          By using this page you agree to our{" "}
          {TERMS ? (
            <Link href={TERMS.href} className={LINK}>
              {TERMS.label}
            </Link>
          ) : null}{" "}
          (including arbitration) and{" "}
          {PRIVACY ? (
            <Link href={PRIVACY.href} className={LINK}>
              {PRIVACY.label}
            </Link>
          ) : null}
          .
        </p>
      </div>
    </article>
  );
}
