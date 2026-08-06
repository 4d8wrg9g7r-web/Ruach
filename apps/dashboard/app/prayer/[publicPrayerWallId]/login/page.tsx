import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { LogIn } from "lucide-react";
import { prayerService, prayerWallService } from "@ruach/database";
import { PrayerPageIntro } from "../../../../components/PrayerPageIntro";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Card } from "../../../../components/ui/Card";
import { brandButtonStyle, brandInputClasses, brandInputStyle, DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { setPrayerSessionCookie } from "../../../../lib/prayer-session";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

async function loginAction(publicPrayerWallId: string, formData: FormData) {
  "use server";
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall) throw new Error("Not found");

  const next = String(formData.get("next") ?? "");
  const nextQuery = next ? `&next=${encodeURIComponent(next)}` : "";

  const ip = getClientIp(await headers());
  const rateCheck = checkRateLimit(`prayer-login:${wall.organizationId}:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rateCheck.allowed) redirect(`/prayer/${publicPrayerWallId}/login?error=rate_limited${nextQuery}`);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const account = await prayerService.findAccountByEmail(wall.organizationId, email);
  const isValid = account ? await bcrypt.compare(password, account.passwordHash) : false;
  if (!account || !isValid) {
    redirect(`/prayer/${publicPrayerWallId}/login?error=invalid${nextQuery}`);
  }

  const token = await prayerService.createSession(account.id, new Date(Date.now() + SESSION_DURATION_MS));
  await setPrayerSessionCookie(publicPrayerWallId, token);

  redirect(`/prayer/${publicPrayerWallId}/${next === "submit" ? "submit" : "mine"}`);
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect email or password.",
  rate_limited: "Too many attempts -- please try again in a bit.",
};

export default async function PrayerLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicPrayerWallId: string }>;
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const { publicPrayerWallId } = await params;
  const sp = await searchParams;
  const wall = await prayerWallService.resolvePublicPrayerWall(publicPrayerWallId);
  if (!wall) notFound();

  const boundLogin = loginAction.bind(null, publicPrayerWallId);
  const signupHref = `/prayer/${publicPrayerWallId}/signup${sp.next ? `?next=${sp.next}` : ""}`;
  const brandColor = wall.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={wall.displayName}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={wall.prayerWallLogoUrl}
        brandColor={brandColor}
        isLoggedIn={false}
      />
      <main className="mx-auto max-w-sm px-6 py-12">
        <PrayerPageIntro
          icon={<LogIn size={20} style={{ color: brandColor }} />}
          title="Log in"
          description="Log in to submit or manage your prayer requests."
          brandColor={brandColor}
        />
        {sp.error && (
          <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[sp.error] ?? "Something went wrong."}
          </p>
        )}
        {sp.reset && (
          <p className="mb-4 rounded-md bg-success-bg px-3 py-2 text-sm text-success">
            Password reset. Log in with your new password.
          </p>
        )}
        <Card>
          <form action={boundLogin} className="flex flex-col gap-3">
            <input type="hidden" name="next" value={sp.next ?? ""} />
            <label className="text-sm text-ink-secondary">
              Email
              <input name="email" type="email" required style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <label className="text-sm text-ink-secondary">
              Password
              <input name="password" type="password" required style={brandInputStyle(brandColor)} className={`mt-1 ${brandInputClasses}`} />
            </label>
            <SubmitButton pendingLabel="Logging in..." style={brandButtonStyle(brandColor)}>
              Log in
            </SubmitButton>
          </form>
        </Card>
        <p className="mt-4 flex flex-col gap-1.5 text-sm text-ink-secondary">
          <a href={`/prayer/${publicPrayerWallId}/forgot-password`} style={{ color: brandColor }} className="hover:underline">
            Forgot password?
          </a>
          <span>
            Don&rsquo;t have an account?{" "}
            <a href={signupHref} style={{ color: brandColor }} className="hover:underline">
              Sign up
            </a>
          </span>
        </p>
      </main>
    </div>
  );
}
