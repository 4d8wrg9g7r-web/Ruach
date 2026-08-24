"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { groupRepeatedText, timeAgo } from "../../lib/format";

interface RecentQuestionRow {
  question: string;
  askedAt: Date;
  outcome: "matched" | "no_match" | "pending";
}

const OUTCOME_LABEL: Record<RecentQuestionRow["outcome"], string> = {
  matched: "Matched",
  no_match: "No match",
  pending: "Pending",
};

const OUTCOME_VARIANT: Record<
  RecentQuestionRow["outcome"],
  "success" | "warning" | "neutral"
> = {
  matched: "success",
  no_match: "warning",
  pending: "neutral",
};

/** Client-side filter only -- the full recent-questions window is already fetched server-side, so no extra round trip is needed just to narrow what's on screen. */
export function RecentQuestionsList({
  questions,
}: {
  questions: RecentQuestionRow[];
}) {
  const [query, setQuery] = useState("");
  const grouped = useMemo(
    () =>
      groupRepeatedText(
        questions,
        (q) => q.question,
        (q) => q.askedAt,
      ),
    [questions],
  );
  const filtered = query.trim()
    ? grouped.filter((q) =>
        q.display.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : grouped;

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search questions..."
          className="pl-9"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          {questions.length === 0
            ? "No questions in this window yet."
            : "No questions match your search."}
        </p>
      ) : (
        <ul className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto">
          {filtered.map((q, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-4 py-2.5 text-sm"
            >
              <span className="text-ink">
                {q.display}
                {q.count > 1 && (
                  <span className="ml-1.5 text-xs text-ink-muted">
                    &times;{q.count}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge variant={OUTCOME_VARIANT[q.mostRecent.outcome]}>
                  {OUTCOME_LABEL[q.mostRecent.outcome]}
                </Badge>
                <span className="text-xs text-ink-muted">
                  {timeAgo(q.mostRecent.askedAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
