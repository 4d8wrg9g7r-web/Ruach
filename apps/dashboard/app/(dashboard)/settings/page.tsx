import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auditService, billingService, organizationService, userService } from "@ruach/database";
import { unstable_update } from "../../../auth";
import { AccountForm } from "../../../components/AccountForm";
import { PrayerWallSettingsForm } from "../../../components/PrayerWallSettingsForm";
import { Card } from "../../../components/ui/Card";
import { DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../lib/prayer-branding";
import { getCurrentOrganization, getCurrentUser, requireCurrentUser, requireOrgRole } from "../../../lib/session";
import { saveLogoUpload } from "../../../lib/upload";

const forwardingEmailSchema = z.string().email();
const brandColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a 6-digit hex color like #b87b38");
const accountNameSchema = z.string().trim().min(1, "Name is required.").max(120);
const accountEmailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

async function updateAccountAction(formData: FormData) {
  "use server";
  const user = await requireCurrentUser();

  const nameParsed = accountNameSchema.safeParse(String(formData.get("name") ?? ""));
  if (!nameParsed.success) throw new Error(nameParsed.error.issues[0]?.message ?? "Invalid name.");

  const emailParsed = accountEmailSchema.safeParse(String(formData.get("email") ?? ""));
  if (!emailParsed.success) throw new Error(emailParsed.error.issues[0]?.message ?? "Invalid email.");

  await userService.updateUser(user.id, { name: nameParsed.data, email: emailParsed.data });
  await unstable_update({ user: { name: nameParsed.data, email: emailParsed.data } });

  const organization = await getCurrentOrganization();
  if (organization) {
    await auditService.recordAuditEvent({
      organizationId: organization.id,
      actorUserId: user.id,
      action: "account.updated",
      targetType: "User",
      targetId: user.id,
    });
  }

  revalidatePath("/settings");
}

async function enablePrayerWallAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

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

  let logoUrl = organization.prayerWallLogoUrl;
  const logoFile = formData.get("logoFile");
  if (formData.get("removeLogo") === "on") {
    logoUrl = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await saveLogoUpload(organization.id, logoFile);
  }

  const testimoniesEnabled = formData.get("testimoniesEnabled") === "on";
  const testimoniesPageName = String(formData.get("testimoniesPageName") ?? "").trim() || "Praise Report";

  await organizationService.enablePrayerWall(organization.id, {
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
    targetType: "Organization",
    targetId: organization.id,
    metadata: { enabled, forwardingEmails, brandColor, logoUrl, testimoniesEnabled, testimoniesPageName },
  });

  revalidatePath("/settings");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}`, "layout");
}

export default async function SettingsPage() {
  const organization = await getCurrentOrganization();
  const sessionUser = await getCurrentUser();
  if (!organization || !sessionUser) return null;
  // Read fresh from the DB rather than the session -- unstable_update()'s cookie only
  // takes effect on the *next* request, so right after Save this render would
  // otherwise still show the pre-edit name/email even though the write succeeded.
  const user = await userService.getUser(sessionUser.id);

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
          {billingService.planHasFeature(organization.planKey, "campusScopedPrayerWalls") && (
            <>
              {" "}
              This is the org-wide default wall -- give an individual campus its own wall on the{" "}
              <a href="/websites" className="underline hover:text-ink">Websites</a> page.
            </>
          )}
        </p>
        <PrayerWallSettingsForm
          publicPrayerWallId={organization.publicPrayerWallId}
          prayerWallEnabled={organization.prayerWallEnabled}
          forwardingEmails={organization.prayerRequestForwardingEmails}
          maxForwardingEmails={billingService.planHasFeature(organization.planKey, "prayerTeamNotifications") ? null : 1}
          brandColor={organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR}
          logoUrl={organization.prayerWallLogoUrl}
          prayerWallUrl={prayerWallUrl}
          testimoniesEnabled={organization.testimoniesEnabled}
          testimoniesPageName={organization.testimoniesPageName}
          action={enablePrayerWallAction}
        />
        {organization.testimoniesEnabled && (
          <p className="mt-4 text-sm">
            <a href="/prayer-wall/testimonies" className="underline hover:text-ink">
              Manage testimonies
            </a>
          </p>
        )}
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-sm font-semibold text-ink">Your account</h2>
        <AccountForm defaultName={user?.name ?? ""} defaultEmail={user?.email ?? ""} action={updateAccountAction} />
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
