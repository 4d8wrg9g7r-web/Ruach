import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditService, organizationService } from "@ruach/database";
import { PrayerWallSettingsForm } from "../../../components/PrayerWallSettingsForm";
import { Card } from "../../../components/ui/Card";
import { DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../lib/prayer-branding";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";
import { saveLogoUpload } from "../../../lib/upload";

const forwardingEmailSchema = z.string().email();
const brandColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a 6-digit hex color like #b87b38");

async function enablePrayerWallAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const enabled = formData.get("prayerWallEnabled") === "on";
  const rawEmail = String(formData.get("forwardingEmail") ?? "").trim();
  let forwardingEmail: string | null = null;
  if (rawEmail) {
    const parsed = forwardingEmailSchema.safeParse(rawEmail);
    if (!parsed.success) throw new Error("Enter a valid forwarding email address.");
    forwardingEmail = parsed.data;
  }
  const rawBrandColor = String(formData.get("brandColor") ?? "").trim();
  let brandColor: string | null = null;
  if (rawBrandColor) {
    const parsed = brandColorSchema.safeParse(rawBrandColor);
    if (!parsed.success) throw new Error("Brand color must be a 6-digit hex color, like #b87b38.");
    brandColor = parsed.data;
  }

  let logoUrl = organization.prayerWallLogoUrl;
  const logoFile = formData.get("logoFile");
  if (formData.get("removeLogo") === "on") {
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveLogoUpload(organization.id, logoFile);
  }

  await organizationService.enablePrayerWall(organization.id, { enabled, forwardingEmail, brandColor, logoUrl });

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "prayer_wall.settings_updated",
    targetType: "Organization",
    targetId: organization.id,
    metadata: { enabled, forwardingEmail, brandColor, logoUrl },
  });

  revalidatePath("/settings");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}`, "layout");
}

export default async function SettingsPage() {
  const organization = await getCurrentOrganization();
  const user = await getCurrentUser();
  if (!organization) return null;

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const prayerWallUrl = `${appOrigin}/prayer/${organization.publicPrayerWallId}`;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mb-8 text-sm text-ink-secondary">Organization profile and preferences.</p>

      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Organization</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-ink">{organization.name}</dd>
          <dt className="text-ink-muted">Slug</dt>
          <dd className="text-ink">{organization.slug}</dd>
          <dt className="text-ink-muted">Categorization mode</dt>
          <dd className="text-ink">{organization.categorizationMode}</dd>
        </dl>
      </Card>

      <Card padding="md" className="mb-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Prayer wall</h2>
        <p className="mb-4 text-sm text-ink-secondary">
          A public page where visitors can submit prayer requests and, if they choose, post them publicly for
          others to pray for. New submissions can be forwarded to a staff email.
        </p>
        <PrayerWallSettingsForm
          publicPrayerWallId={organization.publicPrayerWallId}
          prayerWallEnabled={organization.prayerWallEnabled}
          forwardingEmail={organization.prayerRequestForwardingEmail ?? ""}
          brandColor={organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR}
          logoUrl={organization.prayerWallLogoUrl}
          prayerWallUrl={prayerWallUrl}
          action={enablePrayerWallAction}
        />
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-sm font-semibold text-ink">Your account</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-ink">{user?.name || "--"}</dd>
          <dt className="text-ink-muted">Email</dt>
          <dd className="text-ink">{user?.email}</dd>
        </dl>
      </Card>

      <p className="mt-6 text-xs text-ink-muted">
        Manage teammates on the <a href="/team" className="underline hover:text-ink-secondary">Team</a> page, usage on
        the <a href="/billing" className="underline hover:text-ink-secondary">Billing</a> page, and activity history on
        the <a href="/audit-log" className="underline hover:text-ink-secondary">Audit log</a> page. Safety configuration
        is still on the roadmap -- see docs/admin-guide.md.
      </p>
    </div>
  );
}
