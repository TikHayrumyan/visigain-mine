"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { TESTIMONIALS, type Testimonial } from "./quotes";

/** One card per click, the same 0.6s ease-in-out the track and the progress bar share. */
const SLIDE_MS = 600;

export function Testimonials() {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ prev: false, next: true });

  const sync = (instance: SwiperClass) => {
    setIndex(instance.activeIndex);
    setEdges({ prev: !instance.isBeginning, next: !instance.isEnd });
  };

  return (
    <section className="flex flex-col gap-7 bg-bg pt-hero lg:gap-12 lg:pt-35">
      <div className="flex w-full max-w-360 mx-auto flex-col gap-5 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-30">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-headline-m text-fg lg:text-headline-l">Results our customers can see</h2>
          <p className="text-body-l text-muted">What local business owners say about Visigain</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Previous testimonial"
            disabled={!edges.prev}
            onClick={() => swiper?.slidePrev()}
            className="grid size-12 place-items-center rounded-full border border-line bg-surface disabled:opacity-45"
          >
            <Image src="/icons/arrow-right-ink.svg" alt="" width={20} height={20} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            disabled={!edges.next}
            onClick={() => swiper?.slideNext()}
            className="grid size-12 place-items-center rounded-full border border-line bg-surface disabled:opacity-45"
          >
            <Image src="/icons/arrow-right-ink.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      <Swiper
        slidesPerView="auto"
        speed={SLIDE_MS}
        spaceBetween={12}
        slidesOffsetBefore={20}
        slidesOffsetAfter={20}
        watchOverflow
        breakpoints={{
          1024: { spaceBetween: 40, slidesOffsetBefore: 120, slidesOffsetAfter: 120 },
        }}
        style={{ "--swiper-wrapper-transition-timing-function": "ease-in-out" } as CSSProperties}
        onSwiper={(instance) => {
          setSwiper(instance);
          sync(instance);
        }}
        onSlideChange={sync}
        className="w-full"
      >
        {TESTIMONIALS.map((item) => (
          <SwiperSlide key={item.name} className="w-82.5! lg:w-300! ">
            <TestimonialCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pl-5 lg:pl-30">
        <div
          className="relative h-1 w-30 overflow-hidden rounded-pill bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={TESTIMONIALS.length}
          aria-valuenow={index + 1}
          aria-label="Testimonial"
        >
          <div
            className="absolute top-0 left-0 h-1 w-10 rounded-pill bg-ink"
            style={{
              transform: `translateX(${index * 40}px)`,
              transition: `transform ${SLIDE_MS}ms ease-in-out`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="flex w-82.5 flex-col gap-2 lg:h-105 lg:w-300 lg:flex-row">
      <div className="flex flex-col gap-10 rounded-card-lg bg-ink p-6 lg:h-full lg:min-w-0 lg:flex-1 lg:justify-between lg:gap-0 lg:px-10 lg:py-9">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-white font-display text-title-s text-ink">
            {item.letter}
          </span>
          <span className="font-display text-title-s text-white">{item.company}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="font-display text-headline-m text-green lg:text-headline-l">“</span>
          <p className="font-display text-headline-s text-white lg:text-headline-m">{item.quote}</p>
        </div>
        <div className="flex items-center gap-3.5">
          <Image
            src={item.photo}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-label-l text-white">{item.name}</p>
            <p className="text-body-m text-faint">{item.role}</p>
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 rounded-card-lg p-6 text-ink lg:h-full lg:w-96 lg:shrink-0 lg:justify-between lg:gap-0 lg:p-9 ${item.tone}`}
      >
        <p className="font-display text-[48px] leading-20 tracking-[-0.04em] whitespace-nowrap lg:text-[80px]">
          {item.metric}
        </p>
        <p className="font-display text-[16px] leading-6.5 tracking-[-0.015em] lg:text-title-l">{item.metricLabel}</p>
      </div>
    </article>
  );
}
