"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import { TESTIMONIALS, type Testimonial } from "./quotes";

/** One card per click, the same 0.6s ease-in-out the track and the progress bar share. */
const SLIDE_MS = 600;

/** The design frame: 1440 wide, 120px side inset, a 1200px card. On a phone, 390 wide, 20px inset, a 330px card. */
function trackSize(width: number) {
  const desktop = window.matchMedia("(min-width: 64rem)").matches;
  if (desktop) return { offset: 120, gap: 40, slide: width - 240 };
  return { offset: 20, gap: 12, slide: width - 60 };
}

export function Testimonials() {
  const frame = useRef<HTMLDivElement>(null);
  const swiper = useRef<SwiperClass | null>(null);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ prev: false, next: true });
  const [track, setTrack] = useState({ offset: 20, gap: 12, slide: 330 });

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const apply = () => setTrack(trackSize(element.clientWidth));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
            onClick={() => swiper.current?.slidePrev()}
            className="grid size-12 place-items-center rounded-full border border-line bg-surface disabled:opacity-45"
          >
            <Image src="/icons/arrow-right-ink.svg" alt="" width={20} height={20} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            disabled={!edges.next}
            onClick={() => swiper.current?.slideNext()}
            className="grid size-12 place-items-center rounded-full border border-line bg-surface disabled:opacity-45"
          >
            <Image src="/icons/arrow-right-ink.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      <div ref={frame} className="mx-auto w-full max-w-360">
        <Swiper
          slidesPerView="auto"
          speed={SLIDE_MS}
          spaceBetween={track.gap}
          slidesOffsetBefore={track.offset}
          slidesOffsetAfter={track.offset}
          watchOverflow
          style={{ "--swiper-wrapper-transition-timing-function": "ease-in-out" } as CSSProperties}
          onSwiper={(instance) => {
            swiper.current = instance;
            sync(instance);
          }}
          onSlideChange={sync}
          className="w-full"
        >
          {TESTIMONIALS.map((item) => (
            <SwiperSlide key={item.name} className="flex! h-auto!" style={{ width: track.slide }}>
              <TestimonialCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="mx-auto w-full max-w-360 pl-5 lg:pl-30">
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
    <article className="flex h-full w-full flex-col gap-2 lg:h-105 lg:flex-row">
      <div className="flex flex-1 flex-col justify-between gap-10 rounded-card-lg bg-ink p-6 lg:h-full lg:min-w-0 lg:gap-0 lg:px-10 lg:py-9">
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
        className={`flex flex-col gap-2 rounded-card-lg p-6 text-ink lg:h-full lg:w-[calc(100%*384/1200)] lg:shrink-0 lg:justify-between lg:gap-0 lg:p-9 ${item.tone}`}
      >
        <p className="font-display text-[48px] leading-20 tracking-[-0.04em] whitespace-nowrap lg:text-[80px]">
          {item.metric}
        </p>
        <p className="font-display text-[16px] leading-6.5 tracking-[-0.015em] lg:text-title-l">{item.metricLabel}</p>
      </div>
    </article>
  );
}
