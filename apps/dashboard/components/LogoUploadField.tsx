"use client";

import { useEffect, useId, useState } from "react";
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
  disabled?: boolean;
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
  disabled = false,
}: LogoUploadFieldProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [markedForRemoval, setMarkedForRemoval] = useState(false);

  // currentUrl only changes once the server action has actually persisted a new value
  // (via revalidatePath) -- that's the signal that the locally-selected file/removal
  // choice was applied, so the transient client state can be dropped in favor of it.
  useEffect(() => {
    setPreviewUrl(null);
    setSelectedFileName(null);
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
          {/* Native file inputs never show a previously-uploaded filename after a page
              load -- browsers never pre-populate them, for any site, ever. Showing that
              raw "No file chosen" text next to a thumbnail that clearly has a logo
              already read as broken, so this hides the input (still focusable/keyboard-
              operable via the label's `for`) and drives the visible text from our own
              state instead, using accurate copy for each case. */}
          <div className="flex items-center gap-2">
            <label
              htmlFor={inputId}
              className={`rounded-sm bg-surface-warm px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors duration-180 hover:bg-accent/15 ${
                markedForRemoval || disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
              }`}
            >
              {currentUrl || previewUrl ? "Change logo" : "Choose File"}
            </label>
            <span className="text-xs text-ink-muted">
              {markedForRemoval ? "Logo will be removed" : (selectedFileName ?? (currentUrl ? "Current logo" : "No file chosen"))}
            </span>
          </div>
          <input
            id={inputId}
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            disabled={markedForRemoval || disabled}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
              setSelectedFileName(file?.name ?? null);
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
            className="sr-only"
          />
          <p className="text-[11px] text-ink-muted">Recommended: square, at least 256&times;256px (PNG, JPG, WEBP, GIF, or SVG)</p>
          {currentUrl && (
            <label className={`flex w-fit items-center gap-1.5 text-xs text-ink-muted ${disabled ? "pointer-events-none opacity-50" : ""}`}>
              <input
                type="checkbox"
                name={removeFieldName}
                checked={markedForRemoval}
                disabled={disabled}
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
