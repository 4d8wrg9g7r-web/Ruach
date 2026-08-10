import { redirect } from "next/navigation";
import { z } from "zod";
import { organizationService } from "@ruach/database";
import { PrayerTestimonyWizard } from "../../../../components/PrayerTestimonyWizard";
import { DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { getCurrentOrganization, requireOrgRole } from "../../../../lib/session";

const forwardingEmailSchema = z.string().email("Enter a valid email address.");
const brandColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Brand color must be a 6-digit hex color, like #b87b38.");

async function wizardEnablePrayerWallAction(formData: FormData): Promise<{ ok: true }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const rawEmail = String(formData.get("forwardingEmail") ?? "").trim();
  const forwardingEmails: string[] = [];
  if (rawEmail) {
    const parsed = forwardingEmailSchema.safeParse(rawEmail);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Enter a valid email.");
    forwardingEmails.push(parsed.data);
  }

  const rawBrandColor = String(formData.get("brandColor") ?? "").trim();
  let brandColor: string | null = null;
  if (rawBrandColor && rawBrandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR) {
    const parsed = brandColorSchema.safeParse(rawBrandColor);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Enter a valid color.");
    brandColor = parsed.data;
  }

  await organizationService.enablePrayerWall(organization.id, {
    enabled: true,
    forwardingEmails,
    brandColor,
    logoUrl: organization.prayerWallLogoUrl,
  });
  return { ok: true };
}

/** Preserves whatever prayer-wall fields are already set -- enablePrayerWall's other params are required, not optional, so this step must pass them through rather than risk clobbering step 1's choices. */
async function wizardEnableTestimoniesAction(formData: FormData): Promise<{ ok: true }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const testimoniesPageName = String(formData.get("testimoniesPageName") ?? "").trim() || "Praise Report";

  await organizationService.enablePrayerWall(organization.id, {
    enabled: true,
    forwardingEmails: organization.prayerRequestForwardingEmails,
    brandColor: organization.prayerWallBrandColor,
    logoUrl: organization.prayerWallLogoUrl,
    testimoniesEnabled: true,
    testimoniesPageName,
  });
  return { ok: true };
}

/** Shared by "Come back later" (header, any step) and "Go to Prayer Wall" (final step) -- both just stop the auto-redirect and leave. Whatever was enabled along the way stays enabled either way. */
async function wizardExitAction(): Promise<void> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await organizationService.markPrayerTestimonyWizardSeen(organization.id);
  redirect("/prayer-wall");
}

export default async function PrayerTestimonyWizardPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const publicUrl = `${appOrigin}/prayer/${organization.publicPrayerWallId}`;

  return (
    <PrayerTestimonyWizard
      organizationName={organization.name}
      publicUrl={publicUrl}
      prayerWallEnabled={organization.prayerWallEnabled}
      testimoniesEnabled={organization.testimoniesEnabled}
      testimoniesPageName={organization.testimoniesPageName}
      defaultBrandColor={DEFAULT_PRAYER_WALL_BRAND_COLOR}
      enablePrayerWallAction={wizardEnablePrayerWallAction}
      enableTestimoniesAction={wizardEnableTestimoniesAction}
      exitAction={wizardExitAction}
    />
  );
}
