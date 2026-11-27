"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0, 0, 0.58, 1] as const;

const LETTERS = [
  { letter: "A", tile: "bg-grade-a" },
  { letter: "B", tile: "bg-grade-b" },
  { letter: "C", tile: "bg-grade-c" },
  { letter: "D", tile: "bg-grade-d" },
  { letter: "F", tile: "bg-grade-f" },
] as const;

const PRINCIPLE_TITLES: readonly { start: string; title: string }[] = [
  { start: "We only grade what we could measure", title: "Only what we measured" },
  { start: "Every finding comes with its evidence", title: "Evidence, then the fix" },
  { start: "We don't claim results we can't show", title: "Nothing we can't show" },
  { start: "We don't promise rankings", title: "No promised place in search" },
];

type AboutContent = {
  company: { legalName: string; address: string; email: string };
  standard: readonly string[];
  companyLine: string | null;
  monitoring: readonly string[];
  principles: readonly string[];
  contact: string | null;
};

function titleFor(sentence: string): string | null {
  return PRINCIPLE_TITLES.find((item) => sentence.startsWith(item.start))?.title ?? null;
}

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** The about story, in the same section rhythm as the home page. */
export function AboutBody({ about }: { about: AboutContent }) {
  return (
    <>
      {about.standard.length > 0 ? (
        <section className="bg-bg pt-16 lg:pt-30">
          <div className="mx-auto flex w-full max-w-360 flex-col gap-10 px-5 lg:px-30">
            <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4">
                <p className="font-display text-title-s text-muted">The standard</p>
                <h2 className="font-display text-headline-m text-fg lg:w-140 lg:text-headline-l">
                  One grade, measured the same way for every business.
                </h2>
              </div>
              <div className="flex flex-col gap-3 lg:w-124 lg:py-2">
                {about.standard.map((paragraph) => (
                  <p key={paragraph} className="text-body-l text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal className="flex flex-wrap gap-3" delay={0.08}>
              {LETTERS.map((grade) => (
                <span
                  key={grade.letter}
                  className={`grid size-16 place-items-center rounded-2xl font-display text-headline-m text-ink ${grade.tile}`}
                >
                  {grade.letter}
                </span>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {about.principles.length > 0 ? (
        <section className="bg-bg pt-16 lg:pt-30">
          <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-5 lg:gap-12 lg:px-30">
            <Reveal className="flex flex-col gap-4">
              <p className="font-display text-title-s text-muted">How we grade</p>
              <h2 className="font-display text-headline-m text-fg lg:max-w-180 lg:text-headline-l">
                We say what we measured, and what we didn’t.
              </h2>
            </Reveal>
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              {about.principles.map((paragraph, index) => {
                const title = titleFor(paragraph);

                return (
                  <Reveal key={paragraph} delay={index * 0.06}>
                    <article className="flex h-full flex-col gap-3 rounded-panel-sm border border-line bg-surface p-6 lg:p-8">
                      <p className="text-label-s text-faint">{String(index + 1).padStart(2, "0")}</p>
                      {title ? <h3 className="font-display text-title-l text-fg">{title}</h3> : null}
                      <p className="text-body-l text-muted">{paragraph}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {about.monitoring.length > 0 ? (
        <section className="bg-bg px-2 pt-16 lg:px-0 lg:pt-30">
          <div className="mx-auto w-full max-w-360 lg:px-30">
            <Reveal>
              <div data-theme="dark" className="rounded-panel bg-ink px-6 py-12 lg:px-16 lg:py-16">
                <p className="font-display text-title-s text-muted">Monitoring</p>
                <h2 className="mt-4 max-w-180 font-display text-headline-m text-fg lg:text-headline-l">
                  A full check every week. A short check every day.
                </h2>
                <div className="mt-5 flex max-w-200 flex-col gap-3">
                  {about.monitoring.map((paragraph) => (
                    <p key={paragraph} className="text-body-l text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="bg-bg pt-16 lg:pt-30">
        <div className="mx-auto grid w-full max-w-360 gap-10 px-5 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-30">
          <Reveal className="flex flex-col gap-4">
            <p className="font-display text-title-s text-muted">The company</p>
            <h2 className="font-display text-headline-m text-fg lg:text-headline-l">{about.company.legalName}</h2>
            {about.companyLine ? <p className="max-w-130 text-body-l text-muted">{about.companyLine}</p> : null}
            <p className="text-body-m text-muted">{about.company.address}</p>
          </Reveal>
          {about.contact ? (
            <Reveal delay={0.08}>
              <article className="flex flex-col gap-4 rounded-panel-sm border border-line bg-surface p-6 lg:p-8">
                <h2 className="font-display text-title-l text-fg">Write to us</h2>
                <p className="text-body-l text-muted">{about.contact}</p>
                <a
                  href={`mailto:${about.company.email}`}
                  className="w-fit font-display text-title-s text-fg no-underline hover:underline"
                >
                  {about.company.email}
                </a>
              </article>
            </Reveal>
          ) : null}
        </div>
      </section>
    </>
  );
}
