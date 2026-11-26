"use client";

import { motion, useReducedMotion } from "motion/react";
import { HeroSurface } from "@/components/home/hero/hero-surface";
import { ScanForm } from "./scan-form";

const REVEAL = { duration: 0.6, ease: [0, 0, 0.58, 1] as const };

const STEPS = [
  "We email you a link at once, so you can come back to your grade.",
  "We measure your website against the free part of our standard. It usually takes about 15 minutes.",
  "You get your letter grade, your biggest finding and your easiest win, by email and on the page.",
  "Nothing is charged. If you want every finding with its exact fix, you can buy the full report afterwards.",
] as const;

/** The dark panel: the form on the left, the title and the four steps on the right. */
export function ScanView() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) =>
    reduceMotion ? { duration: 0 } : { ...REVEAL, delay };

  return (
    <HeroSurface
      aria-labelledby="scan-title"
      className="relative mx-2 mt-2 mb-12 overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:mb-0 lg:overflow-visible lg:rounded-none"
      panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:bottom-auto lg:h-206.25 lg:rounded-panel"
    >
      <div
        data-theme="dark"
        className="relative z-10 mx-auto flex w-full max-w-360 flex-col gap-4 px-4 pt-26.5 pb-8 lg:grid lg:grid-cols-[520px_minmax(0,600px)] lg:items-start lg:justify-between lg:gap-x-20 lg:px-30 lg:pt-42 lg:pb-30"
      >
        <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:pt-6">
        <motion.div
          className="order-1 flex flex-col gap-4 lg:gap-6"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={rise(0)}
        >
          <h1 id="scan-title" className="font-display text-display-s text-fg lg:text-display-m">
            Get your free Visibility Grade
          </h1>
          <p className="text-body-l text-muted">
            We measure your website against the free part of our standard and email you the grade, usually within 15
            minutes.
          </p>
        </motion.div>
        <div className="order-3 flex flex-col gap-5 pt-4 lg:mt-6 lg:w-122.75">
          <p className="font-display text-title-l text-fg">What happens next</p>
          <ol className="flex flex-col gap-1 lg:gap-4">
            {STEPS.map((step, index) => (
              <motion.li
                key={step}
                className="flex items-center gap-4"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={rise(0.15 + index * 0.08)}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-label-m ${
                    index === 0 ? "bg-green text-ink" : "bg-white/12 text-fg"
                  }`}
                >
                  {index + 1}
                </span>
                <p className="py-2 text-body-l text-fg">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
        </div>
        <motion.div
          className="order-2 lg:col-start-1 lg:row-start-1"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={rise(0.08)}
        >
          <ScanForm />
        </motion.div>
      </div>
    </HeroSurface>
  );
}
