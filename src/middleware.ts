import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const role = token.role as string;

  if (request.nextUrl.pathname.startsWith("/editor") && !["ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/tickets") && !["ADMIN", "SUPPORT"].includes(token?.role as string)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !["ADMIN", "SUPPORT", "EDITOR", "USER"].includes(token?.role as string)
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/editor/:path*", "/tickets/:path*", "/dashboard/:path*"],
};
