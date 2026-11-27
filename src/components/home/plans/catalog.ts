import { CONTACT, FREE_SCAN } from "@/config/navigation";

export type Plan = {
  tag: string;
  /** The pale chip, or the green one on the highlighted plan. */
  tagTone: "neutral" | "ok";
  name: string;
  price: string;
  /** The words beside the figure. The proposal has none. */
  note?: string;
  /** The proposal is 32px on every screen. The figures grow from 28 to 36. */
  figure: "price" | "proposal";
  features: readonly string[];
  cta: string;
  href: string;
  highlighted: boolean;
};

const PRICING = "/pricing";
const REPORT_CHECKOUT = "/checkout/report";
const MONITORING_CHECKOUT = "/checkout/monitoring";

export const PLANS: readonly Plan[] = [
  {
    tag: "Start here",
    tagTone: "neutral",
    name: "Free Scan",
    price: "$0",
    figure: "price",
    features: ["Your grade and score", "Top three findings", "How you compare locally"],
    cta: FREE_SCAN.label,
    href: FREE_SCAN.href,
    highlighted: false,
  },
  {
    tag: "One time",
    tagTone: "neutral",
    name: "Full Visibility Grade Report",
    price: "$99",
    note: "one time",
    figure: "price",
    features: [
      "Every finding, with the exact fix",
      "What to do first, and why",
      "Credit toward Monitoring or services for 14 days",
    ],
    cta: "Get the report",
    href: PRICING,
    highlighted: false,
  },
  {
    tag: "Most chosen",
    tagTone: "ok",
    name: "Monitoring",
    price: "$149",
    note: "a month",
    figure: "price",
    features: ["Weekly checks", "Alerts when something changes", "Monthly progress report"],
    cta: "Start monitoring",
    href: PRICING,
    highlighted: true,
  },
  {
    tag: "Done for you",
    tagTone: "neutral",
    name: "Growth retainer",
    price: "By proposal",
    figure: "proposal",
    features: ["We make the fixes", "Monthly strategy call", "Grade tracked every week"],
    cta: "Book a call",
    href: CONTACT.href,
    highlighted: false,
  },
];

/**
 * The pricing page's cards. The full report is $199 here; Home still shows $99.
 * The mobile frame's plan card still says $99, which the design notes flag as a mistake.
 */
export const PAGE_PLANS: readonly Plan[] = PLANS.map((plan) => {
  if (plan.price === "$99") return { ...plan, price: "$199", href: REPORT_CHECKOUT };
  if (plan.name === "Monitoring") return { ...plan, href: MONITORING_CHECKOUT };
  return plan;
});

const API_PRICE = {
  "Free Scan": "free",
  "Full Visibility Grade Report": "fullReport",
  Monitoring: "monitoring",
} as const;

/** Swaps the three priced cards. Growth retainer stays "By proposal". */
export function withApiPrices(
  plans: readonly Plan[],
  prices: { free: string; fullReport: string; monitoring: string },
): readonly Plan[] {
  return plans.map((plan) => {
    const key = API_PRICE[plan.name as keyof typeof API_PRICE];

    return key ? { ...plan, price: prices[key] } : plan;
  });
}
