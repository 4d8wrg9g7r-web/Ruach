import Link from "next/link";
import { resourceService, websiteService, widgetService } from "@ruach/database";
import { getCurrentOrganization } from "../../../lib/session";

export default async function OverviewPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const [resources, websites, widgets] = await Promise.all([
    resourceService.listResources(organization.id),
    websiteService.listWebsites(organization.id),
    widgetService.listWidgets(organization.id),
  ]);

  const active = resources.filter((r) => r.status === "ACTIVE").length;
  const needsReview = resources.filter((r) => r.status === "REVIEW_REQUIRED").length;
  const draft = resources.filter((r) => r.status === "DRAFT" || r.status === "PROCESSING").length;

  const stats = [
    { label: "Active resources", value: active },
    { label: "Awaiting review", value: needsReview },
    { label: "Draft / processing", value: draft },
    { label: "Websites", value: websites.length },
    { label: "Widgets", value: widgets.length },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded border border-slate-200 bg-white p-4">
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {websites.length === 0 && (
        <p className="mt-8 text-sm text-slate-600">
          Get started by <Link href="/websites" className="text-blue-600 underline">adding a website</Link>, then{" "}
          <Link href="/widgets" className="text-blue-600 underline">creating a widget</Link> and{" "}
          <Link href="/resources" className="text-blue-600 underline">importing a resource</Link>.
        </p>
      )}
    </div>
  );
}
