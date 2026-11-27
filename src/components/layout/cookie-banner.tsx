"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { OUTLINE_LINK, PRIMARY_BUTTON } from "@/components/ui/button-styles";

const EASE = [0, 0, 0.58, 1] as const;
const reported = new Set<string>();

type Piece = { strong: boolean; value: string };

/** Bold runs may contain a link, so links are resolved inside each run. */
function pieces(markdown: string): Piece[] {
  const out: Piece[] = [];
  const marks = /\*\*([\s\S]+?)\*\*/g;
  let last = 0;

  for (const match of markdown.matchAll(marks)) {
    const index = match.index ?? 0;

    if (index > last) out.push({ strong: false, value: markdown.slice(last, index) });

    out.push({ strong: true, value: match[1] ?? "" });
    last = index + match[0].length;
  }

  if (last < markdown.length) out.push({ strong: false, value: markdown.slice(last) });

  return out;
}

function Inline({ value }: { value: string }) {
  const links = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  const nodes: ReactNode[] = [];
  let last = 0;

  for (const match of value.matchAll(links)) {
    const index = match.index ?? 0;

    if (index > last) nodes.push(value.slice(last, index));

    nodes.push(
      <Link key={index} href={match[2] ?? "/"} className="underline decoration-line-strong underline-offset-2">
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }

  if (last < value.length) nodes.push(value.slice(last));

  return <>{nodes}</>;
}

export function CookieBanner({
  version,
  markdown,
  agree,
  optOut,
}: {
  version: string;
  markdown: string;
  agree: string;
  optOut: string;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [pending, setPending] = useState<"agree" | "opt_out" | null>(null);

  useEffect(() => {
    if (reported.has(version)) return;

    reported.add(version);
    void fetch("/api/v1/consent", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ event: "shown", version }),
      keepalive: true,
    }).catch(() => {
      reported.delete(version);
    });
  }, [version]);

  async function choose(event: "agree" | "opt_out") {
    if (pending) return;

    setPending(event);

    try {
      const response = await fetch("/api/v1/consent", {
        method: "POST",
        headers: { accept: "application/json", "content-type": "application/json" },
        body: JSON.stringify({ event, version }),
      });

      if (response.ok) setOpen(false);
      else setPending(null);
    } catch {
      setPending(null);
    }
  }

  if (!open) return null;

  return (
    <motion.div
      role="dialog"
      aria-labelledby="cookie-notice"
      className="fixed inset-x-2 bottom-2 z-30 lg:inset-x-5 lg:bottom-5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: EASE }}
    >
      <div className="mx-auto flex w-full max-w-360 flex-col gap-4 rounded-panel-sm border border-line bg-surface p-4 shadow-[var(--shadow-lift)] lg:flex-row lg:items-center lg:gap-8 lg:p-5">
        <p id="cookie-notice" className="min-w-0 text-body-m text-fg">
          {pieces(markdown).map((piece, index) =>
            piece.strong ? (
              <strong key={index} className="font-medium">
                <Inline value={piece.value} />
              </strong>
            ) : (
              <Inline key={index} value={piece.value} />
            ),
          )}
        </p>
        <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row lg:flex-row">
          <button
            type="button"
            className={`${OUTLINE_LINK} w-full sm:w-auto`}
            disabled={pending !== null}
            onClick={() => void choose("opt_out")}
          >
            {optOut}
          </button>
          <button
            type="button"
            className={`${PRIMARY_BUTTON} h-11 w-full px-5 sm:w-auto`}
            disabled={pending !== null}
            onClick={() => void choose("agree")}
          >
            {agree}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
