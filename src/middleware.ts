// HybridAI/src/middleware.ts

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import RateLimiter from "@/utils/rateLimiter";
const globalRateLimiter = new RateLimiter();

// Middleware to enhance security and prevent attacks
export async function middleware(req: NextRequest) {
  // 0. Limiting requests from current IP
  const getIP = (req: NextRequest): string => {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }

    // Fallback to localhost if no headers are found
    return "127.0.0.1";
  };
  const ip = getIP(req);
  if (!globalRateLimiter.checkLimit(ip)) {
    return NextResponse.json(
      { error: `Too many requests from IP: ${ip}` },
      { status: 429 }
    );
  }

  const { pathname } = req.nextUrl;

  // 1. Logging all incoming requests
  console.log(`[${new Date().toISOString()}] Request to: ${pathname}`);

  // 2. Protect against Cross-Site Request Forgery (CSRF)
  if (req.method !== "GET" && !req.headers.get("x-csrf-token")) {
    return NextResponse.json(
      { error: "CSRF token is required for this request." },
      { status: 403 }
    );
  }

  // 3. Validate authentication for protected routes
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session && pathname.startsWith("/api/protected")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  // 4. Validate API request headers and content type
  if (pathname.startsWith("/api/") && req.method !== "GET") {
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json." },
        { status: 400 }
      );
    }
  }

  // 5. Add security headers to prevent common attacks
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

// Configuration for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
