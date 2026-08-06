"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Lock, Send, X } from "lucide-react";
import type { ChatResponse } from "@ruach/shared-types";
import { hexToRgba } from "../../../../lib/color";

interface ActionLinkDisplay {
  id: string;
  label: string;
  url: string;
}

interface ChatWidgetProps {
  publicWidgetId: string;
  organizationName: string;
  assistantName: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  suggestedPrompts: string[];
  primaryColor: string;
  logoUrl: string | null;
  privacyNotice: string;
  showPlatformBranding: boolean;
  actionLinks: ActionLinkDisplay[];
  host: string | null;
}

interface DisplayMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  response?: ChatResponse;
  sentAt: Date;
  /** Distinguishes "the assistant found nothing" (a real, if unhelpful, answer) from "something broke" -- both currently render as a normal-looking assistant bubble otherwise. */
  isError?: boolean;
}

function sessionStorageKey(publicWidgetId: string) {
  return `ruach_session_${publicWidgetId}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Header/message avatar -- shows the org's logo image when set, otherwise the initials circle. */
function Avatar({
  logoUrl,
  organizationName,
  primaryColor,
  size,
}: {
  logoUrl: string | null;
  organizationName: string;
  primaryColor: string;
  size: "md" | "sm";
}) {
  const dimensionClass = size === "md" ? "h-9 w-9 text-xs" : "h-6 w-6 text-[10px]";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={organizationName}
        className={`shrink-0 rounded-full object-cover ${dimensionClass}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${dimensionClass}`}
      style={{ backgroundColor: primaryColor }}
    >
      {initials(organizationName)}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const VISIBLE_LINK_COUNT = 4;

export function ChatWidget(props: ChatWidgetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [linksExpanded, setLinksExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = sessionStorageKey(props.publicWidgetId);
    const existing = window.localStorage.getItem(key);
    if (existing) {
      setSessionId(existing);
    } else {
      const id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
      setSessionId(id);
    }
  }, [props.publicWidgetId]);

  // Scroll so the TOP of the newest message is visible, not the bottom of the whole
  // conversation -- a long answer (acknowledgment + explanation + resource cards)
  // would otherwise jump straight past the text and land on the last card, and the
  // visitor would miss the actual response. They can still scroll down themselves
  // to see everything below it.
  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || !sessionId || isLoading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "USER", text, sentAt: new Date() }]);
    setInput("");
    setIsLoading(true);

    try {
      const hostParam = props.host ? `?host=${encodeURIComponent(props.host)}` : "";
      const res = await fetch(`/api/widget/${props.publicWidgetId}/chat${hostParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicWidgetId: props.publicWidgetId, sessionId, message: text }),
      });

      if (!res.ok) {
        const fallbackText =
          res.status === 429
            ? "You've sent quite a few messages in a short time -- please wait a moment before asking again."
            : "I'm having trouble searching this resource library right now. Please try again shortly.";
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "ASSISTANT", text: fallbackText, sentAt: new Date(), isError: true },
        ]);
        return;
      }

      const data = (await res.json()) as ChatResponse;
      const displayText = data.acknowledgment ? `${data.acknowledgment} ${data.answer}` : data.answer;
      setMessages((prev) => [
        ...prev,
        { id: data.messageId, role: "ASSISTANT", text: displayText, response: data, sentAt: new Date() },
      ]);
    } catch {
      // A raw network failure (offline, DNS, CORS) throws before the res.ok check
      // above ever runs -- without this, the typing dots would just vanish with no
      // message shown at all.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ASSISTANT",
          text: "Something went wrong sending that -- please check your connection and try again.",
          sentAt: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function closePanel() {
    window.parent.postMessage({ type: "ruach:close" }, "*");
  }

  // props.host is only ever set when this page is loaded inside the loader's iframe
  // (widget-loader.js always appends ?host=); a direct visit (the dashboard's "Open
  // full-page preview" link, or a visitor typing the embed URL) has none, so this is
  // a reliable standalone-vs-embedded signal without a new prop. Without the cap, a
  // standalone tab renders the exact same iframe-cramped layout stretched full-bleed.
  const isStandalone = !props.host;

  // `fixed inset-0` rather than `h-screen` (100vh) for the embedded case -- mobile
  // browsers have long-standing bugs computing vh units *inside* a nested iframe,
  // where the value tracks the outer host page's dynamic viewport (which shifts as
  // the address bar/keyboard show and hide) instead of this iframe's own fixed box,
  // making the whole layout appear to drift/resize inside the panel that's hosting
  // it. `position:fixed` sizes against the iframe's own initial containing block
  // regardless of ancestor heights, sidestepping that entirely. Standalone (a real
  // top-level tab, not inside an iframe) doesn't have this problem, so it keeps
  // h-screen.
  return (
    <div
      className={`flex flex-col bg-surface ${
        isStandalone ? "h-screen mx-auto w-full max-w-[480px] border-x border-border" : "fixed inset-0"
      }`}
    >
      <header
        className="flex items-center gap-3 border-b border-border px-5 py-4"
        style={{ backgroundColor: hexToRgba(props.primaryColor, 0.05) }}
      >
        <Avatar logoUrl={props.logoUrl} organizationName={props.organizationName} primaryColor={props.primaryColor} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-ink">{props.organizationName}</h1>
          <p className="truncate text-xs text-ink-muted">We&rsquo;re here to help you find what you need.</p>
        </div>
        <button type="button" onClick={closePanel} aria-label="Close" className="text-ink-muted hover:text-ink">
          <X size={18} />
        </button>
      </header>

      {props.actionLinks.length > 0 && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-border px-5 py-4">
          {(linksExpanded ? props.actionLinks : props.actionLinks.slice(0, VISIBLE_LINK_COUNT)).map((link, index) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-opacity duration-180 hover:opacity-90"
              style={
                index === 0
                  ? { backgroundColor: props.primaryColor, color: "#ffffff" }
                  : { backgroundColor: hexToRgba(props.primaryColor, 0.12), color: props.primaryColor }
              }
            >
              {link.label}
            </a>
          ))}
          {!linksExpanded && props.actionLinks.length > VISIBLE_LINK_COUNT && (
            <button
              type="button"
              onClick={() => setLinksExpanded(true)}
              className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-ink-muted transition-colors duration-180 hover:text-ink"
            >
              or, see more next steps
            </button>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="mb-4 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-secondary">
            {props.welcomeMessage}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={index === messages.length - 1 ? latestMessageRef : undefined}
              className={message.role === "USER" ? "flex justify-end" : "flex items-start gap-2.5"}
            >
              {message.role === "ASSISTANT" && (
                <div className="mt-0.5">
                  <Avatar logoUrl={props.logoUrl} organizationName={props.organizationName} primaryColor={props.primaryColor} size="sm" />
                </div>
              )}
              <div className={message.role === "USER" ? "max-w-[85%]" : "max-w-[85%] flex-1"}>
                {message.role === "ASSISTANT" && (
                  <p className="mb-1 text-xs font-medium text-ink">{props.organizationName}</p>
                )}
                <div
                  className={
                    message.role === "USER"
                      ? "inline-block rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white"
                      : `inline-block rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm ${
                          message.isError ? "border border-danger/30 bg-danger-bg text-danger" : "bg-surface-muted text-ink"
                        }`
                  }
                  style={message.role === "USER" ? { backgroundColor: props.primaryColor } : undefined}
                >
                  {message.text}
                </div>
                <div className={`mt-1 flex items-center gap-1 text-[10px] text-ink-muted ${message.role === "USER" ? "justify-end" : ""}`}>
                  <span>{formatTime(message.sentAt)}</span>
                  {message.role === "USER" && <Check size={10} />}
                </div>

                {message.response && message.response.resources.length > 0 && (
                  <div className="mt-3 flex flex-col gap-3">
                    {message.response.resources.map((resource) => (
                      <div key={resource.resourceId} className="shadow-panel overflow-hidden rounded-lg border border-border bg-surface">
                        {resource.thumbnailUrl && (
                          <div className="relative aspect-video w-full bg-surface-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resource.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="p-3.5">
                          <p className="text-sm font-semibold text-ink">{resource.title}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {[resource.speakerName, resource.seriesTitle && `Series: ${resource.seriesTitle}`, resource.durationLabel]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {resource.relevanceExplanation && (
                            <div className="mt-2.5 rounded-md bg-surface-muted px-2.5 py-2 text-xs text-ink-secondary">
                              <p className="mb-1 font-medium text-ink">Why this matches your question</p>
                              <p className="flex items-start gap-1.5">
                                <Check size={13} className="mt-0.5 shrink-0" style={{ color: props.primaryColor }} />
                                <span>{resource.relevanceExplanation}</span>
                              </p>
                            </div>
                          )}
                          <a
                            href={resource.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs font-medium text-white"
                            style={{ backgroundColor: props.primaryColor }}
                          >
                            {resource.buttonLabel} Now <ArrowUpRight size={13} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.response?.followUpQuestion && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Follow up</p>
                    <button
                      onClick={() => sendMessage(message.response!.followUpQuestion!)}
                      style={{ "--brand-color": props.primaryColor } as React.CSSProperties}
                      className="rounded-full border border-border-strong px-3 py-1.5 text-xs text-ink-secondary transition-colors duration-180 hover:border-[color:var(--brand-color)] hover:text-[color:var(--brand-color)]"
                    >
                      {message.response.followUpQuestion}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2.5">
              <Avatar logoUrl={props.logoUrl} organizationName={props.organizationName} primaryColor={props.primaryColor} size="sm" />
              <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-surface-muted px-3.5 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
              </div>
            </div>
          )}
        </div>

        {messages.length === 0 && props.suggestedPrompts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {props.suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                style={{ "--brand-color": props.primaryColor } as React.CSSProperties}
                className="rounded-full border border-border-strong px-3 py-1.5 text-xs text-ink-secondary transition-colors duration-180 hover:border-[color:var(--brand-color)] hover:text-[color:var(--brand-color)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-border p-3.5"
      >
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder={props.inputPlaceholder}
            style={isInputFocused ? { borderColor: props.primaryColor } : undefined}
            className="flex-1 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-180"
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-180 hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: props.primaryColor }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1" title={props.privacyNotice}>
            <Lock size={10} /> Answers come from {props.organizationName}&rsquo;s approved resources.
          </span>
          <span className="shrink-0 font-medium" style={{ color: props.primaryColor }}>
            Privacy
          </span>
        </div>
        {props.showPlatformBranding && <p className="mt-1 text-[11px] text-ink-muted/70">Powered by Ruach</p>}
      </form>
    </div>
  );
}
