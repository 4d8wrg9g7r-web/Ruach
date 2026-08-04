import { cookies } from "next/headers";
import { prayerService } from "@ruach/database";

const PRAYER_SESSION_COOKIE = "ruach_prayer_session";
const PRAYER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * The cookie is path-scoped to /prayer/{publicPrayerWallId}, not global. This
 * dashboard hosts many organizations' prayer walls under different
 * publicPrayerWallId paths on the same domain -- a single global cookie name would
 * mean logging into one church's wall silently overwrites (and logs out of) another
 * church's session in the same browser. Path-scoping lets the same cookie name be
 * reused safely per church, since the browser only sends the matching path's cookie.
 */
export async function setPrayerSessionCookie(publicPrayerWallId: string, token: string) {
  const jar = await cookies();
  jar.set(PRAYER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/prayer/${publicPrayerWallId}`,
    maxAge: PRAYER_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearPrayerSessionCookie(publicPrayerWallId: string) {
  const jar = await cookies();
  jar.set(PRAYER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/prayer/${publicPrayerWallId}`,
    maxAge: 0,
  });
}

/**
 * Resolves the logged-in PrayerWallAccount for the current request, or null.
 * organizationId is checked explicitly against the resolved account (not just relied
 * on via the cookie's path scoping) as defense-in-depth -- never trust the browser
 * boundary alone.
 */
export async function getCurrentPrayerAccount(organizationId: string) {
  const token = await getPrayerSessionToken();
  if (!token) return null;
  const account = await prayerService.getAccountBySessionToken(token);
  if (!account || account.organizationId !== organizationId) return null;
  return account;
}

/** Raw session token, for logoutAction to pass to prayerService.deleteSession. */
export async function getPrayerSessionToken() {
  const jar = await cookies();
  return jar.get(PRAYER_SESSION_COOKIE)?.value ?? null;
}
