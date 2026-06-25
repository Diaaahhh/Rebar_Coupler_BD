import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token");

  const isLoginPage =
    request.nextUrl.pathname === "/admin/login";

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Not logged in
  if (!token && !isLoginPage) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Logged in
  if (token && isLoginPage) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
