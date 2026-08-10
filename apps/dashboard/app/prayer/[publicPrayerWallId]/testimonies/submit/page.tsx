import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { PenLine } from "lucide-react";
import { prayerWallService, testimonyService } from "@ruach/database";
import { PrayerPageIntro } from "../../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../../components/SubmitButton";
import { Card } from "../../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../../lib/prayer-branding";
import { getCurrentPrayerAccount } from "../../../../../lib/prayer-session";
import { checkRateLimit, getClientIp } from "../../../../../lib/rate-limit";

async function submitTestimonyAction(publicPrayerWallId: string, formData: FormData) {
  "use server";
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall || !wall.testimoniesEnabled) throw new Error("Not found");

  const account = await getCurrentPrayerAccount(wall.organizationId);
  if (!account) redirect(`/prayer/${publicPrayerWallId}/login?next=testimonies`);

  const ip = getClientIp(await headers());
  const ipCheck = checkRateLimit(`testimony-submit-ip:${wall.organizationId}:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  const accountCheck = checkRateLimit(`testimony-submit-account:${wall.organizationId}:${account.id}`, 10, 24 * 60 * 60 * 1000);
  if (!ipCheck.allowed || !accountCheck.allowed) {
    redirect(`/prayer/${publicPrayerWallId}/testimonies/submit?error=rate_limited`);
  }

  const message = String(formData.get("message") ?? "").trim();
  if (!message) redirect(`/prayer/${publicPrayerWallId}/testimonies/submit?error=invalid`);

  await testimonyService.createVisitorTestimony({
    organizationId: wall.organizationId,
    accountId: account.id,
    websiteId: wall.websiteId,
    message,
  });

  redirect(`/prayer/${publicPrayerWallId}/testimonies`);
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a message before submitting.",
  rate_limited: "You've submitted several testimonies recently -- please try again later.",
};

export default async function TestimonySubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall || !wall.testimoniesEnabled) notFound();

  const account = await getCurrentPrayerAccount(wall.organizationId);
  if (!account) redirect(`/prayer/${publicPrayerWallId}/login?next=testimonies`);

  const boundSubmit = submitTestimonyAction.bind(null, publicPrayerWallId);
  const brandColor = wall.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={wall.displayName}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={wall.prayerWallLogoUrl}
        brandColor={brandColor}
        testimoniesPageName={wall.testimoniesPageName}
        isLoggedIn
      />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <PrayerPageIntro
          icon={<PenLine size={20} style={{ color: brandColor }} />}
          title={`Share your ${wall.testimoniesPageName.toLowerCase()}`}
          description="Tell the community what God has done. This posts publicly right away under your account name."
          brandColor={brandColor}
        />
        {sp.error && (
          <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
          </p>
        )}
        <Card>
          <form action={boundSubmit} className="flex flex-col gap-4">
            <label className="text-sm text-ink-secondary">
              Your story
              <textarea name="message" required rows={6} style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Submitting..." style={brandButtonStyle(brandColor)}>
                Submit
              </SubmitButton>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
