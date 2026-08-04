import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { Mail } from "lucide-react";
import { organizationService, prayerService } from "@ruach/database";
import { getEmailProvider } from "@ruach/email";
import { PrayerPageIntro } from "../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Card } from "../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

async function requestResetAction(publicPrayerWallId: string, formData: FormData) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");

  const ip = getClientIp(await headers());
  const rateCheck = checkRateLimit(`prayer-forgot-password:${organization.id}:${ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rateCheck.allowed) redirect(`/prayer/${publicPrayerWallId}/forgot-password?error=rate_limited`);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email) {
    // Same "always show the same confirmation" approach as the staff-account flow --
    // this endpoint can't be used to enumerate which emails have an account here.
    const account = await prayerService.findAccountByEmail(organization.id, email);
    if (account) {
      const token = await prayerService.createPasswordResetToken(organization.id, account.id);
      const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      await getEmailProvider().sendEmail({
        to: account.email,
        subject: `Reset your password for ${organization.name}'s prayer wall`,
        text: `Reset your password: ${appOrigin}/prayer/${publicPrayerWallId}/reset-password?token=${token}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      });
    }
  }

  redirect(`/prayer/${publicPrayerWallId}/forgot-password?sent=1`);
}

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Too many attempts -- please try again in a bit.",
};

export default async function PrayerForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) notFound();

  const boundRequest = requestResetAction.bind(null, publicPrayerWallId);
  const brandColor = organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={organization.name}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={organization.prayerWallLogoUrl}
        brandColor={brandColor}
        isLoggedIn={false}
      />
      <main className="mx-auto max-w-sm px-6 py-12">
        <PrayerPageIntro
          icon={<Mail size={20} style={{ color: brandColor }} />}
          title="Reset your password"
          description="Enter your email and we'll send you a reset link."
          brandColor={brandColor}
        />
        {sp.error && (
          <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
          </p>
        )}
        {sp.sent ? (
          <Card>
            <p className="text-sm text-ink-secondary">
              If an account exists for that email, we&rsquo;ve sent a link to reset your password. Check your inbox.
            </p>
          </Card>
        ) : (
          <Card>
            <form action={boundRequest} className="flex flex-col gap-3">
              <label className="text-sm text-ink-secondary">
                Email
                <input name="email" type="email" required style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
              </label>
              <SubmitButton pendingLabel="Sending..." style={brandButtonStyle(brandColor)}>
                Send reset link
              </SubmitButton>
            </form>
          </Card>
        )}
        <p className="mt-4 text-sm text-ink-secondary">
          <a href={`/prayer/${publicPrayerWallId}/login`} style={{ color: brandColor }} className="hover:underline">
            Back to log in
          </a>
        </p>
      </main>
    </div>
  );
}
