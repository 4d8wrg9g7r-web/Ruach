import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { UserPlus } from "lucide-react";
import { organizationService, prayerService } from "@ruach/database";
import { PrayerPageIntro } from "../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Card } from "../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { setPrayerSessionCookie } from "../../../../lib/prayer-session";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

async function signupAction(publicPrayerWallId: string, formData: FormData) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");

  const next = String(formData.get("next") ?? "");
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";

  const ip = getClientIp(await headers());
  const rateCheck = checkRateLimit(`prayer-signup:${organization.id}:${ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rateCheck.allowed) redirect(`/prayer/${publicPrayerWallId}/signup?error=rate_limited${nextQuery}`);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim() || null;

  if (!email || password.length < 8) {
    redirect(`/prayer/${publicPrayerWallId}/signup?error=invalid${nextQuery}`);
  }

  const existing = await prayerService.findAccountByEmail(organization.id, email);
  if (existing) {
    redirect(`/prayer/${publicPrayerWallId}/signup?error=exists${nextQuery}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await prayerService.createAccount({ organizationId: organization.id, email, passwordHash, displayName });
  const token = await prayerService.createSession(account.id, new Date(Date.now() + SESSION_DURATION_MS));
  await setPrayerSessionCookie(publicPrayerWallId, token);

  redirect(`/prayer/${publicPrayerWallId}/${next === "submit" ? "submit" : "mine"}`);
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Enter a valid email and a password of at least 8 characters.",
  exists: "An account with that email already exists -- log in instead.",
  rate_limited: "Too many attempts -- please try again in a bit.",
};

export default async function PrayerSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) notFound();

  const boundSignup = signupAction.bind(null, publicPrayerWallId);
  const loginHref = `/prayer/${publicPrayerWallId}/login${sp.next ? `?next=${sp.next}` : ""}`;
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
          icon={<UserPlus size={20} style={{ color: brandColor }} />}
          title="Create an account"
          description="Sign up to submit and manage your prayer requests."
          brandColor={brandColor}
        />
        {sp.error && (
          <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
          </p>
        )}
        <Card>
          <form action={boundSignup} className="flex flex-col gap-3">
            <input type="hidden" name="next" value={sp.next ?? ""} />
            <label className="text-sm text-ink-secondary">
              Name (optional)
              <input name="displayName" style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <label className="text-sm text-ink-secondary">
              Email
              <input name="email" type="email" required style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <label className="text-sm text-ink-secondary">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                style={brandInputStyle(brandColor)}
                className={`mt-1 ${brandInputClasses}`}
              />
            </label>
            <SubmitButton pendingLabel="Signing up..." style={brandButtonStyle(brandColor)}>
              Sign up
            </SubmitButton>
          </form>
        </Card>
        <p className="mt-4 text-sm text-ink-secondary">
          Already have an account?{" "}
          <a href={loginHref} style={{ color: brandColor }} className="hover:underline">
            Log in
          </a>
        </p>
      </main>
    </div>
  );
}
