import { createClient } from "./client";

/** The API client in the browser: the site's own origin, so the session cookie and the Origin header go by themselves. */
export const browserApi = createClient({ baseUrl: "" });
