"use client";

import { motion, useReducedMotion } from "motion/react";
import styles from "@/components/home/hero/hero.module.css";
import { AREAS } from "./content";

const EASE = [0, 0, 0.58, 1] as const;

/** Scores out of 100. The bars grow to their values once the card is on screen. */
export function AreaCard() {
  const reduceMotion = useReducedMotion();

  return (
    <article className="flex flex-col rounded-card-lg bg-surface p-5 lg:h-103 lg:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-headline-s text-fg">By area</h2>
        <p className="text-body-m text-muted">Your score in each area, out of 100</p>
      </div>
      <ul className="flex flex-col gap-5 pt-6">
        {AREAS.map(({ name, score, bar }) => (
          <li key={name} className="flex flex-col gap-2">
            <div className="flex justify-between gap-2 text-label-m text-fg">
              <span>{name}</span>
              {score === undefined ? (
                <span className="font-normal text-muted">Not assessed</span>
              ) : (
                <span>{score}</span>
              )}
            </div>
            <div className={`h-3 overflow-hidden rounded-full ${styles.track}`}>
              {score !== undefined && bar ? (
                <motion.div
                  className={`h-full rounded-full ${bar}`}
                  initial={reduceMotion ? false : { width: 0 }}
                  whileInView={{ width: `${score}%` }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
