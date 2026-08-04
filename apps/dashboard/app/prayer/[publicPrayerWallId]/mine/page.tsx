import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { organizationService, prayerService } from "@ruach/database";
import { MyPrayerRequestList } from "../../../../components/MyPrayerRequestList";
import { PrayerWallHeader } from "../../../../components/PrayerWallHeader";
import { DEFAULT_PRAYER_WALL_BRAND_COLOR } from "../../../../lib/prayer-branding";
import { getCurrentPrayerAccount } from "../../../../lib/prayer-session";

async function markAnsweredAction(publicPrayerWallId: string, requestId: string) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");
  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) throw new Error("Not logged in");

  await prayerService.markAnswered(organization.id, account.id, requestId);
  revalidatePath(`/prayer/${publicPrayerWallId}/mine`);
}

async function togglePublicAction(publicPrayerWallId: string, requestId: string, isPublic: boolean) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");
  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) throw new Error("Not logged in");

  await prayerService.setPublicVisibility(organization.id, account.id, requestId, isPublic);
  revalidatePath(`/prayer/${publicPrayerWallId}/mine`);
  revalidatePath(`/prayer/${publicPrayerWallId}`);
}

async function toggleAnonymousAction(publicPrayerWallId: string, requestId: string, isAnonymous: boolean) {
  "use server";
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) throw new Error("Not found");
  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) throw new Error("Not logged in");

  await prayerService.setAnonymous(organization.id, account.id, requestId, isAnonymous);
  revalidatePath(`/prayer/${publicPrayerWallId}/mine`);
  revalidatePath(`/prayer/${publicPrayerWallId}`);
}

export default async function MyPrayerRequestsPage({ params }: { params: Promise<{ publicPrayerWallId: string }> }) {
  const { publicPrayerWallId } = await params;
  const organization = await organizationService.getOrganizationByPublicPrayerWallId(publicPrayerWallId);
  if (!organization) notFound();

  const account = await getCurrentPrayerAccount(organization.id);
  if (!account) redirect(`/prayer/${publicPrayerWallId}/login?next=mine`);

  const requests = await prayerService.listMyPrayerRequests(organization.id, account.id);

  const boundMarkAnswered = markAnsweredAction.bind(null, publicPrayerWallId);
  const boundTogglePublic = togglePublicAction.bind(null, publicPrayerWallId);
  const boundToggleAnonymous = toggleAnonymousAction.bind(null, publicPrayerWallId);
  const brandColor = organization.prayerWallBrandColor ?? DEFAULT_PRAYER_WALL_BRAND_COLOR;
  const hasCustomBrandColor = brandColor !== DEFAULT_PRAYER_WALL_BRAND_COLOR;

  return (
    <div className={`min-h-screen ${hasCustomBrandColor ? "bg-surface" : "bg-surface-muted"}`}>
      <PrayerWallHeader
        organizationName={organization.name}
        publicPrayerWallId={publicPrayerWallId}
        logoUrl={organization.prayerWallLogoUrl}
        brandColor={brandColor}
        isLoggedIn
      />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-1 text-xl font-semibold text-ink">My prayer requests</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Mark a request answered, or change whether it&rsquo;s visible on the public wall.
        </p>
        <MyPrayerRequestList
          requests={requests}
          onMarkAnswered={boundMarkAnswered}
          onTogglePublic={boundTogglePublic}
          onToggleAnonymous={boundToggleAnonymous}
          brandColor={brandColor}
        />
      </main>
    </div>
  );
}
