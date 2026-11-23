"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FEATURES, type Feature } from "./features";

/** How far a card behind the active one peeks out. Desktop 24, phone 16. */
const PEEK_DESKTOP = 24;
const PEEK_PHONE = 16;

/** The front card sticks below the compact header, leaving room for two peeks. */
const STICKY = "top-25 lg:top-34.5";

/** Six feature rows. Each sticks; the next slides over it. At most three stay visible. */
export function KeyFeatures() {
  return (
    <section className="bg-bg pt-16 pb-[30vh] lg:pt-35">
      <div className="mx-auto flex max-w-160 flex-col items-center gap-4 px-5 text-center lg:px-0">
        <h2 className="font-display text-headline-m text-fg lg:text-headline-l">
          Everything that decides whether you get the call
        </h2>
        <p className="max-w-140 text-body-l text-muted">
          One grade, the fixes behind it, and weekly checks to keep it moving. We apply the same standard to every
          business, and each finding comes with its evidence.
        </p>
      </div>
      <div className="mt-10 flex flex-col lg:mt-10">
        {FEATURES.map((feature, index) => (
          <StackedRow key={feature.title} index={index} count={FEATURES.length}>
            <FeatureRow feature={feature} />
          </StackedRow>
        ))}
      </div>
    </section>
  );
}

function StackedRow({ index, count, children }: { index: number; count: number; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const probe = useRef<HTMLDivElement>(null);
  const behind = count - 1 - index;
  const { scrollYProgress } = useScroll({ target: probe, offset: ["start start", "end start"] });
  const peek = usePeek();
  const scale = useTransform(scrollYProgress, behind >= 2 ? [0, 0.5, 1] : [0, 1], behind >= 2 ? [1, 0.96, 0.92] : [1, 0.96]);
  const y = useTransform(
    scrollYProgress,
    behind >= 2 ? [0, 0.5, 1] : [0, 1],
    behind >= 2 ? [0, -peek, -peek * 2] : [0, -peek],
  );

  return (
    <div className="relative">
      <div ref={probe} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[200%]" />
      <motion.div
        style={reduceMotion || behind === 0 ? { zIndex: index + 1 } : { scale, y, zIndex: index + 1 }}
        className={`sticky ${STICKY} origin-top px-4 lg:px-0`}
      >
        <div className="mx-auto w-full max-w-270">{children}</div>
      </motion.div>
    </div>
  );
}

function usePeek() {
  const [peek, setPeek] = useState(PEEK_DESKTOP);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const apply = () => setPeek(query.matches ? PEEK_DESKTOP : PEEK_PHONE);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return peek;
}

function FeatureRow({ feature }: { feature: Feature }) {
  if (feature.icon === "grid") return <GradeCard />;
  const reduceMotion = useReducedMotion();
  const fade = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.5 },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  return (
    <article className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-card lg:h-133 lg:flex-row">
      <motion.div
        {...fade(0)}
        className={`flex flex-col justify-between gap-8 p-6 lg:h-full lg:w-95 lg:p-8 lg:pb-12 ${feature.visualFirst ? "lg:order-2" : ""}`}
      >
        <Icon name={feature.icon} />
        <div className="flex flex-col gap-5">
          <h3 className="font-display text-title-l text-fg lg:text-display-s">{feature.title}</h3>
          <p className="text-body-l text-muted">{feature.body}</p>
          {feature.link && (
            <Link href={feature.link.href} className="inline-flex items-center gap-1.5 text-label-m text-fg no-underline">
              {feature.link.label}
              <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
            </Link>
          )}
        </div>
      </motion.div>
      <motion.div
        {...fade(0.15)}
        className={`min-h-64 flex-1 p-4 lg:min-h-0 lg:p-4 ${feature.visualFirst ? "lg:order-1" : ""}`}
      >
        <Visual feature={feature} />
      </motion.div>
    </article>
  );
}

function Visual({ feature }: { feature: Feature }) {
  if (feature.icon === "pin") return <MapVisual />;
  if (feature.icon === "chat") return <ReviewsVisual />;
  if (feature.icon === "search") return <CitationsVisual />;
  if (feature.icon === "check") return <FixesVisual />;
  return <AlertsVisual />;
}

const NEARBY = [
  { grade: "A", name: "Veda Med Spa", score: "88.4", bar: "90.14%", tone: "bg-green", yours: false },
  { grade: "B", name: "Hydration Room", score: "81.2", bar: "82.75%", tone: "bg-grade-b", yours: false },
  { grade: "B", name: "You", score: "75.9", bar: "77.46%", tone: "bg-grade-b", yours: true },
  { grade: "C", name: "Soft Glow Med Spa", score: "64.7", bar: "66.2%", tone: "bg-grade-c", yours: false },
] as const;

function GradeCard() {
  return (
    <article className="flex flex-col items-center overflow-hidden rounded-[28px] bg-surface p-2 shadow-lift outline outline-1 -outline-offset-1 outline-line lg:h-133 lg:flex-row lg:gap-12 lg:rounded-[40px] lg:p-4">
      <div className="flex w-full flex-col gap-6 px-4 pt-5 pb-6 lg:h-full lg:w-95 lg:justify-between lg:gap-0 lg:pt-8 lg:pr-0 lg:pb-12 lg:pl-8">
        <span className="grid size-14 place-items-center rounded-full bg-ink">
          <Image src="/icons/layout-grid.svg" alt="" width={24} height={24} />
        </span>
        <div className="flex w-full flex-col gap-5">
          <h3 className="font-display text-headline-s text-fg lg:text-display-s">Your Visibility Grade, A to F</h3>
          <p className="text-body-l text-muted">One letter and one score, measured the same way for every business.</p>
        </div>
      </div>
      <div className="@container w-full lg:w-155 lg:shrink-0">
        <div className="relative h-[calc(500px*100cqw/620px)] w-full overflow-hidden rounded-[13.239px] bg-chip-ok outline outline-[1.103px] -outline-offset-1 outline-chip-ok lg:h-125 lg:rounded-panel-sm lg:outline-2">
          <div className="absolute top-0 left-0 h-125 w-155 origin-top-left scale-[calc(100cqw/620px)] lg:scale-100">
            <GradeScene />
          </div>
        </div>
      </div>
    </article>
  );
}

function GradeScene() {
  return (
    <div className="relative h-125 w-155">
      <div className="absolute top-8.25 left-10 flex w-80 flex-col gap-4 rounded-[20px] border border-line bg-surface p-6">
        <p className="text-label-m text-muted">Visibility Grade</p>
        <div className="flex items-center gap-3.5">
          <span className="grid size-14 place-items-center rounded-[14px] bg-grade-b font-display text-[32px] leading-9 text-ink">
            B
          </span>
          <span className="font-display text-display-s text-fg">75.9</span>
          <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-chip-ok pr-2.5 pl-2 text-label-s text-ok">
            <Image src="/icons/spark.svg" alt="" width={14} height={14} />
            1.2
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-12.75 rounded-sm bg-danger opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-d opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-c opacity-35" />
            <span className="h-2 w-12.75 rounded-sm bg-grade-b" />
            <span className="h-2 w-12.5 rounded-sm bg-green opacity-35" />
          </div>
          <div className="flex gap-1 text-center text-label-s">
            {["F", "D", "C", "B", "A"].map((letter) => (
              <span key={letter} className={`${letter === "A" ? "w-12.5" : "w-12.75"} ${letter === "B" ? "text-fg" : "text-faint"}`}>
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute top-50.5 left-53.5 flex w-95 flex-col gap-4 rounded-[20px] border border-line bg-surface px-6 py-5 shadow-card">
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-title-s text-fg">How you compare nearby</p>
          <p className="text-body-s text-faint">Top Google results for “med spa”</p>
        </div>
        <ul className="flex flex-col gap-5">
          {NEARBY.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-label-m text-ink ${item.tone}`}>
                {item.grade}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex justify-between text-body-m">
                  <span className={item.yours ? "font-medium" : "font-normal"}>{item.name}</span>
                  <span className="font-medium">{item.score}</span>
                </span>
                <span className="h-2.5 overflow-hidden rounded-pill bg-surface-subtle bg-[url('/images/features/track.png')] bg-size-[7px_7px]">
                  <span
                    className={`block h-full rounded-pill ${item.yours ? "bg-green" : "bg-line-darken"}`}
                    style={{ width: item.bar }}
                  />
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MapVisual() {
  const cells = ["bg-grade-b", "bg-grade-c", "bg-grade-d", "bg-line", "bg-grade-b", "bg-grade-c"];
  return (
    <div className="flex h-full min-h-72 flex-col gap-4 rounded-card bg-surface-subtle p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-title-s">Local Search Grid</p>
        <span className="text-label-s text-muted">Open the grid</span>
      </div>
      <p className="text-body-s text-muted">Average rank for “med spa”</p>
      <div className="grid flex-1 grid-cols-6 gap-1.5">
        {Array.from({ length: 30 }, (_, index) => (
          <div key={index} className={`rounded-sm ${cells[index % cells.length]}`} />
        ))}
      </div>
    </div>
  );
}

function ReviewsVisual() {
  return (
    <div className="relative h-full min-h-72 rounded-card bg-surface-subtle">
      <div className="absolute top-6 left-6 w-72 rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="font-display text-display-s">4.8</p>
        <p className="text-body-s text-muted">412 reviews · 86% replied</p>
      </div>
      <div className="absolute right-4 bottom-6 w-80 rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-label-m">Newest reviews</p>
        <p className="pt-2 text-body-s text-muted">“Booked the same day. Clear about the price.”</p>
        <p className="pt-2 text-body-s text-muted">“Came up first when I asked for a med spa.”</p>
      </div>
    </div>
  );
}

function CitationsVisual() {
  const directories = ["Google", "Yelp", "Apple Maps", "Facebook"];
  return (
    <div className="relative h-full min-h-72 rounded-card bg-chip-ok">
      <div className="absolute top-6 left-6 w-80 rounded-card border border-line bg-surface p-5">
        <p className="font-display text-title-s">Directories where we found you</p>
        <p className="mt-2 font-display text-display-s">
          17 <span className="text-title-s text-muted">of 36</span>
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-pill bg-line">
          <div className="h-full w-[47%] rounded-pill bg-green" />
        </div>
      </div>
      <div className="absolute right-4 bottom-4 w-80 rounded-card border border-line bg-surface p-4">
        {directories.map((name) => (
          <div key={name} className="flex items-center justify-between py-2 text-label-m">
            <span>{name}</span>
            <span className="text-ok">Match</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixesVisual() {
  const fixes = ["Add a booking link that loads", "Reply to reviews from this month", "Match your name on Yelp"];
  return (
    <div className="flex h-full min-h-72 flex-col gap-3 rounded-card bg-surface-subtle p-6">
      <p className="font-display text-title-s">What to fix first</p>
      {fixes.map((fix, index) => (
        <div key={fix} className="flex items-center gap-3 rounded-card bg-surface px-4 py-3">
          <span className="grid size-7 place-items-center rounded-full bg-ink text-label-s text-white">{index + 1}</span>
          <span className="text-label-m">{fix}</span>
        </div>
      ))}
    </div>
  );
}

function AlertsVisual() {
  const bars = ["h-8", "h-10", "h-12", "h-14", "h-16", "h-20", "h-24"];
  return (
    <div className="relative h-full min-h-72 rounded-card bg-warn-soft">
      <div className="absolute top-6 left-6 right-16 rounded-card border border-line bg-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-title-s">Your grade, week by week</p>
            <p className="text-body-s text-muted">Checked every Tuesday</p>
          </div>
          <span className="rounded-pill bg-chip-ok px-2 py-1 text-label-s text-ok">↑ 1.2</span>
        </div>
        <div className="mt-4 flex h-24 items-end gap-2">
          {bars.map((height) => (
            <div key={height} className={`flex-1 rounded-sm bg-line ${height}`} />
          ))}
          <div className="h-full w-6 rounded-sm bg-green" />
        </div>
        <div className="mt-2 flex justify-between text-body-s text-muted">
          <span>Aug 18</span>
          <span>Oct 6</span>
        </div>
      </div>
      <div className="absolute right-6 bottom-16 w-72 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
        <p className="text-label-m">Booking link is down</p>
        <p className="text-body-s text-muted">Daily check · 8:02 AM</p>
      </div>
      <div className="absolute bottom-4 left-10 w-72 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
        <p className="text-label-m">Your grade went up to B</p>
        <p className="text-body-s text-muted">Weekly check · Tuesday</p>
      </div>
    </div>
  );
}

function Icon({ name }: { name: Feature["icon"] }) {
  const src = {
    pin: "/icons/map-pin-area.svg",
    search: "/icons/search.svg",
    check: "/icons/check.svg",
  }[name as "pin" | "search" | "check"];

  return (
    <span className="grid size-14 place-items-center rounded-full bg-ink text-white">
      {src ? (
        <Image src={src} alt="" width={24} height={24} className="brightness-0 invert" />
      ) : name === "mail" ? (
        <MailIcon />
      ) : name === "chat" ? (
        <ChatIcon />
      ) : (
        <GridIcon />
      )}
    </span>
  );
}

function GridIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 16.5 4 20l4.2-1.4A8 8 0 1 0 6 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
