"use client";

import { useEffect, useState } from "react";
import { ColorPickerField } from "./ColorPickerField";
import { LogoUploadField } from "./LogoUploadField";
import { WidgetPreviewFrame } from "./WidgetPreviewFrame";
import { buttonClasses } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input, Select, Textarea } from "./ui/Input";

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
  allowInlinePlayback: boolean;
  showPlatformBranding: boolean;
}

interface WidgetCustomizePanelProps {
  widget: WidgetForPanel;
  updateAction: (formData: FormData) => Promise<void>;
  /** Server-rendered content (Installation snippet, Standard Links card) slotted into the same left column below the form -- stays a Server Component even though this wrapper is a Client Component. */
  children?: React.ReactNode;
}

/**
 * Houses the Customize form and the preview panel together so they can share live
 * color/logo state -- the preview used to only ever show the last *saved* state
 * (WidgetPreviewFrame just iframes the real embed page), this makes it update as
 * you edit, before "Publish Changes" is ever clicked.
 */
export function WidgetCustomizePanel({ widget, updateAction, children }: WidgetCustomizePanelProps) {
  const [previewColor, setPreviewColor] = useState(widget.primaryColor);
  const [previewLogo, setPreviewLogo] = useState<string | null>(widget.logoUrl);
  const [debouncedColor, setDebouncedColor] = useState(previewColor);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedColor(previewColor), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [previewColor]);

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_440px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">Customize</h2>
          <form action={updateAction} className="flex flex-col gap-4">
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
              <Textarea name="suggestedPrompts" defaultValue={widget.suggestedPrompts.join("\n")} rows={3} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              No-result message
              <Input name="noResultMessage" defaultValue={widget.noResultMessage} className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Privacy notice
              <Input name="privacyNotice" defaultValue={widget.privacyNotice} className="mt-1 block" />
            </label>

            <h3 className="mt-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <ColorPickerField label="Brand color" name="primaryColor" defaultValue={widget.primaryColor} onChange={setPreviewColor} />
              <label className="text-sm text-ink-secondary">
                Launcher label
                <Input name="launcherLabel" defaultValue={widget.launcherLabel} className="mt-1 block" />
              </label>
            </div>
            <LogoUploadField
              label="Logo (optional -- shown in place of your initials)"
              currentUrl={widget.logoUrl}
              onFileSelected={(dataUrl) => setPreviewLogo(dataUrl === undefined ? widget.logoUrl : dataUrl)}
            />
            <label className="text-sm text-ink-secondary">
              Launcher position
              <Select name="launcherPosition" defaultValue={widget.launcherPosition} className="mt-1 block">
                <option value="BOTTOM_RIGHT">Bottom right</option>
                <option value="BOTTOM_LEFT">Bottom left</option>
              </Select>
            </label>

            <h3 className="mt-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Behavior</h3>
            <div className="flex flex-col gap-2">
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
        </Card>

        {children}
      </div>

      <div className="min-w-0">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-ink">Widget Preview</h2>
          <p className="text-xs text-ink-muted">This is how your widget looks to visitors.</p>
        </div>
        <WidgetPreviewFrame publicWidgetId={widget.publicWidgetId} previewColor={debouncedColor} previewLogo={previewLogo} />
      </div>
    </div>
  );
}
