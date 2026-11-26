"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { PLANS, type Plan } from "./catalog";

/** Each card rises 36px and fades in over 0.75s, the next starting 0.08s later (34.6–35.3s). */
const REVEAL_SECONDS = 0.75;
const STAGGER_SECONDS = 0.08;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

const OUTLINE_BUTTON =
  "inline-flex h-12 w-full items-center justify-center rounded-button border border-ink bg-surface text-body-l text-fg no-underline transition-colors duration-300 ease-reveal hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none";

/** Four plans. The cards arrive left to right when the section enters the screen. */
export function Plans({ plans = PLANS, bare = false }: { plans?: readonly Plan[]; bare?: boolean }) {
  const row = (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-5">
      {plans.map((plan, index) => (
        <PlanCard key={plan.name} plan={plan} index={index} bare={bare} />
      ))}
    </div>
  );

  if (bare) return row;

  return (
    <section id="pricing" className="scroll-mt-28 bg-bg pt-hero lg:scroll-mt-32 lg:pt-35">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center gap-7 px-5 lg:gap-14 lg:px-30">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="w-64 font-display text-headline-m text-fg lg:w-auto lg:text-headline-l">
            Pick how far you want to go
          </h2>
          <p className="text-body-l text-muted lg:w-132">
            Start free. Upgrade when you want the full report or someone to do the work.
          </p>
        </div>
        {row}
      </div>
    </section>
  );
}

function PlanCard({ plan, index, bare }: { plan: Plan; index: number; bare: boolean }) {
  const reduceMotion = useReducedMotion();
  const ink = plan.highlighted;

  return (
    <motion.article
      className={`flex min-h-96.25 min-w-0 flex-1 flex-col gap-5 rounded-[20px] px-6 pt-7 pb-6 lg:gap-6 ${
        bare ? "shadow-window lg:min-h-[429px]" : "lg:min-h-0"
      } ${ink ? `bg-ink ${bare ? "" : "shadow-plan"}` : "bg-surface ring-1 ring-line ring-inset"}`}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: REVEAL_SECONDS, delay: index * STAGGER_SECONDS, ease: REVEAL_EASE }
      }
    >
      <div className="flex flex-col gap-3 lg:min-h-22.5">
        <span
          className={`flex h-6.5 w-fit items-center rounded-pill px-2.5 text-label-s ${
            plan.tagTone === "ok" ? "bg-chip-ok text-ok" : "bg-chip-neutral text-muted"
          }`}
        >
          {plan.tag}
        </span>
        <h3 className={`font-display text-title-l ${ink ? "text-white" : "text-fg"}`}>{plan.name}</h3>
      </div>
      <p className="flex items-baseline gap-1.5">
        <span
          className={`font-display whitespace-nowrap ${ink ? "text-white" : "text-fg"} ${
            plan.figure === "proposal" ? "text-[32px] leading-9 tracking-[-0.03em]" : "text-headline-m lg:text-display-s"
          }`}
        >
          {plan.price}
        </span>
        {plan.note ? <span className={`text-body-m ${ink ? "text-faint" : "text-muted"}`}>{plan.note}</span> : null}
      </p>
      <div className={`h-px w-full ${ink ? "bg-muted" : "bg-line"}`} />
      <ul className="flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Image src="/icons/check-plan.svg" alt="" width={20} height={20} className="shrink-0" />
            <span className={`text-body-m ${ink ? "text-white" : "text-fg"}`}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={plan.href} className={ink ? `${PRIMARY_BUTTON} h-12 w-full` : OUTLINE_BUTTON}>
        {plan.cta}
      </Link>
    </motion.article>
  );
}
