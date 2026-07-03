import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MEMBER_TOKEN = "aesthete_member_token";
const STAFF_TOKEN = "aesthete_staff_token";
const STAFF_ROLE = "aesthete_staff_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const memberToken = request.cookies.get(MEMBER_TOKEN)?.value;
  const staffToken = request.cookies.get(STAFF_TOKEN)?.value;
  const staffRole = request.cookies.get(STAFF_ROLE)?.value;

  if (pathname.startsWith("/account") && !memberToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/pos") && pathname !== "/pos/login" && !staffToken) {
    return NextResponse.redirect(new URL("/pos/login", request.url));
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    (!staffToken || staffRole !== "admin")
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/pos/:path*", "/admin/:path*"],
};
