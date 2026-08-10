"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const VARIANT_CLASSES = {
  // Default -- most call sites sit on a light surface (bg-surface / bg-surface-muted).
  light: "border-border-strong bg-surface text-ink-secondary hover:bg-surface-muted hover:text-ink",
  // Opt-in for the handful of dark containers (e.g. the widget install snippet's bg-sidebar/bg-ink boxes).
  dark: "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
} as const;

export function CopySnippetButton({ text, variant = "light" }: { text: string; variant?: keyof typeof VARIANT_CLASSES }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-180 ${VARIANT_CLASSES[variant]}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
