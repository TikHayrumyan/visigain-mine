"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { QUESTIONS } from "./questions";

/** Each row fades and rises 8px in 0.5s, the next starting 0.05s later (37.5–38.3s). */
const REVEAL_SECONDS = 0.5;
const STAGGER_SECONDS = 0.05;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

const LEFT = QUESTIONS.slice(0, 5);
const RIGHT = QUESTIONS.slice(5);

/**
 * Ten questions on one card. The first is open; each click opens or closes its own answer.
 * `stack` is the standalone page: one 800px column, no heading (the page title sits above it).
 */
export function Faq({ layout = "split" }: { layout?: "split" | "stack" }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const stacked = layout === "stack";

  const toggle = (index: number) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section
      {...(stacked ? {} : { id: "faq" })}
      className={stacked ? "bg-bg pt-10 lg:pt-18" : "scroll-mt-28 bg-bg pt-hero lg:scroll-mt-32 lg:pt-35"}
    >
      <div
        className={`mx-auto flex w-full max-w-360 flex-col px-5 lg:px-30 ${
          stacked ? "items-center" : "items-start gap-7 lg:gap-12"
        }`}
      >
        {stacked ? null : (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-headline-m text-fg lg:text-headline-l">Frequently asked questions</h2>
            <p className="text-body-l text-muted">
              Answers about your grade, the free scan, the full report and monitoring.
            </p>
          </div>
        )}
        <div
          className={`flex w-full flex-col rounded-panel-sm bg-surface px-5 py-2 ring-1 ring-line ring-inset ${
            stacked ? "max-w-200 lg:px-8" : "lg:flex-row lg:gap-16 lg:px-8"
          }`}
        >
          {stacked ? (
            <ul className="flex min-w-0 flex-1 flex-col">
              {QUESTIONS.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  index={index}
                  open={open.has(index)}
                  onToggle={toggle}
                  divider={index < QUESTIONS.length - 1}
                />
              ))}
            </ul>
          ) : (
            <>
              <ul className="flex min-w-0 flex-1 flex-col">
                {LEFT.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    index={index}
                    open={open.has(index)}
                    onToggle={toggle}
                    divider
                    hideDividerOnWide={index === LEFT.length - 1}
                  />
                ))}
              </ul>
              <ul className="flex min-w-0 flex-1 flex-col">
                {RIGHT.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    index={index + LEFT.length}
                    open={open.has(index + LEFT.length)}
                    onToggle={toggle}
                    divider={index < RIGHT.length - 1}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  item,
  index,
  open,
  onToggle,
  divider,
  hideDividerOnWide = false,
}: {
  item: (typeof QUESTIONS)[number];
  index: number;
  open: boolean;
  onToggle: (index: number) => void;
  divider: boolean;
  hideDividerOnWide?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const answerId = `faq-answer-${index}`;

  return (
    <motion.li
      className={`py-6 ${divider ? "border-b border-line" : ""} ${hideDividerOnWide ? "lg:border-b-0" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: REVEAL_SECONDS, delay: index * STAGGER_SECONDS, ease: REVEAL_EASE }
      }
    >
      <button
        type="button"
        className="flex w-full items-center gap-4 text-left"
        aria-expanded={open}
        aria-controls={answerId}
        onClick={() => onToggle(index)}
      >
        <span className="min-w-0 flex-1 font-display text-title-s text-fg">{item.question}</span>
        <Image src={open ? "/icons/faq-minus.svg" : "/icons/faq-add.svg"} alt="" width={20} height={20} />
      </button>
      <div
        id={answerId}
        role="region"
        aria-hidden={!open}
        className={`grid ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transition: "grid-template-rows 0.3s var(--ease-reveal)" }}
      >
        <div className="overflow-hidden">
          <p className="pt-2.5 text-body-m text-muted">{item.answer}</p>
        </div>
      </div>
    </motion.li>
  );
}
