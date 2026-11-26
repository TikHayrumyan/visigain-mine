"use server";

import { redirect } from "next/navigation";
import { fieldIssue, scanSchema, websiteHost, type ScanField, type ScanFormState } from "./schema";

const FIELDS: readonly ScanField[] = ["website", "business", "email", "terms"];

/** Accepts the form and opens the waiting page. Nothing is emailed: there is no mailer or grader yet. */
export async function startScan(_previous: ScanFormState, formData: FormData): Promise<ScanFormState> {
  const values = {
    website: String(formData.get("website") ?? ""),
    city: String(formData.get("city") ?? ""),
    business: String(formData.get("business") ?? ""),
    email: String(formData.get("email") ?? ""),
    terms: formData.get("terms") === "on",
    marketing: formData.get("marketing") === "on",
  };
  const parsed = scanSchema.safeParse({ ...values, terms: values.terms ? "on" : "" });
  if (!parsed.success) {
    const errors: ScanFormState["errors"] = {};
    for (const field of FIELDS) {
      const issue = fieldIssue(field, field === "terms" ? (values.terms ? "on" : "") : values[field]);
      if (issue) errors[field] = issue;
    }
    return { status: "invalid", errors, values };
  }
  const website = websiteHost(parsed.data.website);
  redirect(`/scan/waiting?website=${encodeURIComponent(website)}`);
}
