"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, MessageCircle, Search, Send, X } from "lucide-react";
import {
  EMPTY_LIBRARY_FILTERS,
  RESOURCE_TYPE_LABELS,
  buildLibraryFacets,
  filterLibraryItems,
  normalizeKey,
  scriptureBook,
  type ChatResponse,
  type FacetOption,
  type LibraryFilters,
  type LibraryItem,
  type ResourceTypeValue,
} from "@ruach/shared-types";
import { hexToRgba } from "../../../../lib/color";

interface SermonLibraryProps {
  publicWidgetId: string;
  organizationName: string;
  inputPlaceholder: string;
  suggestedPrompts: string[];
  primaryColor: string;
  showPlatformBranding: boolean;
  items: LibraryItem[];
  host: string | null;
  showChat: boolean;
}

interface ChatTurn {
  id: string;
  question: string;
  response: ChatResponse | null;
  error: string | null;
}

const PAGE_SIZE = 12;

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${Math.max(minutes, 1)} min`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 === 0 ? `${hours} hr` : `${hours} hr ${minutes % 60} min`;
}

function buttonLabel(type: ResourceTypeValue): string {
  if (type === "AUDIO" || type === "PODCAST") return "Listen";
  if (type === "DEVOTIONAL" || type === "ARTICLE") return "Read";
  if (type === "DOCUMENT" || type === "OTHER") return "Open";
  return "Watch";
}

/**
 * Tells sermon-library.js how tall the content is so the host page's iframe can grow
 * to fit -- an embed that lives in the page's own flow (unlike the chat launcher's
 * fixed panel) shouldn't have its own scrollbar.
 */
function useReportHeight(ref: React.RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof ResizeObserver === "undefined") return;
    let last = 0;
    const report = () => {
      // The content element, not documentElement.scrollHeight -- the document is
      // always at least as tall as the iframe itself, so measuring it could only
      // ever grow the iframe, never shrink it after a filter narrows the results.
      const height = Math.ceil(element.getBoundingClientRect().height);
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: "ruach:library-height", height }, "*");
    };
    const observer = new ResizeObserver(report);
    observer.observe(element);
    report();
    return () => observer.disconnect();
  }, [ref, enabled]);
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
  primaryColor,
}: {
  label: string;
  allLabel: string;
  value: string | null;
  options: FacetOption[];
  onChange: (value: string | null) => void;
  primaryColor: string;
}) {
  // A dropdown with a single choice (or none) filters nothing -- hide it, unless
  // it's the active filter, which must stay visible so it can be cleared.
  if (options.length < 2 && !value) return null;
  return (
    <label className="flex min-w-0 flex-col gap-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full min-w-0 rounded-md border border-border-strong bg-surface px-2.5 py-2 text-sm normal-case tracking-normal text-ink outline-none"
        style={value ? { borderColor: primaryColor } : undefined}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

export function SermonLibrary(props: SermonLibraryProps) {
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  useReportHeight(rootRef, props.host !== null);

  useEffect(() => {
    const key = `ruach_library_session_${props.publicWidgetId}`;
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return setSessionId(existing);
      const id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
      setSessionId(id);
    } catch {
      // Storage blocked (third-party iframe in a privacy-strict browser) -- a
      // per-page-view session still lets the chat work.
      setSessionId(crypto.randomUUID());
    }
  }, [props.publicWidgetId]);

  const results = useMemo(() => filterLibraryItems(props.items, filters), [props.items, filters]);
  const facets = useMemo(() => buildLibraryFacets(props.items, filters), [props.items, filters]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof LibraryFilters; label: string }> = [];
    const labelFor = (options: FacetOption[], value: string | null) =>
      options.find((o) => o.value === value)?.label ?? value ?? "";
    if (filters.query.trim()) chips.push({ key: "query", label: `“${filters.query.trim()}”` });
    if (filters.speaker) chips.push({ key: "speaker", label: labelFor(facets.speakers, filters.speaker) });
    if (filters.topic) chips.push({ key: "topic", label: labelFor(facets.topics, filters.topic) });
    if (filters.book) chips.push({ key: "book", label: labelFor(facets.books, filters.book) });
    if (filters.verse) chips.push({ key: "verse", label: labelFor(facets.verses, filters.verse) });
    if (filters.messageType) chips.push({ key: "messageType", label: labelFor(facets.messageTypes, filters.messageType) });
    if (filters.type) chips.push({ key: "type", label: RESOURCE_TYPE_LABELS[filters.type] });
    if (filters.series) chips.push({ key: "series", label: `Series: ${labelFor(facets.series, filters.series)}` });
    return chips;
  }, [filters, facets]);

  function update(patch: Partial<LibraryFilters>) {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      // A verse only means something inside its book.
      if ("book" in patch && patch.book !== prev.book) next.verse = null;
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilter(key: keyof LibraryFilters) {
    update(key === "query" ? { query: "" } : key === "book" ? { book: null, verse: null } : { [key]: null });
  }

  function filterByScripture(reference: string) {
    const book = scriptureBook(reference);
    update({ book: book ? normalizeKey(book) : null, verse: normalizeKey(reference) });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function ask(text: string) {
    const question = text.trim();
    if (!question || !sessionId || isAsking) return;
    const turnId = crypto.randomUUID();
    setChatTurns((prev) => [...prev, { id: turnId, question, response: null, error: null }]);
    setChatInput("");
    setIsAsking(true);
    const settle = (patch: Partial<ChatTurn>) =>
      setChatTurns((prev) => prev.map((turn) => (turn.id === turnId ? { ...turn, ...patch } : turn)));
    try {
      // The same chat endpoint (and ChatPipeline) the assistant widget uses -- one
      // matching brain, one conversation log, one usage meter.
      const hostParam = props.host ? `?host=${encodeURIComponent(props.host)}` : "";
      const res = await fetch(`/api/widget/${props.publicWidgetId}/chat${hostParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicWidgetId: props.publicWidgetId, sessionId, message: question }),
      });
      if (!res.ok) {
        settle({
          error:
            res.status === 429
              ? "You've asked quite a few questions in a short time. Please wait a moment and try again."
              : "We couldn't search the library right now. Please try again shortly.",
        });
        return;
      }
      settle({ response: (await res.json()) as ChatResponse });
    } catch {
      settle({ error: "Something went wrong sending that. Please check your connection and try again." });
    } finally {
      setIsAsking(false);
    }
  }

  const hasFilters = activeChips.length > 0;
  const brandTint = hexToRgba(props.primaryColor, 0.08);

  return (
    <main ref={rootRef} className="mx-auto w-full max-w-6xl bg-surface px-4 py-5 text-ink sm:px-6">
      {props.showChat && (
        <section className="mb-6 rounded-lg border border-border p-4 sm:p-5" style={{ backgroundColor: brandTint }}>
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle size={16} style={{ color: props.primaryColor }} />
            <h2 className="text-sm font-semibold">Not sure where to start?</h2>
          </div>
          <p className="mb-3 text-sm text-ink-secondary">
            Tell us what you&rsquo;re going through or what you want to learn about, and we&rsquo;ll point you to the
            right message.
          </p>

          {chatTurns.length > 0 && (
            <div className="mb-4 flex flex-col gap-4">
              {chatTurns.map((turn) => (
                <div key={turn.id} className="flex flex-col gap-2">
                  <p className="self-end rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm text-white" style={{ backgroundColor: props.primaryColor }}>
                    {turn.question}
                  </p>
                  {!turn.response && !turn.error && (
                    <div className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-surface px-3.5 py-3" aria-label="Searching">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
                    </div>
                  )}
                  {turn.error && (
                    <p className="w-fit rounded-2xl rounded-tl-sm border border-danger/30 bg-danger-bg px-3.5 py-2 text-sm text-danger">
                      {turn.error}
                    </p>
                  )}
                  {turn.response && (
                    <div className="flex flex-col gap-2">
                      <p className="w-fit max-w-full rounded-2xl rounded-tl-sm bg-surface px-3.5 py-2 text-sm">
                        {turn.response.acknowledgment ? `${turn.response.acknowledgment} ` : ""}
                        {turn.response.answer}
                      </p>
                      {turn.response.resources.length > 0 && (
                        <div className="grid gap-2 sm:grid-cols-3">
                          {turn.response.resources.map((resource) => (
                            <a
                              key={resource.resourceId}
                              href={resource.publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex gap-3 rounded-md border border-border bg-surface p-2.5 transition-shadow duration-180 hover:shadow-panel"
                            >
                              {resource.thumbnailUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resource.thumbnailUrl} alt="" className="h-14 w-24 shrink-0 rounded object-cover" />
                              )}
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium">{resource.title}</p>
                                <p className="mt-0.5 truncate text-xs text-ink-muted">
                                  {[resource.speakerName, resource.durationLabel].filter(Boolean).join(" · ")}
                                </p>
                                {resource.relevanceExplanation && (
                                  <p className="mt-1 line-clamp-2 text-xs text-ink-secondary">{resource.relevanceExplanation}</p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                      {turn.response.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {turn.response.suggestedActions.map((action, index) =>
                            action.url ? (
                              <a
                                key={`${action.label}-${index}`}
                                href={action.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-white"
                                style={{ backgroundColor: props.primaryColor }}
                              >
                                {action.label} <ArrowUpRight size={12} />
                              </a>
                            ) : null,
                          )}
                        </div>
                      )}
                      {turn.response.followUpQuestion && (
                        <button
                          type="button"
                          onClick={() => ask(turn.response!.followUpQuestion!)}
                          className="w-fit rounded-full border border-border-strong bg-surface px-3 py-1.5 text-left text-xs text-ink-secondary hover:text-ink"
                        >
                          {turn.response.followUpQuestion}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(chatInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={props.inputPlaceholder || "Ask a question..."}
              aria-label="Ask a question"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={isAsking || !chatInput.trim()}
              aria-label="Ask"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: props.primaryColor }}
            >
              <Send size={16} />
            </button>
          </form>
          {chatTurns.length === 0 && props.suggestedPrompts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {props.suggestedPrompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs text-ink-secondary hover:text-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section aria-label="Filter messages" className="mb-4">
        <label className="relative mb-3 block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search by title, speaker, topic or verse"
            aria-label="Search messages"
            className="w-full rounded-md border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-sm outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <FilterSelect label="Speaker" allLabel="All speakers" value={filters.speaker} options={facets.speakers} onChange={(speaker) => update({ speaker })} primaryColor={props.primaryColor} />
          <FilterSelect label="Subject" allLabel="All subjects" value={filters.topic} options={facets.topics} onChange={(topic) => update({ topic })} primaryColor={props.primaryColor} />
          <FilterSelect label="Scripture" allLabel="All books" value={filters.book} options={facets.books} onChange={(book) => update({ book })} primaryColor={props.primaryColor} />
          {filters.book && (
            <FilterSelect label="Key verse" allLabel="Any verse" value={filters.verse} options={facets.verses} onChange={(verse) => update({ verse })} primaryColor={props.primaryColor} />
          )}
          <FilterSelect label="Message type" allLabel="All message types" value={filters.messageType} options={facets.messageTypes} onChange={(messageType) => update({ messageType })} primaryColor={props.primaryColor} />
          <FilterSelect
            label="Format"
            allLabel="All formats"
            value={filters.type}
            options={facets.types}
            onChange={(type) => update({ type: type as ResourceTypeValue | null })}
            primaryColor={props.primaryColor}
          />
          <FilterSelect label="Series" allLabel="All series" value={filters.series} options={facets.series} onChange={(series) => update({ series })} primaryColor={props.primaryColor} />
        </div>
      </section>

      <div ref={resultsRef} className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-secondary">
          {results.length} {results.length === 1 ? "message" : "messages"}
        </span>
        {activeChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => clearFilter(chip.key)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: hexToRgba(props.primaryColor, 0.12), color: props.primaryColor }}
            aria-label={`Remove filter ${chip.label}`}
          >
            {chip.label} <X size={12} />
          </button>
        ))}
        {hasFilters && (
          <button type="button" onClick={() => update(EMPTY_LIBRARY_FILTERS)} className="text-xs text-ink-muted underline hover:text-ink">
            Clear all
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong px-4 py-10 text-center text-sm text-ink-secondary">
          {props.items.length === 0
            ? "Messages will appear here once they're added to the library."
            : props.showChat
              ? "No messages match those filters. Try removing one, or ask a question above."
              : "No messages match those filters. Try removing one."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, visibleCount).map((item) => (
            <article key={item.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
              <a href={item.publicUrl} target="_blank" rel="noreferrer" className="relative block aspect-video bg-surface-muted">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center" style={{ backgroundColor: brandTint }}>
                    <BookOpen size={28} style={{ color: props.primaryColor }} />
                  </span>
                )}
              </a>
              <div className="flex flex-1 flex-col p-4">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {[RESOURCE_TYPE_LABELS[item.resourceType], formatDate(item.publishedAt), formatDuration(item.durationSeconds)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h3 className="text-base font-semibold leading-snug">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-secondary">
                  {item.speakerName && (
                    <button type="button" onClick={() => update({ speaker: normalizeKey(item.speakerName!) })} className="hover:underline">
                      {item.speakerName}
                    </button>
                  )}
                  {item.speakerName && item.seriesTitle && " · "}
                  {item.seriesTitle && (
                    <button type="button" onClick={() => update({ series: normalizeKey(item.seriesTitle!) })} className="hover:underline">
                      {item.seriesTitle}
                    </button>
                  )}
                </p>
                {item.summary && <p className="mt-2 line-clamp-3 text-sm text-ink-secondary">{item.summary}</p>}
                {(item.scriptures.length > 0 || item.topics.length > 0 || item.messageTypes.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.messageTypes.slice(0, 2).map((messageType) => (
                      <button
                        key={`m-${messageType}`}
                        type="button"
                        onClick={() => update({ messageType: normalizeKey(messageType) })}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: hexToRgba(props.primaryColor, 0.12), color: props.primaryColor }}
                      >
                        {messageType}
                      </button>
                    ))}
                    {item.scriptures.slice(0, 3).map((ref) => (
                      <button
                        key={`v-${ref}`}
                        type="button"
                        onClick={() => filterByScripture(ref)}
                        className="rounded-full border border-border-strong px-2 py-0.5 text-[11px] text-ink-secondary hover:text-ink"
                      >
                        {ref}
                      </button>
                    ))}
                    {[...new Set(item.topics)].slice(0, 3).map((topic) => (
                      <button
                        key={`t-${topic}`}
                        type="button"
                        onClick={() => update({ topic: normalizeKey(topic) })}
                        className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-ink-secondary hover:text-ink"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
                <a
                  href={item.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded px-3.5 py-2 text-xs font-medium text-white"
                  style={{ backgroundColor: props.primaryColor }}
                >
                  {buttonLabel(item.resourceType)} <ArrowUpRight size={13} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {results.length > visibleCount && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink"
          >
            Show more ({results.length - visibleCount} left)
          </button>
        </div>
      )}

      {props.showPlatformBranding && <p className="mt-6 text-center text-[11px] text-ink-muted/70">Powered by Ruach</p>}
    </main>
  );
}
