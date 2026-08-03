"use client";

import { useState } from "react";
import { Check, Code2, Copy, X } from "lucide-react";

const PLATFORMS = [
  { key: "custom", label: "Custom HTML", instructions: "Paste the snippet just before the closing </head> tag." },
  { key: "wordpress", label: "WordPress", instructions: 'In your theme, go to Appearance → Theme Editor → header.php, and paste the snippet before </head>. Or use a "header/footer scripts" plugin if you\'d rather not edit theme files.' },
  { key: "wix", label: "Wix", instructions: "Go to Settings → Custom Code, add a new code snippet, set it to load on all pages in the <head>, and paste the snippet in." },
  { key: "squarespace", label: "Squarespace", instructions: "Go to Settings → Advanced → Code Injection, and paste the snippet into the Header field." },
  { key: "webflow", label: "Webflow", instructions: "Go to Project Settings → Custom Code → Head Code, and paste the snippet in. Publish your site for it to take effect." },
];

export function InstallCodeModal({ snippet, websiteName }: { snippet: string; websiteName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState(PLATFORMS[0]!.key);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const active = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0]!;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-180 hover:bg-surface-muted"
      >
        <Code2 size={13} /> Copy install code
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsOpen(false)}>
          <div
            className="shadow-panel w-full max-w-lg rounded-lg border border-border bg-surface p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Install on {websiteName}</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close" className="text-ink-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlatform(p.key)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors duration-180 ${
                    platform === p.key ? "bg-surface-warm font-medium text-accent-dark" : "text-ink-muted hover:bg-surface-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <p className="mb-3 text-xs text-ink-secondary">{active.instructions}</p>

            <div className="relative">
              <pre className="overflow-x-auto rounded-md bg-sidebar p-3 text-xs text-white/80">{snippet}</pre>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-2 inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
