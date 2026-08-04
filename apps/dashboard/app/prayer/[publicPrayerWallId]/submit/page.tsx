import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { organizationService, prayerService } from "@ruach/database";
import { getAIProvider } from "@ruach/ai";
import { getEmailProvider } from "@ruach/email";
import { PenLine } from "lucide-react";
import { PrayerPageIntro } from "../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Card } from "../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { getCurrentPrayerAccount } from "../../../../lib/prayer-session";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

async function submitPrayerRequestAction(publicPrayerWallId: string, formData: FormData) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");

  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) redirect(`/prayer/${publicPrayerWallId}/login?next=submit`);

  const ip = getClientIp(await headers());
  const ipCheck = checkRateLimit(`prayer-submit-ip:${organization.id}:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  const accountCheck = checkRateLimit(`prayer-submit-account:${organization.id}:${account.id}`, 10, 24 * 60 * 60 * 1000);
  if (!ipCheck.allowed || !accountCheck.allowed) {
    redirect(`/prayer/${publicPrayerWallId}/submit?error=rate_limited`);
  }

  const message = String(formData.get("message") ?? "").trim();
  if (!message) redirect(`/prayer/${publicPrayerWallId}/submit?error=invalid`);

  let isPublic = formData.get("isPublic") === "on";
  const isAnonymous = formData.get("isAnonymous") === "on";

  // Anything the requester wants to make public first passes through the same
  // safety classifier the chat pipeline already uses -- if it reads as an active
  // crisis rather than an ordinary request, it's still saved and still forwarded to
  // staff, it just never reaches the public, unauthenticated wall unreviewed.
  if (isPublic) {
    try {
      const safety = await getAIProvider().classifySafety(message);
      if (safety.category !== "ORDINARY") isPublic = false;
    } catch (err) {
      console.error("Safety classification failed for prayer request -- defaulting to private:", err);
      isPublic = false;
    }
  }

  const request = await prayerService.createPrayerRequest({
    organizationId: organization.id,
    accountId: account.id,
    message,
    isPublic,
    isAnonymous,
  });

  if (organization.prayerRequestForwardingEmail) {
    try {
      await getEmailProvider().sendEmail({
        to: organization.prayerRequestForwardingEmail,
        subject: `New prayer request${isPublic ? " (public)" : ""}`,
        text: `A new prayer request was submitted:\n\n${message}\n\nFrom: ${account.displayName ?? account.email}`,
      });
      await prayerService.markForwarded(organization.id, request.id);
    } catch (err) {
      // Forwarding failure must never fail an already-saved submission.
      console.error("Failed to forward prayer request email:", err);
    }
  }

  redirect(`/prayer/${publicPrayerWallId}/mine`);
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a message before submitting.",
  rate_limited: "You've submitted several requests recently -- please try again later.",
};

export default async function PrayerSubmitPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) notFound();

  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) redirect(`/prayer/${publicPrayerWallId}/login?next=submit`);

  const boundSubmit = submitPrayerRequestAction.bind(null, publicPrayerWallId);
  const brandColor = organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={organization.name}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={organization.prayerWallLogoUrl}
        brandColor={brandColor}
        isLoggedIn
      />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <PrayerPageIntro
          icon={<PenLine size={20} style={{ color: brandColor }} />}
          title="Submit a prayer request"
          description="Share what's on your heart. You can choose to post it publicly for others to pray for, or keep it private."
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
              Your request
              <textarea name="message" required rows={5} style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <input type="checkbox" name="isPublic" />
              Post this publicly on the prayer wall
            </label>
            <label className="ml-6 flex items-center gap-2 text-sm text-ink-secondary">
              <input type="checkbox" name="isAnonymous" />
              Post anonymously (hides your name if posted publicly -- you&rsquo;ll still be logged in)
            </label>
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Submitting..." style={brandButtonStyle(brandColor)}>
                Submit request
              </SubmitButton>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
