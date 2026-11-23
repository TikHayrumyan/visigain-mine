/** Example AI-visibility reading shown on the home page. */
export const ASSISTANTS = [
  { name: "ChatGPT", named: "named you for 7 of 8 questions", share: 88, tone: "ok" },
  { name: "Gemini", named: "named you for 2 of 8 questions", share: 25, tone: "low" },
  { name: "Perplexity", named: "named you for 8 of 8 questions", share: 100, tone: "ok" },
  { name: "AI Overviews", named: "named you for 8 of 8 questions", share: 100, tone: "ok" },
] as const;

/** Columns follow the assistants: ChatGPT, Gemini, Perplexity, AI Overview. */
export const QUESTIONS: { question: string; named: readonly boolean[] }[] = [
  { question: "What is the best med spa in Torrance?", named: [true, false, true, true] },
  { question: "Who should I see for Botox in Torrance?", named: [true, true, true, true] },
  { question: "Where should I get lip filler in Torrance?", named: [false, false, true, true] },
  { question: "Where should I go for laser hair removal in Torrance?", named: [true, false, true, true] },
];

/** Bar lengths are the design's pixels on a 396px track, not the count divided by 32. */
export const LEADERBOARD = [
  { name: "Skin Works Medical Spa · you", count: 25, yours: true, bar: 328 },
  { name: "HoneMD Med Spa Torrance", count: 5, yours: false, bar: 66 },
  { name: "South Bay Med Spa", count: 5, yours: false, bar: 66 },
  { name: "The Spa at South Bay Plastic Surgeons", count: 4, yours: false, bar: 53 },
] as const;

export const BAR_TRACK = 396;

export const ANSWER_TOTAL = 32;
