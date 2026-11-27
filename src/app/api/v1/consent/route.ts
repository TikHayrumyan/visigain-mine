import { backendApiOrigin, backendSiteOrigin } from "@/lib/api/backend";
import { consentBodySchema, noticeCookie } from "@/lib/consent";

const TIMEOUT_MS = 8_000;

function sameSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function secureRequest(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");

  return proto === "https";
}

/** Localhost is http, and a Secure cookie from the API would never be stored there. */
function forwardCookie(cookie: string, secure: boolean): string {
  return secure ? cookie : cookie.replace(/;\s*Secure/gi, "");
}

/**
 * Records that the privacy notice was shown, agreed to, or opted out of.
 * The browser id cookie comes back from the API; the choice itself stays on our host.
 */
export async function POST(request: Request): Promise<Response> {
  if (!sameSite(request)) {
    return new Response(null, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = consentBodySchema.safeParse(body);

  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backendApiOrigin()}/api/v1/consent?event=${parsed.data.event}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        origin: backendSiteOrigin(),
        "content-length": "0",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new Response(null, { status: upstream.status });
    }

    const headers = new Headers();
    const secure = secureRequest(request);

    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append("set-cookie", forwardCookie(cookie, secure));
    }

    if (parsed.data.event !== "shown") {
      headers.append("set-cookie", noticeCookie(parsed.data.version, parsed.data.event, secure));
    }

    return new Response(null, { status: 204, headers });
  } catch {
    return new Response(null, { status: 503 });
  }
}
