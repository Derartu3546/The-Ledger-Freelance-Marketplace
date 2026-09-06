import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Routes that require a logged-in user.
const PROTECTED_PREFIXES = ["/dashboard", "/jobs/new"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Client-only route: posting a job.
  if (path.startsWith("/jobs/new") && payload.role !== "CLIENT") {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }

  // Route each role to its own dashboard.
  if (path === "/dashboard") {
    const target = payload.role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/jobs/new"],
};
