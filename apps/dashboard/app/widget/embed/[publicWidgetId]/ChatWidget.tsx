"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatResponse } from "@ruach/shared-types";

interface ChatWidgetProps {
  publicWidgetId: string;
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
}

function sessionStorageKey(publicWidgetId: string) {
  return `ruach_session_${publicWidgetId}`;
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
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || !sessionId || isLoading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "USER", text }]);
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
          },
        ]);
        return;
      }

      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [...prev, { id: data.messageId, role: "ASSISTANT", text: data.answer, response: data }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-slate-200 p-4">
        <h1 className="font-semibold" style={{ color: props.primaryColor }}>
          {props.assistantName}
        </h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mb-4 rounded bg-slate-50 p-3 text-sm text-slate-700">{props.welcomeMessage}</div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "USER" ? "text-right" : ""}>
              <div
                className={
                  message.role === "USER"
                    ? "inline-block rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                    : "inline-block rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800"
                }
              >
                {message.text}
              </div>

              {message.response && message.response.resources.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {message.response.resources.map((resource) => (
                    <a
                      key={resource.resourceId}
                      href={resource.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 rounded border border-slate-200 p-3 text-left hover:border-slate-400"
                    >
                      {resource.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resource.thumbnailUrl} alt="" className="h-14 w-24 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{resource.title}</div>
                        <div className="text-xs text-slate-500">
                          {[resource.speakerName, resource.seriesTitle, resource.durationLabel].filter(Boolean).join(" · ")}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">{resource.relevanceExplanation}</div>
                      </div>
                      <span
                        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: props.primaryColor }}
                      >
                        {resource.buttonLabel}
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {message.response?.followUpQuestion && (
                <div className="mt-2 text-sm text-slate-600">{message.response.followUpQuestion}</div>
              )}
            </div>
          ))}
          {isLoading && <div className="text-sm text-slate-400">Thinking...</div>}
        </div>

        {messages.length === 0 && props.suggestedPrompts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {props.suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
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
        className="border-t border-slate-200 p-3"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={props.inputPlaceholder}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: props.primaryColor }}
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{props.privacyNotice}</p>
        {props.showPlatformBranding && <p className="mt-1 text-xs text-slate-300">Powered by Ruach</p>}
      </form>
    </div>
  );
}
