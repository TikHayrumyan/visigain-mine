"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { AreaCard } from "./area-card";
import { FindingsCard } from "./findings-card";
import { FixesCard } from "./fixes-card";
import { GradeCard } from "./grade-card";
import { OwnGrade } from "./own-grade";

const REVEAL = { duration: 0.6, ease: [0, 0, 0.58, 1] as const };

function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduceMotion ? { duration: 0 } : { ...REVEAL, delay }}
    >
      {children}
    </motion.div>
  );
}

/** The sample notice and the report cards, in one column on a phone. */
export function SampleReport() {
  return (
    <section className="bg-bg pt-8 pb-16 lg:pt-16 lg:pb-35">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-3 px-5 lg:gap-5 lg:px-30">
        <Reveal delay={0}>
          <div className="flex flex-col gap-1 rounded-card bg-chip-warn px-4 py-3 lg:flex-row lg:items-center lg:gap-4 lg:py-3.5 lg:pr-4 lg:pl-7">
            <p className="shrink-0 font-display text-title-s text-chip-warn-text">Sample</p>
            <p className="text-body-m text-fg">
              The business is invented, and so are its findings. A real report has the same parts, with what we
              measured for your business.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
          <Reveal delay={0.08}>
            <GradeCard />
          </Reveal>
          <Reveal delay={0.16}>
            <AreaCard />
          </Reveal>
        </div>
        <Reveal delay={0.08}>
          <FixesCard />
        </Reveal>
        <Reveal delay={0.08}>
          <FindingsCard />
        </Reveal>
        <Reveal delay={0.08}>
          <OwnGrade />
        </Reveal>
      </div>
    </section>
  );
}
