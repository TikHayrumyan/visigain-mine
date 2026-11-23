"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { BUSINESS_GROUPS, CATEGORY_ROWS } from "./categories";
import styles from "./who-its-for.module.css";

/** Each tile fades and rises 40px; the next starts 0.08s later (the page timeline's 6.5–10.6s window). */
const TILE_RISE = 0.8;
const TILE_STAGGER = 0.08;

/** Four groups, then the business types running in three rows with a search pill over the middle. */
export function WhoItsFor() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="who-its-for-title" className="pt-16 lg:pt-30">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-4 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-0">
        <div className="flex flex-col gap-4">
          <p className="font-display text-title-s text-muted">Who it’s for</p>
          <h2 id="who-its-for-title" className="font-display text-headline-m text-fg lg:w-130 lg:text-headline-l">
            Built for 180+ kinds of local businesses
          </h2>
        </div>
        <p className="text-body-l text-muted lg:w-124 lg:py-2">
          From med spas and law firms to plumbers, cafes and dance studios. We cover 600+ Google business categories, so
          if you’re on Google Maps, we can grade you.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 lg:mt-12 lg:gap-8">
        <div
          className={`flex gap-3 overflow-x-auto px-5 lg:mx-auto lg:w-full lg:max-w-300 lg:gap-5 lg:overflow-visible lg:px-0 ${styles.scroll}`}
        >
          {BUSINESS_GROUPS.map((group, index) => (
            <motion.article
              key={group.name}
              className="relative h-90 w-65 shrink-0 overflow-hidden rounded-card lg:h-100 lg:w-auto lg:flex-1"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: TILE_RISE, delay: index * TILE_STAGGER, ease: "easeOut" }
              }
            >
              <Image
                src={group.image}
                alt=""
                width={group.width}
                height={group.height}
                sizes="(min-width: 64rem) 285px, 260px"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1 rounded-card bg-surface px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-title-s text-fg">{group.name}</p>
                  <p className="shrink-0 text-body-l text-muted">{group.count}</p>
                </div>
                <p className="text-body-s text-muted">{group.examples}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="relative h-48">
          <div className="flex h-full flex-col justify-center gap-3">
            {CATEGORY_ROWS.map((row, index) => (
              <Marquee key={row[0]} reverse={index === 1} pauseOnHover>
                {row.map((name) => (
                  <span
                    key={name}
                    className="rounded-pill border border-line-darken bg-surface px-4 py-2.5 text-body-m whitespace-nowrap text-fg"
                  >
                    {name}
                  </span>
                ))}
              </Marquee>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-bg to-transparent lg:w-60" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-bg to-transparent lg:w-60" />
          <div
            className={`pointer-events-none absolute top-5 left-1/2 z-10 h-30 w-[calc(100%-2.5rem)] -translate-x-1/2 lg:h-37.5 lg:w-190 ${styles.glow}`}
          />
          <form
            role="search"
            className="absolute top-16.5 left-1/2 z-20 flex h-15 w-[calc(100%-2.5rem)] -translate-x-1/2 items-center gap-3 rounded-pill border border-line-darken bg-surface px-5.5 shadow-search lg:w-140"
          >
            <Image src="/icons/search.svg" alt="" width={20} height={20} />
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Your business type</span>
              <input
                name="category"
                type="search"
                placeholder=" "
                className="peer w-full bg-transparent text-body-l text-fg outline-none"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center truncate text-body-l text-faint peer-[:not(:placeholder-shown)]:hidden">
                <span className="lg:hidden">Search your business type</span>
                <span className="hidden lg:inline">Search your business type, e.g. “roofing contractor”</span>
              </span>
            </label>
            <span className="hidden shrink-0 text-body-s text-muted lg:inline">638 categories</span>
          </form>
        </div>
      </div>
    </section>
  );
}
