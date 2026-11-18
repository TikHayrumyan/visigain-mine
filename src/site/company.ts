import "server-only";
import { publicApi } from "@/api/server";
import type { components } from "@/api/client";

export type Company = components["schemas"]["CompanyFacts"];

/** The company's facts change rarely: GET /about is read at most every five minutes. */
const TTL_MS = 300_000;
let held: { company: Company; at: number } | undefined;

/** The company's legal name, public email and postal address for the footer (GET /about), or null when unreadable. */
export async function loadCompany(): Promise<Company | null> {
  if (held && Date.now() - held.at < TTL_MS) return held.company;
  try {
    const { data } = await publicApi().GET("/api/v1/about");
    if (data) {
      held = { company: data.company, at: Date.now() };
      return data.company;
    }
  } catch {
    // The API could not be reached: fall through.
  }
  return held?.company ?? null;
}
