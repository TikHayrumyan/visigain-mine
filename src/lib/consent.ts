import { z } from "zod";

/** Remembers which notice version this browser already answered, so a new version shows the bar again. */
export const NOTICE_COOKIE = "vg_notice";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export const consentBodySchema = z.object({
  event: z.enum(["shown", "agree", "opt_out"]),
  version: z.string().trim().min(1).max(40),
});

export function hasNoticeChoice(value: string | undefined, version: string): boolean {
  return value === `${version}:agree` || value === `${version}:opt_out`;
}

export function noticeCookie(version: string, choice: "agree" | "opt_out", secure: boolean): string {
  const flags = ["Max-Age=" + YEAR_SECONDS, "Path=/", "HttpOnly", "SameSite=Lax"];

  if (secure) flags.push("Secure");

  return `${NOTICE_COOKIE}=${encodeURIComponent(`${version}:${choice}`)}; ${flags.join("; ")}`;
}
