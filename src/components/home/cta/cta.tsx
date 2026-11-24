"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ScanForm } from "../hero/scan-form";
import { HeroSurface } from "../hero/hero-surface";

function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setOn(entry.isIntersecting);
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return on;
}

/** The closing panel: the same dotted field as the hero, a scan, and the rank-tracking screen. */
export function Cta() {
  const section = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(section);

  return (
    <section ref={section} className="bg-bg px-2 pt-hero pb-20 lg:px-0 lg:pt-35 lg:pb-35">
      <div className="mx-auto w-full max-w-360 lg:px-30">
        <HeroSurface
          markHero={false}
          aria-labelledby="cta-title"
          className="relative overflow-hidden rounded-panel-sm lg:rounded-[40px]"
          panelClassName="absolute inset-0 overflow-hidden bg-ink"
        >
          <div data-theme="dark" className="relative z-10 flex flex-col items-center px-4 pt-12 text-center lg:pt-20">
            <h2 id="cta-title" className="font-display text-headline-m text-fg lg:w-140 lg:text-headline-l">
              See your grade before your competitors do.
            </h2>
            <ScanForm variant="cta" animate={onScreen} />
          </div>
          <div className="relative mt-8 h-75 overflow-hidden lg:mx-auto lg:mt-16 lg:h-103.75 lg:w-250">
            <div className="absolute top-0 left-2 w-250 origin-top-left scale-[0.55] lg:left-0 lg:scale-100">
              <RankWindow />
            </div>
          </div>
        </HeroSurface>
      </div>
    </section>
  );
}

function RankWindow() {
  return (
    <div data-theme="light" className="overflow-hidden rounded-card border border-line bg-surface shadow-window">
      <div className="flex h-11 items-center justify-between border-b border-line bg-surface-subtle px-4">
        <Image src="/images/hero/browser-dots.svg" alt="" width={52} height={12} />
        <span className="rounded-lg border border-line bg-surface px-4 py-1.5 text-label-s text-muted">
          app.visigain.com/rank-tracking
        </span>
        <span className="w-13" />
      </div>
      <div className="h-149.5 overflow-hidden">
        <Image
          src="/images/cta/rank-tracking.png"
          alt="Rank tracking: positions on Google, Maps and the map pack"
          width={2000}
          height={2660}
          sizes="(min-width: 64rem) 1000px, 550px"
          className="w-full"
        />
      </div>
    </div>
  );
}
