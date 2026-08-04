import { redirect } from "next/navigation";
import { auditService, organizationService } from "@ruach/database";
import { slugify } from "../../lib/slug";
import { getCurrentOrganization, requireCurrentUser } from "../../lib/session";

async function createOrganizationAction(formData: FormData) {
  "use server";
  const user = await requireCurrentUser();

  // Page-level check (below) already redirects an existing member away before they
  // ever see this form -- this is the defense-in-depth check against a direct POST
  // to the action itself, so a race/bypass fails with a clear message instead of a
  // raw unique-constraint error from OrganizationMember.userId.
  const existingMemberships = await organizationService.getMembershipsForUser(user.id);
  if (existingMemberships.length > 0) redirect("/dashboard");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Organization name is required");

  let slug = slugify(name);
  let suffix = 0;
  while (await organizationService.getOrganizationBySlug(slug)) {
    suffix += 1;
    slug = `${slugify(name)}-${suffix}`;
  }

  const organization = await organizationService.createOrganizationWithOwner({ name, slug, ownerUserId: user.id });
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user.id,
    action: "organization.created",
    targetType: "Organization",
    targetId: organization.id,
  });
  redirect("/dashboard");
}

export default async function OnboardingPage() {
  const existing = await getCurrentOrganization();
  if (existing) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold">Create your organization</h1>
      <p className="mb-6 text-sm text-slate-500">
        This is the workspace your team, websites, widgets, and resources will belong to.
      </p>
      <form action={createOrganizationAction} className="flex flex-col gap-3">
        <label className="text-sm font-medium">
          Organization name
          <input
            name="name"
            required
            placeholder="Riverside Fellowship"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="mt-2 rounded bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">
          Create organization
        </button>
      </form>
    </main>
  );
}
