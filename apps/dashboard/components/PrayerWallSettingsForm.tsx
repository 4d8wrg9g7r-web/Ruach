"use client";

import { useEffect, useState } from "react";
import { ColorPickerField } from "./ColorPickerField";
import { CopySnippetButton } from "./CopySnippetButton";
import { LogoUploadField } from "./LogoUploadField";
import { PrayerWallPreviewFrame } from "./PrayerWallPreviewFrame";
import { SubmitButton } from "./SubmitButton";
import { Input, Textarea } from "./ui/Input";
import { useToast } from "./ui/Toast";

const PREVIEW_DEBOUNCE_MS = 200;

interface PrayerWallSettingsFormProps {
  publicPrayerWallId: string;
  prayerWallEnabled: boolean;
  forwardingEmails: string[];
  /** null = unlimited. Essential/free are capped at 1 -- see billingService's prayerTeamNotifications feature. */
  maxForwardingEmails: number | null;
  brandColor: string;
  logoUrl: string | null;
  prayerWallUrl: string;
  testimoniesEnabled: boolean;
  testimoniesPageName: string;
  action: (formData: FormData) => Promise<void>;
}

/**
 * Wraps the existing "Prayer wall" settings form in a two-column layout with a live
 * preview -- Settings previously had no preview of any kind, an admin had to open
 * the real public URL in a new tab to see what a color/logo change actually looked
 * like.
 */
export function PrayerWallSettingsForm({
  publicPrayerWallId,
  prayerWallEnabled,
  forwardingEmails,
  maxForwardingEmails,
  brandColor,
  logoUrl,
  prayerWallUrl,
  testimoniesEnabled,
  testimoniesPageName,
  action,
}: PrayerWallSettingsFormProps) {
  const [previewColor, setPreviewColor] = useState(brandColor);
  const [previewLogo, setPreviewLogo] = useState<string | null>(logoUrl);
  const [debouncedColor, setDebouncedColor] = useState(previewColor);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedColor(previewColor), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [previewColor]);

  async function handleSave(formData: FormData) {
    try {
      await action(formData);
      showToast("Prayer wall settings saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong. Please try again.", "error");
    }
  }

  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-[1fr_280px]">
      <form action={handleSave} className="flex min-w-0 flex-col gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input type="checkbox" name="prayerWallEnabled" defaultChecked={prayerWallEnabled} />
          Enable the public prayer wall
        </label>
        <label className="text-sm text-ink-secondary">
          Forward new submissions to {maxForwardingEmails === 1 ? "" : "(one per line)"}
          <Textarea
            name="forwardingEmails"
            placeholder="staff@example.org"
            defaultValue={forwardingEmails.join("\n")}
            rows={maxForwardingEmails === 1 ? 1 : 3}
            className="mt-1 block w-full max-w-sm"
          />
          {maxForwardingEmails !== null && (
            <span className="mt-1 block text-xs text-ink-muted">
              {maxForwardingEmails === 1
                ? "Your plan supports one forwarding address. Upgrade to notify your whole prayer team."
                : `Up to ${maxForwardingEmails} addresses on your plan.`}
            </span>
          )}
        </label>
        <ColorPickerField label="Brand color" name="brandColor" defaultValue={brandColor} onChange={setPreviewColor} />
        <LogoUploadField
          label="Logo"
          currentUrl={logoUrl}
          onFileSelected={(dataUrl) => setPreviewLogo(dataUrl === undefined ? logoUrl : dataUrl)}
        />
        {prayerWallEnabled && (
          <div className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-xs text-ink-secondary">{prayerWallUrl}</code>
            <CopySnippetButton text={prayerWallUrl} />
          </div>
        )}
        {prayerWallEnabled && (
          <div className="flex flex-col gap-3 rounded-md border border-border-strong p-3">
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <input type="checkbox" name="testimoniesEnabled" defaultChecked={testimoniesEnabled} />
              Enable testimonies ("praise reports") on this same wall
            </label>
            <label className="text-sm text-ink-secondary">
              Page name
              <Input
                name="testimoniesPageName"
                defaultValue={testimoniesPageName}
                placeholder="Praise Report"
                className="mt-1 block w-full max-w-xs"
              />
              <span className="mt-1 block text-xs text-ink-muted">
                Shown as the nav link on the public wall, e.g. "{testimoniesPageName || "Praise Report"}".
              </span>
            </label>
          </div>
        )}
        <div className="flex justify-end">
          <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
        </div>
      </form>

      <div className="min-w-0">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-ink">Preview</h3>
          <p className="text-xs text-ink-muted">How the wall looks to visitors.</p>
        </div>
        <PrayerWallPreviewFrame publicPrayerWallId={publicPrayerWallId} previewColor={debouncedColor} previewLogo={previewLogo} />
      </div>
    </div>
  );
}
