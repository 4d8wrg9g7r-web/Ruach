"use client";

import { useState } from "react";
import type { WidgetDisplayStyle } from "@ruach/shared-types";

interface WidgetShellPreviewProps {
  publicWidgetId: string;
  previewColor?: string;
  previewLogo?: string | null;
  displayStyle: WidgetDisplayStyle;
}

/**
 * Replaces the old WidgetPreviewFrame, which just iframed the embed page directly --
 * that shows the chat content, but nothing about the launcher/shell (position,
 * open/close animation) surrounding it, since that chrome lives entirely in
 * widget-loader.js on a real customer site, not in the embed page itself. This
 * reconstructs the same 10 shells widget-loader.js mounts (see that file's
 * buildXShell functions and the shared style-gallery artifact both were derived
 * from), scoped to this preview pane, with the real embed iframe slotted in as the
 * panel content -- no fabricated chat markup needed, unlike a static mockup.
 */
export function WidgetShellPreview({ publicWidgetId, previewColor, previewLogo, displayStyle }: WidgetShellPreviewProps) {
  const [open, setOpen] = useState(true);

  const params = new URLSearchParams();
  if (previewColor) params.set("previewColor", previewColor);
  if (previewLogo !== undefined) params.set("previewLogo", previewLogo ?? "");
  const query = params.toString();
  const src = `/widget/embed/${publicWidgetId}${query ? `?${query}` : ""}`;

  const frame = <iframe src={src} title="Widget preview" style={{ width: "100%", height: "100%", border: "none" }} />;

  return (
    <div>
      <style>{SHELL_CSS}</style>
      <div className="rounded-xl bg-surface-warm p-5">
        <div className="rs-site" data-open={open ? "true" : "false"}>
          <div className="rs-nav">
            <span className="rs-brand">Your Website</span>
            <span className="rs-links">
              <span>Home</span>
              <span>About</span>
              <span>Give</span>
            </span>
          </div>
          <div className="rs-hero">
            <p>This is a preview of your website with the widget installed.</p>
          </div>

          <Shell style={displayStyle} open={open} setOpen={setOpen}>
            {frame}
          </Shell>
        </div>
      </div>
    </div>
  );
}

function Shell({
  style,
  open,
  setOpen,
  children,
}: {
  style: WidgetDisplayStyle;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const toggle = () => setOpen(!open);

  switch (style) {
    case "BUBBLE":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--bubble" aria-expanded={open} onClick={toggle}>
            💬
          </button>
          <div className="rs-panel rs-panel--bubble">{children}</div>
        </>
      );
    case "GREETER":
      return (
        <>
          <div className="rs-greeter">Have a question? I&rsquo;m happy to help. 👋</div>
          <button type="button" className="rs-launcher rs-launcher--bubble" aria-expanded={open} onClick={toggle}>
            💬
          </button>
          <div className="rs-panel rs-panel--bubble">{children}</div>
        </>
      );
    case "SLIDE":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--slide" aria-expanded={open} onClick={toggle}>
            Ask&nbsp;Us
          </button>
          <div className="rs-panel rs-panel--slide">{children}</div>
        </>
      );
    case "TAB":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--tab" aria-expanded={open} onClick={toggle}>
            Ask&nbsp;Us
          </button>
          <div className="rs-panel rs-panel--tab">{children}</div>
        </>
      );
    case "INLINE":
      return <div className="rs-panel rs-panel--inline">{children}</div>;
    case "DOCK":
      return (
        <div className="rs-panel rs-panel--dock">
          {children}
          <button type="button" className="rs-dock-bar" aria-expanded={open} onClick={toggle}>
            <span className="rs-dock-input">Ask a question…</span>
            <span className="rs-dock-send">↑</span>
          </button>
        </div>
      );
    case "PALETTE":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--palette" aria-expanded={open} onClick={toggle}>
            Ask a question
          </button>
          <div className="rs-scrim" onClick={toggle} />
          <div className="rs-panel rs-panel--palette">{children}</div>
        </>
      );
    case "SHEET":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--sheet" aria-expanded={open} onClick={toggle}>
            Chat with us
          </button>
          <div className="rs-panel rs-panel--sheet">
            <div className="rs-grabber" />
            <div className="rs-panel-body">{children}</div>
          </div>
        </>
      );
    case "RIBBON":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--ribbon" aria-expanded={open} onClick={toggle}>
            Have a question? Ask →
          </button>
          <div className="rs-panel rs-panel--ribbon">
            <div className="rs-panel-body">{children}</div>
          </div>
        </>
      );
    case "LINK":
      return (
        <>
          <button type="button" className="rs-launcher rs-launcher--link" aria-expanded={open} onClick={toggle}>
            Questions? Ask here.
          </button>
          <div className="rs-panel rs-panel--link">{children}</div>
        </>
      );
    default:
      return null;
  }
}

const SHELL_CSS = `
.rs-site {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-muted);
}
.rs-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--text-primary);
}
.rs-links { display: flex; gap: 14px; font-size: 11px; font-weight: 400; color: var(--text-muted); }
.rs-hero { padding: 20px 20px 0; max-width: 220px; font-size: 12px; line-height: 1.6; color: var(--text-secondary); }

.rs-panel :where(iframe) { display: block; }

/* shared panel chrome */
.rs-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 16px 36px rgba(20, 17, 13, 0.16);
  overflow: hidden;
  display: flex; flex-direction: column;
}

/* bubble / greeter */
.rs-launcher--bubble {
  position: absolute; right: 16px; bottom: 16px; z-index: 3;
  width: 48px; height: 48px; border-radius: 999px; border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #fff; font-size: 18px; cursor: pointer;
  box-shadow: 0 8px 18px rgba(20, 17, 13, 0.22);
}
.rs-panel--bubble {
  position: absolute; right: 16px; bottom: 72px; z-index: 2;
  width: 280px; height: 320px; border-radius: 14px;
  opacity: 0; transform: scale(0.94) translateY(6px); pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
}
[data-open="true"] .rs-panel--bubble { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; }
.rs-greeter {
  position: absolute; right: 72px; bottom: 22px; z-index: 3; max-width: 160px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px; border-bottom-right-radius: 3px;
  box-shadow: 0 8px 18px rgba(20, 17, 13, 0.14); padding: 8px 10px; font-size: 11px; line-height: 1.5; color: var(--text-primary);
  transition: opacity 160ms ease;
}
[data-open="true"] .rs-greeter { opacity: 0; pointer-events: none; }

/* slide */
.rs-launcher--slide {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 3;
  writing-mode: vertical-rl; border: 1px solid var(--border-strong); border-right: none;
  background: var(--surface); color: var(--text-primary); font-size: 11px; font-weight: 600;
  padding: 12px 7px; border-radius: 8px 0 0 8px; cursor: pointer;
}
.rs-panel--slide {
  position: absolute; right: 0; top: 0; bottom: 0; z-index: 2; width: 74%; max-width: 260px;
  border-radius: 0; transform: translateX(100%); transition: transform 220ms ease;
}
[data-open="true"] .rs-panel--slide { transform: translateX(0); }

/* tab */
.rs-launcher--tab {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 3;
  writing-mode: vertical-rl; border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: #fff;
  font-size: 11px; font-weight: 600; padding: 14px 8px; border-radius: 8px 0 0 8px; cursor: pointer;
}
.rs-panel--tab {
  position: absolute; right: 0; top: 50%; z-index: 2; width: 230px; height: 280px;
  border-radius: 12px 0 0 12px; transform: translate(100%, -50%); opacity: 0; pointer-events: none;
  transition: transform 220ms ease, opacity 220ms ease;
}
[data-open="true"] .rs-panel--tab { transform: translate(0, -50%); opacity: 1; pointer-events: auto; }

/* inline */
.rs-panel--inline {
  position: absolute; right: 16px; top: 16px; bottom: 16px; z-index: 2; width: 190px; border-radius: 10px;
}

/* dock -- .rs-panel--dock is the positioned container itself (not nested inside a
   button, unlike the other styles) so a real iframe never ends up inside a <button>'s
   content model, which real browsers handle inconsistently for focus/tab order. */
.rs-panel--dock {
  position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 3;
  border-radius: 14px; border: 1px solid var(--border-strong);
  max-height: 46px; transition: max-height 220ms ease;
  flex-direction: column;
}
[data-open="true"] .rs-panel--dock { max-height: 300px; }
.rs-panel--dock iframe { display: none; flex: 1; min-height: 0; }
[data-open="true"] .rs-panel--dock iframe { display: block; }
.rs-dock-bar {
  display: flex; align-items: center; gap: 8px; background: var(--surface); border: none;
  border-radius: 999px; padding: 10px 14px; font-size: 12px; color: var(--text-muted); cursor: pointer; flex-shrink: 0;
}
.rs-dock-input { flex: 1; text-align: left; }
.rs-dock-send { color: var(--accent); font-weight: 700; }

/* palette */
.rs-launcher--palette {
  position: absolute; right: 16px; bottom: 16px; z-index: 3; border: 1px solid var(--border-strong); background: var(--surface);
  border-radius: 999px; padding: 8px 14px; cursor: pointer; font-size: 11px; color: var(--text-secondary);
  box-shadow: 0 4px 12px rgba(20, 17, 13, 0.1);
}
.rs-scrim {
  position: absolute; inset: 0; z-index: 2; background: rgba(20, 17, 13, 0.32);
  opacity: 0; pointer-events: none; transition: opacity 180ms ease;
}
[data-open="true"] .rs-scrim { opacity: 1; pointer-events: auto; }
.rs-panel--palette {
  position: absolute; left: 50%; top: 40px; z-index: 3; width: 78%; max-width: 280px; height: 320px; border-radius: 12px;
  transform: translate(-50%, -8px) scale(0.96); opacity: 0; pointer-events: none; transition: transform 180ms ease, opacity 180ms ease;
}
[data-open="true"] .rs-panel--palette { transform: translate(-50%, 0) scale(1); opacity: 1; pointer-events: auto; }

/* sheet */
.rs-launcher--sheet {
  position: absolute; right: 16px; bottom: 16px; z-index: 3; border: none; border-radius: 999px; cursor: pointer;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: #fff; font-size: 12px; font-weight: 600; padding: 10px 16px;
  box-shadow: 0 8px 18px rgba(20, 17, 13, 0.22);
}
.rs-panel--sheet {
  position: absolute; inset: 0; z-index: 4; border-radius: 18px 18px 0 0; border: none;
  transform: translateY(100%); transition: transform 240ms cubic-bezier(.22,1,.36,1);
}
[data-open="true"] .rs-panel--sheet { transform: translateY(0); }
.rs-grabber { width: 32px; height: 4px; border-radius: 999px; background: var(--border-strong); margin: 9px auto 0; flex-shrink: 0; }
.rs-panel-body { flex: 1; display: flex; min-height: 0; }
.rs-panel-body iframe { flex: 1; }

/* ribbon */
.rs-launcher--ribbon {
  position: absolute; left: 0; right: 0; top: 0; z-index: 3; border: none; border-bottom: 1px solid var(--border-strong);
  background: var(--surface-warm); color: var(--accent-dark); font-size: 12px; font-weight: 600; padding: 9px; cursor: pointer;
}
.rs-panel--ribbon {
  position: absolute; left: 0; right: 0; top: 38px; z-index: 2; border-radius: 0; border-top: none; max-height: 0;
  transition: max-height 240ms ease;
}
[data-open="true"] .rs-panel--ribbon { max-height: 280px; }

/* link */
.rs-launcher--link {
  position: absolute; right: 16px; bottom: 14px; z-index: 3; border: none; background: none; cursor: pointer;
  font-size: 11px; color: var(--text-secondary); padding: 3px 1px; border-bottom: 1px solid var(--border-strong);
}
.rs-panel--link {
  position: absolute; right: 16px; bottom: 42px; z-index: 2; width: 230px; height: 260px; border-radius: 9px;
  opacity: 0; transform: translateY(6px); pointer-events: none; transition: opacity 150ms ease, transform 150ms ease;
}
[data-open="true"] .rs-panel--link { opacity: 1; transform: translateY(0); pointer-events: auto; }
`;
