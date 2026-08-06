import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { HeartHandshake } from "lucide-react";
import { prayerService, prayerWallService } from "@ruach/database";
import { getEmailProvider } from "@ruach/email";
import { PrayerWallHeader } from "../../../components/PrayerWallHeader";
import { PrayerWallList } from "../../../components/PrayerWallList";
import { buttonClasses } from "../../../components/ui/Button";
import { clearPrayerSessionCookie, getCurrentPrayerAccount, getPrayerSessionToken } from "../../../lib/prayer-session";
import { brandButtonStyle, brandTintStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../lib/prayer-branding";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";
import { getCurrentOrganization } from "../../../lib/session";

const PRAY_LIMIT = { max: 30, windowMs: 60 * 60 * 1000 };

async function prayAction(publicPrayerWallId: string, requestId: string) {
  "use server";
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall) throw new Error("Not found");

  const ip = getClientIp(await headers());
  const rateCheck = checkRateLimit(`pray:${wall.organizationId}:${ip ?? "unknown"}`, PRAY_LIMIT.max, PRAY_LIMIT.windowMs);
  if (!rateCheck.allowed) throw new Error("Too many prayers sent recently -- please try again in a bit.");

  await prayerService.incrementPrayerCount(wall.organizationId, requestId);

  // Best-effort notification -- a failed/slow email must never surface as a broken
  // "pray" click, the count is already saved regardless.
  try {
    const request = await prayerService.getPrayerRequestById(wall.organizationId, requestId);
    if (request) {
      await getEmailProvider().sendEmail({
        to: request.account.email,
        subject: `Someone is praying for you`,
        text: `Someone from ${wall.displayName}'s prayer wall just prayed for your request: "${request.message}"`,
      });
    }
  } catch (err) {
    console.error("Failed to send prayer notification email:", err);
  }

  revalidatePath(`/prayer/${publicPrayerWallId}`);
}

async function logoutAction(publicPrayerWallId: string) {
  "use server";
  const token = await getPrayerSessionToken();
  if (token) await prayerService.deleteSession(token);
  await clearPrayerSessionCookie(publicPrayerWallId);
  redirect(`/prayer/${publicPrayerWallId}`);
}

/**
 * previewColor/previewLogo are cosmetic-only render overrides used exclusively by
 * Settings' live prayer-wall preview iframe (PrayerWallSettingsForm.tsx) -- never
 * persisted, never affect any data-mutating action (pray/submit/signup), and absent
 * on every real visit.
 */
export default async function PrayerWallPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ previewColor?: string; previewLogo?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const { previewColor, previewLogo } = await searchParams;
  let wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);

  // The wall being disabled must still 404 for real visitors. The one exception:
  // Settings'/Websites' own live preview iframe needs to render even before an admin
  // has enabled the wall, so that request is allowed through, but only after
  // confirming the requester is signed into the dashboard AS that same
  // organization's staff -- never for an arbitrary visitor who happens to add
  // ?previewColor= to the URL.
  if (!wall && (previewColor !== undefined || previewLogo !== undefined)) {
    const staffOrg = await getCurrentOrganization();
    if (staffOrg) {
      const unfiltered = await prayerWallService.resolvePublicPrayerWallForPreview(publicPrayerWallId);
      if (unfiltered && unfiltered.organizationId === staffOrg.id) wall = unfiltered;
    }
  }

  if (!wall) notFound();

  const account = await getCurrentPrayerAccount(wall.organizationId);
  const requests = await prayerService.listPublicPrayerRequests(wall.organizationId, wall.websiteId ?? undefined);
  const brandColor = previewColor ?? wall.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const logoUrl = previewLogo !== undefined ? previewLogo || null : wall.prayerWallLogoUrl;
  // The cream --surface-muted wash is tuned to complement Ruach's own bronze default;
  // once an org picks a different color it can clash, so the page goes plain white instead.
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  const boundPray = prayAction.bind(null, publicPrayerWallId);
  const boundLogout = logoutAction.bind(null, publicPrayerWallId);

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={wall.displayName}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={logoUrl}
        brandColor={brandColor}
        isLoggedIn={!!account}
        onLogout={account ? boundLogout : undefined}
      />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-10 text-center">
          <span
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={brandTintStyle(brandColor, 0.12)}
          >
            <HeartHandshake size={24} style={{ color: brandColor }} />
          </span>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-ink">Join us in prayer</h2>
          <p className="mx-auto max-w-md text-sm text-ink-secondary">
            Browse requests from our community below and click the heart to let someone know you&rsquo;re praying
            for them.
          </p>
          {!account && (
            <a
              href={`/prayer/${publicPrayerWallId}/signup?next=submit`}
              style={brandButtonStyle(brandColor)}
              className={`mt-5 ${buttonClasses("primary", "md")}`}
            >
              Share your own request
            </a>
          )}
        </div>
        <PrayerWallList
          requests={requests.map((r) => ({
            ...r,
            authorName: r.isAnonymous ? "Anonymous" : (r.account.displayName ?? "A community member"),
          }))}
          onPray={boundPray}
          brandColor={brandColor}
        />
      </main>
    </div>
  );
}
