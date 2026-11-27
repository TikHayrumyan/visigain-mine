import { backendApiOrigin, backendSiteOrigin } from "@/lib/api/backend";
import { placeSearchRequestSchema, placeSearchResponseSchema } from "@/lib/api/places";

const SEARCH_TIMEOUT_MS = 8_000;

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

/**
 * The dropdown. A Server Action would queue each keystroke behind the previous one,
 * so this is a route the browser calls on the site's own host.
 */
export async function POST(request: Request): Promise<Response> {
  if (!sameSite(request)) {
    return Response.json({ suggestions: [] }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ suggestions: [] }, { status: 400 });
  }

  const parsed = placeSearchRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ suggestions: [] }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backendApiOrigin()}/api/v1/places/search`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        origin: backendSiteOrigin(),
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return Response.json({ suggestions: [] }, { status: upstream.status });
    }

    const suggestions = placeSearchResponseSchema.safeParse(await upstream.json());

    if (!suggestions.success) {
      return Response.json({ suggestions: [] }, { status: 502 });
    }

    return Response.json({ suggestions: suggestions.data.suggestions });
  } catch {
    return Response.json({ suggestions: [] }, { status: 503 });
  }
}
