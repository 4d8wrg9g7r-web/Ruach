import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUp, Sparkles, Trash2 } from "lucide-react";
import { testimonyService } from "@ruach/database";
import { parseYouTubeUrl } from "@ruach/providers";
import { SubmitButton } from "../../../../components/SubmitButton";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Input, Textarea } from "../../../../components/ui/Input";
import { timeAgo } from "../../../../lib/format";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../../lib/session";

const MODERATION_ROLES = ["OWNER", "ADMIN"] as const;

async function addFeaturedAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);

  const message = String(formData.get("message") ?? "").trim();
  const authorDisplayName = String(formData.get("authorDisplayName") ?? "").trim();
  if (!message || !authorDisplayName) throw new Error("A message and author name are required.");

  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const youtubeVideoId = youtubeUrl ? parseYouTubeUrl(youtubeUrl) : null;
  if (youtubeUrl && !youtubeVideoId) throw new Error("That doesn't look like a valid YouTube URL.");

  const user = await getCurrentUser();
  if (!user) throw new Error("No user");

  await testimonyService.createFeaturedTestimony({
    organizationId: organization.id,
    createdByUserId: user.id,
    message,
    authorDisplayName,
    youtubeVideoId,
  });
  revalidatePath("/prayer-wall/testimonies");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}/testimonies`);
}

async function updateFeaturedAction(testimonyId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);

  const message = String(formData.get("message") ?? "").trim();
  const authorDisplayName = String(formData.get("authorDisplayName") ?? "").trim();
  if (!message || !authorDisplayName) throw new Error("A message and author name are required.");

  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();
  const youtubeVideoId = youtubeUrl ? parseYouTubeUrl(youtubeUrl) : null;
  if (youtubeUrl && !youtubeVideoId) throw new Error("That doesn't look like a valid YouTube URL.");

  await testimonyService.updateFeaturedTestimony(organization.id, testimonyId, { message, authorDisplayName, youtubeVideoId });
  revalidatePath("/prayer-wall/testimonies");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}/testimonies`);
}

async function reorderFeaturedAction(testimonyId: string, direction: "up" | "down") {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);
  await testimonyService.reorderFeaturedTestimony(organization.id, testimonyId, direction);
  revalidatePath("/prayer-wall/testimonies");
}

async function toggleVisibilityAction(testimonyId: string, isPublic: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);
  await testimonyService.staffSetPublicVisibility(organization.id, testimonyId, isPublic);
  revalidatePath("/prayer-wall/testimonies");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}/testimonies`);
}

async function deleteAction(testimonyId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);
  await testimonyService.deleteTestimony(organization.id, testimonyId);
  revalidatePath("/prayer-wall/testimonies");
  revalidatePath(`/prayer/${organization.publicPrayerWallId}/testimonies`);
}

export default async function TestimoniesModerationPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  await requireOrgRole(organization.id, [...MODERATION_ROLES]);

  const { featured, submitted } = await testimonyService.listTestimoniesForModeration(organization.id);

  return (
    <div>
      <Link href="/prayer-wall" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeft size={15} strokeWidth={1.75} /> Prayer Wall
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">{organization.testimoniesPageName}</h1>
      <p className="mb-8 text-sm text-ink-secondary">
        Curate featured highlights and moderate visitor-submitted testimonies for {organization.name}
        {!organization.testimoniesEnabled && " (currently disabled -- enable it in Settings)"}.
      </p>

      <Card padding="md" className="mb-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Add a featured testimony</h2>
        <p className="mb-4 text-sm text-ink-secondary">
          Staff-curated highlights, optionally with an embedded YouTube video. Shown above visitor submissions on the
          public page.
        </p>
        <form action={addFeaturedAction} className="flex flex-col gap-3">
          <label className="text-sm text-ink-secondary">
            Story
            <Textarea name="message" required rows={4} className="mt-1 block w-full" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-ink-secondary">
              Author name
              <Input name="authorDisplayName" required placeholder="Jane Smith" className="mt-1 block w-full" />
            </label>
            <label className="text-sm text-ink-secondary">
              YouTube URL <span className="font-normal text-ink-muted">(optional)</span>
              <Input name="youtubeUrl" placeholder="https://youtube.com/watch?v=..." className="mt-1 block w-full" />
            </label>
          </div>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Adding...">Add featured testimony</SubmitButton>
          </div>
        </form>
      </Card>

      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Featured ({featured.length})</h2>
        {featured.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-muted">No featured testimonies yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {featured.map((testimony, index) => {
              const boundUpdate = updateFeaturedAction.bind(null, testimony.id);
              const boundUp = reorderFeaturedAction.bind(null, testimony.id, "up");
              const boundDown = reorderFeaturedAction.bind(null, testimony.id, "down");
              const boundDelete = deleteAction.bind(null, testimony.id);
              return (
                <li key={testimony.id} className="rounded-md border border-border p-4">
                  <form action={boundUpdate} className="flex flex-col gap-3">
                    <Textarea name="message" defaultValue={testimony.message} required rows={3} className="block w-full" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input name="authorDisplayName" defaultValue={testimony.authorDisplayName ?? ""} required className="block w-full" />
                      <Input name="youtubeUrl" defaultValue={testimony.youtubeUrl ?? ""} placeholder="YouTube URL" className="block w-full" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-muted">Added {timeAgo(testimony.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <form action={boundUp}>
                          <button
                            type="submit"
                            disabled={index === 0}
                            aria-label="Move up"
                            className="rounded-sm p-1.5 text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                        </form>
                        <form action={boundDown}>
                          <button
                            type="submit"
                            disabled={index === featured.length - 1}
                            aria-label="Move down"
                            className="rounded-sm p-1.5 text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </form>
                        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
                        <form action={boundDelete}>
                          <button type="submit" aria-label="Delete" className="rounded-sm p-1.5 text-danger hover:bg-danger-bg">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    </div>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card padding="none">
        <div className="p-4 pb-0">
          <h2 className="text-sm font-semibold text-ink">Visitor submissions ({submitted.length})</h2>
        </div>
        {submitted.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={26} strokeWidth={1.5} />}
            title="No submissions yet"
            description="Visitor-submitted testimonies will show up here for moderation."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border p-4 pt-2">
            {submitted.map((testimony) => {
              const boundToggle = toggleVisibilityAction.bind(null, testimony.id, !testimony.isPublic);
              const boundDelete = deleteAction.bind(null, testimony.id);
              return (
                <li key={testimony.id} className="py-3">
                  <p className="whitespace-pre-wrap text-sm text-ink">{testimony.message}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-ink-muted">
                      {testimony.account?.displayName ?? testimony.account?.email ?? "Unknown"} &middot; {timeAgo(testimony.createdAt)}
                      {!testimony.isPublic && " · Hidden"}
                    </span>
                    <div className="flex items-center gap-2">
                      <form action={boundToggle}>
                        <Button type="submit" variant="secondary" size="sm">
                          {testimony.isPublic ? "Hide" : "Show"}
                        </Button>
                      </form>
                      <form action={boundDelete}>
                        <button type="submit" aria-label="Delete" className="rounded-sm p-1.5 text-danger hover:bg-danger-bg">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
