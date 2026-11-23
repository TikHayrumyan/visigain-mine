"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { REVIEW_RATINGS } from "./ratings";

/** From the page timeline: each badge fades and rises 16px in 0.6s, the next starting 0.08s later. */
const FADE_SECONDS = 0.6;
const STAGGER_SECONDS = 0.08;

type Rating = (typeof REVIEW_RATINGS)[number];

/** The row of review ratings under the hero: one line on a wide screen, two on a phone. */
export function ReviewRatings() {
  return (
    <section
      aria-label="Review ratings"
      className="grid grid-cols-[max-content_max-content] items-start justify-center gap-x-6 gap-y-5 px-5 pt-7 pb-2 lg:flex lg:items-center lg:gap-14 lg:px-0 lg:pt-10"
    >
      {REVIEW_RATINGS.map((rating, index) => (
        <RatingBadge key={rating.name} rating={rating} index={index} />
      ))}
    </section>
  );
}

/** One source. It reveals when the row enters the screen; with reduced motion it is shown as-is. */
function RatingBadge({ rating, index }: { rating: Rating; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-center gap-2 lg:gap-2.5"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: FADE_SECONDS, delay: index * STAGGER_SECONDS, ease: "easeOut" }
      }
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center ${rating.framed ? "overflow-hidden rounded-md" : ""} lg:size-9`}
      >
        <Image
          src={rating.logoSrc}
          alt={rating.name}
          width={rating.logoWidth}
          height={rating.logoHeight}
          sizes="32px"
          className={rating.logoClass}
        />
      </span>
      <span className="flex flex-col gap-1 lg:gap-0.75">
        <Image src={rating.starsSrc} alt="" width={90} height={18} className="h-3.5 w-17.5 lg:h-4.5 lg:w-22.5" />
        <span className="flex items-center gap-1.5 text-label-m lg:gap-2 lg:text-label-l">
          <span className="text-fg underline decoration-dotted decoration-from-font underline-offset-2">
            {rating.score}
          </span>
          <span className="h-3 w-px bg-line-darken lg:h-4" />
          <span className="text-faint">{rating.reviewCount} Reviews</span>
        </span>
      </span>
    </motion.div>
  );
}
