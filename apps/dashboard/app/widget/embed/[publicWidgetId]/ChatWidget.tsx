"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Lock, Send, X } from "lucide-react";
import type { ChatResponse } from "@ruach/shared-types";

interface ChatWidgetProps {
  publicWidgetId: string;
  organizationName: string;
  assistantName: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  suggestedPrompts: string[];
  primaryColor: string;
  privacyNotice: string;
  showPlatformBranding: boolean;
  host: string | null;
}

interface DisplayMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
  response?: ChatResponse;
  sentAt: Date;
}

function sessionStorageKey(publicWidgetId: string) {
  return `ruach_session_${publicWidgetId}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ChatWidget(props: ChatWidgetProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

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
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "ASSISTANT",
            text: "I'm having trouble searching this resource library right now. Please try again shortly.",
            sentAt: new Date(),
          },
        ]);
        return;
      }

      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { id: data.messageId, role: "ASSISTANT", text: data.answer, response: data, sentAt: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function closePanel() {
    window.parent.postMessage({ type: "ruach:close" }, "*");
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: props.primaryColor }}
        >
          {initials(props.organizationName)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-ink">{props.organizationName}</h1>
          <p className="truncate text-xs text-ink-muted">We&rsquo;re here to help you find what you need.</p>
        </div>
        <button type="button" onClick={closePanel} aria-label="Close" className="text-ink-muted hover:text-ink">
          <X size={18} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="mb-4 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-secondary">
            {props.welcomeMessage}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "USER" ? "flex justify-end" : "flex items-start gap-2.5"}>
              {message.role === "ASSISTANT" && (
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: props.primaryColor }}
                >
                  {initials(props.organizationName)}
                </span>
              )}
              <div className={message.role === "USER" ? "max-w-[85%]" : "max-w-[85%] flex-1"}>
                {message.role === "ASSISTANT" && (
                  <p className="mb-1 text-xs font-medium text-ink">{props.organizationName}</p>
                )}
                <div
                  className={
                    message.role === "USER"
                      ? "inline-block rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white"
                      : "inline-block rounded-2xl rounded-tl-sm bg-surface-muted px-3.5 py-2.5 text-sm text-ink"
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
                                <Check size={13} className="mt-0.5 shrink-0 text-success" />
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
                      className="rounded-full border border-border-strong px-3 py-1.5 text-xs text-ink-secondary transition-colors duration-180 hover:border-accent hover:text-accent"
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
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: props.primaryColor }}
              >
                {initials(props.organizationName)}
              </span>
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
                className="rounded-full border border-border-strong px-3 py-1.5 text-xs text-ink-secondary transition-colors duration-180 hover:border-accent hover:text-accent"
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
            placeholder={props.inputPlaceholder}
            className="flex-1 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus:border-accent"
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
          <span className="shrink-0 font-medium text-accent">Privacy</span>
        </div>
        {props.showPlatformBranding && <p className="mt-1 text-[11px] text-ink-muted/70">Powered by Ruach</p>}
      </form>
    </div>
  );
}
