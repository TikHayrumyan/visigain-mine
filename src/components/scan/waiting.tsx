"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroSurface } from "@/components/home/hero/hero-surface";
import styles from "@/components/home/hero/hero.module.css";

const STEP = 18;

/** Step 2. The bar is this page's own timer: nothing is measuring the website yet. */
export function Waiting() {
  const website = useSearchParams().get("website") || "skinworksmed.com";
  const router = useRouter();
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (progress >= 100) {
      const timer = window.setTimeout(() => {
        router.push(`/scan/result?website=${encodeURIComponent(website)}`);
      }, 400);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setProgress((value) => Math.min(100, value + STEP)), 1600);
    return () => window.clearTimeout(timer);
  }, [progress, router, website]);

  return (
    <>
      <HeroSurface
        aria-labelledby="waiting-title"
        className="relative mx-2 mt-2 min-h-62.5 overflow-hidden rounded-panel-sm lg:mx-auto lg:mt-0 lg:h-87.5 lg:min-h-0 lg:overflow-visible lg:rounded-none"
        panelClassName="absolute inset-0 overflow-hidden rounded-panel-sm bg-ink lg:inset-x-4 lg:rounded-panel"
      >
        <div data-theme="dark" className="relative z-10 px-4 pt-26.5 pb-10 lg:mx-auto lg:w-full lg:max-w-360 lg:px-30 lg:pt-40">
          <div className="flex max-w-200 flex-col gap-4">
            <h1 id="waiting-title" className="font-display text-display-s text-fg lg:text-display-m">
              Grading {website}
            </h1>
            <p className="text-body-l text-muted">
              This usually takes 5 to 15 minutes. You can close this page; we’ll email you.
            </p>
          </div>
        </div>
      </HeroSurface>
      <section className="bg-bg px-5 pt-8 pb-16 lg:px-30 lg:pt-16 lg:pb-35">
        <div className="mx-auto flex w-full max-w-200 flex-col gap-6 rounded-card-lg border border-line bg-surface p-6 lg:p-10">
          <p className="flex items-center gap-4 font-display text-title-l text-fg">
            <span
              className="scan-pulse size-3 shrink-0 rounded-full bg-green shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-green)_25%,transparent)]"
              aria-hidden
            />
            Waiting for a free measuring slot…
          </p>
          <div className={`h-3 overflow-hidden rounded-full ${styles.track}`}>
            <div className="h-full rounded-full bg-green transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-body-m text-muted">This page updates by itself while we grade.</p>
            <button
              type="button"
              onClick={() => setProgress((value) => Math.min(100, value + STEP))}
              className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-full border border-ink px-4 text-body-m text-fg lg:w-auto"
            >
              Refresh now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
