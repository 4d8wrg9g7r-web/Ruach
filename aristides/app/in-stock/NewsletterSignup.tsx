"use client";

import { useState } from "react";
import { CTAButton } from "@/components/ui/primitives";

/**
 * Client-side newsletter capture for the in-stock empty state (§27). No backend:
 * a valid email flips the block to a machined confirmation. The point of the
 * empty state is momentum, not a dead ecommerce shelf.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setError(true);
      return;
    }
    setError(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-sm border border-graphite-line bg-graphite-raised/60 p-6">
        <div className="tech-label text-ice">Subscribed</div>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-steel">
          You are on the list. When an instrument is ready to ship, it lands in
          your inbox before it lands anywhere else.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <label htmlFor="stock-alert" className="tech-label block">
        Ready-to-ship alerts
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="stock-alert"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(false);
          }}
          className="min-w-0 flex-1 rounded-sm border border-graphite-line bg-void px-4 py-3 font-mono text-[13px] text-chalk placeholder:text-steel-dim focus:border-steel focus:outline-none"
          aria-invalid={error}
        />
        <CTAButton type="submit" variant="primary">
          Subscribe
        </CTAButton>
      </div>
      {error && (
        <p className="mt-2 font-mono text-[11px] text-steel">
          Enter a valid email address.
        </p>
      )}
    </form>
  );
}
