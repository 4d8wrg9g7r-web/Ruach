"use client";

import { useEffect, useState } from "react";
import { ImageOff, Trash2 } from "lucide-react";

/** A data-URL logo preview larger than this is skipped -- kept out of a cross-frame preview iframe's query string, not out of the actual upload (which is unaffected). */
const LIVE_PREVIEW_MAX_FILE_BYTES = 2 * 1024 * 1024;

interface LogoUploadFieldProps {
  label: string;
  currentUrl: string | null;
  /** File input's form field name -- read on the server via formData.get(name). */
  name?: string;
  /** Checkbox field name signaling "clear the existing logo" -- read the same way. */
  removeFieldName?: string;
  /**
   * Fired whenever the locally-selected/removed logo changes, as a same-document
   * data: URL (not the blob: URL used for this field's own thumbnail, which can't
   * cross into a preview iframe) -- undefined means "revert to currentUrl", null
   * means "no logo". Only used by callers building a live cross-frame preview (the
   * widget builder, Settings' prayer-wall card); omitted everywhere else.
   */
  onFileSelected?: (dataUrl: string | null | undefined) => void;
}

/**
 * Replaces the old raw "Logo URL" text input everywhere a logo is set. Submits as a
 * real <input type="file"> inside the existing server-action <form>, so no client-side
 * fetch/XHR is needed -- Next.js server actions already accept File values out of a
 * standard multipart form submission.
 */
export function LogoUploadField({
  label,
  currentUrl,
  name = "logoFile",
  removeFieldName = "removeLogo",
  onFileSelected,
}: LogoUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [markedForRemoval, setMarkedForRemoval] = useState(false);

  // currentUrl only changes once the server action has actually persisted a new value
  // (via revalidatePath) -- that's the signal that the locally-selected file/removal
  // choice was applied, so the transient client state can be dropped in favor of it.
  useEffect(() => {
    setPreviewUrl(null);
    setMarkedForRemoval(false);
  }, [currentUrl]);

  const displayUrl = markedForRemoval ? null : (previewUrl ?? currentUrl);

  return (
    <div className="text-sm text-ink-secondary">
      <span className="block">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border-strong bg-surface-muted">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff size={18} className="text-ink-muted" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <input
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            disabled={markedForRemoval}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
              if (file) setMarkedForRemoval(false);

              if (!onFileSelected) return;
              if (!file) {
                onFileSelected(undefined);
              } else if (file.size <= LIVE_PREVIEW_MAX_FILE_BYTES) {
                const reader = new FileReader();
                reader.onload = () => onFileSelected(typeof reader.result === "string" ? reader.result : undefined);
                reader.readAsDataURL(file);
              }
            }}
            className="block w-full text-xs text-ink-secondary file:mr-3 file:rounded-sm file:border-0 file:bg-surface-warm file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent-dark hover:file:bg-accent/15 disabled:opacity-50"
          />
          <p className="text-[11px] text-ink-muted">Recommended: square, at least 256&times;256px (PNG, JPG, WEBP, GIF, or SVG)</p>
          {currentUrl && (
            <label className="flex w-fit items-center gap-1.5 text-xs text-ink-muted">
              <input
                type="checkbox"
                name={removeFieldName}
                checked={markedForRemoval}
                onChange={(e) => {
                  setMarkedForRemoval(e.currentTarget.checked);
                  if (e.currentTarget.checked) setPreviewUrl(null);
                  onFileSelected?.(e.currentTarget.checked ? null : undefined);
                }}
              />
              <Trash2 size={11} /> Remove current logo
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
