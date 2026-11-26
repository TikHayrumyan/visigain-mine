"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { AreaScoresCard } from "@/components/home/hero/area-scores-card";
import { HeroSurface } from "@/components/home/hero/hero-surface";
import styles from "@/components/home/hero/hero.module.css";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { LOGIN } from "@/config/navigation";

const AREAS = [
  { name: "Findability", score: 74.5, bar: "bg-green" },
  { name: "Credibility", score: 86.2, bar: "bg-green" },
  { name: "Experience", score: 59.7, bar: "bg-grade-c" },
  { name: "Evidence", score: 71.7, bar: "bg-green" },
  { name: "Reach", score: 100, bar: "bg-green" },
] as const;

const EASE = [0, 0, 0.58, 1] as const;
const LINK = "cursor-pointer text-muted underline decoration-current decoration-1 underline-offset-2";

/**
 * Step 3. The letter and the scores are the grade drawn in the design. This site does not measure a website yet,
 * so every address shows that same example.
 */
export function Result() {
  const website = useSearchParams().get("website") || "skinworksmed.com";
  const reduceMotion = useReducedMotion();
  const recorded = website === "skinworksmed.com";

  return (
    <>
      <HeroSurface
        aria-labelledby="result-title"
        className="relative mx-2 mt-2 min-h-71.5 overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:h-103.5 lg:min-h-0 lg:overflow-visible lg:rounded-none"
        panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:rounded-panel"
      >
        <div data-theme="dark" className="relative z-10 px-4 pt-26.5 pb-12 lg:mx-auto lg:w-full lg:max-w-360 lg:px-30 lg:pt-40 lg:pb-0">
          <div className="flex max-w-200 flex-col gap-4">
            <h1 id="result-title" className="font-display text-display-s text-fg lg:text-display-m">
              Free Visibility Grade: {website}
            </h1>
            <p className="text-body-l text-muted">
              Measured on the free part of our standard only. Not comparable with a full-report grade.
            </p>
          </div>
        </div>
      </HeroSurface>

      <section className="bg-bg px-5 pt-8 pb-16 lg:px-30 lg:pt-16 lg:pb-24">
        <div className="mx-auto flex w-full max-w-360 flex-col gap-3 lg:gap-5">
          {recorded ? <Walkthrough website={website} /> : null}
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="flex flex-col justify-between rounded-card-lg bg-surface p-5 lg:h-105.5 lg:p-7">
              <div className="flex flex-col gap-5">
                <h2 className="font-display text-headline-s text-fg">Visibility Grade</h2>
                <div className="flex items-center gap-3.5">
                  <span className="grid size-18 place-items-center rounded-2xl bg-grade-b font-display text-[32px] leading-9 tracking-[-0.03em] text-ink">
                    B
                  </span>
                  <div>
                    <p className="text-body-s text-fg">Grade</p>
                    <p className="font-display text-[48px] leading-12 tracking-[-0.04em] text-fg">75.9</p>
                  </div>
                </div>
                <p className="text-body-m text-muted">Category: Med spa</p>
                <div className="rounded-xl bg-surface-subtle px-3.5 py-3">
                  <p className="text-body-m text-fg">Directory count: coming soon</p>
                  <p className="text-body-s text-muted">It appears here once you open the link in the email we sent you.</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 pt-6 text-body-s text-muted">
                <p>Visigain Standard 1.9.0, scanned Oct 8, 2026, 1:06 AM PT.</p>
                <p>
                  The Visibility Grade is an opinion produced by an automated engine applying Visigain’s standard to
                  publicly available information as of the scan date.
                </p>
                <p>
                  By using this page you agree to our{" "}
                  <Link href="/terms" className={LINK}>
                    Terms of Service
                  </Link>{" "}
                  (including arbitration) and{" "}
                  <Link href="/privacy" className={LINK}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </article>
            <article className="rounded-card-lg bg-surface p-5 lg:p-7">
              <h2 className="font-display text-headline-s text-fg">By area</h2>
              <p className="mt-1 text-body-m text-muted">Your score in each area, out of 100</p>
              <ul className="flex flex-col gap-5 pt-6">
                {AREAS.map((area) => (
                  <li key={area.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-label-m text-fg">
                      <span>{area.name}</span>
                      <span>{area.score}</span>
                    </div>
                    <div className={`h-3 overflow-hidden rounded-full ${styles.track}`}>
                      <motion.div
                        className={`h-full rounded-full ${area.bar}`}
                        initial={reduceMotion ? false : { width: 0 }}
                        whileInView={{ width: `${area.score}%` }}
                        viewport={{ once: true }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <ReportOffer />
        </div>
      </section>
    </>
  );
}

function Walkthrough({ website }: { website: string }) {
  return (
    <article className="flex flex-col gap-4 rounded-card-lg bg-surface p-4 lg:flex-row lg:items-center lg:gap-10 lg:p-7">
      <div className="relative h-45 overflow-hidden rounded-[20px] lg:h-108 lg:w-192 lg:shrink-0">
        <Image src="/images/scan/walkthrough.png" alt="" fill sizes="(min-width: 64rem) 768px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/65" />
        <Image
          src="/images/scan/play.svg"
          alt=""
          width={128}
          height={128}
          className="absolute top-1/2 left-1/2 max-lg:scale-[0.42] -translate-x-1/2 -translate-y-1/2 lg:-translate-y-[calc(50%-8px)]"
        />
        <p className="absolute top-3 right-3 rounded-full bg-ink px-2.5 py-1 text-label-s text-surface lg:top-5 lg:right-5">3 min</p>
        <div className="absolute right-3 bottom-3 left-3 flex items-center gap-3 lg:right-5 lg:bottom-5 lg:left-5">
          <span className="text-label-s text-surface">0:00</span>
          <span className="h-1 flex-1 rounded-full bg-surface" />
          <span className="text-label-s text-surface">3:42</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <span className="inline-flex h-6 w-fit items-center rounded-full bg-grade-b px-2.5 text-label-s text-ink">
          Recorded for you
        </span>
        <h2 className="font-display text-headline-m text-fg">Your grade, walked through</h2>
        <p className="text-body-l text-muted">
          We recorded a short video for {website}: what your grade means and which fixes move it the most.
        </p>
        <p className="text-body-s text-faint">3 min · Recorded Oct 9, 2026</p>
      </div>
    </article>
  );
}

/** The closing offer: the same dotted field and product window as the home CTA, with the sample area card over it. */
function ReportOffer() {
  return (
    <HeroSurface
      markHero={false}
      aria-labelledby="result-upsell"
      className="relative mt-7 overflow-hidden rounded-panel lg:mt-15"
      panelClassName="absolute inset-0 overflow-hidden bg-ink"
    >
      <div data-theme="dark" className="relative z-10 flex flex-col items-center px-5 pt-10 text-center lg:px-0 lg:pt-20">
        <h2 id="result-upsell" className="font-display text-headline-m text-fg lg:w-190 lg:text-headline-l">
          Every finding, with the exact fix
        </h2>
        <Link href="/checkout/report" className={`${PRIMARY_BUTTON} mt-6 h-12 px-6 lg:mt-11`}>
          Get the Full Report ($199)
        </Link>
        <p className="mt-4 max-w-160 text-body-m text-faint">
          Or{" "}
          <Link href={LOGIN.href} className="cursor-pointer text-faint underline decoration-current decoration-1 underline-offset-2">
            create a free account
          </Link>{" "}
          with the email you used here: this grade will be waiting in your dashboard.
        </p>
      </div>
      <div className="relative mt-8 h-75 overflow-hidden lg:mx-auto lg:mt-16 lg:h-126 lg:w-250">
        <div className="absolute top-0 left-4 w-250 origin-top-left scale-50 lg:left-0 lg:scale-100">
          <div data-theme="light" className="overflow-hidden rounded-card border border-line bg-surface shadow-window">
            <div className="flex h-11 items-center justify-between border-b border-line bg-surface-subtle px-4">
              <Image src="/images/hero/browser-dots.svg" alt="" width={52} height={12} />
              <span className="rounded-lg border border-line bg-surface px-4 py-1.5 text-label-s text-muted">app.visigain.com</span>
              <span className="w-13" />
            </div>
            <div className="h-149.5 overflow-hidden">
              <Image src="/images/cta/rank-tracking.png" alt="" width={2000} height={2660} className="w-full" />
            </div>
          </div>
        </div>
        <div className="absolute top-33 left-167.5 hidden lg:block">
          <AreaScoresCard />
        </div>
      </div>
    </HeroSurface>
  );
}
