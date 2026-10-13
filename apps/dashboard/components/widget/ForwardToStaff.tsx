"use client";

import { useState } from "react";

export interface ForwardValues {
  name: string;
  email: string;
  note: string;
}

/** POSTs to the widget's /forward route. Resolves to null on success, or a visitor-facing error message. */
export async function submitForwardToStaff(params: ForwardValues & {
  publicWidgetId: string;
  sessionId: string;
  host: string | null;
}): Promise<string | null> {
  try {
    const hostParam = params.host ? `?host=${encodeURIComponent(params.host)}` : "";
    const res = await fetch(`/api/widget/${params.publicWidgetId}/forward${hostParam}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicWidgetId: params.publicWidgetId,
        sessionId: params.sessionId,
        name: params.name,
        email: params.email,
        note: params.note.trim() || undefined,
      }),
    });
    if (res.ok) return null;
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return data?.error ?? "We couldn't forward that right now. Please try again shortly.";
  } catch {
    return "Something went wrong sending that. Please check your connection and try again.";
  }
}

/**
 * Inline form behind a NO_RESULTS reply's "Forward to staff" button. The visitor is
 * anonymous to the chat, so this is the one place they give a name and email --
 * staff reply to that address directly (see the /forward route's replyTo).
 */
export function ForwardForm({
  primaryColor,
  isSending,
  error,
  onSubmit,
  onCancel,
}: {
  primaryColor: string;
  isSending: boolean;
  error?: string;
  onSubmit: (values: ForwardValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const fieldClass =
    "w-full rounded border border-border-strong bg-surface px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none";
  return (
    <form
      className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, email, note });
      }}
    >
      <p className="text-xs text-ink-secondary">Where should our staff reply?</p>
      <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={fieldClass} />
      <input required type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={fieldClass} />
      <textarea maxLength={1000} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else they should know? (optional)" className={fieldClass} />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {isSending ? "Sending..." : "Send to staff"}
        </button>
        <button type="button" onClick={onCancel} className="px-2 py-2 text-xs text-ink-muted hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}


/**
 * Self-contained "Forward to staff" button -> form -> confirmation, for a surface
 * (the sermon library) that doesn't thread forwarding state through its own chat log.
 */
export function ForwardToStaffOffer({
  label,
  publicWidgetId,
  sessionId,
  host,
  primaryColor,
}: {
  label: string;
  publicWidgetId: string;
  sessionId: string | null;
  host: string | null;
  primaryColor: string;
}) {
  const [state, setState] = useState<
    { status: "idle" } | { status: "open"; error?: string } | { status: "sending" } | { status: "sent"; name: string; email: string }
  >({ status: "idle" });

  if (state.status === "sent") {
    return (
      <p className="text-sm text-ink-secondary">
        Thanks, {state.name}! I&rsquo;ve forwarded our conversation to our staff, and someone will reply to you at {state.email}.
      </p>
    );
  }
  if (state.status === "idle") {
    return (
      <button
        type="button"
        onClick={() => setState({ status: "open" })}
        className="inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {label}
      </button>
    );
  }
  return (
    <ForwardForm
      primaryColor={primaryColor}
      isSending={state.status === "sending"}
      error={state.status === "open" ? state.error : undefined}
      onCancel={() => setState({ status: "idle" })}
      onSubmit={async (values) => {
        if (!sessionId) return;
        setState({ status: "sending" });
        const error = await submitForwardToStaff({ publicWidgetId, sessionId, host, ...values });
        setState(error ? { status: "open", error } : { status: "sent", name: values.name, email: values.email });
      }}
    />
  );
}
