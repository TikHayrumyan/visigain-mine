"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

/**
 * One 6s pass of the three demos, taken from the homepage timeline at 27.9–33.9s.
 * Each demo then holds its reset until the loop starts again.
 */
const LOOP_MS = 6000;
const BUSINESS = "Skin Works Medical Spa";
const EMAIL = "owner@skinworksmed.com";

const GRADES = [
  { letter: "F", score: "31.4", tile: "bg-grade-f" },
  { letter: "D", score: "48.2", tile: "bg-grade-d" },
  { letter: "C", score: "61.5", tile: "bg-grade-c" },
  { letter: "B", score: "75.9", tile: "bg-grade-b" },
  { letter: "A", score: "88.4", tile: "bg-grade-a" },
] as const;

const CHECKS = ["Your website", "Your Google listing and maps", "What AI assistants say about you"] as const;

type Phase = {
  business: number;
  email: number;
  businessFocus: boolean;
  emailFocus: boolean;
  pressed: boolean;
  checks: number;
  grade: number;
  pulse: boolean;
  /** The grade jumps back to F without rolling through the letters. */
  snap: boolean;
};

/** The still frame in the design: both fields filled, two checks done, a B. */
const POSTER: Phase = {
  business: BUSINESS.length,
  email: EMAIL.length,
  businessFocus: false,
  emailFocus: false,
  pressed: false,
  checks: 2,
  grade: 3,
  pulse: false,
  snap: true,
};

function typedCount(seconds: number, start: number, end: number, length: number) {
  if (seconds < start || seconds >= 4.8) return 0;
  const progress = Math.min(1, (seconds - start) / (end - start));
  return Math.min(length, Math.ceil(progress * length));
}

function phaseAt(ms: number): Phase {
  const seconds = (ms % LOOP_MS) / 1000;
  let grade = 0;
  if (seconds >= 1.15 && seconds < 5.35) grade = seconds >= 3.55 ? 4 : seconds >= 2.75 ? 3 : seconds >= 1.95 ? 2 : 1;
  const checks = seconds < 0.7 || seconds >= 4.8 ? 0 : Math.min(3, Math.floor((seconds - 0.7) / 0.8) + 1);
  return {
    business: typedCount(seconds, 0.25, 1, BUSINESS.length),
    email: typedCount(seconds, 1.4, 2.45, EMAIL.length),
    businessFocus: seconds >= 0.09 && seconds < 1.4,
    emailFocus: seconds >= 1.24 && seconds < 2.8,
    pressed: seconds >= 2.75 && seconds < 2.9,
    checks,
    grade,
    pulse: seconds >= 3.25 && seconds < 3.55,
    snap: seconds >= 5.35,
  };
}

function samePhase(a: Phase, b: Phase) {
  return (
    a.business === b.business &&
    a.email === b.email &&
    a.businessFocus === b.businessFocus &&
    a.emailFocus === b.emailFocus &&
    a.pressed === b.pressed &&
    a.checks === b.checks &&
    a.grade === b.grade &&
    a.pulse === b.pulse &&
    a.snap === b.snap
  );
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

function useDemoPhase(running: boolean) {
  const [phase, setPhase] = useState(POSTER);
  const current = useRef(POSTER);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const next = phaseAt(now - start);
      if (!samePhase(current.current, next)) {
        current.current = next;
        setPhase(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  return phase;
}

const STEPS = [
  {
    title: "Find your business",
    body: "Start typing your business name, pick it from the list and add your email. That’s all we need.",
  },
  {
    title: "We measure it against our standard",
    body: "We check your business against the free part of Visigain’s standard. It usually takes about 15 minutes.",
  },
  {
    title: "You get your grade by email",
    body: "A letter grade with its score, your biggest finding and your easiest win. If you want every finding with its exact fix, that’s the full report.",
  },
] as const;

/** Three steps. Each demo loops while the section is on screen; reduced motion keeps the still frame. */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(section);
  const reduceMotion = useReducedMotion();
  const phase = useDemoPhase(onScreen && !reduceMotion);
  const shown = onScreen && !reduceMotion ? phase : POSTER;

  return (
    <section id="how-it-works" ref={section} className="scroll-mt-28 bg-bg pt-hero lg:scroll-mt-32 lg:pt-35">
      <div className="mx-auto flex w-full max-w-360 flex-col items-center gap-7 px-5 lg:gap-14 lg:px-30">
        <h2 className="text-center font-display text-headline-m text-fg lg:text-headline-l">How it works</h2>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
          <Step number="1" title={STEPS[0].title} body={STEPS[0].body}>
            <FindDemo phase={shown} />
          </Step>
          <Step number="2" title={STEPS[1].title} body={STEPS[1].body}>
            <MeasureDemo phase={shown} />
          </Step>
          <Step number="3" title={STEPS[2].title} body={STEPS[2].body}>
            <GradeDemo phase={shown} />
          </Step>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  body,
  children,
}: {
  number: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-6 rounded-[20px] bg-surface px-2 pt-2 pb-7 ring-1 ring-line ring-inset">
      <div className="@container relative w-full">
        <div className="relative w-full overflow-hidden rounded-[14px]" style={{ height: "calc(272px * 100cqw / 368px)" }}>
          <div
            aria-hidden
            className="absolute top-0 left-0 h-68 w-92 origin-top-left bg-surface-subtle"
            style={{ transform: "scale(calc(100cqw / 368px))" }}
          >
            {children}
            <span className="absolute top-3 right-3 grid size-11 place-items-center rounded-[16px] border-6 border-surface-subtle bg-ink text-label-m text-white">
              {number}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5">
        <h3 className="font-display text-title-l text-fg">{title}</h3>
        <p className="text-body-m text-muted">{body}</p>
      </div>
    </article>
  );
}

function FindDemo({ phase }: { phase: Phase }) {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <Field label="Business" value={BUSINESS.slice(0, phase.business)} focused={phase.businessFocus} caret={phase.businessFocus && phase.business > 0} />
      <Field label="Email" value={EMAIL.slice(0, phase.email)} focused={phase.emailFocus} caret={phase.emailFocus && phase.email > 0} />
      <div
        className={`grid h-11 place-items-center rounded-button bg-green text-label-m text-ink ${phase.pressed ? "scale-95 opacity-85" : "scale-100 opacity-100"}`}
        style={{ transition: "scale 0.15s ease-out, opacity 0.15s ease-out" }}
      >
        Get Your Free Scan
      </div>
    </div>
  );
}

function Field({ label, value, focused, caret }: { label: string; value: string; focused: boolean; caret: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-s text-muted">{label}</span>
      <span
        className={`flex items-center overflow-hidden rounded-[12px] border px-4 py-3.5 ${focused ? "border-green" : "border-line-darken"}`}
        style={{ transition: "border-color 0.2s ease-out" }}
      >
        <span className="min-h-5 text-body-m whitespace-nowrap text-fg">{value}</span>
        {caret ? <span className="ml-px h-4 w-px shrink-0 bg-fg" /> : null}
      </span>
    </label>
  );
}

function MeasureDemo({ phase }: { phase: Phase }) {
  return (
    <div className="flex h-full flex-col justify-center px-6 py-4">
      <div className="rounded-[12px] bg-surface px-4 py-1 ring-1 ring-line ring-inset">
        {CHECKS.map((task, index) => (
          <CheckRow key={task} task={task} done={index < phase.checks} divider={index > 0} />
        ))}
      </div>
    </div>
  );
}

function CheckRow({ task, done, divider }: { task: string; done: boolean; divider: boolean }) {
  return (
    <div className="relative flex items-start gap-3.5 py-3.5">
      {divider ? <span className="absolute inset-x-0 top-0 h-px bg-line" /> : null}
      <span className="relative mt-px grid size-[22px] shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-lg border border-line-darken" />
        <span
          className={`absolute inset-0 grid place-items-center rounded-lg bg-green text-ink ${done ? "scale-100 opacity-100" : "scale-[0.6] opacity-0"}`}
          style={{ transition: "scale 0.3s cubic-bezier(0.45, 1.45, 0.8, 1), opacity 0.2s ease-out" }}
        >
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M11.6661 3.5L5.24943 9.91667L2.33276 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={done ? 0 : 1}
              style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
            />
          </svg>
        </span>
      </span>
      <span className={`min-w-0 flex-1 text-body-m ${done ? "text-faint" : "text-fg"}`} style={{ transition: "color 0.25s ease-out" }}>
        {task}
      </span>
      <span className="relative h-6.5 shrink-0">
        <span className={`flex h-6.5 items-center rounded-pill bg-chip-neutral px-2.5 text-label-s text-muted ${done ? "opacity-0" : "opacity-100"}`} style={{ transition: "opacity 0.15s ease-out" }}>
          To do
        </span>
        <span
          className={`absolute inset-0 flex h-6.5 items-center justify-center rounded-pill bg-chip-ok px-2.5 text-label-s text-ok ${done ? "scale-100 opacity-100" : "scale-[0.85] opacity-0"}`}
          style={{ transition: "scale 0.2s cubic-bezier(0.45, 1.45, 0.8, 1), opacity 0.2s ease-out" }}
        >
          Done
        </span>
      </span>
    </div>
  );
}

function GradeDemo({ phase }: { phase: Phase }) {
  const grade = GRADES[phase.grade] ?? GRADES[0];
  const motion = phase.snap ? "none" : undefined;
  return (
    <div className="flex h-full flex-col justify-center p-6">
      <div className="flex flex-col gap-3 rounded-[12px] bg-surface px-4 py-3.5 ring-1 ring-line ring-inset">
        <div className="flex items-center gap-3">
          <div
            className={`relative size-14 shrink-0 overflow-hidden rounded-[12px] ${grade.tile} ${phase.pulse ? "scale-[1.08]" : "scale-100"}`}
            style={{ transition: motion ?? "background-color 0.36s ease-in-out, scale 0.15s ease-out" }}
          >
            {GRADES.map((item, index) => (
              <span
                key={item.letter}
                className="absolute inset-0 grid place-items-center font-display text-headline-m text-ink"
                style={{
                  opacity: index === phase.grade ? 1 : 0,
                  transform: `translateY(${index === phase.grade ? 0 : index < phase.grade ? -14 : 14}px)`,
                  transition: motion ?? "opacity 0.3s ease-out, transform 0.3s ease-out",
                }}
              >
                {item.letter}
              </span>
            ))}
          </div>
          <div className="min-w-0">
            <div className="h-8.5 overflow-hidden">
              <div style={{ transform: `translateY(${-phase.grade * 34}px)`, transition: motion ?? "transform 0.4s ease-in-out" }}>
                {GRADES.map((item) => (
                  <p key={item.score} className="font-display text-headline-m whitespace-nowrap text-fg">
                    {item.score}
                  </p>
                ))}
              </div>
            </div>
            <p className="text-label-s text-muted">Visigain · Your Visibility Grade</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5 rounded-[12px] bg-chip-warn px-3 py-2.5">
            <p className="text-label-s text-grade-c">Biggest finding</p>
            <p className="text-body-m whitespace-nowrap text-fg">No prices on service pages</p>
          </div>
          <div className="flex flex-col gap-0.5 rounded-[12px] bg-chip-ok px-3 py-2.5">
            <p className="text-label-s text-ok">Easiest win</p>
            <p className="text-body-m whitespace-nowrap text-fg">Add your booking link</p>
          </div>
        </div>
      </div>
    </div>
  );
}
