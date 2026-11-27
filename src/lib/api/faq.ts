import "server-only";

import { z } from "zod";
import { backendApiOrigin, backendSiteOrigin } from "./backend";

const TIMEOUT_MS = 2_500;

const faqSchema = z
  .object({
    items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) }).passthrough()).min(1),
  })
  .passthrough();

export type FaqEntry = {
  question: string;
  answer: string;
};

/** Published questions for /faq. A failure leaves the page on its design copy. */
export async function liveFaq(): Promise<readonly FaqEntry[] | null> {
  try {
    const response = await fetch(`${backendApiOrigin()}/api/v1/faq`, {
      headers: { accept: "application/json", origin: backendSiteOrigin() },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const parsed = faqSchema.safeParse(await response.json());

    if (!parsed.success) return null;

    return parsed.data.items.map((item) => ({ question: item.q, answer: item.a }));
  } catch {
    return null;
  }
}
