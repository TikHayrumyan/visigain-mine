import "server-only";

import { z } from "zod";
import { backendApiOrigin, backendSiteOrigin } from "./backend";

const TIMEOUT_MS = 2_500;

const aboutSchema = z
  .object({
    company: z.object({
      legalName: z.string().trim().min(1),
      publicEmail: z.string().trim().includes("@"),
      postalAddress: z.string().trim().min(1),
    }),
  })
  .passthrough();

export type CompanyFacts = {
  legalName: string;
  address: string;
  email: string;
};

/** Footer name, address and email. A failure leaves the design copy in place. */
export async function companyFacts(): Promise<CompanyFacts | null> {
  try {
    const response = await fetch(`${backendApiOrigin()}/api/v1/about`, {
      headers: { accept: "application/json", origin: backendSiteOrigin() },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const parsed = aboutSchema.safeParse(await response.json());

    if (!parsed.success) return null;

    return {
      legalName: parsed.data.company.legalName,
      address: parsed.data.company.postalAddress,
      email: parsed.data.company.publicEmail,
    };
  } catch {
    return null;
  }
}
