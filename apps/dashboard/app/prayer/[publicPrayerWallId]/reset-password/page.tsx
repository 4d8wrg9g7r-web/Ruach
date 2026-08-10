import { notFound, redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { KeyRound } from "lucide-react";
import { prayerService, prayerWallService } from "@ruach/database";
import { PrayerPageIntro } from "../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Card } from "../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";

async function resetPasswordAction(publicPrayerWallId: string, token: string, formData: FormData) {
  "use server";
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall) throw new Error("Not found");

  const record = await prayerService.getValidPasswordResetToken(wall.organizationId, token);
  if (!record) redirect(`/prayer/${publicPrayerWallId}/reset-password?error=invalid_token`);

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8) redirect(`/prayer/${publicPrayerWallId}/reset-password?token=${token}&error=too_short`);
  if (password !== confirmPassword) redirect(`/prayer/${publicPrayerWallId}/reset-password?token=${token}&error=mismatch`);

  const passwordHash = await bcrypt.hash(password, 10);
  await prayerService.updateAccountPassword(wall.organizationId, record.accountId, passwordHash);
  await prayerService.deletePasswordResetToken(wall.organizationId, token);

  redirect(`/prayer/${publicPrayerWallId}/login?reset=1`);
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "This reset link is invalid or has expired. Request a new one below.",
  too_short: "Password must be at least 8 characters.",
  mismatch: "Passwords don't match.",
};

export default async function PrayerResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall) notFound();

  const token = sp.token ?? "";
  const record = token ? await prayerService.getValidPasswordResetToken(wall.organizationId, token) : null;
  const boundReset = resetPasswordAction.bind(null, publicPrayerWallId, token);
  const brandColor = wall.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={wall.displayName}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={wall.prayerWallLogoUrl}
        brandColor={brandColor}
        testimoniesPageName={wall.testimoniesEnabled ? wall.testimoniesPageName : undefined}
        isLoggedIn={false}
      />
      <main className="mx-auto max-w-sm px-6 py-12">
        <PrayerPageIntro
          icon={<KeyRound size={20} style={{ color: brandColor }} />}
          title="Choose a new password"
          description="Enter a new password for your account."
          brandColor={brandColor}
        />
        {sp.error && (
          <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
          </p>
        )}
        {!record ? (
          <Card>
            <p className="mb-3 text-sm text-ink-secondary">This reset link is invalid or has expired.</p>
            <a href={`/prayer/${publicPrayerWallId}/forgot-password`} style={{ color: brandColor }} className="text-sm hover:underline">
              Request a new link
            </a>
          </Card>
        ) : (
          <Card>
            <form action={boundReset} className="flex flex-col gap-3">
              <label className="text-sm text-ink-secondary">
                New password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  style={brandInputStyle(brandColor)}
                  className={`mt-1 ${brandInputClasses}`}
                />
              </label>
              <label className="text-sm text-ink-secondary">
                Confirm password
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  style={brandInputStyle(brandColor)}
                  className={`mt-1 ${brandInputClasses}`}
                />
              </label>
              <SubmitButton pendingLabel="Saving..." style={brandButtonStyle(brandColor)}>
                Reset password
              </SubmitButton>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}
