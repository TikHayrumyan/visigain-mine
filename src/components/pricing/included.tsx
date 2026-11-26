"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const REVEAL_SECONDS = 0.6;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

const CARDS: readonly { name: string; price: string; items: readonly string[] }[] = [
  {
    name: "Free Scan",
    price: "$0",
    items: ["Your letter grade and score", "Your biggest finding and your easiest win", "By email, usually in about 15 minutes"],
  },
  {
    name: "Full Visibility Grade Report",
    price: "$199 one time",
    items: [
      "Every finding, each with its evidence and its exact fix",
      "Fixes ranked: what to do first, and what you can do yourself",
      "On screen and as a PDF you can share",
      "Normally ready within 1 hour of payment. Sometimes a person checks one item first.",
      "If we cannot deliver your Report within 3 business days, we email you and you can ask for a full refund; if we cannot deliver it at all, we refund you without you having to ask.",
      "Within 14 days, the full amount can be used once as a credit: toward Monitoring or your first statement of work, whichever you start first",
    ],
  },
  {
    name: "Monitoring",
    price: "$149 a month",
    items: [
      "A full re-check every week, with a short summary on Monday morning",
      "A quick check every day: site up, certificate valid, listed by search engines, booking link working",
      "An alert at once when something urgent breaks",
      "A monthly PDF report",
      "Cancel anytime: it stops at the end of the paid period.",
    ],
  },
  {
    name: "Growth retainer",
    price: "By proposal",
    items: [
      "We do the fixes for you, month by month",
      "A call first, then a written proposal with the scope and the price",
      "The Full Report’s price is credited toward your first statement of work if you sign it within 14 days and have not used the credit for Monitoring",
    ],
  },
];

/** Four cards, two to a row. Each pair fades in and rises together. */
export function Included() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-bg pt-18 lg:pt-35">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-7 px-5 lg:gap-10 lg:px-30">
        <h2 className="font-display text-headline-m text-fg lg:text-headline-l">What’s included</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {CARDS.map((card, index) => (
            <motion.article
              key={card.name}
              className="flex flex-col gap-5 rounded-panel-sm bg-surface p-[25px] ring-1 ring-line ring-inset lg:p-8"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: REVEAL_SECONDS, delay: Math.floor(index / 2) * 0.08, ease: REVEAL_EASE }
              }
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-headline-s text-fg">{card.name}</h3>
                <p className="shrink-0 font-display text-title-s text-muted">{card.price}</p>
              </div>
              <ul className="flex flex-col gap-3 border-t border-line pt-5">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Image src="/icons/check-plan.svg" alt="" width={20} height={20} className="shrink-0" />
                    <span className="text-body-l text-fg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
