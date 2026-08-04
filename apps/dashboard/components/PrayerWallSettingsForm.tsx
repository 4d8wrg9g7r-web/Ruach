"use client";

import { useEffect, useState } from "react";
import { ColorPickerField } from "./ColorPickerField";
import { CopySnippetButton } from "./CopySnippetButton";
import { LogoUploadField } from "./LogoUploadField";
import { PrayerWallPreviewFrame } from "./PrayerWallPreviewFrame";
import { buttonClasses } from "./ui/Button";
import { Input } from "./ui/Input";

const PREVIEW_DEBOUNCE_MS = 200;

interface PrayerWallSettingsFormProps {
  publicPrayerWallId: string;
  prayerWallEnabled: boolean;
  forwardingEmail: string;
  brandColor: string;
  logoUrl: string | null;
  prayerWallUrl: string;
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
  forwardingEmail,
  brandColor,
  logoUrl,
  prayerWallUrl,
  action,
}: PrayerWallSettingsFormProps) {
  const [previewColor, setPreviewColor] = useState(brandColor);
  const [previewLogo, setPreviewLogo] = useState<string | null>(logoUrl);
  const [debouncedColor, setDebouncedColor] = useState(previewColor);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedColor(previewColor), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [previewColor]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input type="checkbox" name="prayerWallEnabled" defaultChecked={prayerWallEnabled} />
          Enable the public prayer wall
        </label>
        <label className="text-sm text-ink-secondary">
          Forward new submissions to
          <Input
            name="forwardingEmail"
            type="email"
            placeholder="staff@example.org"
            defaultValue={forwardingEmail}
            className="mt-1 block w-full max-w-sm"
          />
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
        <div className="flex justify-end">
          <button type="submit" className={buttonClasses("primary", "md")}>
            Save
          </button>
        </div>
      </form>

      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-ink">Preview</h3>
          <p className="text-xs text-ink-muted">How the wall looks to visitors.</p>
        </div>
        <PrayerWallPreviewFrame publicPrayerWallId={publicPrayerWallId} previewColor={debouncedColor} previewLogo={previewLogo} />
      </div>
    </div>
  );
}
