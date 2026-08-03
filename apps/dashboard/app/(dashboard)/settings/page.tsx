import { getCurrentOrganization, getCurrentUser } from "../../../lib/session";

export default async function SettingsPage() {
  const organization = await getCurrentOrganization();
  const user = await getCurrentUser();
  if (!organization) return null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mb-8 text-sm text-ink-secondary">Organization profile and preferences.</p>

      <div className="shadow-panel mb-6 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Organization</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-ink">{organization.name}</dd>
          <dt className="text-ink-muted">Slug</dt>
          <dd className="text-ink">{organization.slug}</dd>
          <dt className="text-ink-muted">Categorization mode</dt>
          <dd className="text-ink">{organization.categorizationMode}</dd>
        </dl>
      </div>

      <div className="shadow-panel rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Your account</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-ink">{user?.name || "--"}</dd>
          <dt className="text-ink-muted">Email</dt>
          <dd className="text-ink">{user?.email}</dd>
        </dl>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Team management, billing, and safety configuration are on the roadmap -- see docs/billing.md and
        docs/admin-guide.md.
      </p>
    </div>
  );
}
