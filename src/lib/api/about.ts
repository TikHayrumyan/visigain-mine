import "server-only";

import { z } from "zod";
import { COMPANY } from "@/config/navigation";
import { backendApiOrigin, backendSiteOrigin } from "./backend";

const TIMEOUT_MS = 2_500;

const aboutSchema = z
  .object({
    company: z.object({
      legalName: z.string().trim().min(1),
      publicEmail: z.string().trim().includes("@"),
      postalAddress: z.string().trim().min(1),
    }),
    paragraphs: z.array(z.object({ section: z.string().trim().min(1), text: z.string().trim().min(1) })).optional(),
  })
  .passthrough();

const wordingsSchema = z
  .object({
    entries: z.record(z.string(), z.string()),
  })
  .passthrough();

/** Approved sentences, used only when a wording key does not resolve. */
const FALLBACK_SENTENCE: Record<string, string> = {
  "site.about.visigain_makes_the_visibility_grade_a":
    "Visigain makes the Visibility Grade: a letter grade, with its score, for how a local business shows up everywhere a buyer checks.",
  "site.about.we_apply_the_same_standard_to":
    "We apply the same standard to every business, and every finding comes with its evidence.",
  "site.about.visigain_llc_is_the_company_behind": "Visigain LLC is the company behind Visigain, based in Los Angeles.",
  "site.faq.we_re_check_your_business_in":
    "We re-check your business in full every week and run a quick check every day. You get a weekly summary, and an alert at once if something urgent breaks, such as your site going down or your booking link failing. Monitoring also includes the Full Report and every tool we use to help you fix what we find. Fair-use limits apply.",
  "site.about.we_only_grade_what_we_could": "We only grade what we could measure, and we say so when we couldn't.",
  "site.about.every_finding_comes_with_its_evidence": "Every finding comes with its evidence and its fix.",
  "site.about.we_don_t_claim_results_we": "We don't claim results we can't show.",
  "site.about.we_don_t_promise_rankings_or":
    "We don't promise rankings or results. No one can honestly promise a place in search results.",
  "site.contact.write_to_us_and_a_person": "Write to us and a person will answer, usually within one business day.",
};

const FALLBACK_KEYS: readonly { section: string; text: string }[] = [
  { section: "intro", text: "site.about.visigain_makes_the_visibility_grade_a" },
  { section: "intro", text: "site.about.we_apply_the_same_standard_to" },
  { section: "who", text: "site.about.visigain_llc_is_the_company_behind" },
  { section: "monitoring", text: "site.faq.we_re_check_your_business_in" },
  { section: "values", text: "site.about.we_only_grade_what_we_could" },
  { section: "values", text: "site.about.every_finding_comes_with_its_evidence" },
  { section: "values", text: "site.about.we_don_t_claim_results_we" },
  { section: "values", text: "site.about.we_don_t_promise_rankings_or" },
  { section: "contact", text: "site.contact.write_to_us_and_a_person" },
];

/** Quiet headings are chosen in the page. An unknown section is kept with the nearest block. */
const KNOWN_SECTIONS = new Set(["intro", "who", "monitoring", "values", "contact"]);

export type CompanyFacts = {
  legalName: string;
  address: string;
  email: string;
};

export type AboutContent = {
  company: CompanyFacts;
  lead: string;
  standard: readonly string[];
  companyLine: string | null;
  monitoring: readonly string[];
  principles: readonly string[];
  contact: string | null;
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

function companyFrom(value: z.infer<typeof aboutSchema> | null): CompanyFacts | null {
  if (!value) return null;

  return {
    legalName: value.company.legalName,
    address: value.company.postalAddress,
    email: value.company.publicEmail,
  };
}

/** Footer name, address and email. A failure leaves the design copy in place. */
export async function companyFacts(): Promise<CompanyFacts | null> {
  try {
    const parsed = aboutSchema.safeParse(await readJson("/api/v1/about"));

    return companyFrom(parsed.success ? parsed.data : null);
  } catch {
    return null;
  }
}

function sentence(key: string, entries: Record<string, string> | null): string | null {
  const live = entries?.[key]?.trim();

  if (live) return live;

  return FALLBACK_SENTENCE[key] ?? null;
}

/** The about page: the lead, the remaining paragraphs, and the company line. */
export async function aboutContent(): Promise<AboutContent> {
  let company: CompanyFacts | null = null;
  let keys = FALLBACK_KEYS;
  let entries: Record<string, string> | null = null;

  try {
    const [aboutBody, wordingsBody] = await Promise.all([readJson("/api/v1/about"), readJson("/api/v1/wordings?locale=en&ns=site")]);
    const about = aboutSchema.safeParse(aboutBody);
    const wordings = wordingsSchema.safeParse(wordingsBody);

    if (about.success) {
      company = companyFrom(about.data);
      if (about.data.paragraphs && about.data.paragraphs.length > 0) keys = about.data.paragraphs;
    }

    if (wordings.success) entries = wordings.data.entries;
  } catch {
    company = null;
  }

  const groups: { section: string; paragraphs: string[] }[] = [];

  for (const item of keys) {
    const line = sentence(item.text, entries);

    if (!line) continue;

    const last = groups.at(-1);

    if (last?.section === item.section) last.paragraphs.push(line);
    else groups.push({ section: item.section, paragraphs: [line] });
  }

  const intro = groups.find((group) => group.section === "intro");
  const lead =
    intro?.paragraphs[0] ??
    "Visigain makes the Visibility Grade: a letter grade, with its score, for how a local business shows up everywhere a buyer checks.";

  if (intro) intro.paragraphs = intro.paragraphs.slice(1);

  const paragraphs = (section: string) => groups.find((group) => group.section === section)?.paragraphs ?? [];
  const extras = groups.filter((group) => !KNOWN_SECTIONS.has(group.section)).flatMap((group) => group.paragraphs);

  return {
    company: company ?? COMPANY,
    lead,
    standard: [...(intro?.paragraphs ?? []), ...extras],
    companyLine: paragraphs("who")[0] ?? null,
    monitoring: paragraphs("monitoring"),
    principles: paragraphs("values"),
    contact: paragraphs("contact")[0] ?? null,
  };
}
