"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { motion, useMotionValue } from "motion/react";

import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { FREE_SCAN } from "@/config/navigation";
import { suggestBusinesses, type Business } from "./businesses";

type Variant = "hero" | "cta";
type Mode = "business" | "website";
type FocusScope = "field" | "form" | null;

type ScanFormProps = {
  variant?: Variant;
  animate?: boolean;
};

type SuggestionProps = {
  id: string;
  business: Business;
  selected: boolean;
  onSelect: () => void;
  onHighlight: () => void;
};

type DemoFrame = {
  count: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
};

const DEMO_NAME = "Skin Works Medical Spa";

const TIMING = {
  loop: 3800,
  typingEnd: 750,
  cursorStart: 600,
  movementStart: 650,
  movementEnd: 2000,
  pressStart: 2050,
  pressEnd: 2350,
  reset: 2750,
} as const;

const CURSOR_OFFSET = { x: 189, y: 183 } as const;
const PRESSED_SCALE = 0.97;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const FIELD = {
  hero: "h-14 shadow-field lg:h-15",
  cta: "h-15 shadow-[var(--shadow-fieldCta)]",
} satisfies Record<Variant, string>;

const FORM = {
  hero: "pt-2 lg:w-140 lg:pt-3",
  cta: "mt-8 lg:w-140",
} satisfies Record<Variant, string>;

function subscribeReducedMotion(onChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return true;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getServerReducedMotionSnapshot);
}

function progressAt(time: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (time - start) / (end - start)));
}

function easeInOutQuad(value: number): number {
  return value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
}

function demoAt(elapsed: number): DemoFrame {
  const time = elapsed % TIMING.loop;
  const count = time < TIMING.reset ? Math.ceil(progressAt(time, 0, TIMING.typingEnd) * DEMO_NAME.length) : 0;
  const movement = easeInOutQuad(progressAt(time, TIMING.movementStart, TIMING.movementEnd));
  const opacity =
    time < TIMING.cursorStart
      ? 0
      : time < TIMING.typingEnd
        ? progressAt(time, TIMING.cursorStart, TIMING.typingEnd)
        : time < TIMING.pressEnd
          ? 1
          : time < TIMING.reset
            ? 1 - progressAt(time, TIMING.pressEnd, TIMING.reset)
            : 0;

  return {
    count,
    x: (1 - movement) * CURSOR_OFFSET.x,
    y: (1 - movement) * CURSOR_OFFSET.y,
    opacity,
    scale: time >= TIMING.pressStart && time < TIMING.pressEnd ? PRESSED_SCALE : 1,
  };
}

function normalizeWebsite(raw: string): string | null {
  const value = raw.trim();

  if (!value || /\s/.test(value)) return null;

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value);

  try {
    const url = new URL(hasScheme ? value : `https://${value}`);

    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
      return null;
    }

    const hostname = url.hostname;

    if (
      hostname.length > 253 ||
      !hostname.includes(".") ||
      !hostname.split(".").every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function sameName(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: "accent" }) === 0;
}

function useDemo(running: boolean) {
  const [count, setCount] = useState(0);
  const [runningNow, setRunningNow] = useState(running);

  if (running !== runningNow) {
    setRunningNow(running);
    if (running) setCount(0);
  }

  const x = useMotionValue<number>(CURSOR_OFFSET.x);
  const y = useMotionValue<number>(CURSOR_OFFSET.y);
  const opacity = useMotionValue<number>(0);
  const scale = useMotionValue<number>(1);

  useEffect(() => {
    if (!running) return;

    let frameId = 0;
    let previousCount = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const frame = demoAt(now - start);

      if (frame.count !== previousCount) {
        previousCount = frame.count;
        setCount(frame.count);
      }

      x.set(frame.x);
      y.set(frame.y);
      opacity.set(frame.opacity);
      scale.set(frame.scale);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      x.set(CURSOR_OFFSET.x);
      y.set(CURSOR_OFFSET.y);
      opacity.set(0);
      scale.set(1);
    };
  }, [running, x, y, opacity, scale]);

  return {
    text: running ? DEMO_NAME.slice(0, count) : "",
    x,
    y,
    opacity,
    scale,
  };
}

export function ScanForm({ variant = "hero", animate = false }: ScanFormProps) {
  const router = useRouter();
  const listId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("business");
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<FocusScope>(null);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);

  const reducedMotion = usePrefersReducedMotion();
  const isBusiness = mode === "business";
  const query = value.trim();
  const fieldFocused = scope === "field";

  const demoRunning = variant === "cta" && animate && !reducedMotion && scope === null && value === "" && isBusiness;

  const demo = useDemo(demoRunning);
  const suggestions = isBusiness && query.length > 0 ? suggestBusinesses(query) : [];
  const open = fieldFocused && isBusiness && query.length > 0 && !dismissed;
  const activeIndex = open && suggestions.length > 0 ? Math.min(active, suggestions.length - 1) : -1;
  const highlighted = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
  const placeholder = isBusiness ? "Enter your business name" : "Enter your website";

  function dismissPopup(): void {
    setDismissed(true);
    setActive(0);
  }

  function chooseBusiness(business: Business): void {
    inputRef.current?.setCustomValidity("");
    setValue(business.name);
    setActive(0);
    inputRef.current?.focus();
    setDismissed(true);
  }

  function switchToWebsite(): void {
    inputRef.current?.setCustomValidity("");
    setMode("website");
    setValue("");
    setActive(0);
    inputRef.current?.focus();
    setDismissed(true);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const input = inputRef.current;

    if (!input) return;

    input.setCustomValidity("");

    if (!query) {
      input.focus();

      // The demo paints a name over an empty input. A click ends the loop
      // and lets the user type, instead of reporting an empty field.
      if (demoRunning) return;

      input.setCustomValidity(isBusiness ? "Please enter your business name." : "Please enter your website.");
      input.reportValidity();
      return;
    }

    const normalizedValue = isBusiness ? query : normalizeWebsite(query);

    if (!normalizedValue) {
      input.setCustomValidity("Please enter a valid website address.");
      input.reportValidity();
      return;
    }

    const params = new URLSearchParams({ [mode]: normalizedValue });

    router.push(`${FREE_SCAN.href}?${params}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.nativeEvent.isComposing || !isBusiness) return;

    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      dismissPopup();
      return;
    }

    if (suggestions.length === 0) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setDismissed(false);
        setActive(open ? Math.min(activeIndex + 1, suggestions.length - 1) : 0);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        setDismissed(false);
        setActive(open ? Math.max(activeIndex - 1, 0) : suggestions.length - 1);
        break;
      }

      case "Enter": {
        if (!open || !highlighted || sameName(highlighted.name, query)) return;

        event.preventDefault();
        chooseBusiness(highlighted);
        break;
      }
    }
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>): void {
    if (!demoRunning || !event.isPrimary || event.button !== 0) return;

    event.preventDefault();
  }

  function onClick(event: MouseEvent<HTMLButtonElement>): void {
    if (!demoRunning) return;

    event.preventDefault();
    inputRef.current?.focus();
  }

  return (
    <form
      action={FREE_SCAN.href}
      method="get"
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={(event) => {
        const target = event.target;

        setScope(target instanceof Node && fieldRef.current?.contains(target) ? "field" : "form");
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;

        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setScope(null);
        }
      }}
      className={`relative flex w-full flex-col gap-2.5 ${FORM[variant]}`}
    >
      <div
        ref={fieldRef}
        className="relative z-20"
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.key !== "Escape" || !open) return;

          event.preventDefault();
          inputRef.current?.focus();
          dismissPopup();
        }}
      >
        <label
          className={`flex items-center gap-3 rounded-pill border bg-surface px-5.5 lg:pr-50 ${FIELD[variant]} ${
            fieldFocused ? "border-green" : "border-line-darken"
          }`}
        >
          <Image src="/icons/search.svg" alt="" width={20} height={20} />

          <span className="sr-only">{isBusiness ? "Your business name" : "Your website"}</span>

          <span className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              name={mode}
              type="text"
              inputMode={isBusiness ? "text" : "url"}
              autoComplete={isBusiness ? "off" : "url"}
              autoCapitalize={isBusiness ? undefined : "none"}
              spellCheck={isBusiness}
              role={isBusiness ? "combobox" : undefined}
              aria-autocomplete={isBusiness ? "list" : undefined}
              aria-expanded={isBusiness ? open : undefined}
              aria-controls={open ? listId : undefined}
              aria-activedescendant={highlighted ? `${listId}-${activeIndex}` : undefined}
              placeholder={demo.text ? "" : placeholder}
              value={value}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setValue(event.currentTarget.value);
                setDismissed(false);
                setActive(0);
              }}
              onFocus={() => setDismissed(false)}
              onKeyDown={onKeyDown}
              className="block w-full min-w-0 border-none bg-transparent text-base text-fg caret-green outline-none placeholder:text-faint focus:border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none! lg:text-body-l"
            />

            {demo.text && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap bg-surface text-base text-fg lg:text-body-l"
              >
                {demo.text}
              </span>
            )}
          </span>
        </label>

        {open && (
          <div
            onMouseDown={(event) => event.preventDefault()}
            className="absolute top-full z-20 mt-2 w-full rounded-[20px] border border-line-darken bg-surface p-2 shadow-menu lg:rounded-panel-sm"
          >
            <ul id={listId} role="listbox" aria-label="Businesses">
              {suggestions.map((business, index) => (
                <li key={`${business.name}-${business.address}`} role="presentation">
                  <Suggestion
                    id={`${listId}-${index}`}
                    business={business}
                    selected={index === activeIndex}
                    onSelect={() => chooseBusiness(business)}
                    onHighlight={() => setActive(index)}
                  />
                </li>
              ))}
            </ul>

            {suggestions.length === 0 && (
              <span role="status" className="sr-only">
                No matching businesses.
              </span>
            )}

            <button
              type="button"
              onClick={switchToWebsite}
              className="w-full px-3.5 pt-2.5 pb-1.5 text-left text-body-s text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-green"
            >
              Can’t find it? Enter your website instead
            </button>
          </div>
        )}
      </div>

      <motion.button
        type="submit"
        onPointerDown={onPointerDown}
        onClick={onClick}
        className={`${PRIMARY_BUTTON} h-13 w-full cursor-pointer px-6 lg:absolute lg:right-1.5 lg:bottom-1.5 lg:z-30 lg:h-12 lg:w-auto`}
        style={{ scale: demoRunning ? demo.scale : 1 }}
      >
        {FREE_SCAN.label}
      </motion.button>

      {demoRunning && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-3.5 right-19.5 z-30 hidden text-ink lg:block"
          style={{ x: demo.x, y: demo.y, opacity: demo.opacity }}
        >
          <Cursor />
        </motion.span>
      )}
    </form>
  );
}

function Suggestion({ id, business, selected, onSelect, onHighlight }: SuggestionProps) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      tabIndex={-1}
      aria-selected={selected}
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
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
      <path
        d="M1 1.2 L1 14.2 L4.2 11.1 L6.6 16.4 L8.4 15.6 L6 10.3 L10.2 10.1 Z"
        className="fill-white stroke-ink"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
