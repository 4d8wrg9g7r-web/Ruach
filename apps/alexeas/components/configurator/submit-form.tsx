"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { getModel } from "@/lib/data/models";
import { summaryRows, totalPrice, buildRange, formatUSD, type Configuration } from "@/lib/config/engine";

const inputClass =
  "w-full bg-warmwhite border border-brass/30 px-4 py-3 font-sans text-ink placeholder:text-ink-muted/60 focus:border-brass outline-none transition-colors";
const labelClass = "block font-sans text-xs uppercase tracking-wider2 text-ink-muted mb-2";

/**
 * The closing step. Not "add to cart" — a message to the workshop carrying the
 * full specification. With no backend wired, submitting composes a complete
 * email to the shop (spec + contact + shareable link) so the build actually
 * reaches someone, and confirms on-page with the saved link.
 */
export function SubmitForm({
  config,
  shareUrl,
  reference,
}: {
  config: Configuration;
  shareUrl: string;
  reference: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const model = getModel(config.model);

  const specText = summaryRows(config)
    .map((r) => `  ${r.label}: ${r.value}`)
    .join("\n");
  const [lo, hi] = buildRange(config);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `A build from the Alexeas configurator — reference ${reference}`,
      "",
      "SPECIFICATION",
      specText,
      "",
      `Estimated commission: ${formatUSD(totalPrice(config))}`,
      `Estimated build time: ${lo}–${hi} months`,
      `Saved build: ${shareUrl}`,
      "",
      "ABOUT ME",
      `  Name: ${data.get("name")}`,
      `  Email: ${data.get("email")}`,
      `  Phone: ${data.get("phone") || "—"}`,
      `  Country: ${data.get("country")}`,
      `  Primary playing style: ${data.get("style")}`,
      `  Current favorite guitar: ${data.get("favorite") || "—"}`,
      "",
      "NOTES",
      `  ${data.get("notes") || "—"}`,
    ].join("\n");

    const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(
      `Build ${reference} — ${model?.name}`
    )}&body=${encodeURIComponent(body)}`;
    // Open the composer as a real submission path in the absence of a backend.
    window.location.href = mailto;
    setSubmitted(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; the link is shown in full below */
    }
  };

  if (submitted) {
    return (
      <div className="border border-brass/30 bg-plaster p-8 text-center sm:p-12">
        <p className="overline mx-auto">This is the beginning</p>
        <h3 className="mt-4 font-serif text-3xl text-espresso">Thank you.</h3>
        <p className="mx-auto mt-4 max-w-md font-sans leading-relaxed text-ink-soft">
          Your configuration is on its way to the workshop. If your email client
          didn’t open, write to{" "}
          <a href={`mailto:${SITE.email}`} className="text-wood underline">
            {SITE.email}
          </a>{" "}
          and include your build reference below. {SITE.maker} will be in touch to
          begin the conversation.
        </p>
        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2">
          <p className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">
            Build reference
          </p>
          <p className="font-serif text-2xl text-espresso">{reference}</p>
          <button onClick={copyLink} className="btn-ghost mt-3 !py-2 !text-[0.7rem]">
            {copied ? "Link copied" : "Copy saved-build link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input id="name" name="name" required className={inputClass} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required className={inputClass} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone (optional)</label>
          <input id="phone" name="phone" className={inputClass} autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>Country</label>
          <input id="country" name="country" required className={inputClass} autoComplete="country-name" />
        </div>
      </div>
      <div>
        <label htmlFor="style" className={labelClass}>Primary playing style</label>
        <input id="style" name="style" placeholder="Fingerstyle, flatpicking, singer-songwriter…" className={inputClass} />
      </div>
      <div>
        <label htmlFor="favorite" className={labelClass}>Current favorite guitar</label>
        <input id="favorite" name="favorite" placeholder="What are you playing now?" className={inputClass} />
      </div>
      <div>
        <label htmlFor="notes" className={labelClass}>Anything Alexeas should know?</label>
        <textarea id="notes" name="notes" rows={4} className={inputClass} />
      </div>
      <button type="submit" className="btn-primary w-full sm:w-auto">
        Send My Configuration to Alexeas →
      </button>
    </form>
  );
}
