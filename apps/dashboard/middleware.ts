import { NextResponse } from "next/server";
import { auth } from "./auth";

/**
 * Inverted from the previous allowlist-of-protected-paths, which drifted out of
 * sync every time a new dashboard route was added -- /analytics, /prayer-wall,
 * /team, /settings, /audit-log, /getting-started, /billing, /conversations were all
 * missing from that matcher at one point or another, so unauthenticated requests
 * fell through to each page's own getCurrentOrganization() check instead of getting
 * a clean /login redirect. Still safe in every case -- no protected data ever
 * rendered, since every dashboard page independently checks for a session -- just
 * the wrong redirect target (usually /onboarding).
 *
 * This instead fails safe: a forgotten new PUBLIC page just gets wrongly sent to
 * login (annoying, easy to notice, one line to fix), rather than a forgotten new
 * PROTECTED page silently sitting unlisted.
 *
 * Built from a full `next build` route listing, not guessed -- see the two exact
 * root-level static-file sets and the prefix set below. Prefix checks require an
 * exact match OR the next character to be "/", not just startsWith -- "/widgets"
 * (protected dashboard page) must not accidentally match a "/widget" (public embed)
 * prefix, same for "/prayer-wall" (protected) vs. "/prayer" (public visitor pages).
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/_not-found",
  "/apple-icon",
  "/icon",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/login",
  "/forgot-password",
  "/reset-password",
  // Public embeddable script -- every installed widget-loader.js tag on a
  // customer's site fetches this with no session.
  "/widget-loader.js",
]);

// Next's per-page opengraph-image/twitter-image routes get a content hash suffix
// that changes on every build, so the root-level ones (the homepage's) can't be
// exact-matched. Page-scoped ones (e.g. /pricing/opengraph-image-xyz) are already
// covered by that page's own prefix below.
const PUBLIC_ROOT_IMAGE_PATTERN = /^\/(opengraph|twitter)-image-[a-z0-9]+$/;

const PUBLIC_PREFIXES = [
  // Marketing pages (each may have its own opengraph-image/twitter-image children).
  "/demo",
  "/faq",
  "/features",
  "/how-it-works",
  "/pricing",
  "/privacy",
  "/product",
  "/terms",
  "/why-ruach",
  // Signup flow -- must work for a visitor with no session yet.
  "/signup",
  // API routes handle their own auth per-route (webhook signatures, cron secrets,
  // publicWidgetId scoping, NextAuth's own callback endpoints) -- never gated here.
  "/api",
  // Public widget embed (/widget/embed/[id]) -- NOT "/widgets", the protected
  // dashboard page; the boundary check below is what keeps these apart.
  "/widget",
  // Public prayer-wall + testimonies visitor pages (/prayer/[id]/...) -- NOT
  // "/prayer-wall", the protected dashboard moderation page.
  "/prayer",
  // Uploaded logos, rendered on public prayer-wall/widget-embed pages with no session.
  "/uploads",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_ROOT_IMAGE_PATTERN.test(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
