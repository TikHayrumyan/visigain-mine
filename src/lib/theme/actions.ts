"use server";

import { cookies } from "next/headers";
import { parseTheme, THEME_COOKIE } from "./theme";

/** Stores the theme for this browser ("system" removes the cookie); Next then re-renders the current page. */
export async function setTheme(form: FormData) {
  const theme = parseTheme(String(form.get("theme") ?? ""));
  const jar = await cookies();
  if (theme === "system") {
    jar.delete(THEME_COOKIE);
    return;
  }
  jar.set(THEME_COOKIE, theme, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 365 * 86_400,
  });
}
