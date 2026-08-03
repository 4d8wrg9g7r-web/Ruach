import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { widgetService } from "@ruach/database";
import { CopySnippetButton } from "../../../../components/CopySnippetButton";
import { WidgetPreviewFrame } from "../../../../components/WidgetPreviewFrame";
import { buttonClasses } from "../../../../components/ui/Button";
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
    inputPlaceholder: String(formData.get("inputPlaceholder") ?? ""),
    launcherLabel: String(formData.get("launcherLabel") ?? ""),
    launcherPosition: formData.get("launcherPosition") === "BOTTOM_LEFT" ? "BOTTOM_LEFT" : "BOTTOM_RIGHT",
    primaryColor: String(formData.get("primaryColor") ?? "#161616"),
    suggestedPrompts,
    privacyNotice: String(formData.get("privacyNotice") ?? ""),
    noResultMessage: String(formData.get("noResultMessage") ?? ""),
    showPlatformBranding: formData.get("showPlatformBranding") === "on",
    allowInlinePlayback: formData.get("allowInlinePlayback") === "on",
  });
  revalidatePath(`/widgets/${widgetId}`);
  revalidatePath(`/widget/embed/${widgetId}`);
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
      <Link href="/widgets" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> Widgets
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{widget.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{widget.website.name}</p>
        </div>
        <a href={`/widget/embed/${widget.publicWidgetId}`} target="_blank" rel="noreferrer" className={buttonClasses("secondary", "sm")}>
          Open full-page preview <ExternalLink size={13} />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col gap-6">
          <div className="shadow-panel rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Customize</h2>
            <form action={boundUpdateAction} className="flex flex-col gap-4">
              <label className="text-sm text-ink-secondary">
                Assistant name
                <input
                  name="assistantName"
                  defaultValue={widget.assistantName}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-ink-secondary">
                Welcome message
                <textarea
                  name="welcomeMessage"
                  defaultValue={widget.welcomeMessage}
                  rows={2}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-ink-secondary">
                Input placeholder
                <input
                  name="inputPlaceholder"
                  defaultValue={widget.inputPlaceholder}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-ink-secondary">
                Suggested prompts (one per line)
                <textarea
                  name="suggestedPrompts"
                  defaultValue={widget.suggestedPrompts.join("\n")}
                  rows={3}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-ink-secondary">
                No-result message
                <input
                  name="noResultMessage"
                  defaultValue={widget.noResultMessage}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-ink-secondary">
                Privacy notice
                <input
                  name="privacyNotice"
                  defaultValue={widget.privacyNotice}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm text-ink-secondary">
                  Brand color
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue={widget.primaryColor}
                    className="mt-1 block h-10 w-full rounded border border-border-strong"
                  />
                </label>
                <label className="text-sm text-ink-secondary">
                  Launcher label
                  <input
                    name="launcherLabel"
                    defaultValue={widget.launcherLabel}
                    className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  />
                </label>
              </div>

              <label className="text-sm text-ink-secondary">
                Launcher position
                <select
                  name="launcherPosition"
                  defaultValue={widget.launcherPosition}
                  className="mt-1 block w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="BOTTOM_RIGHT">Bottom right</option>
                  <option value="BOTTOM_LEFT">Bottom left</option>
                </select>
              </label>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <label className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input type="checkbox" name="allowInlinePlayback" defaultChecked={widget.allowInlinePlayback} />
                  Allow inline playback
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-secondary">
                  <input type="checkbox" name="showPlatformBranding" defaultChecked={widget.showPlatformBranding} />
                  Show &ldquo;Powered by Ruach&rdquo;
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button type="submit" className={buttonClasses("primary", "md")}>
                  Publish Changes
                </button>
              </div>
            </form>
          </div>

          <div className="shadow-panel overflow-hidden rounded-lg border border-white/10 bg-sidebar p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Installation</h2>
              <CopySnippetButton text={snippet} />
            </div>
            <p className="mb-3 text-xs text-white/40">
              Paste this in the <code>&lt;head&gt;</code> of {widget.website.primaryDomain}:
            </p>
            <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-white/80">{snippet}</pre>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">Widget Preview</h2>
            <p className="text-xs text-ink-muted">This is how your widget looks to visitors.</p>
          </div>
          <WidgetPreviewFrame publicWidgetId={widget.publicWidgetId} />
        </div>
      </div>
    </div>
  );
}
