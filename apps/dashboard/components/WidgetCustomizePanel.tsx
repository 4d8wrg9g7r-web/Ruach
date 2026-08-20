"use client";

import { useEffect, useState } from "react";
import { WIDGET_DISPLAY_STYLES, type WidgetDisplayStyle } from "@ruach/shared-types";
import { ColorPickerField } from "./ColorPickerField";
import { LogoUploadField } from "./LogoUploadField";
import { SubmitButton } from "./SubmitButton";
import { WidgetShellPreview } from "./WidgetShellPreview";
import { WidgetStyleField } from "./WidgetStyleField";
import { Card } from "./ui/Card";
import { Input, Select, Textarea } from "./ui/Input";
import { useToast } from "./ui/Toast";

const PREVIEW_DEBOUNCE_MS = 200;

interface WidgetForPanel {
  publicWidgetId: string;
  assistantName: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  suggestedPrompts: string[];
  noResultMessage: string;
  privacyNotice: string;
  primaryColor: string;
  launcherLabel: string;
  logoUrl: string | null;
  launcherPosition: string;
  displayStyle: WidgetDisplayStyle;
  allowInlinePlayback: boolean;
  showPlatformBranding: boolean;
}

interface WidgetCustomizePanelProps {
  widget: WidgetForPanel;
  updateAction: (formData: FormData) => Promise<void>;
  /** Which plan-gated fields this org's plan actually allows changing -- the update Server Action also defensively ignores attempts to set these past what the plan allows, so this is UI-affordance only, not the real enforcement. */
  entitlements: { removeBranding: boolean; advancedWidgetCustomization: boolean };
  /** Server-rendered content (Installation snippet, Standard Links card) slotted into the same left column below the form -- stays a Server Component even though this wrapper is a Client Component. */
  children?: React.ReactNode;
}

/**
 * Houses the Customize form and the preview panel together so they can share live
 * color/logo/style state, updating the preview as you edit rather than only after
 * "Publish Changes." Uses WidgetShellPreview (not the simpler WidgetPreviewFrame
 * still used on the dashboard overview) since a display-style choice specifically
 * needs the launcher/panel shell shown, not just the chat content inside it.
 */
export function WidgetCustomizePanel({ widget, updateAction, entitlements, children }: WidgetCustomizePanelProps) {
  const [previewColor, setPreviewColor] = useState(widget.primaryColor);
  const [previewLogo, setPreviewLogo] = useState<string | null>(widget.logoUrl);
  const [previewStyle, setPreviewStyle] = useState<WidgetDisplayStyle>(widget.displayStyle);
  const [debouncedColor, setDebouncedColor] = useState(previewColor);
  const { showToast } = useToast();
  const styleInfo = WIDGET_DISPLAY_STYLES.find((s) => s.key === previewStyle) ?? WIDGET_DISPLAY_STYLES[0]!;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedColor(previewColor), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [previewColor]);

  async function handlePublish(formData: FormData) {
    try {
      await updateAction(formData);
      showToast("Widget published");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong. Please try again.", "error");
    }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_440px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">Customize</h2>
          <form action={handlePublish} className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Content</h3>
            <label className="text-sm text-ink-secondary">
              Assistant name
              <Input name="assistantName" defaultValue={widget.assistantName} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Welcome message
              <Textarea name="welcomeMessage" defaultValue={widget.welcomeMessage} rows={2} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Input placeholder
              <Input name="inputPlaceholder" defaultValue={widget.inputPlaceholder} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Suggested prompts (one per line)
              <Textarea
                name="suggestedPrompts"
                defaultValue={widget.suggestedPrompts.join("\n")}
                rows={3}
                className="mt-1 block"
                disabled={!entitlements.advancedWidgetCustomization}
              />
              {!entitlements.advancedWidgetCustomization && (
                <span className="mt-1 block text-xs text-ink-muted">Upgrade your plan to set suggested prompts.</span>
              )}
            </label>
            <label className="text-sm text-ink-secondary">
              No-result message
              <Input name="noResultMessage" defaultValue={widget.noResultMessage} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Privacy notice
              <Input name="privacyNotice" defaultValue={widget.privacyNotice} className="mt-1 block" />
            </label>

            <h3 className="mt-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Display style</h3>
            <WidgetStyleField name="displayStyle" defaultValue={widget.displayStyle} onChange={setPreviewStyle} />
            {styleInfo.key === "INLINE" && (
              <p className="-mt-1 rounded-md bg-surface-warm px-3 py-2 text-xs text-ink-secondary">
                Inline requires a small change to your embed code -- add{" "}
                <code className="rounded bg-surface px-1 py-0.5">&lt;div id=&quot;ruach-widget-inline&quot;&gt;&lt;/div&gt;</code>{" "}
                wherever you want the widget to appear on the page. If that element isn&rsquo;t found, visitors see the
                classic bubble instead.
              </p>
            )}
            {styleInfo.supportsLauncherPosition && (
              <label className="text-sm text-ink-secondary">
                Launcher position
                <Select name="launcherPosition" defaultValue={widget.launcherPosition} className="mt-1 block">
                  <option value="BOTTOM_RIGHT">Bottom right</option>
                  <option value="BOTTOM_LEFT">Bottom left</option>
                </Select>
              </label>
            )}

            <h3 className="mt-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ColorPickerField
                  label="Brand color"
                  name="primaryColor"
                  defaultValue={widget.primaryColor}
                  onChange={setPreviewColor}
                  disabled={!entitlements.advancedWidgetCustomization}
                />
                {!entitlements.advancedWidgetCustomization && (
                  <span className="mt-1 block text-xs text-ink-muted">Upgrade your plan to change the brand color.</span>
                )}
              </div>
              <label className="text-sm text-ink-secondary">
                Launcher label
                <Input name="launcherLabel" defaultValue={widget.launcherLabel} className="mt-1 block" />
              </label>
            </div>
            <div>
              <LogoUploadField
                label="Logo (optional -- shown in place of your initials)"
                currentUrl={widget.logoUrl}
                onFileSelected={(dataUrl) => setPreviewLogo(dataUrl === undefined ? widget.logoUrl : dataUrl)}
                disabled={!entitlements.advancedWidgetCustomization}
              />
              {!entitlements.advancedWidgetCustomization && (
                <span className="mt-1 block text-xs text-ink-muted">Upgrade your plan to set a logo.</span>
              )}
            </div>

            <h3 className="mt-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Behavior</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-ink-secondary">
                <input type="checkbox" name="allowInlinePlayback" defaultChecked={widget.allowInlinePlayback} />
                Allow inline playback
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  name="showPlatformBranding"
                  defaultChecked={entitlements.removeBranding ? widget.showPlatformBranding : true}
                  disabled={!entitlements.removeBranding}
                />
                Show &ldquo;Powered by Ruach&rdquo;
              </label>
              {!entitlements.removeBranding && (
                <span className="text-xs text-ink-muted">Upgrade your plan to remove Ruach branding.</span>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <SubmitButton pendingLabel="Publishing...">Publish Changes</SubmitButton>
            </div>
          </form>
        </Card>

        {children}
      </div>

      <div className="min-w-0">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-ink">Widget Preview</h2>
          <p className="text-xs text-ink-muted">This is how your widget looks to visitors. Click it to see it open and close.</p>
        </div>
        <WidgetShellPreview
          publicWidgetId={widget.publicWidgetId}
          previewColor={debouncedColor}
          previewLogo={previewLogo}
          displayStyle={previewStyle}
        />
      </div>
    </div>
  );
}
