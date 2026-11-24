"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";
import { HeroSurface } from "../hero/hero-surface";

const NAME = "Skin Works Medical Spa";
/** The homepage timeline's pass, 40.2–44.0s: the name types, then the cursor presses the button. */
const LOOP_MS = 3800;

type Demo = {
  count: number;
  /** 0 at the cursor's start, 1 when it sits on the button. */
  progress: number;
  pressed: boolean;
  cursor: number;
};

function demoAt(ms: number): Demo {
  const t = (ms % LOOP_MS) / 1000;
  const count = t < 0.75 ? Math.ceil((t / 0.75) * NAME.length) : t < 2.75 ? NAME.length : 0;
  const move = t < 0.65 ? 0 : t >= 2 ? 1 : (t - 0.65) / 1.35;
  const progress = move < 0.5 ? 2 * move * move : 1 - ((-2 * move + 2) ** 2) / 2;
  const cursor = t < 0.6 ? 0 : t < 0.75 ? (t - 0.6) / 0.15 : t < 2.35 ? 1 : t < 2.75 ? 1 - (t - 2.35) / 0.4 : 0;
  return { count, progress, pressed: t >= 2.05 && t < 2.35, cursor };
}

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

function useDemo(running: boolean) {
  const [demo, setDemo] = useState<Demo | null>(null);
  const current = useRef<Demo | null>(null);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const next = demoAt(now - start);
      const prev = current.current;
      if (!prev || prev.count !== next.count || prev.pressed !== next.pressed || Math.abs(prev.progress - next.progress) > 0.02 || Math.abs(prev.cursor - next.cursor) > 0.05) {
        current.current = next;
        setDemo(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  return demo;
}

/** The closing panel: the same dotted field as the hero, a scan, and the rank-tracking screen. */
export function Cta() {
  const router = useRouter();
  const section = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(section);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const demo = useDemo(onScreen && !focused && value === "");
  const shown = demo ? NAME.slice(0, demo.count) : value;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const business = shown.trim();
    if (!business) return;
    router.push(`${FREE_SCAN.href}?business=${encodeURIComponent(business)}`);
  };

  return (
    <section ref={section} className="bg-bg px-2 pt-hero pb-20 lg:px-0 lg:pt-35 lg:pb-35">
      <div className="mx-auto w-full max-w-360 lg:px-30">
        <HeroSurface
          markHero={false}
          aria-labelledby="cta-title"
          className="relative overflow-hidden rounded-panel-sm lg:rounded-[40px]"
          panelClassName="absolute inset-0 overflow-hidden bg-ink"
        >
          <div data-theme="dark" className="relative flex flex-col items-center px-4 pt-12 text-center lg:pt-20">
            <h2 id="cta-title" className="font-display text-headline-m text-fg lg:w-140 lg:text-headline-l">
              See your grade before your competitors do.
            </h2>
            <form onSubmit={submit} className="mt-8 flex w-full flex-col gap-2.5 lg:relative lg:w-140">
              <label className="flex h-15 items-center gap-3 rounded-pill border border-line-darken bg-surface px-5.5 shadow-(--shadow-fieldCta) lg:pr-50">
                <Image src="/icons/search.svg" alt="" width={20} height={20} />
                <span className="sr-only">Your business name</span>
                <input
                  name="business"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Enter your business name"
                  value={shown}
                  onChange={(event) => setValue(event.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="min-w-0 flex-1 border-none bg-transparent text-body-l text-fg outline-none placeholder:text-faint focus:border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none!"
                />
              </label>
              <button
                type="submit"
                className={`${PRIMARY_BUTTON} h-13 w-full px-6 lg:absolute lg:right-1.5 lg:bottom-1.5 lg:h-12 lg:w-auto`}
                style={{ transform: demo?.pressed ? "scale(0.97)" : undefined, transition: "transform 0.1s ease-out" }}
              >
                {FREE_SCAN.label}
              </button>
              {demo && demo.cursor > 0 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute z-10 hidden text-ink lg:block"
                  style={{
                    right: 78,
                    top: 14,
                    opacity: demo.cursor,
                    transform: `translate(${(1 - demo.progress) * 189}px, ${(1 - demo.progress) * 183}px)`,
                  }}
                >
                  <Cursor />
                </span>
              ) : null}
            </form>
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

function Cursor() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden>
      <path
        d="M1 1.2 L1 14.2 L4.2 11.1 L6.6 16.4 L8.4 15.6 L6 10.3 L10.2 10.1 Z"
        className="fill-white stroke-ink"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
