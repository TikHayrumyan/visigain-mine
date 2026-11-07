"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseTheme, safeBack, THEME_COOKIE } from "./theme";

/** Sets the theme for this browser. "system" removes the cookie. Then back to the page the switch was on. */
export async function setTheme(form: FormData) {
  const theme = parseTheme(String(form.get("theme") ?? ""));
  const jar = await cookies();
  if (theme === "system") jar.delete(THEME_COOKIE);
  else
    jar.set(THEME_COOKIE, theme, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 86_400,
    });
  redirect(safeBack(form.get("back")));
}
