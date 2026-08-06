"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 1000;

/**
 * Bridges the gap between "Stripe redirected back after a successful payment" and
 * "the webhook has actually created the organization" -- the webhook is nearly
 * instant but not synchronous with the redirect, so this polls rather than assuming
 * the org exists yet. Same polling technique as ResourcesTable's BulkJob progress.
 */
export default function SignupFinishingPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(async () => {
      const res = await fetch("/api/signup/status");
      if (cancelled || !res.ok) return;
      const data = await res.json();
      if (data.ready) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <Loader2 size={28} className="mb-4 animate-spin text-accent" />
      <h1 className="mb-1 text-lg font-semibold text-ink">Setting up your account...</h1>
      <p className="text-sm text-ink-secondary">This only takes a few seconds. Don&rsquo;t close this page.</p>
    </main>
  );
}
