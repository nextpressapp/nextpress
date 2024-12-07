import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/editor") &&
      !["ADMIN", "EDITOR"].includes(token?.role as string)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/tickets") &&
      !["ADMIN", "SUPPORT"].includes(token?.role as string)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/dashboard") &&
      !["ADMIN", "SUPPORT", "EDITOR", "USER"].includes(token?.role as string)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/tickets/:path*",
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
