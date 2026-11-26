export interface AreaScore {
  name: string;
  /** Out of 100. Missing when the area was not assessed. */
  score?: number;
  bar?: string;
}

export interface Fix {
  fix: string;
  effort: string;
  /** The visitor can do it without help. */
  yourself: boolean;
}

export interface Evidence {
  source: string;
  value: string;
  differs?: boolean;
}

export interface Finding {
  problem: string;
  detail: string;
  evidence?: readonly Evidence[];
  fix: string;
  why: string;
  where: string;
}

export const AREAS: readonly AreaScore[] = [
  { name: "Findability", score: 61.2, bar: "bg-grade-c" },
  { name: "Reputation", score: 54, bar: "bg-grade-c" },
  { name: "Website experience", score: 70.1, bar: "bg-green" },
  { name: "AI answers", score: 38.5, bar: "bg-grade-d" },
  { name: "Trust" },
];

export const FIXES: readonly Fix[] = [
  { fix: "Reply to every Google review from the last 90 days.", effort: "An afternoon", yourself: true },
  { fix: "Use one phone number everywhere the business is listed.", effort: "An hour", yourself: true },
  {
    fix: "Publish a page per service that answers the questions buyers ask.",
    effort: "A few weeks",
    yourself: false,
  },
  {
    fix: "Compress the homepage images so the page loads in under 2.5 seconds on a phone.",
    effort: "A day",
    yourself: false,
  },
];

const WHY = "Buyers and AI assistants use this to decide who to recommend.";

export const FINDINGS: readonly Finding[] = [
  {
    problem: "Replies to reviews",
    detail: "3 of the last 41 reviews have a reply.",
    fix: "Reply to every Google review from the last 90 days, starting with the critical ones.",
    why: WHY,
    where: "On the website",
  },
  {
    problem: "Name, address and phone match everywhere",
    detail: "Two different phone numbers are in use.",
    evidence: [
      { source: "Website", value: "(310) 555-0101" },
      { source: "Google profile", value: "(310) 555-0199", differs: true },
      { source: "Yelp", value: "(310) 555-0101" },
    ],
    fix: "Use one phone number on the website, the Google profile and the directories.",
    why: WHY,
    where: "On the website",
  },
  {
    problem: "Named in AI answers for the main local query",
    detail: "Not named in 5 of 5 answers to “best dentist in Los Angeles”.",
    fix: "Publish a page per service that answers the questions buyers ask, with prices where you can.",
    why: WHY,
    where: "On the website",
  },
];
