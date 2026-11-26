"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { OUTLINE_LINK } from "@/components/ui/button-styles";
import { QUESTIONS, type Question } from "./questions";

/** Each row fades and rises 8px in 0.5s, the next starting 0.05s later (37.5–38.3s). */
const REVEAL_SECONDS = 0.5;
const STAGGER_SECONDS = 0.05;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

/**
 * Ten questions on one card. The first is open; each click opens or closes its own answer.
 * `stack` is the standalone page: one 800px column, no heading (the page title sits above it).
 * A heading plus an action is the pricing page: the given questions, split in half.
 */
export function Faq({
  layout = "split",
  questions = QUESTIONS,
  heading,
  action,
}: {
  layout?: "split" | "stack";
  questions?: readonly Question[];
  heading?: string;
  action?: { href: string; label: string };
}) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const stacked = layout === "stack";
  const framed = Boolean(heading);
  const mid = Math.ceil(questions.length / 2);
  const left = questions.slice(0, mid);
  const right = questions.slice(mid);

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
      {...(stacked || framed ? {} : { id: "faq" })}
      className={
        framed
          ? "bg-bg pt-18 lg:pt-35"
          : stacked
            ? "bg-bg pt-10 lg:pt-18"
            : "scroll-mt-28 bg-bg pt-hero lg:scroll-mt-32 lg:pt-35"
      }
    >
      <div
        className={`mx-auto flex w-full max-w-360 flex-col px-5 lg:px-30 ${
          stacked ? "items-center" : "items-start gap-7 lg:gap-12"
        }`}
      >
        {framed ? (
          <div className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="font-display text-headline-m text-fg lg:text-headline-l">{heading}</h2>
            {action ? (
              <Link href={action.href} className={OUTLINE_LINK}>
                {action.label}
              </Link>
            ) : null}
          </div>
        ) : stacked ? null : (
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
              {questions.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  index={index}
                  open={open.has(index)}
                  onToggle={toggle}
                  divider={index < questions.length - 1}
                />
              ))}
            </ul>
          ) : (
            <>
              <ul className="flex min-w-0 flex-1 flex-col">
                {left.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    index={index}
                    open={open.has(index)}
                    onToggle={toggle}
                    divider
                    hideDividerOnWide={index === left.length - 1}
                  />
                ))}
              </ul>
              <ul className="flex min-w-0 flex-1 flex-col">
                {right.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    item={item}
                    index={index + left.length}
                    open={open.has(index + left.length)}
                    onToggle={toggle}
                    divider={index < right.length - 1}
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
  item: Question;
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
