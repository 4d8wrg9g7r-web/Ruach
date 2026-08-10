import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { auditService, billingService, websiteService } from "@ruach/database";
import { PrayerWallSettingsForm } from "../../../../components/PrayerWallSettingsForm";
import { Card } from "../../../../components/ui/Card";
import { DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../../lib/session";
import { saveLogoUpload } from "../../../../lib/upload";

const forwardingEmailSchema = z.string().email();
const brandColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a 6-digit hex color like #b87b38");

async function enableCampusPrayerWallAction(websiteId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);
  if (!billingService.planHasFeature(organization.planKey, "campusScopedPrayerWalls")) return;

  const website = await websiteService.getWebsite(organization.id, websiteId);
  if (!website) throw new Error("Website not found");

  const enabled = formData.get("prayerWallEnabled") === "on";

  const rawEmails = String(formData.get("forwardingEmails") ?? "")
    .split("\n")
    .map((e) => e.trim())
    .filter(Boolean);
  const forwardingEmails: string[] = [];
  for (const rawEmail of rawEmails) {
    const parsed = forwardingEmailSchema.safeParse(rawEmail);
    if (!parsed.success) throw new Error("Please enter a valid email.");
    forwardingEmails.push(parsed.data);
  }
  const maxForwardingEmails = billingService.planHasFeature(organization.planKey, "prayerTeamNotifications") ? null : 1;
  if (maxForwardingEmails !== null && forwardingEmails.length > maxForwardingEmails) {
    throw new Error(`Your plan supports up to ${maxForwardingEmails} forwarding address. Upgrade to notify more people.`);
  }

  const rawBrandColor = String(formData.get("brandColor") ?? "").trim();
  let brandColor: string | null = null;
  if (rawBrandColor) {
    const parsed = brandColorSchema.safeParse(rawBrandColor);
    if (!parsed.success) throw new Error("Brand color must be a 6-digit hex color, like #b87b38.");
    brandColor = parsed.data;
  }

  let logoUrl = website.prayerWallLogoUrl;
  const logoFile = formData.get("logoFile");
  if (formData.get("removeLogo") === "on") {
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveLogoUpload(organization.id, logoFile);
  }

  const testimoniesEnabled = formData.get("testimoniesEnabled") === "on";
  const testimoniesPageName = String(formData.get("testimoniesPageName") ?? "").trim() || "Praise Report";

  await websiteService.enablePrayerWall(organization.id, websiteId, {
    enabled,
    forwardingEmails,
    brandColor,
    logoUrl,
    testimoniesEnabled,
    testimoniesPageName,
  });

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "prayer_wall.settings_updated",
    targetType: "Website",
    targetId: websiteId,
    metadata: { enabled, forwardingEmails, brandColor, logoUrl, testimoniesEnabled, testimoniesPageName },
  });

  revalidatePath(`/websites/${websiteId}`);
  if (website.publicPrayerWallId) revalidatePath(`/prayer/${website.publicPrayerWallId}`, "layout");
}

export default async function WebsiteDetailPage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const website = await websiteService.getWebsite(organization.id, websiteId);
  if (!website) notFound();

  const canScopePrayerWall = billingService.planHasFeature(organization.planKey, "campusScopedPrayerWalls");
  // Lazily allocates Website.publicPrayerWallId on first view of this tab -- see
  // ensurePrayerWallId's doc comment for why this isn't eager like Organization's.
  const websiteWithWallId = canScopePrayerWall ? await websiteService.ensurePrayerWallId(organization.id, websiteId) : website;

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const boundEnable = enableCampusPrayerWallAction.bind(null, websiteId);

  return (
    <div>
      <Link
        href="/websites"
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <ArrowLeft size={14} /> Websites
      </Link>

      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">{website.name}</h1>
      <p className="mb-8 text-sm text-ink-secondary">{website.primaryDomain}</p>

      <Card padding="md">
        <h2 className="mb-1 text-sm font-semibold text-ink">Prayer wall</h2>
        {canScopePrayerWall ? (
          <>
            <p className="mb-4 text-sm text-ink-secondary">
              A prayer wall just for {website.name}, separate from your org-wide default wall. Submissions here only
              notify this campus's forwarding addresses and only appear on this campus's own public wall page.
            </p>
            {websiteWithWallId?.publicPrayerWallId && (
              <PrayerWallSettingsForm
                publicPrayerWallId={websiteWithWallId.publicPrayerWallId}
                prayerWallEnabled={website.prayerWallEnabled}
                forwardingEmails={website.prayerRequestForwardingEmails}
                maxForwardingEmails={billingService.planHasFeature(organization.planKey, "prayerTeamNotifications") ? null : 1}
                brandColor={website.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR}
                logoUrl={website.prayerWallLogoUrl}
                prayerWallUrl={`${appOrigin}/prayer/${websiteWithWallId.publicPrayerWallId}`}
                testimoniesEnabled={website.testimoniesEnabled}
                testimoniesPageName={website.testimoniesPageName}
                action={boundEnable}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-ink-secondary">
            Give each campus its own prayer wall, with its own branding and forwarding addresses, on the Multi-Site
            plan. Every campus already shares your org-wide default wall (Settings) at no extra cost.
          </p>
        )}
      </Card>
    </div>
  );
}
