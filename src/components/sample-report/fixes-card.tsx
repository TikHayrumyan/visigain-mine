"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { FIXES } from "./content";

const rows: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function Tag({ yourself }: { yourself: boolean }) {
  return (
    <span
      className={`inline-flex h-6.5 items-center rounded-full px-2.5 text-label-s whitespace-nowrap ${
        yourself ? "bg-chip-ok text-ok" : "bg-chip-neutral text-muted"
      }`}
    >
      {yourself ? "Yes" : "Usually needs help"}
    </span>
  );
}

/** The fixes in impact order. On a phone the effort and the tag sit under the fix. */
export function FixesCard() {
  const reduceMotion = useReducedMotion();

  return (
    <article className="rounded-card-lg bg-surface p-5 lg:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-headline-s text-fg">What to fix first</h2>
        <p className="text-body-m text-muted">In order: the fixes that move your grade the most come first.</p>
      </div>
      <div className="pt-5">
        <div className="flex border-b border-line text-label-m text-fg">
          <span className="w-9 shrink-0 px-2 pt-1 pb-4.5 lg:w-14">#</span>
          <span className="min-w-0 flex-1 px-2 pt-1 pb-4.5">Fix</span>
          <span className="hidden w-40 shrink-0 px-2 pt-1 pb-4.5 lg:block">Effort</span>
          <span className="hidden w-50 shrink-0 px-2 pt-1 pb-4.5 text-center lg:block">Do it yourself?</span>
        </div>
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={reduceMotion ? undefined : rows}
        >
          {FIXES.map((item, index) => (
            <motion.div
              key={item.fix}
              variants={reduceMotion ? undefined : row}
              className={`flex border-b border-line last:border-b-0 ${index === 0 ? "lg:border-t-0" : ""}`}
            >
              <span className="w-9 shrink-0 px-2 py-3.5 text-label-m text-fg lg:w-14 lg:py-3.5">{index + 1}</span>
              <div className="min-w-0 flex-1 px-2 py-3.5 lg:py-3.5">
                <p className="text-label-m text-fg">{item.fix}</p>
                <div className="flex items-center gap-4 pt-1 lg:hidden">
                  <span className="text-body-m text-fg">{item.effort}</span>
                  <Tag yourself={item.yourself} />
                </div>
              </div>
              <span className="hidden w-40 shrink-0 items-center px-2 text-body-m text-fg lg:flex">{item.effort}</span>
              <span className="hidden w-50 shrink-0 items-center justify-center px-2 lg:flex">
                <Tag yourself={item.yourself} />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </article>
  );
}
