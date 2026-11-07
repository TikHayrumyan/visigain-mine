import "server-only";
import { cookies } from "next/headers";
import { appOrigin, REF_COOKIE, referralCode, withReferral } from "./referral";

/** The referral code this visitor holds on the website's host (`vg_ref`, HttpOnly, so read here on the server), or null. */
export async function heldReferral(): Promise<string | null> {
  return referralCode((await cookies()).get(REF_COOKIE)?.value);
}

/** A link to the app as this visitor should follow it: with `?vg_ref=<code>` when a valid code is held (`withReferral`). */
export async function appHref(href: string): Promise<string> {
  return withReferral(href, await heldReferral(), appOrigin(process.env));
}
