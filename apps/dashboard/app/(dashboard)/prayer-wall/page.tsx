import { revalidatePath } from "next/cache";
import type { OrganizationRole, PrayerRequestCategory } from "@ruach/database";
import { auditService, billingService, prayerService } from "@ruach/database";
import { PrayerModerationList } from "../../../components/PrayerModerationList";
import { Card } from "../../../components/ui/Card";
import { PRAYER_CATEGORY_OPTIONS } from "../../../lib/format";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

/** OWNER/ADMIN can always moderate; PRAYER_MODERATOR only counts on plans with the multipleModerators feature. */
function moderationRoles(planKey: string): OrganizationRole[] {
  const base: OrganizationRole[] = ["OWNER", "ADMIN"];
  return billingService.planHasFeature(planKey, "multipleModerators") ? [...base, "PRAYER_MODERATOR"] : base;
}

async function togglePublicAction(requestId: string, isPublic: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));
  await prayerService.staffSetPublicVisibility(organization.id, requestId, isPublic);
  revalidatePath("/prayer-wall");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}`);
}

async function markAnsweredAction(requestId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));
  await prayerService.staffMarkAnswered(organization.id, requestId);
  revalidatePath("/prayer-wall");
}

async function deleteAction(requestId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));
  await prayerService.deletePrayerRequest(organization.id, requestId);

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "prayer_request.deleted",
    targetType: "PrayerRequest",
    targetId: requestId,
  });

  revalidatePath("/prayer-wall");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}`);
}

async function setCategoryAction(requestId: string, category: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));
  if (!billingService.planHasFeature(organization.planKey, "prayerCategories")) return;

  const isValid = PRAYER_CATEGORY_OPTIONS.some((o) => o.key === category);
  await prayerService.setCategory(organization.id, requestId, isValid ? (category as PrayerRequestCategory) : null);
  revalidatePath("/prayer-wall");
}

async function saveNotesAction(requestId: string, notes: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));
  if (!billingService.planHasFeature(organization.planKey, "internalPrayerNotes")) return;

  await prayerService.setInternalNotes(organization.id, requestId, notes.trim() || null);
  revalidatePath("/prayer-wall");
}

export default async function PrayerWallModerationPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  await requireOrgRole(organization.id, moderationRoles(organization.planKey));

  const canEditCategory = billingService.planHasFeature(organization.planKey, "prayerCategories");
  const canEditNotes = billingService.planHasFeature(organization.planKey, "internalPrayerNotes");

  const requests = await prayerService.listPrayerRequestsForModeration(organization.id);
  const rows = requests.map((r) => ({
    id: r.id,
    message: r.message,
    requesterName: r.account.displayName ?? r.account.email,
    isAnonymous: r.isAnonymous,
    isPublic: r.isPublic,
    status: r.status,
    category: r.category,
    internalNotes: r.internalNotes,
    createdAt: r.createdAt,
    campusName: r.website?.name ?? null,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Prayer Wall</h1>
      <p className="mb-8 text-sm text-ink-secondary">
        Review, moderate, and respond to every prayer request submitted to {organization.name}
        {!organization.prayerWallEnabled && " (the prayer wall itself is currently disabled -- enable it in Settings)"}.
      </p>

      <Card padding="none">
        <PrayerModerationList
          requests={rows}
          canEditCategory={canEditCategory}
          canEditNotes={canEditNotes}
          onTogglePublic={togglePublicAction}
          onMarkAnswered={markAnsweredAction}
          onDelete={deleteAction}
          onSetCategory={setCategoryAction}
          onSaveNotes={saveNotesAction}
        />
      </Card>
    </div>
  );
}
