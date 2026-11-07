import { NextResponse, type NextRequest } from "next/server";
import { PATH_HEADER } from "@/site/path";

/**
 * Next 16's proxy (the former middleware): it only hands the path to the root layout, which decides whether the
 * holding page shows (GET /api/v1/site). Every rule about the API stays in the backend.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(PATH_HEADER, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Not the API (rewritten or routed to the backend), not the static files (under the asset prefix, /fe/_next/:
  // src/site/asset-prefix.ts; a literal here, as Next reads the matcher when it builds).
  matcher: ["/((?!api/|fe/_next/|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
