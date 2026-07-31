import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

// Only the authenticated dashboard surface is protected here. The public widget
// embed page and public widget/chat API routes are intentionally NOT matched --
// they have no session and are scoped entirely by publicWidgetId (build-plan decision).
export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/websites/:path*", "/widgets/:path*", "/resources/:path*"],
};
