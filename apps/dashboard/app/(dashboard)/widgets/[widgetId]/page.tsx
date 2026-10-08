import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { z } from "zod";
import { actionLinkService, billingService, widgetService } from "@ruach/database";
import {
  LIBRARY_FONTS,
  RESOURCE_TYPE_LABELS,
  ResourceTypeSchema,
  WidgetDisplayStyleSchema,
  findLibraryFont,
} from "@ruach/shared-types";
import { ActionLinkList } from "../../../../components/ActionLinkList";
import { CopySnippetButton } from "../../../../components/CopySnippetButton";
import { WidgetCustomizePanel } from "../../../../components/WidgetCustomizePanel";
import { buttonClasses } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Input, Select } from "../../../../components/ui/Input";
import { getCurrentOrganization, requireOrgRole } from "../../../../lib/session";
import { invalidateLibraryWidget } from "../../../../lib/sermon-library";
import { saveLogoUpload } from "../../../../lib/upload";

const actionLinkUrlSchema = z.string().url("Enter a full URL, including https://");

async function updateWidgetAction(widgetId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const plan = billingService.getPlan(organization.planKey);
  const canCustomizeAppearance = billingService.planHasFeature(organization.planKey, "advancedWidgetCustomization");

  const existingWidget = await widgetService.getWidget(organization.id, widgetId);
  if (!existingWidget) throw new Error("Widget not found");

  // Disabled form fields never submit, so a disabled checkbox/textarea/color-picker
  // in the UI already degrades to "unset" here -- these checks are the real
  // enforcement (defense in depth against a raw POST that skips the UI entirely),
  // not merely mirroring what the disabled inputs already do. Below plan, every
  // gated field falls back to whatever the widget already had, not a hardcoded
  // default -- an org that had a custom color/logo set before a downgrade keeps
  // seeing it, just can't change it further without upgrading again.
  const suggestedPrompts = canCustomizeAppearance
    ? String(formData.get("suggestedPrompts") ?? "")
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  const primaryColor = canCustomizeAppearance ? String(formData.get("primaryColor") ?? "#161616") : existingWidget.primaryColor;

  let logoUrl = existingWidget.logoUrl;
  if (canCustomizeAppearance) {
    const logoFile = formData.get("logoFile");
    if (formData.get("removeLogo") === "on") {
      logoUrl = null;
    } else if (logoFile instanceof File && logoFile.size > 0) {
      logoUrl = await saveLogoUpload(organization.id, logoFile);
    }
  }

  const displayStyleParsed = WidgetDisplayStyleSchema.safeParse(formData.get("displayStyle"));
  const displayStyle = displayStyleParsed.success ? displayStyleParsed.data : existingWidget.displayStyle;

  await widgetService.updateWidget(organization.id, widgetId, {
    assistantName: String(formData.get("assistantName") ?? ""),
    welcomeMessage: String(formData.get("welcomeMessage") ?? ""),
    inputPlaceholder: String(formData.get("inputPlaceholder") ?? ""),
    launcherLabel: String(formData.get("launcherLabel") ?? ""),
    launcherPosition: formData.get("launcherPosition") === "BOTTOM_LEFT" ? "BOTTOM_LEFT" : "BOTTOM_RIGHT",
    displayStyle,
    primaryColor,
    logoUrl,
    suggestedPrompts,
    privacyNotice: String(formData.get("privacyNotice") ?? ""),
    noResultMessage: String(formData.get("noResultMessage") ?? ""),
    showPlatformBranding: plan.features.includes("removeBranding") ? formData.get("showPlatformBranding") === "on" : true,
    allowInlinePlayback: formData.get("allowInlinePlayback") === "on",
  });
  revalidatePath(`/widgets/${widgetId}`);
  // Bug: this must be the *public* id -- the real embed page (what the preview
  // iframe and every installed widget-loader.js actually hit) lives at
  // /widget/embed/<publicWidgetId>, not /widget/embed/<internal widgetId>.
  // Revalidating the wrong path left the real page serving stale cached data
  // after every Publish Changes.
  revalidatePath(`/widget/embed/${existingWidget.publicWidgetId}`);
  invalidateLibraryWidget(existingWidget.publicWidgetId);
}

async function updateLibrarySettingsAction(widgetId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const existingWidget = await widgetService.getWidget(organization.id, widgetId);
  if (!existingWidget) throw new Error("Widget not found");

  // Anything that isn't a real ResourceType is dropped rather than rejected -- the
  // form only ever offers valid ones.
  const libraryResourceTypes = [
    ...new Set(
      formData
        .getAll("libraryResourceType")
        .map((value) => ResourceTypeSchema.safeParse(value))
        .flatMap((parsed) => (parsed.success ? [parsed.data] : [])),
    ),
  ];
  // Same pattern as the Customize form: below plan the saved font is kept, not
  // cleared, and the embed itself ignores it (see getLibraryWidget).
  const libraryFontFamily = billingService.planHasFeature(organization.planKey, "advancedWidgetCustomization")
    ? (findLibraryFont(String(formData.get("libraryFontFamily") ?? ""))?.family ?? null)
    : existingWidget.libraryFontFamily;
  await widgetService.updateWidget(organization.id, widgetId, { libraryResourceTypes, libraryFontFamily });
  revalidatePath(`/widgets/${widgetId}`);
  invalidateLibraryWidget(existingWidget.publicWidgetId);
}

async function createActionLinkAction(widgetId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const label = String(formData.get("label") ?? "").trim();
  const rawUrl = String(formData.get("url") ?? "").trim();
  const type = String(formData.get("type") ?? "CUSTOM");
  if (!label || !rawUrl) throw new Error("Label and URL are required.");

  const urlParsed = actionLinkUrlSchema.safeParse(rawUrl);
  if (!urlParsed.success) throw new Error(urlParsed.error.issues[0]?.message ?? "Enter a valid URL.");

  await actionLinkService.createActionLink({ organizationId: organization.id, label, url: urlParsed.data, type });
  revalidatePath(`/widgets/${widgetId}`);
}

async function toggleActionLinkActiveAction(widgetId: string, linkId: string, enabled: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await actionLinkService.updateActionLink(organization.id, linkId, { isActive: enabled });
  revalidatePath(`/widgets/${widgetId}`);
}

async function removeActionLinkAction(widgetId: string, linkId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await actionLinkService.deleteActionLink(organization.id, linkId);
  revalidatePath(`/widgets/${widgetId}`);
}

async function reorderActionLinkAction(widgetId: string, linkId: string, direction: "up" | "down") {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await actionLinkService.reorderActionLink(organization.id, linkId, direction);
  revalidatePath(`/widgets/${widgetId}`);
}

export default async function WidgetDetailPage({ params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = await params;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const widget = await widgetService.getWidget(organization.id, widgetId);
  if (!widget) notFound();

  const actionLinks = await actionLinkService.listActionLinks(organization.id);
  const plan = billingService.getPlan(organization.planKey);
  const entitlements = {
    removeBranding: plan.features.includes("removeBranding"),
    advancedWidgetCustomization: plan.features.includes("advancedWidgetCustomization"),
  };

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const snippet = `<script src="${appOrigin}/widget-loader.js" data-widget-id="${widget.publicWidgetId}" defer></script>`;
  const librarySnippet = `<div id="ruach-sermon-library"></div>\n<script src="${appOrigin}/sermon-library.js" data-widget-id="${widget.publicWidgetId}" defer></script>`;
  const libraryIframeSnippet = `<iframe src="${appOrigin}/widget/library/${widget.publicWidgetId}" title="Sermon library" style="width:100%;height:1400px;border:0"></iframe>`;
  const boundUpdateAction = updateWidgetAction.bind(null, widgetId);
  const boundUpdateLibrarySettings = updateLibrarySettingsAction.bind(null, widgetId);
  const enabledLibraryTypes = new Set<string>(widget.libraryResourceTypes);
  const boundCreateActionLink = createActionLinkAction.bind(null, widgetId);
  const boundToggleActionLinkActive = toggleActionLinkActiveAction.bind(null, widgetId);
  const boundRemoveActionLink = removeActionLinkAction.bind(null, widgetId);
  const boundReorderActionLink = reorderActionLinkAction.bind(null, widgetId);

  return (
    <div>
      <Link
        href="/widgets"
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
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

      <WidgetCustomizePanel widget={widget} updateAction={boundUpdateAction} entitlements={entitlements}>
        <Card padding="none">
          <div className="border-b border-border p-5">
            <h2 className="mb-1 text-sm font-semibold text-ink">Standard Links</h2>
            <p className="text-sm text-ink-secondary">
              Up to 10 quick-action buttons shown alongside the chat when a visitor opens the widget. These are
              shared across every widget in your organization, not just this one. To let the assistant answer
              navigational questions like "where can I find the notes?" from chat, add an{" "}
              <a href="/resources" className="underline hover:text-ink">
                Organizational Link
              </a>{" "}
              instead.
            </p>
          </div>
          <div className="border-b border-border p-5">
            <form action={boundCreateActionLink} className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-ink-secondary">
                Label
                <Input name="label" required placeholder="Give" className="mt-1 block w-40" />
              </label>
              <label className="grow text-sm text-ink-secondary">
                URL
                <Input name="url" required placeholder="https://..." className="mt-1 block w-full" />
              </label>
              <label className="text-sm text-ink-secondary">
                Type
                <Select name="type" defaultValue="CUSTOM" className="mt-1 block">
                  <option value="CUSTOM">Custom</option>
                  <option value="GIVING">Giving</option>
                  <option value="CONTACT">Contact</option>
                  <option value="PRAYER_REQUEST">Prayer request</option>
                  <option value="SERVICE_TIMES">Service times</option>
                </Select>
              </label>
              <button type="submit" className={buttonClasses("secondary", "md")} disabled={actionLinks.length >= 10}>
                Add link
              </button>
            </form>
            {actionLinks.length >= 10 && (
              <p className="mt-2 text-xs text-ink-muted">Maximum of 10 links reached -- remove one to add another.</p>
            )}
          </div>
          <ActionLinkList
            links={actionLinks}
            onToggleActive={boundToggleActionLinkActive}
            onRemove={boundRemoveActionLink}
            onReorder={boundReorderActionLink}
          />
        </Card>

        <div className="shadow-panel overflow-hidden rounded-lg border border-white/10 bg-sidebar p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Installation</h2>
            <CopySnippetButton text={snippet} variant="dark" />
          </div>
          <p className="mb-3 text-xs text-white/40">
            Paste this in the <code>&lt;head&gt;</code> of {widget.website.primaryDomain}:
          </p>
          <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-white/80">{snippet}</pre>
        </div>

        <Card padding="none">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-ink">Sermon library embed</h2>
              <p className="text-sm text-ink-secondary">
                A searchable message archive for your sermon page, with filters for speaker, subject, scripture,
                message type, format and series, plus a box where visitors can describe what they need and get matched to a
                message. It lists this campus&rsquo;s messages along with your organization-wide ones, and uses this
                widget&rsquo;s color, suggested prompts and &ldquo;Powered by Ruach&rdquo; setting.
              </p>
            </div>
            <a
              href={`/widget/library/${widget.publicWidgetId}`}
              target="_blank"
              rel="noreferrer"
              className={`${buttonClasses("secondary", "sm")} shrink-0`}
            >
              Preview <ExternalLink size={13} />
            </a>
          </div>
          <form action={boundUpdateLibrarySettings} className="border-b border-border p-5">
            <h3 className="mb-1 text-xs font-semibold text-ink">What the library shows</h3>
            <p className="mb-3 text-xs text-ink-secondary">
              Choose which kinds of resources appear in the embed. The chat box still searches everything.
            </p>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2">
              {ResourceTypeSchema.options.map((type) => (
                <label key={type} className="inline-flex items-center gap-1.5 text-sm text-ink-secondary">
                  <input
                    type="checkbox"
                    name="libraryResourceType"
                    value={type}
                    defaultChecked={enabledLibraryTypes.has(type)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  {RESOURCE_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
            <label className="mb-3 block max-w-xs text-xs font-semibold text-ink">
              Font
              <Select
                name="libraryFontFamily"
                defaultValue={widget.libraryFontFamily ?? ""}
                disabled={!entitlements.advancedWidgetCustomization}
                className="mt-1 block font-normal"
              >
                <option value="">Default</option>
                {LIBRARY_FONTS.map((font) => (
                  <option key={font.family} value={font.family}>
                    {font.family}
                  </option>
                ))}
              </Select>
              <span className="mt-1 block text-xs font-normal text-ink-muted">
                {entitlements.advancedWidgetCustomization
                  ? "Pick the font closest to your website's so the library blends in."
                  : "Upgrade your plan to choose a font."}
              </span>
            </label>
            <button type="submit" className={buttonClasses("secondary", "sm")}>
              Save
            </button>
          </form>
          <div className="border-b border-border p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-ink-secondary">
                Paste this where the library should appear on your sermon page (most site builders call this an
                &ldquo;embed&rdquo; or &ldquo;custom code&rdquo; block):
              </p>
              <CopySnippetButton text={librarySnippet} />
            </div>
            <pre className="overflow-x-auto rounded-md bg-surface-muted p-3 text-xs text-ink-secondary">{librarySnippet}</pre>
            <p className="mt-2 text-xs text-ink-muted">
              Add <code>data-chat=&quot;off&quot;</code> to the script tag to show only the filters.
            </p>
          </div>
          <div className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-ink-secondary">
                If your site builder doesn&rsquo;t allow scripts, use this iframe instead (it won&rsquo;t resize to fit,
                so adjust the height):
              </p>
              <CopySnippetButton text={libraryIframeSnippet} />
            </div>
            <pre className="overflow-x-auto rounded-md bg-surface-muted p-3 text-xs text-ink-secondary">{libraryIframeSnippet}</pre>
          </div>
        </Card>
      </WidgetCustomizePanel>
    </div>
  );
}
