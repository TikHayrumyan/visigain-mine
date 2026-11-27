"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { COMPANY } from "@/config/navigation";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { sendContactMessage } from "./send-message";
import { TOPICS, contactSchema, fieldIssue, initialContactState, type FieldName, type Topic } from "./schema";

const FIELD_ORDER: readonly FieldName[] = ["name", "email", "message"];

function inputClass(invalid: boolean): string {
  return `h-12 w-full rounded-xl border bg-surface px-4 text-base text-fg caret-green outline-none placeholder:text-faint focus-visible:outline-none! lg:text-body-m ${
    invalid ? "border-grade-f" : "border-line-darken focus:border-green"
  }`;
}

/** The contact form. Fields stay uncontrolled; Zod checks them, and the server action sends. */
export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialContactState);
  const [touched, setTouched] = useState<Partial<Record<FieldName, string | null>>>({});
  const sent = state.status === "sent" && state.sent ? state.sent : null;
  const topic = state.values?.topic ?? state.topic;

  const shown = (field: FieldName): string | undefined => {
    if (Object.hasOwn(touched, field)) return touched[field] ?? undefined;
    return state.errors[field];
  };

  const reveal = (field: FieldName, value: string) => {
    setTouched((current) => ({ ...current, [field]: fieldIssue(field, value) }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const parsed = contactSchema.safeParse({
      name: valueOf(form, "name"),
      email: valueOf(form, "email"),
      message: valueOf(form, "message"),
      topic: valueOf(form, "topic"),
    });
    if (parsed.success) {
      setTouched({});
      return;
    }
    event.preventDefault();
    const next: Partial<Record<FieldName, string | null>> = {};
    for (const field of FIELD_ORDER) next[field] = fieldIssue(field, valueOf(form, field));
    setTouched(next);
    const first = FIELD_ORDER.find((field) => next[field]);
    const node = first ? form.elements.namedItem(first) : null;
    if (node instanceof HTMLElement) node.focus();
  };

  return (
    <div className="grid rounded-panel-sm border border-line bg-surface p-5.25 lg:min-h-167.5 lg:p-8">
      {sent ? (
        <div className="contact-sent z-10 col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 text-center">
          <Image src="/icons/contact-success.svg" alt="" width={64} height={64} />
          <h2 className="max-w-120 font-display text-headline-s text-fg">
            Thanks, {sent.name}. Your message is on its way.
          </h2>
          <p className="max-w-120 text-body-m text-muted">
            We’ll reply to {sent.email}, usually within one working day.
          </p>
          <form action={formAction}>
            <input type="hidden" name="intent" value="reset" />
            <input type="hidden" name="topic" value={state.topic} />
            <ResetButton />
          </form>
        </div>
      ) : null}

      <form
        key={state.generation}
        action={formAction}
        noValidate
        inert={sent ? true : undefined}
        onSubmit={onSubmit}
        className={`col-start-1 row-start-1 flex flex-col gap-5 ${sent ? "invisible" : ""}`}
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden defaultValue="" className="sr-only" />
        {state.status === "failed" ? (
          <div role="alert" className="flex gap-3 rounded-[14px] bg-danger-soft px-4 py-3.5">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-grade-f" aria-hidden />
            <p className="text-body-m text-fg">
              We couldn’t send your message. Your text is saved. Try again, or write to{" "}
              <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2">
                {COMPANY.email}
              </a>
              .
            </p>
          </div>
        ) : null}

        <Field
          id="contact-name"
          name="name"
          label="Your name"
          error={shown("name")}
          defaultValue={state.values?.name}
          placeholder="Jane Cooper"
          autoComplete="name"
          onBlur={(value) => reveal("name", value)}
          onChange={(value) => {
            if (shown("name")) reveal("name", value);
          }}
        />
        <Field
          id="contact-email"
          name="email"
          label="Your email"
          error={shown("email")}
          hint="We reply here."
          defaultValue={state.values?.email}
          placeholder="you@yourbusiness.com"
          type="email"
          autoComplete="email"
          onBlur={(value) => reveal("email", value)}
          onChange={(value) => {
            if (shown("email")) reveal("email", value);
          }}
        />

        <fieldset className="border-0 p-0">
          <legend id="contact-topic" className="p-0">
            <span className="block pb-2.5 text-label-m text-fg">What’s this about?</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="contact-topic">
            {TOPICS.map((item) => (
              <TopicChip key={item} topic={item} defaultChecked={item === topic} />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-label-m text-fg">
            Your message
          </label>
          <textarea
            id="contact-message"
            name="message"
            defaultValue={state.values?.message}
            placeholder="How can we help?"
            rows={5}
            aria-invalid={shown("message") ? true : undefined}
            aria-describedby={shown("message") ? "contact-message-error" : undefined}
            onBlur={(event) => reveal("message", event.target.value)}
            onChange={(event) => {
              if (shown("message")) reveal("message", event.target.value);
            }}
            className={`${inputClass(Boolean(shown("message")))} h-40 resize-none py-3.5`}
          />
          {shown("message") ? (
            <p id="contact-message-error" className="text-body-s text-grade-f">
              {shown("message")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 pt-1 lg:flex-row lg:items-center lg:gap-5">
          <SubmitButton failed={state.status === "failed"} />
          <p className="min-w-0 text-body-s text-muted lg:flex-1">
            By submitting this form you agree that we may use what you send to reply to you, as our{" "}
            <Link
              href="/privacy"
              className="cursor-pointer text-muted underline decoration-current decoration-1 underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            describes.
          </p>
        </div>
      </form>
    </div>
  );
}

/** The green send button. Pending comes from the form action, so the label can switch without its own state. */
function SubmitButton({ failed }: { failed: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${PRIMARY_BUTTON} h-12 w-full shrink-0 cursor-pointer px-6 whitespace-nowrap disabled:cursor-default lg:w-auto`}
    >
      {pending ? "Sending…" : failed ? "Try again" : "Send message"}
    </button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex h-12 cursor-pointer items-center rounded-full border border-ink bg-surface px-6 text-body-l text-fg disabled:cursor-default disabled:text-faint"
    >
      Send another message
    </button>
  );
}

function TopicChip({ topic, defaultChecked }: { topic: Topic; defaultChecked: boolean }) {
  return (
    <label
      className="cursor-pointer rounded-full border border-line bg-surface px-3.5 py-2 text-body-m text-fg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink has-checked:border-ink has-checked:bg-ink has-checked:text-surface"
    >
      <input type="radio" name="topic" value={topic} defaultChecked={defaultChecked} className="sr-only" />
      {topic}
    </label>
  );
}

function Field({
  id,
  name,
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  type = "text",
  autoComplete,
  onBlur,
  onChange,
}: {
  id: string;
  name: FieldName;
  label: string;
  error?: string;
  hint?: string;
  defaultValue?: string;
  placeholder: string;
  type?: "text" | "email";
  autoComplete: string;
  onBlur: (value: string) => void;
  onChange: (value: string) => void;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
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
        aria-describedby={describedBy}
        onBlur={(event) => onBlur(event.target.value)}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass(Boolean(error))}
      />
      {error ? (
        <p id={`${id}-error`} className="text-body-s text-grade-f">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-body-s text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function valueOf(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (field instanceof RadioNodeList) return field.value;
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) return field.value;
  return "";
}
