/**
 * The referral code on links to the customer app. `vg_ref` is host-only: a referral link (/r/<code>, the backend's)
 * leaves it on the website's host (visigain.com), and the pages that read it (the Full Report's and Monitoring's
 * checkout, the onboarding form) are on the app's host (app.visigain.com), where it is not sent. So every link from
 * this site to the app carries the code as `?vg_ref=<code>` when a valid one is held here, and the app's host keeps it
 * as its own cookie (the backend's src/server/referrals/carry.ts, which does the same for its 308s).
 *
 * The code is checked as the backend checks it (`referralCode`, a copy of its rule: upper case, eight characters of
 * growth's alphabet, no 0, O, 1, I or L); anything else adds nothing. Pure: no Next import.
 */

export const REF_COOKIE = "vg_ref";
/** The query parameter that carries it to the app's host. */
export const REF_PARAM = "vg_ref";
/** The backend's CODE_PATTERN (src/server/growth/index.ts), copied: the alphabet ABCDEFGHJKMNPQRSTUVWXYZ23456789, eight long. */
const CODE_PATTERN = /^[A-HJKMNP-Z2-9]{8}$/;

/** The customer app's origin when APP_ORIGIN does not say otherwise. */
export const DEFAULT_APP_ORIGIN = "https://app.visigain.com";

type Env = Record<string, string | undefined>;

/** The code as the backend keeps it (upper case), or null when it is not one. */
export function referralCode(value: string | null | undefined): string | null {
  const c = (value ?? "").toUpperCase();
  return CODE_PATTERN.test(c) ? c : null;
}

/** The app's origin: APP_ORIGIN (an http(s) origin), else app.visigain.com. */
export function appOrigin(env: Env): string {
  const raw = (env.APP_ORIGIN ?? "").trim();
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol === "https:" || u.protocol === "http:") return u.origin;
    } catch {
      // Not a URL: the default stands.
    }
  }
  return DEFAULT_APP_ORIGIN;
}

/** Whether a link goes to the app: an absolute address on its origin. A path of this site never does. */
export function isAppHref(href: string, app: string): boolean {
  try {
    return new URL(href).origin === new URL(app).origin;
  } catch {
    return false;
  }
}

/**
 * `href` with the code added as `?vg_ref=`, when it goes to the app and the code is one; else `href` unchanged. A
 * `vg_ref` the address already had is replaced (the cookie's code is the one this visitor arrived with).
 */
export function withReferral(href: string, code: string | null | undefined, app: string): string {
  const c = referralCode(code);
  if (!c || !isAppHref(href, app)) return href;
  const u = new URL(href);
  u.searchParams.set(REF_PARAM, c);
  return u.toString();
}
