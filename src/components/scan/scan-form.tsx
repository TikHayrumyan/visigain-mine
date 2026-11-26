"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { BUSINESS_TYPES, searchCategories } from "@/components/home/who-its-for/categories";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { LEGAL_LINKS } from "@/config/navigation";
import { fieldIssue, initialScanState, scanSchema, type ScanField } from "./schema";
import { startScan } from "./start-scan";

const ORDER: readonly ScanField[] = ["website", "business", "email", "terms"];
const UNDERLINE =
  "underline decoration-current decoration-from-font underline-offset-0 [text-decoration-skip-ink:none] [text-underline-position:from-font]";
const LINK = `cursor-pointer text-fg ${UNDERLINE}`;
const MUTED_LINK = `cursor-pointer text-muted ${UNDERLINE}`;
const TERMS = LEGAL_LINKS.find((link) => link.href === "/terms");
const PRIVACY = LEGAL_LINKS.find((link) => link.href === "/privacy");

function inputClass(invalid: boolean): string {
  return `h-12 w-full rounded-xl border bg-surface px-4 text-base text-fg caret-green outline-none placeholder:text-faint focus-visible:outline-none! lg:text-body-m ${
    invalid ? "border-grade-f" : "[border-color:var(--color-line)] focus:border-green"
  }`;
}

/** The free-scan form. Fields stay in the form; Zod checks them, and the action opens the waiting page. */
export function ScanForm() {
  const [state, action] = useActionState(startScan, initialScanState);
  const [touched, setTouched] = useState<Partial<Record<ScanField, string | null>>>({});
  const shown = (field: ScanField): string | undefined => {
    if (Object.hasOwn(touched, field)) return touched[field] ?? undefined;
    return state.errors[field];
  };
  const reveal = (field: ScanField, value: string) => {
    setTouched((current) => ({ ...current, [field]: fieldIssue(field, value) }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const parsed = scanSchema.safeParse({
      website: valueOf(form, "website"),
      city: valueOf(form, "city"),
      business: valueOf(form, "business"),
      email: valueOf(form, "email"),
      terms: form.elements.namedItem("terms") instanceof HTMLInputElement &&
        (form.elements.namedItem("terms") as HTMLInputElement).checked
        ? "on"
        : "",
      marketing:
        form.elements.namedItem("marketing") instanceof HTMLInputElement &&
        (form.elements.namedItem("marketing") as HTMLInputElement).checked,
    });
    if (parsed.success) {
      setTouched({});
      return;
    }
    event.preventDefault();
    const next: Partial<Record<ScanField, string | null>> = {};
    for (const field of ORDER) {
      const raw = field === "terms" ? (checked(form, "terms") ? "on" : "") : valueOf(form, field);
      next[field] = fieldIssue(field, raw);
    }
    setTouched(next);
    const first = ORDER.find((field) => next[field]);
    const node = first ? form.elements.namedItem(first) : null;
    if (node instanceof HTMLElement) node.focus();
  };

  return (
    <form
      action={action}
      noValidate
      data-theme="light"
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-card-lg bg-surface p-5 shadow-[var(--shadow-planCard)] lg:w-130 lg:p-10"
    >
      <Field
        id="scan-website"
        name="website"
        label="Your website"
        placeholder="yourbusiness.com"
        error={shown("website")}
        defaultValue={state.values?.website}
        autoComplete="url"
        onBlur={(value) => reveal("website", value)}
        onChange={(value) => {
          if (shown("website")) reveal("website", value);
        }}
      />
      <Field
        id="scan-city"
        name="city"
        label="City (optional)"
        placeholder="Santa Monica"
        defaultValue={state.values?.city}
        autoComplete="address-level2"
      />
      <BusinessField
        error={shown("business")}
        defaultValue={state.values?.business}
        onBlur={(value) => reveal("business", value)}
        onChange={(value) => {
          if (shown("business")) reveal("business", value);
        }}
      />
      <Field
        id="scan-email"
        name="email"
        label="Your email"
        placeholder="you@yourbusiness.com"
        type="email"
        error={shown("email")}
        defaultValue={state.values?.email}
        autoComplete="email"
        onBlur={(value) => reveal("email", value)}
        onChange={(value) => {
          if (shown("email")) reveal("email", value);
        }}
      />

      <div className="flex flex-col gap-1 py-1">
        <label className="flex cursor-pointer items-center gap-2">
          <Box
            name="terms"
            defaultChecked={state.values?.terms}
            invalid={Boolean(shown("terms"))}
            describedBy={shown("terms") ? "scan-terms-error" : undefined}
            onChange={(value) => reveal("terms", value)}
          />
          <span className="min-w-0 flex-1 text-body-m text-fg">
            I agree to the{" "}
            {TERMS ? (
              <Link href={TERMS.href} className={LINK}>
                Terms of Service
              </Link>
            ) : null}{" "}
            and{" "}
            {PRIVACY ? (
              <Link href={PRIVACY.href} className={LINK}>
                Privacy Policy
              </Link>
            ) : null}
          </span>
        </label>
        {shown("terms") ? (
          <p id="scan-terms-error" className="pl-10 text-body-s text-grade-f">
            {shown("terms")}
          </p>
        ) : null}
        <label className="flex cursor-pointer items-center gap-2">
          <Box name="marketing" defaultChecked={state.values?.marketing} />
          <span className="min-w-0 flex-1 text-body-m text-fg">
            Email me visibility tips and Visigain news. Unsubscribe any time.
          </span>
        </label>
      </div>

      <SubmitButton />

      <div className="flex flex-col gap-1.5 border-t border-line pt-4">
        <p className="text-body-s text-muted">
          What we collect on this form and why:{" "}
          {PRIVACY ? (
            <Link href={`${PRIVACY.href}#collection`} className={MUTED_LINK}>
              Privacy Policy, section 3.2.
            </Link>
          ) : null}
        </p>
        <p className="text-body-s text-faint">
          One free grade per website each week. We use your email only to send the grade, unless you tick the second
          box.
        </p>
      </div>
    </form>
  );
}

/** A 32px hit target around the 22px box from the form’s checkbox. */
function Box({
  name,
  defaultChecked,
  invalid,
  describedBy,
  onChange,
}: {
  name: string;
  defaultChecked?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <span className="grid size-8 shrink-0 place-items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onChange={onChange ? (event) => onChange(event.target.checked ? "on" : "") : undefined}
        className="peer col-start-1 row-start-1 size-5.5 appearance-none rounded-lg border border-line-darken bg-surface checked:border-ink checked:bg-ink"
      />
      <svg
        viewBox="0 0 12 12"
        aria-hidden
        className="pointer-events-none col-start-1 row-start-1 hidden size-3 text-surface peer-checked:block"
      >
        <path d="M2 6.2L4.6 8.8L10 3.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${PRIMARY_BUTTON} h-12 w-full cursor-pointer px-6 disabled:cursor-default`}>
      {pending ? "Sending…" : "Grade my business"}
    </button>
  );
}

function BusinessField({
  error,
  defaultValue,
  onBlur,
  onChange,
}: {
  error?: string;
  defaultValue?: string;
  onBlur: (value: string) => void;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const matches = value.trim()
    ? searchCategories(value).types
    : BUSINESS_TYPES.slice(0, 8);
  const options = matches.slice(0, 8);

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor="scan-business" className="text-label-m text-fg">
        Your type of business
      </label>
      <div className="relative">
        <input
          id="scan-business"
          name="business"
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={error ? true : undefined}
          aria-autocomplete="list"
          placeholder="Start typing, e.g. Medical spa"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            setOpen(false);
            onBlur(event.target.value);
          }}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
            onChange(event.target.value);
          }}
          className={`${inputClass(Boolean(error))} pr-11.5`}
        />
        <button
          type="button"
          aria-label="Show business types"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
          className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full"
        >
          <Image src="/icons/chevron-down.svg" alt="" width={18} height={18} />
        </button>
      </div>
      {open && options.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-[var(--shadow-planCard)]"
        >
          {options.map((type) => (
            <li key={type.name}>
              <button
                type="button"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(type.name);
                  setOpen(false);
                  onChange(type.name);
                  onBlur(type.name);
                }}
                className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-4 py-2 text-left hover:bg-surface-subtle"
              >
                <span className="text-body-m text-fg">{type.name}</span>
                <span className="text-label-s text-muted">{type.group}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="text-body-s text-grade-f">{error}</p> : null}
    </div>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  error,
  defaultValue,
  type = "text",
  autoComplete,
  onBlur,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  defaultValue?: string;
  type?: "text" | "email";
  autoComplete: string;
  onBlur?: (value: string) => void;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-fg">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={onBlur ? (event) => onBlur(event.target.value) : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={inputClass(Boolean(error))}
      />
      {error ? (
        <p id={`${id}-error`} className="text-body-s text-grade-f">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function valueOf(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement) return field.value;
  return "";
}

function checked(form: HTMLFormElement, name: string): boolean {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement && field.checked;
}
