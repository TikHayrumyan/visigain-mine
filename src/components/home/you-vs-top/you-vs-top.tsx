"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useRef, type ReactNode, type UIEvent } from "react";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";
import { COMPARISON } from "./comparison";
import styles from "./you-vs-top.module.css";

/** Reveal lengths from the page timeline, played when each part enters the screen. */
const EASE = "easeOut" as const;
const ROW_RISE = { duration: 0.5, ease: EASE };

const rows: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.35, staggerChildren: 0.08 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: ROW_RISE },
};

/** Heading, text and the free scan on the left; the comparison table on the right (below, on a phone). */
export function YouVsTop() {
  const reduceMotion = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  const moveThumb = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const marker = thumb.current;
    if (!marker) return;
    const max = el.scrollWidth - el.clientWidth;
    const travel = el.clientWidth - marker.offsetWidth;
    marker.style.transform = `translateX(${max > 0 ? (el.scrollLeft / max) * travel : 0}px)`;
  };

  return (
    <section className="mx-auto flex w-full max-w-360 flex-col items-center gap-8 px-5 pt-16 lg:flex-row lg:items-center lg:gap-20 lg:px-30 lg:pt-35">
      <div className="flex w-full flex-col items-start gap-5 lg:w-121.25 lg:shrink-0">
        <h2 className="font-display text-headline-m text-fg lg:text-headline-l">
          Your next client asks Google and ChatGPT first
        </h2>
        <Reveal y={12} duration={0.7}>
          <p className="text-body-l text-muted">
            Before they call, buyers look you up: on Google, on maps, in reviews and now in AI answers. If the
            businesses near you show up and you don’t, the call goes to them.
          </p>
        </Reveal>
        <Reveal y={12} duration={0.6} delay={0.15} className="pt-2">
          <Link href={FREE_SCAN.href} className={`${PRIMARY_BUTTON} h-12 px-6`}>
            {FREE_SCAN.label}
          </Link>
        </Reveal>
      </div>

      <motion.div
        className="w-full overflow-hidden rounded-panel-sm border border-line bg-surface pt-6 pb-4 shadow-compare-sm lg:min-w-0 lg:flex-1 lg:overflow-visible lg:shadow-compare"
        initial={reduceMotion ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.75, ease: EASE }}
      >
        <div className="flex flex-col gap-1 px-6">
          <p className="font-display text-title-l text-fg">{COMPARISON.title}</p>
          <p className="text-body-s text-muted">{COMPARISON.caption}</p>
        </div>
        <div
          ref={scroller}
          onScroll={moveThumb}
          className={`mt-4 overflow-x-auto px-3 lg:overflow-visible lg:px-6 ${styles.scroll}`}
        >
          <motion.div
            className="w-146.25 px-3 lg:w-full lg:px-0"
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={{ once: true, amount: 0.4 }}
            variants={reduceMotion ? undefined : rows}
          >
            <Row className="border-b border-line pt-1 pb-3 text-label-s text-faint">
              <span className="min-w-0 flex-1">Business</span>
              <span className="w-21 shrink-0 text-right">Map rank</span>
              <span className="w-21 shrink-0 text-right">Reviews</span>
              <span className="w-16 shrink-0 text-right">Rating</span>
              <span className="w-28 shrink-0 text-right">AI answers</span>
            </Row>
            {COMPARISON.rows.map((item, index) => (
              <Row
                key={item.name}
                className={`py-4 ${index < COMPARISON.rows.length - 2 ? "border-b border-line" : ""} ${
                  item.named ? "" : "-mx-3 rounded-icon bg-danger-soft px-3"
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-label-m text-fg">{item.name}</span>
                <span className="w-21 shrink-0 text-right text-body-m text-fg">{item.rank}</span>
                <span className="w-21 shrink-0 text-right text-body-m text-fg">{item.reviews}</span>
                <span className="w-16 shrink-0 text-right text-body-m text-fg">{item.rating}</span>
                <span className="flex w-28 shrink-0 justify-end">
                  <span
                    className={`inline-flex h-6.5 items-center rounded-pill px-2.5 text-label-s ${
                      item.named ? "bg-chip-ok text-ok" : "bg-chip-warn text-chip-warn-text"
                    }`}
                  >
                    {item.answer}
                  </span>
                </span>
              </Row>
            ))}
          </motion.div>
        </div>
        <div className="mx-6 mt-4 h-1.5 overflow-hidden rounded-pill lg:hidden">
          <div ref={thumb} className="h-1.5 w-44.25 rounded-pill bg-line" />
        </div>
      </motion.div>
    </section>
  );
}

/** A table row. It rises 8px as the table comes into view; the header rises with it. */
function Row({ className, children }: { className: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={`relative flex items-center gap-3 ${className}`} variants={reduceMotion ? undefined : row}>
      {children}
    </motion.div>
  );
}

/** A fade and a short rise, played once the block enters the screen. */
function Reveal({
  y,
  duration,
  delay = 0,
  className = "",
  children,
}: {
  y: number;
  duration: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={reduceMotion ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
