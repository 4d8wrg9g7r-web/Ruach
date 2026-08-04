import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { HeartHandshake } from "lucide-react";
import { organizationService, prayerService } from "@ruach/database";
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
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");

  const ip = getClientIp(await headers());
  const rateCheck = checkRateLimit(`pray:${organization.id}:${ip ?? "unknown"}`, PRAY_LIMIT.max, PRAY_LIMIT.windowMs);
  if (!rateCheck.allowed) throw new Error("Too many prayers sent recently -- please try again in a bit.");

  await prayerService.incrementPrayerCount(organization.id, requestId);

  // Best-effort notification -- a failed/slow email must never surface as a broken
  // "pray" click, the count is already saved regardless.
  try {
    const request = await prayerService.getPrayerRequestById(organization.id, requestId);
    if (request) {
      await getEmailProvider().sendEmail({
        to: request.account.email,
        subject: `Someone is praying for you`,
        text: `Someone from ${organization.name}'s prayer wall just prayed for your request: "${request.message}"`,
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
  let organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);

  // The wall being disabled must still 404 for real visitors. The one exception:
  // Settings' own live preview iframe needs to render even before an admin has
  // enabled the wall, so that request is allowed through, but only after confirming
  // the requester is signed into the dashboard AS that same organization's staff --
  // never for an arbitrary visitor who happens to add ?previewColor= to the URL.
  if (!organization && (previewColor !== undefined || previewLogo !== undefined)) {
    const staffOrg = await getCurrentOrganization();
    if (staffOrg) {
      const unfiltered = await organizationService.getOrganizationByPublicPrayerWallIdForPreview(publicPrayerWallId);
      if (unfiltered && unfiltered.id === staffOrg.id) organization = unfiltered;
    }
  }

  if (!organization) notFound();

  const account = await getCurrentPrayerAccount(organization.id);
  const requests = await prayerService.listPublicPrayerRequests(organization.id);
  const brandColor = previewColor ?? organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const logoUrl = previewLogo !== undefined ? previewLogo || null : organization.prayerWallLogoUrl;
  // The cream --surface-muted wash is tuned to complement Ruach's own bronze default;
  // once an org picks a different color it can clash, so the page goes plain white instead.
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  const boundPray = prayAction.bind(null, publicPrayerWallId);
  const boundLogout = logoutAction.bind(null, publicPrayerWallId);

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={organization.name}
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
              href={`/prayer/${publicPrayerWallId}/signup`}
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
