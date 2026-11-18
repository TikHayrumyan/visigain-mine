import "server-only";
import { cookies } from "next/headers";
import { appOrigin } from "./referral";

/** The website's hint that the visitor is signed in on the app (written on .visigain.com by the app's sign-in). */
const SIGNED_IN_COOKIE = "vg_signed_in";

export interface AccountLink {
  signedIn: boolean;
  key: string;
  href: string;
}

/**
 * The link to the customer app in the top bar and the open menu: "Dashboard" while the hint cookie says the visitor is
 * signed in, else "Log in". None while the site is holding and the visitor is not signed in (sign-in is hidden then).
 */
export async function accountLink(holding: boolean): Promise<AccountLink | null> {
  const app = appOrigin(process.env);
  if ((await cookies()).get(SIGNED_IN_COOKIE)?.value === "1") {
    return { signedIn: true, key: "common.shared.dashboard", href: new URL("/dashboard", app).toString() };
  }
  return holding ? null : { signedIn: false, key: "site.home.log_in", href: new URL("/signin", app).toString() };
}
