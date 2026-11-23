"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { PRIMARY_BUTTON } from "@/components/ui/button-styles";
import { HeroSurface } from "../hero/hero-surface";
import { ANSWER_TOTAL, ASSISTANTS, BAR_TRACK, LEADERBOARD, QUESTIONS } from "./answers";

const EASE = "easeOut" as const;

/** Share of answers, the question table, and who the assistants name most. */
export function AiVisibility() {
  return (
    <div className="bg-bg pt-16 lg:pt-35">
      <HeroSurface
        aria-labelledby="ai-visibility-title"
        markHero={false}
        fadeDots={false}
        className="relative"
        panelClassName="absolute inset-0 overflow-hidden bg-ink"
      >
        <div data-theme="dark" className="relative text-fg">
          <div className="mx-auto flex max-w-200 flex-col items-center px-5 pt-14 text-center lg:pt-20">
            <Reveal y={10} duration={0.5}>
              <p className="inline-flex h-8 items-center gap-2 rounded-pill bg-surface py-2 pr-4.25 pl-3.5 text-label-s text-fg lg:bg-white lg:text-ink">
                <span className="size-2 rounded-full bg-green" />
                AI SEARCH VISIBILITY
              </p>
            </Reveal>
            <h2 id="ai-visibility-title" className="mt-4 font-display text-headline-m text-white lg:mt-6 lg:text-display-m">
              Named by AI assistants?
            </h2>
            <Reveal y={12} duration={0.7} delay={0.25} className="mt-4 max-w-150 lg:mt-6">
              <p data-theme="light" className="text-body-l text-faint">
                People now ask ChatGPT, Gemini, Perplexity and Google’s AI Overviews who to call. We ask the same
                questions your customers ask and show you, question by question, whether you’re named.
              </p>
            </Reveal>
            <Reveal y={12} duration={0.6} delay={0.4} className="mt-4 lg:mt-6">
              <a href="/scan" className={`${PRIMARY_BUTTON} h-12 w-52 lg:w-52.5`}>
                Check your AI visibility
              </a>
            </Reveal>
          </div>

          <div className="@container mt-10 w-full overflow-hidden lg:mt-16">
            <div className="relative h-[calc(304px*100cqw/390px)] lg:h-[calc(520px*min(1,100cqw/1440px))]">
              <div className="absolute top-0 left-0 h-76 w-97.5 origin-top-left scale-[calc(100cqw/390px)] overflow-hidden lg:left-1/2 lg:h-130 lg:w-360 lg:-ml-180 lg:origin-top lg:scale-[min(1,100cqw/1440px)]">
                <div className="absolute top-0 left-2.5 h-156.5 w-172.25 overflow-hidden lg:left-41.5 lg:h-130 lg:w-277">
                  <div className="w-277 origin-top-left scale-[0.6128158845] lg:scale-100">
                  <Reveal
                    y={60}
                    duration={0.8}
                    delay={0.3}
                    amount={0.05}
                    className="min-h-254.75 w-277 rounded-panel bg-surface p-7 text-fg"
                    theme="light"
                  >
                    <div className="flex h-7.5 items-center gap-1.5">
                      <h3 className="font-display text-headline-s">AI-assistant visibility</h3>
                      <span className="grid size-7 place-items-center" aria-hidden>
                        <Image src="/icons/info.svg" alt="" width={18} height={18} />
                      </span>
                    </div>

                    <div className="mt-5 flex w-260 gap-4">
                      {ASSISTANTS.map((assistant) => (
                        <article
                          key={assistant.name}
                          className="flex h-28 w-62 shrink-0 items-center gap-4 rounded-[20px] bg-surface-subtle p-4"
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-px pb-px">
                            <p className="font-display text-title-s">{assistant.name}</p>
                            <p className="pt-1 text-body-s text-muted">{assistant.named}</p>
                          </div>
                          <Ring value={assistant.share} low={assistant.tone === "low"} />
                        </article>
                      ))}
                    </div>

                    <div className="mt-8">
                      <div className="flex h-7 items-center gap-2.5">
                        <h3 className="font-display text-title-s">Question by question</h3>
                        <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-chip-ok pr-2.5 pl-2 text-label-s text-ok">
                          <Image src="/icons/spark.svg" alt="" width={14} height={14} />2 answers
                        </span>
                      </div>
                      <table className="mt-3 w-260 table-fixed border-collapse text-left">
                        <thead>
                          <tr>
                            <th className="h-10.5 border-b border-line px-2 pt-1 pb-4.25 text-left text-label-m">
                              Question a customer might ask
                            </th>
                            {["ChatGPT", "Gemini", "Perplexity", "AI Overview"].map((name) => (
                              <th key={name} className="h-10.5 w-24 border-b border-line px-2 pt-1 pb-4.25 text-center text-label-m">
                                {name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {QUESTIONS.map((item) => (
                            <tr key={item.question}>
                              <td className="h-12 border-b border-line px-2 text-body-m">{item.question}</td>
                              {item.named.map((yes, index) => (
                                <td key={index} className="h-12 border-b border-line px-2 text-center">
                                  <Status named={yes} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Reveal>
                  </div>
                </div>
                <Reveal
                  y={30}
                  duration={0.7}
                  delay={0.7}
                  className="hidden rounded-[20px] bg-chip-ok p-7 text-fg shadow-card lg:absolute lg:top-37 lg:left-231.75 lg:block lg:w-113"
                  theme="light"
                >
              <h3 className="font-display text-title-l">Named most often</h3>
              <p className="mt-1 text-body-s text-muted">Answers naming each business, of {ANSWER_TOTAL}</p>
              <ul className="mt-4 flex flex-col gap-4">
                {LEADERBOARD.map((item) => (
                  <li key={item.name}>
                    <div className="flex justify-between gap-3">
                      <span className={item.yours ? "text-label-m" : "text-body-m"}>{item.name}</span>
                      <span className="text-label-m">
                        {item.count} / {ANSWER_TOTAL}
                      </span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-pill bg-surface">
                      <div
                        className={`h-full rounded-pill ${item.yours ? "bg-green" : "bg-faint"}`}
                        style={{ width: `${(item.bar / BAR_TRACK) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </HeroSurface>
    </div>
  );
}

function Ring({ value, low }: { value: number; low: boolean }) {
  const radius = 36;
  const length = 2 * Math.PI * radius;
  const filled = (value / 100) * length;
  return (
    <span className="relative grid size-20 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="6" className="stroke-ring-track" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={value >= 100 ? undefined : `${filled} ${length - filled}`}
          transform="rotate(-90 40 40)"
          className={low ? "stroke-grade-d" : "stroke-green"}
        />
      </svg>
      <span className="font-display text-title-s">{value}%</span>
    </span>
  );
}

function Status({ named }: { named: boolean }) {
  return (
    <span className={`inline-grid size-7 place-items-center rounded-[14px] ${named ? "bg-chip-ok" : "bg-danger-soft"}`}>
      <Image src={named ? "/icons/check.svg" : "/icons/x.svg"} alt={named ? "Named" : "Not named"} width={16} height={16} />
    </span>
  );
}

function Reveal({
  y,
  duration,
  delay = 0,
  amount = 0.3,
  className = "",
  theme,
  children,
}: {
  y: number;
  duration: number;
  delay?: number;
  amount?: number;
  className?: string;
  theme?: "light";
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      data-theme={theme}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={reduceMotion ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
