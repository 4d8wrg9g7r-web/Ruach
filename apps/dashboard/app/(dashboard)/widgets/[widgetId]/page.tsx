import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { widgetService } from "@ruach/database";
import { getCurrentOrganization, requireOrgRole } from "../../../../lib/session";

async function updateWidgetAction(widgetId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const suggestedPrompts = String(formData.get("suggestedPrompts") ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  await widgetService.updateWidget(organization.id, widgetId, {
    assistantName: String(formData.get("assistantName") ?? ""),
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? "#2563EB"),
    suggestedPrompts,
  });
  revalidatePath(`/widgets/${widgetId}`);
}

export default async function WidgetDetailPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = await params;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const widget = await widgetService.getWidget(organization.id, widgetId);
  if (!widget) notFound();

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const snippet = `<script src="${appOrigin}/widget-loader.js" data-widget-id="${widget.publicWidgetId}" defer></script>`;
  const boundUpdateAction = updateWidgetAction.bind(null, widgetId);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{widget.name}</h1>
      <p className="mb-6 text-sm text-slate-500">{widget.website.name}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-medium">Customize</h2>
          <form action={boundUpdateAction} className="flex flex-col gap-3">
            <label className="text-sm">
              Assistant name
              <input
                name="assistantName"
                defaultValue={widget.assistantName}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Welcome message
              <textarea
                name="welcomeMessage"
                defaultValue={widget.welcomeMessage}
                rows={2}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Suggested prompts (one per line)
              <textarea
                name="suggestedPrompts"
                defaultValue={widget.suggestedPrompts.join("\n")}
                rows={3}
                className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Primary color
              <input
                type="color"
                name="primaryColor"
                defaultValue={widget.primaryColor}
                className="mt-1 block h-10 w-16 rounded border border-slate-300"
              />
            </label>
            <button type="submit" className="mt-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Save
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-medium">Installation</h2>
            <p className="mb-2 text-sm text-slate-500">
              Paste this in the <code>&lt;head&gt;</code> of {widget.website.primaryDomain}:
            </p>
            <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{snippet}</pre>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-medium">Preview</h2>
            <a
              href={`/widget/embed/${widget.publicWidgetId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Open full-page preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
