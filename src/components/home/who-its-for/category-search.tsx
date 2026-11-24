"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { FREE_SCAN } from "@/config/navigation";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import {
  CATEGORY_MARKET,
  searchCategories,
  type BusinessType,
} from "./categories";

type Hit =
  | { kind: "type"; type: BusinessType }
  | { kind: "category"; name: string; type: BusinessType };

const PANEL = "absolute top-full z-20 mt-2 w-full border border-line-darken bg-surface shadow-card";

/** The business-type search over the marquee: a grouped list, a found card, or a no-match note. */
export function CategorySearch() {
  const listId = useId();
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<BusinessType | null>(null);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [askingEmail, setAskingEmail] = useState(false);
  const [notified, setNotified] = useState<string | null>(null);

  const query = value.trim();
  const confirmed = selected && value === selected.name ? selected : null;
  const found = searchCategories(query);
  const hits: Hit[] = [
    ...found.types.map((type) => ({ kind: "type" as const, type })),
    ...found.categories.map((category) => ({ kind: "category" as const, name: category.name, type: category.type })),
  ];
  const open = focused && !dismissed && query.length > 0 && confirmed === null;
  const showList = open && hits.length > 0;
  const showEmpty =
    query.length > 0 &&
    confirmed === null &&
    hits.length === 0 &&
    ((focused && !dismissed) || askingEmail || notified !== null);
  const highlighted = showList ? Math.min(active, hits.length - 1) : 0;
  const engaged = focused || confirmed !== null || open;

  function choose(type: BusinessType): void {
    setSelected(type);
    setValue(type.name);
    setDismissed(true);
    setAskingEmail(false);
    setNotified(null);
  }

  function searchAgain(): void {
    setSelected(null);
    setValue("");
    setDismissed(false);
    setAskingEmail(false);
    setNotified(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      setDismissed(true);
      return;
    }
    if (!showList) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((highlighted + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((highlighted - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[highlighted];
      if (hit) choose(hit.type);
    }
  }

  function onBlur(event: FocusEvent<HTMLDivElement>): void {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setFocused(false);
    setDismissed(true);
  }

  return (
    <div className="absolute top-16.5 left-1/2 z-20 w-[calc(100%-2.5rem)] -translate-x-1/2 lg:w-140" onBlur={onBlur}>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className={`flex h-15 items-center gap-3 rounded-pill border bg-surface px-5.5 shadow-search ${
          engaged ? "border-green" : "border-line-darken"
        }`}
      >
        <Image src="/icons/search.svg" alt="" width={20} height={20} />
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Your business type</span>
          <input
            name="category"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={showList ? listId : undefined}
            aria-activedescendant={showList ? `${listId}-${highlighted}` : undefined}
            placeholder=" "
            autoComplete="off"
            value={value}
            onChange={(event) => {
              setValue(event.currentTarget.value);
              setSelected(null);
              setDismissed(false);
              setActive(0);
              setAskingEmail(false);
              setNotified(null);
            }}
            onFocus={() => {
              setFocused(true);
              setDismissed(false);
            }}
            onKeyDown={onKeyDown}
            className="peer block w-full min-w-0 border-none bg-transparent text-body-l text-fg caret-green outline-none placeholder:text-faint focus:border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none!"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center truncate text-body-l text-faint peer-not-placeholder-shown:hidden">
            <span className="lg:hidden">Search your business type</span>
            <span className="hidden lg:inline">Search your business type, e.g. “roofing contractor”</span>
          </span>
        </label>
        {confirmed ? (
          <CheckIcon className="size-5 shrink-0 text-green" />
        ) : query ? (
          <span className="shrink-0 text-body-s text-muted max-lg:sr-only" role="status">
            {matchLabel(hits.length)}
          </span>
        ) : (
          <span className="hidden shrink-0 text-body-s text-muted lg:inline">638 categories</span>
        )}
      </form>

      {showList && (
        <div
          onMouseDown={(event) => event.preventDefault()}
          className={`${PANEL} rounded-[20px] p-2 lg:rounded-panel-sm`}
        >
          <ul id={listId} role="listbox" aria-label="Business types and Google categories">
            {found.types.length > 0 && (
              <Group label="Business types">
                {found.types.map((type, index) => (
                  <Option
                    key={type.name}
                    id={`${listId}-${index}`}
                    name={type.name}
                    detail={`${type.group} · ${categoryCount(type.categories.length)}`}
                    selected={index === highlighted}
                    onSelect={() => choose(type)}
                    onHighlight={() => setActive(index)}
                  />
                ))}
              </Group>
            )}
            {found.categories.length > 0 && (
              <Group label="Google categories">
                {found.categories.map((category, index) => {
                  const optionIndex = found.types.length + index;
                  return (
                    <Option
                      key={`${category.type.name}-${category.name}`}
                      id={`${listId}-${optionIndex}`}
                      name={category.name}
                      detail={`Included in ${category.type.name}`}
                      selected={optionIndex === highlighted}
                      onSelect={() => choose(category.type)}
                      onHighlight={() => setActive(optionIndex)}
                    />
                  );
                })}
              </Group>
            )}
          </ul>
        </div>
      )}

      {confirmed && (
        <div className={`${PANEL} flex flex-col gap-4 rounded-[20px] p-5 lg:rounded-panel-sm lg:p-6`}>
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green text-ink">
              <CheckIcon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-title-s text-fg">Yes, we grade {confirmed.name.toLowerCase()}</span>
              <span className="mt-0.5 block text-body-s text-muted">
                {confirmed.group} · {CATEGORY_MARKET}
              </span>
            </span>
          </div>
          <p className="text-body-m text-muted">Your Visibility Grade covers these Google categories:</p>
          <ul className="flex flex-wrap gap-2">
            {confirmed.categories.map((name) => (
              <li key={name} className="rounded-pill border border-line-darken px-3 py-1.5 text-body-s text-fg">
                {name}
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            <Link href={FREE_SCAN.href} className={`${PRIMARY_BUTTON} h-12 w-full px-6 lg:w-auto`}>
              {FREE_SCAN.label}
            </Link>
            <button type="button" onClick={searchAgain} className="text-center text-label-m text-muted hover:text-fg lg:text-left">
              Not your business? Search again
            </button>
          </div>
        </div>
      )}

      {showEmpty && (
        <div className={`${PANEL} flex flex-col gap-2 rounded-[20px] p-5 lg:rounded-panel-sm lg:p-6`}>
          <p className="font-display text-title-s text-fg">We don’t cover “{query}” yet</p>
          <p className="text-body-m text-muted">
            We add new business types every month. Leave your email and we’ll let you know when yours is live, or try a
            broader term like “pet store”.
          </p>
          <div className="flex flex-col items-stretch gap-3 pt-2 lg:flex-row lg:items-center">
            <NotifyForm
              query={query}
              asking={askingEmail}
              notified={notified}
              onAsk={() => setAskingEmail(true)}
              onNotified={setNotified}
            />
            <button
              type="button"
              onClick={() => {
                searchAgain();
                document.getElementById("who-its-for-groups")?.scrollIntoView({ block: "center" });
              }}
              className="text-center text-label-m text-muted hover:text-fg lg:text-left"
            >
              See all 180+ business types
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function matchLabel(count: number): string {
  if (count === 0) return "No matches";
  if (count === 1) return "1 match";
  return `${count} matches`;
}

function categoryCount(count: number): string {
  return count === 1 ? "1 Google category" : `${count} Google categories`;
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li role="presentation">
      <p className="px-3.5 pt-2 pb-1 text-label-s text-muted">{label}</p>
      <ul role="group" aria-label={label}>
        {children}
      </ul>
    </li>
  );
}

function Option({
  id,
  name,
  detail,
  selected,
  onSelect,
  onHighlight,
}: {
  id: string;
  name: string;
  detail: string;
  selected: boolean;
  onSelect: () => void;
  onHighlight: () => void;
}) {
  return (
    <li role="presentation">
      <button
        id={id}
        type="button"
        role="option"
        tabIndex={-1}
        aria-selected={selected}
        onMouseEnter={onHighlight}
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-card px-3.5 py-3 text-left ${selected ? "bg-line-darken" : ""}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-label-l text-fg">{name}</span>
          <span className="mt-0.5 block text-body-s text-muted">{detail}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-pill bg-chip-ok py-1 pr-2.5 pl-2 text-label-s text-fg">
          <CheckIcon className="size-3.5 text-ok" />
          Supported
        </span>
      </button>
    </li>
  );
}

function NotifyForm({
  query,
  asking,
  notified,
  onAsk,
  onNotified,
}: {
  query: string;
  asking: boolean;
  notified: string | null;
  onAsk: () => void;
  onNotified: (email: string) => void;
}) {
  if (notified) {
    return <p className="text-body-m text-fg">We’ll email {notified} when we cover “{query}”.</p>;
  }

  if (!asking) {
    return (
      <button
        type="button"
        onClick={onAsk}
        className="inline-flex h-12 w-full items-center justify-center rounded-button border border-line-darken bg-surface px-6 text-body-l text-fg lg:w-auto"
      >
        Notify me when it’s live
      </button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("email");
        if (!(input instanceof HTMLInputElement)) return;
        const email = input.value.trim();
        input.setCustomValidity(email.includes("@") && !email.startsWith("@") ? "" : "Please enter your email.");
        if (!input.reportValidity()) return;
        onNotified(email);
      }}
    >
      <input
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email address"
        aria-label="Email address"
        autoFocus
        className="h-12 w-full rounded-pill border border-line-darken bg-surface px-4 text-body-l text-fg outline-none placeholder:text-faint focus:border-green lg:w-56"
      />
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center rounded-button border border-line-darken bg-surface px-6 text-body-l text-fg"
      >
        Notify me when it’s live
      </button>
    </form>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M13.3 4 6 11.3 2.7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
