import { z } from "zod";
import { BUSINESS_TYPES } from "@/components/home/who-its-for/categories";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE = /^(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?$/i;

export const SCAN_ERROR = {
  website: "Enter your website, like yourbusiness.com.",
  business: "Choose your type of business from the list.",
  email: "Enter a valid email, like you@yourbusiness.com.",
  terms: "Agree to the Terms of Service and Privacy Policy.",
} as const;

export type ScanField = keyof typeof SCAN_ERROR;

const TYPES = new Set<string>(BUSINESS_TYPES.map((type) => type.name));

export const scanSchema = z.object({
  website: z.string().trim().regex(WEBSITE, { error: SCAN_ERROR.website }),
  city: z.string().trim(),
  business: z.string().trim().refine((value) => TYPES.has(value), { error: SCAN_ERROR.business }),
  email: z.string().trim().regex(EMAIL, { error: SCAN_ERROR.email }),
  terms: z.literal("on", { error: SCAN_ERROR.terms }),
  marketing: z.boolean(),
});

export type ScanInput = z.infer<typeof scanSchema>;

export interface ScanValues {
  website: string;
  city: string;
  business: string;
  email: string;
  terms: boolean;
  marketing: boolean;
}

export interface ScanFormState {
  status: "idle" | "invalid";
  errors: Partial<Record<ScanField, string>>;
  values: ScanValues | null;
}

export const initialScanState: ScanFormState = { status: "idle", errors: {}, values: null };

export function fieldIssue(field: ScanField, value: string): string | null {
  if (field === "terms") {
    return value === "on" ? null : SCAN_ERROR.terms;
  }
  const parsed = scanSchema.shape[field].safeParse(value);
  if (parsed.success) return null;
  return parsed.error.issues[0]?.message ?? SCAN_ERROR[field];
}

/** The host we show on the waiting and result pages. */
export function websiteHost(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}
