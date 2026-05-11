import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Origins permitted to call the /api/* routes cross-origin.
// Add new dashboard / partner URLs here.
const ALLOWED_ORIGINS = [
  "https://happy-water-0ea27651e.7.azurestaticapps.net",
  "http://localhost:5173", // wic-compliance Vite dev server
  "http://localhost:3000", // local Next.js
];

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

export function proxy(req: NextRequest) {
  // Only apply CORS to /api/* paths; matcher below already restricts this,
  // but check just in case.
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
      res.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
      res.headers.set("Access-Control-Max-Age", "86400");
      res.headers.set("Vary", "Origin");
    }
    return res;
  }

  // Actual request — pass through but tag the response with CORS headers
  const res = NextResponse.next();
  if (isAllowed) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
