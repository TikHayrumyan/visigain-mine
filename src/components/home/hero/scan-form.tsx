"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";
import { suggestBusinesses, type Business } from "./businesses";

const DEMO_NAME = "Skin Works Medical Spa";
/** The homepage timeline's pass, 40.2–44.0s: the name types, then the cursor presses the button. */
const LOOP_MS = 3800;

type Variant = "hero" | "cta";
type Mode = "business" | "website";

type Demo = {
  count: number;
  /** 0 at the cursor's start, 1 when it sits on the button. */
  progress: number;
  pressed: boolean;
  cursor: number;
};

const FIELD = {
  hero: "h-14 shadow-field lg:h-15",
  cta: "h-15 shadow-[var(--shadow-fieldCta)]",
} as const;

const FORM = {
  hero: "pt-2 lg:w-140 lg:pt-3",
  cta: "mt-8 lg:w-140",
} as const;

function demoAt(ms: number): Demo {
  const t = (ms % LOOP_MS) / 1000;
  const count = t < 0.75 ? Math.ceil((t / 0.75) * DEMO_NAME.length) : t < 2.75 ? DEMO_NAME.length : 0;
  const move = t < 0.65 ? 0 : t >= 2 ? 1 : (t - 0.65) / 1.35;
  const progress = move < 0.5 ? 2 * move * move : 1 - ((-2 * move + 2) ** 2) / 2;
  const cursor = t < 0.6 ? 0 : t < 0.75 ? (t - 0.6) / 0.15 : t < 2.35 ? 1 : t < 2.75 ? 1 - (t - 2.35) / 0.4 : 0;
  return { count, progress, pressed: t >= 2.05 && t < 2.35, cursor };
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
      if (
        !prev ||
        prev.count !== next.count ||
        prev.pressed !== next.pressed ||
        Math.abs(prev.progress - next.progress) > 0.02 ||
        Math.abs(prev.cursor - next.cursor) > 0.05
      ) {
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

/**
 * The scan field shared by the hero and the closing panel. Typing a business name opens up to three suggestions;
 * the footer turns the same field into a website address. The closing panel also plays the typing demo while idle.
 */
export function ScanForm({ variant = "hero", animate = false }: { variant?: Variant; animate?: boolean }) {
  const listId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("business");
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);

  const demo = useDemo(variant === "cta" && animate && !focused && value === "" && mode === "business");
  const preview = demo ? DEMO_NAME.slice(0, demo.count) : "";
  const previewing = preview.length > 0 && !focused && value === "";
  const suggestions = mode === "business" ? suggestBusinesses(value) : [];
  const open = focused && mode === "business" && value.trim().length > 0 && !dismissed;
  const activeIndex = suggestions.length > 0 ? Math.min(active, suggestions.length - 1) : -1;
  const current = open && activeIndex >= 0 ? suggestions[activeIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setDismissed(true);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const choose = (business: Business) => {
    setValue(business.name);
    setDismissed(true);
    setActive(0);
    inputRef.current?.focus();
  };

  const useWebsite = () => {
    setMode("website");
    setValue("");
    setDismissed(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setDismissed(true);
      }
      return;
    }
    if (mode !== "business" || suggestions.length === 0) return;
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setDismissed(false);
      setActive(event.key === "ArrowUp" ? suggestions.length - 1 : 0);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && current) {
      event.preventDefault();
      choose(current);
    }
  };

  return (
    <form ref={formRef} action={FREE_SCAN.href} className={`relative flex w-full flex-col gap-2.5 ${FORM[variant]}`}>
      <div className="relative z-20">
        <label
          className={`flex items-center gap-3 rounded-pill border bg-surface px-5.5 lg:pr-50 ${FIELD[variant]} ${focused ? "border-green" : "border-line-darken"}`}
        >
          <Image src="/icons/search.svg" alt="" width={20} height={20} />
          <span className="sr-only">{mode === "website" ? "Your website" : "Your business name"}</span>
          <input
            ref={inputRef}
            name={previewing ? undefined : mode === "website" ? "website" : "business"}
            type={mode === "website" ? "url" : "text"}
            inputMode={mode === "website" ? "url" : "text"}
            required
            readOnly={previewing}
            autoComplete={mode === "website" ? "url" : "off"}
            aria-autocomplete={mode === "business" ? "list" : undefined}
            aria-controls={open ? listId : undefined}
            aria-expanded={mode === "business" ? open : undefined}
            aria-activedescendant={current ? `${listId}-${activeIndex}` : undefined}
            role={mode === "business" ? "combobox" : undefined}
            placeholder={mode === "website" ? "Enter your website" : "Enter your business name"}
            value={previewing ? preview : value}
            onChange={(event) => {
              setValue(event.target.value);
              setDismissed(false);
              setActive(0);
            }}
            onFocus={() => {
              setFocused(true);
              setDismissed(false);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            className="min-w-0 flex-1 border-none bg-transparent text-body-l text-fg caret-green outline-none placeholder:text-faint focus:border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none!"
          />
        </label>
        {open ? (
          <div className="absolute top-full z-20 mt-2 w-full rounded-[20px] border border-line-darken bg-surface p-2 shadow-menu lg:rounded-panel-sm">
            {suggestions.length > 0 ? (
              <ul id={listId} role="listbox" aria-label="Businesses">
                {suggestions.map((business, index) => (
                  <li key={business.name}>
                    <Suggestion
                      id={`${listId}-${index}`}
                      business={business}
                      selected={index === activeIndex}
                      onSelect={() => choose(business)}
                      onHighlight={() => setActive(index)}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={useWebsite}
              className="w-full px-3.5 pt-2.5 pb-1.5 text-left text-body-s text-faint hover:text-fg"
            >
              Can’t find it? Enter your website instead
            </button>
          </div>
        ) : null}
      </div>
      <button
        type="submit"
        className={`${PRIMARY_BUTTON} h-13 w-full cursor-pointer px-6 lg:absolute lg:right-1.5 lg:bottom-1.5 lg:z-30 lg:h-12 lg:w-auto`}
        style={{ transform: demo?.pressed ? "scale(0.97)" : undefined, transition: "transform 0.1s ease-out" }}
      >
        {FREE_SCAN.label}
      </button>
      {demo && demo.cursor > 0 ? (
        <span
          aria-hidden
          className="pointer-events-none absolute z-30 hidden text-ink lg:block"
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
  );
}

function Suggestion({
  id,
  business,
  selected,
  onSelect,
  onHighlight,
}: {
  id: string;
  business: Business;
  selected: boolean;
  onSelect: () => void;
  onHighlight: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onHighlight}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-card px-3.5 py-3 text-left ${selected ? "bg-line" : ""}`}
    >
      <Image src="/icons/map-pin-area.svg" alt="" width={20} height={20} />
      <span className="min-w-0">
        <span className="block text-label-m text-fg">{business.name}</span>
        <span className="mt-0.5 block text-body-s text-faint">{business.address}</span>
      </span>
    </button>
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
