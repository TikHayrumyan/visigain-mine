import "server-only";

import { z } from "zod";
import { backendApiOrigin, backendSiteOrigin } from "./backend";
import { formatUsd } from "./money";

const TIMEOUT_MS = 2_500;

const pricingSchema = z
  .object({
    free: z.object({ amountCents: z.number().int().nonnegative() }).passthrough(),
    fullReport: z.object({ amountCents: z.number().int().nonnegative() }).passthrough(),
    monitoring: z
      .object({
        amountCents: z.number().int().nonnegative(),
      })
      .passthrough(),
    faq: z.array(z.object({ q: z.string(), a: z.string() }).passthrough()),
  })
  .passthrough();

const prepaidTermSchema = z
  .object({
    term: z.string(),
    amountCents: z.number().int().nonnegative(),
  })
  .passthrough();

const monitoringOptionsSchema = z
  .object({
    options: z
      .object({
        prepaid: z.array(prepaidTermSchema).nullable().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type LivePricing = {
  free: string;
  fullReport: string;
  monitoring: string;
  questions: readonly { question: string; answer: string }[];
  sixMonths: string | null;
  year: string | null;
};

async function readJson(path: string): Promise<unknown> {
  const response = await fetch(`${backendApiOrigin()}${path}`, {
    headers: { accept: "application/json", origin: backendSiteOrigin() },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: 60 },
  });

  if (!response.ok) return null;

  return response.json();
}

function prepaidAmount(terms: readonly { term: string; amountCents: number }[] | null | undefined, term: string): string | null {
  const match = terms?.find((item) => item.term === term);

  return match ? formatUsd(match.amountCents) : null;
}

/** Prices and the pricing-page questions. A failure leaves the page on its design copy. */
export async function livePricing(): Promise<LivePricing | null> {
  try {
    const [pricingResult, optionsResult] = await Promise.allSettled([
      readJson("/api/v1/pricing"),
      readJson("/api/v1/checkout/monitoring/options"),
    ]);
    const pricing = pricingSchema.safeParse(pricingResult.status === "fulfilled" ? pricingResult.value : null);

    if (!pricing.success) return null;

    const options = monitoringOptionsSchema.safeParse(optionsResult.status === "fulfilled" ? optionsResult.value : null);
    const terms = options.success ? options.data.options.prepaid : null;

    return {
      free: formatUsd(pricing.data.free.amountCents),
      fullReport: formatUsd(pricing.data.fullReport.amountCents),
      monitoring: formatUsd(pricing.data.monitoring.amountCents),
      questions: pricing.data.faq.map((item) => ({ question: item.q, answer: item.a })),
      sixMonths: prepaidAmount(terms, "six_months"),
      year: prepaidAmount(terms, "yearly"),
    };
  } catch {
    return null;
  }
}
