import { notFound, redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { prayerService, prayerWallService, testimonyService } from "@ruach/database";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { TestimonyList } from "../../../../components/TestimonyList";
import { buttonClasses } from "../../../../components/ui/Button";
import { clearPrayerSessionCookie, getCurrentPrayerAccount, getPrayerSessionToken } from "../../../../lib/prayer-session";
import { brandButtonStyle, brandTintStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";

async function logoutAction(publicPrayerWallId: string) {
  "use server";
  const token = await getPrayerSessionToken();
  if (token) await prayerService.deleteSession(token);
  await clearPrayerSessionCookie(publicPrayerWallId);
  redirect(`/prayer/${publicPrayerWallId}/testimonies`);
}

export default async function TestimoniesPage({
  params,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall || !wall.testimoniesEnabled) notFound();

  const account = await getCurrentPrayerAccount(wall.organizationId);
  const { featured, submitted } = await testimonyService.listPublicTestimonies(wall.organizationId, wall.websiteId ?? undefined);
  const brandColor = wall.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  const boundLogout = logoutAction.bind(null, publicPrayerWallId);

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={wall.displayName}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={wall.prayerWallLogoUrl}
        brandColor={brandColor}
        testimoniesPageName={wall.testimoniesPageName}
        isLoggedIn={!!account}
        onLogout={account ? boundLogout : undefined}
      />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-10 text-center">
          <span
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full"
            style={brandTintStyle(brandColor, 0.12)}
          >
            <Sparkles size={24} style={{ color: brandColor }} />
          </span>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-ink">{wall.testimoniesPageName}</h2>
          <p className="mx-auto max-w-md text-sm text-ink-secondary">
            Stories from our community about what God has done.
          </p>
          <a
            href={
              account
                ? `/prayer/${publicPrayerWallId}/testimonies/submit`
                : `/prayer/${publicPrayerWallId}/signup?next=testimonies`
            }
            style={brandButtonStyle(brandColor)}
            className={`mt-5 ${buttonClasses("primary", "md")}`}
          >
            Share your own
          </a>
        </div>
        <TestimonyList
          featured={featured.map((t) => ({ ...t, authorDisplayName: t.authorDisplayName ?? "" }))}
          submitted={submitted.map((t) => ({ ...t, authorDisplayName: t.account?.displayName ?? "A community member" }))}
          brandColor={brandColor}
        />
      </main>
    </div>
  );
}
