"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { OUTLINE_LINK } from "@/components/ui/button-styles";

const REVEAL_SECONDS = 0.6;
const REVEAL_EASE = [0, 0, 0.58, 1] as const;

const PANEL = {
  green: "bg-chip-ok",
  blue: "bg-grid-wash",
  warm: "bg-review-wash",
} as const;

/** One rule per paid plan. The picture rises 60px, the same distance as the home product shots. */
export function Refunds() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-bg pt-hero lg:pt-35">
      <div className="mx-auto flex w-full max-w-360 flex-col gap-7 px-5 lg:gap-10 lg:px-30">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-headline-m text-fg lg:text-headline-l">
            Refunds and cancelling, in plain words
          </h2>
          <Link href="/refunds" className={OUTLINE_LINK}>
            Read the Refund Policy
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          <Row
            index={0}
            reduceMotion={reduceMotion}
            title="Full Visibility Grade Report"
            body="Purchases are final, with two exceptions. If we cannot deliver your Report within 3 business days, we email you and you can ask for a full refund; if we cannot deliver it at all, we refund you without you having to ask. If the Report contains a material data error that we cannot correct within 5 business days of your email, we refund you in full. A refund ends your license to the Report and cancels the unused credit (or is reduced by any credit already used)."
            panel={PANEL.green}
          >
            <ReportCard />
          </Row>
          <Row
            index={1}
            reduceMotion={reduceMotion}
            title="Monitoring"
            body="Cancel any time, online. Future charges stop, and you keep access until the end of the period you have already paid for. The monthly plan renews every month until you cancel. A 6- or 12-month plan is paid in advance and, at the end of that term, continues as the monthly plan at the then-current monthly price until you cancel. Monitoring payments are not refunded."
            panel={PANEL.blue}
          >
            <BillingCard />
          </Row>
          <Row
            index={2}
            reduceMotion={reduceMotion}
            title="Growth retainer"
            body="The terms are in your written proposal and agreement, which you see before you agree to anything."
            panel={PANEL.warm}
          >
            <ProposalCard />
          </Row>
        </div>
      </div>
    </section>
  );
}

function Row({
  index,
  reduceMotion,
  title,
  body,
  panel,
  children,
}: {
  index: number;
  reduceMotion: boolean | null;
  title: string;
  body: string;
  panel: string;
  children: ReactNode;
}) {
  return (
    <motion.article
      className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 lg:flex-row lg:items-stretch lg:gap-12"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: REVEAL_SECONDS, delay: index * 0.08, ease: REVEAL_EASE }
      }
    >
      <div className="flex flex-col gap-3 px-2 py-2 lg:w-140 lg:shrink-0 lg:py-6 lg:pr-0 lg:pl-6">
        <h3 className="font-display text-headline-s text-fg">{title}</h3>
        <p className="text-body-l text-muted">{body}</p>
      </div>
      <motion.div
        className={`flex flex-1 items-center justify-center rounded-[20px] px-4 py-6 ${panel}`}
        initial={reduceMotion ? false : { opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: REVEAL_SECONDS, delay: index * 0.08 + 0.05, ease: REVEAL_EASE }
        }
      >
        {children}
      </motion.div>
    </motion.article>
  );
}

function Mini({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-95 flex-col gap-3.5 rounded-site-card border border-line bg-surface p-5 shadow-mini">
      {children}
    </div>
  );
}

function ReportCard() {
  return (
    <Mini>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-grade-b font-display text-headline-s text-ink">
          B
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-label-m text-fg">Full report: skinworksmed.com</span>
          <span className="text-body-s text-faint">Ready · Oct 8, 2026</span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-[10px] bg-chip-ok px-3 py-2.5">
        <span className="text-label-s text-fg">$199 credit toward Monitoring</span>
        <span className="shrink-0 text-body-s text-muted">12 days left</span>
      </div>
      <Note divided={false}>Refund if not delivered within 3 business days</Note>
    </Mini>
  );
}

function BillingCard() {
  return (
    <Mini>
      <div className="flex items-start justify-between gap-3">
        <span className="flex flex-col gap-0.5">
          <span className="text-label-m text-fg">Monitoring</span>
          <span className="text-body-s text-faint">$149 a month</span>
        </span>
        <span className="flex h-6.5 items-center rounded-pill bg-chip-ok px-2.5 text-label-s text-ok">
          Active
        </span>
      </div>
      <Line label="Renews" value="Dec 6, 2026" />
      <Line label="Access until" value="End of paid period" />
      <Note>Cancel online anytime · access until Dec 6</Note>
    </Mini>
  );
}

function ProposalCard() {
  return (
    <Mini>
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-label-m text-fg">Proposal · Statement of work</span>
          <span className="text-body-s text-faint">Growth retainer</span>
        </span>
        <span className="flex h-6.5 shrink-0 items-center rounded-pill bg-chip-warn px-2.5 text-label-s text-chip-warn-text">
          To review
        </span>
      </div>
      <Line label="Scope" value="Fixes from your report, month by month" />
      <Line label="Price" value="In the proposal" />
      <Note>You review the terms before you sign</Note>
    </Mini>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-line pt-2.5">
      <span className="text-body-s text-muted">{label}</span>
      <span className="text-right text-label-s text-fg">{value}</span>
    </div>
  );
}

function Note({ children, divided = true }: { children: ReactNode; divided?: boolean }) {
  return (
    <p className={`flex items-center gap-2 pt-2.5 text-body-s text-faint ${divided ? "border-t border-line" : ""}`}>
      <Image src="/icons/check.svg" alt="" width={16} height={16} className="shrink-0" />
      {children}
    </p>
  );
}
