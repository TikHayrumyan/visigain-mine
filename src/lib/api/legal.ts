import "server-only";

import { z } from "zod";
import { backendApiOrigin, backendSiteOrigin } from "./backend";

const TIMEOUT_MS = 2_500;

const legalLinesSchema = z
  .object({
    noticeVersion: z.string().min(1),
    notice: z.object({
      standardMarkdown: z.string().min(1),
      gpcMarkdown: z.string().min(1),
    }),
    noticeButtons: z.object({
      agree: z.string().min(1),
      optOut: z.string().min(1),
    }),
  })
  .passthrough();

export type LegalNotice = {
  version: string;
  standardMarkdown: string;
  gpcMarkdown: string;
  agree: string;
  optOut: string;
};

/** The privacy notice, word for word. A failure leaves the banner off rather than inventing the sentence. */
export async function liveLegalNotice(): Promise<LegalNotice | null> {
  try {
    const response = await fetch(`${backendApiOrigin()}/api/v1/legal/lines`, {
      headers: { accept: "application/json", origin: backendSiteOrigin() },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const parsed = legalLinesSchema.safeParse(await response.json());

    if (!parsed.success) return null;

    return {
      version: parsed.data.noticeVersion,
      standardMarkdown: parsed.data.notice.standardMarkdown,
      gpcMarkdown: parsed.data.notice.gpcMarkdown,
      agree: parsed.data.noticeButtons.agree,
      optOut: parsed.data.noticeButtons.optOut,
    };
  } catch {
    return null;
  }
}
