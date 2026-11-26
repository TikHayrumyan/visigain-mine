"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { COMPANY } from "@/config/navigation";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { DEFAULT_TOPIC, TOPICS, fieldError, firstName, type FieldName, type Topic } from "./fields";

/** A handoff that never settles becomes the failed state. */
const SEND_LIMIT_MS = 10_000;

type Phase = "idle" | "sending" | "sent" | "failed";

type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: readonly FieldName[] = ["name", "email", "message"];

interface Message {
  name: string;
  email: string;
  topic: Topic;
  message: string;
}

/**
 * There is no mail service yet, so a valid message is accepted locally. The short wait lets “Sending…” paint.
 * The caller still races this with the send limit: a handoff that does not finish in time is a failure.
 */
function deliver(message: Message): Promise<void> {
  void message;
  return new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });
}

function inputClass(invalid: boolean): string {
  const border = invalid ? "border-grade-f" : "border-line-darken focus:border-green";
  return `w-full rounded-xl border bg-surface px-4 text-base text-fg caret-green outline-none placeholder:text-faint focus-visible:outline-none! lg:text-body-m ${border}`;
}

/** The contact form and every state the handoff describes. */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState<Topic>(DEFAULT_TOPIC);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [cardHeight, setCardHeight] = useState<number>();
  const [sentTo, setSentTo] = useState({ name: "", email: "" });

  const cardRef = useRef<HTMLDivElement>(null);
  const attempt = useRef(0);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const chipRefs = useRef<Partial<Record<Topic, HTMLButtonElement>>>({});

  const refs = { name: nameRef, email: emailRef, message: messageRef };

  const change = (field: FieldName, value: string) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "message") setMessage(value);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = fieldError(field, value);
      if (next) return { ...current, [field]: next };
      const rest = { ...current };
      delete rest[field];
      return rest;
    });
  };

  const blur = (field: FieldName, value: string) => {
    const next = fieldError(field, value);
    setErrors((current) => {
      if (!next) {
        if (!current[field]) return current;
        const rest = { ...current };
        delete rest[field];
        return rest;
      }
      return { ...current, [field]: next };
    });
  };

  const moveTopic = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !back) return;
    event.preventDefault();
    const index = TOPICS.indexOf(topic);
    const next = TOPICS[(index + (forward ? 1 : -1) + TOPICS.length) % TOPICS.length] ?? topic;
    setTopic(next);
    chipRefs.current[next]?.focus();
  };

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
    setPhase("idle");
    setCardHeight(undefined);
    nameRef.current?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (phase === "sending") return;

    const values = { name, email, message };
    const nextErrors: Errors = {};
    for (const field of FIELD_ORDER) {
      const problem = fieldError(field, values[field]);
      if (problem) nextErrors[field] = problem;
    }
    setErrors(nextErrors);
    const first = FIELD_ORDER.find((field) => nextErrors[field]);
    if (first) {
      refs[first].current?.focus();
      return;
    }

    const id = ++attempt.current;
    const height = cardRef.current?.offsetHeight;
    setPhase("sending");
    let timer = 0;
    const expired = new Promise<never>((_, reject) => {
      timer = window.setTimeout(() => reject(new Error("timeout")), SEND_LIMIT_MS);
    });

    const payload = { name: name.trim(), email: email.trim(), topic, message: message.trim() };
    void Promise.race([deliver(payload), expired]).then(
      () => {
        window.clearTimeout(timer);
        if (attempt.current !== id) return;
        if (height) setCardHeight(height);
        setSentTo({ name: firstName(name), email: email.trim() });
        setPhase("sent");
      },
      () => {
        window.clearTimeout(timer);
        if (attempt.current !== id) return;
        setPhase("failed");
      },
    );
  };

  return (
    <div
      ref={cardRef}
      style={phase === "sent" && cardHeight ? { minHeight: cardHeight } : undefined}
      className="flex flex-col rounded-panel-sm border border-line bg-surface p-[21px] lg:min-h-[670px] lg:p-8"
    >
      {phase === "sent" ? (
        <div className="contact-sent flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Image src="/icons/contact-success.svg" alt="" width={64} height={64} />
          <h2 className="max-w-[480px] font-display text-headline-s text-fg" tabIndex={-1}>
            Thanks, {sentTo.name}. Your message is on its way.
          </h2>
          <p className="max-w-[480px] text-body-m text-muted">
            We’ll reply to {sentTo.email}, usually within one working day.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-1 inline-flex h-12 items-center rounded-full border border-ink bg-surface px-6 text-body-l text-fg"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form noValidate className="flex flex-col gap-5" onSubmit={submit}>
          {phase === "failed" ? (
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
            label="Your name"
            error={errors.name}
            value={name}
            placeholder="Jane Cooper"
            autoComplete="name"
            inputRef={nameRef}
            onChange={(value) => change("name", value)}
            onBlur={() => blur("name", name)}
          />
          <Field
            id="contact-email"
            label="Your email"
            error={errors.email}
            hint="We reply here."
            value={email}
            placeholder="you@yourbusiness.com"
            type="email"
            autoComplete="email"
            inputRef={emailRef}
            onChange={(value) => change("email", value)}
            onBlur={() => blur("email", email)}
          />

          <fieldset className="flex flex-col gap-2.5 border-0 p-0">
            <legend id="contact-topic" className="text-label-m text-fg">
              What’s this about?
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="contact-topic" onKeyDown={moveTopic}>
              {TOPICS.map((item) => {
                const selected = item === topic;
                return (
                  <button
                    key={item}
                    ref={(node) => {
                      if (node) chipRefs.current[item] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTopic(item)}
                    className={`rounded-full px-3.5 py-2 text-body-m focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      selected ? "bg-ink text-surface" : "border border-line bg-surface text-fg"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-message" className="text-label-m text-fg">
              Your message
            </label>
            <textarea
              ref={messageRef}
              id="contact-message"
              value={message}
              placeholder="How can we help?"
              rows={5}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              onChange={(event) => change("message", event.target.value)}
              onBlur={() => blur("message", message)}
              className={`${inputClass(Boolean(errors.message))} h-40 resize-none py-3.5`}
            />
            {errors.message ? (
              <p id="contact-message-error" className="text-body-s text-grade-f">
                {errors.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-1 lg:flex-row lg:items-center lg:gap-5">
            <button type="submit" disabled={phase === "sending"} className={`${PRIMARY_BUTTON} h-12 w-full px-6 lg:w-auto`}>
              {phase === "sending" ? "Sending…" : phase === "failed" ? "Try again" : "Send message"}
            </button>
            <p className="text-body-s text-muted">
              By submitting this form you agree that we may use what you send to reply to you, as our{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>{" "}
              describes.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  value,
  placeholder,
  type = "text",
  autoComplete,
  inputRef,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  value: string;
  placeholder: string;
  type?: "text" | "email";
  autoComplete: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-fg">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={`${inputClass(Boolean(error))} h-12`}
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
