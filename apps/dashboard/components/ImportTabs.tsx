"use client";

import { useState } from "react";
import { Newspaper, Sparkles, Video } from "lucide-react";
import { BulkImportForm, type BulkImportSummary } from "./BulkImportForm";
import { ImportResourceForm } from "./ImportResourceForm";

type Tab = "url" | "channel" | "feed";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "url", label: "Paste a URL", icon: <Sparkles size={14} /> },
  { key: "channel", label: "YouTube channel", icon: <Video size={14} /> },
  { key: "feed", label: "RSS feed", icon: <Newspaper size={14} /> },
];

interface ImportTabsProps {
  importResourceAction: (formData: FormData) => Promise<void>;
  importChannelAction: (formData: FormData) => Promise<BulkImportSummary>;
  importFeedAction: (formData: FormData) => Promise<BulkImportSummary>;
  youtubeApiKeyConfigured: boolean;
  vimeoAccessTokenConfigured: boolean;
}

/**
 * Collapses what used to be 3 separate stacked cards (one per import path) into a
 * single card with a tab strip -- a tab, not an accordion, since hiding 2 of 3 paths
 * behind a click is worse for discoverability than a tab. Reuses the same
 * border-b-2 active-underline visual language already established by the resource
 * type-filter tabs on this page, just as local client state instead of URL-driven
 * navigation (switching import method shouldn't change the URL or reload data).
 */
export function ImportTabs({
  importResourceAction,
  importChannelAction,
  importFeedAction,
  youtubeApiKeyConfigured,
  vimeoAccessTokenConfigured,
}: ImportTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  return (
    <div>
      <div className="mb-4 flex items-center gap-5 border-b border-border" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-sm transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                isActive ? "border-accent font-medium text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "url" && (
        <div>
          <p className="mb-3 text-sm text-ink-secondary">
            Paste a YouTube or Vimeo URL, or any other public HTTPS URL.{" "}
            {youtubeApiKeyConfigured ? (
              "YouTube imports use the real YouTube Data API."
            ) : (
              <>
                YouTube is running in mock mode (no{" "}
                <code className="rounded-sm bg-surface-muted px-1 py-0.5 text-xs">YOUTUBE_API_KEY</code> set) -- try{" "}
                <code className="rounded-sm bg-surface-muted px-1 py-0.5 text-xs">
                  https://www.youtube.com/watch?v=mock-yt-anxiety-01
                </code>
                .
              </>
            )}{" "}
            {vimeoAccessTokenConfigured
              ? "Vimeo imports use the real Vimeo API, including real transcripts when available."
              : "Vimeo is running in mock mode (no VIMEO_ACCESS_TOKEN set)."}
          </p>
          <ImportResourceForm action={importResourceAction} />
        </div>
      )}

      {activeTab === "channel" && (
        <div>
          <p className="mb-3 text-sm text-ink-secondary">
            Paste a channel URL (<code className="rounded-sm bg-surface-muted px-1 py-0.5 text-xs">/channel/UC...</code>{" "}
            or <code className="rounded-sm bg-surface-muted px-1 py-0.5 text-xs">/@handle</code>) to import every
            public video on it as draft resources. Safe to re-run -- videos already imported are skipped.
          </p>
          <BulkImportForm
            action={importChannelAction}
            fieldName="channelUrl"
            fieldLabel="Channel URL"
            placeholder="https://www.youtube.com/@somechannel"
            buttonLabel="Import Channel"
            itemNoun="video"
            pendingNote="Importing videos from this channel -- this may take a moment for large channels."
          />
        </div>
      )}

      {activeTab === "feed" && (
        <div>
          <p className="mb-3 text-sm text-ink-secondary">
            Paste a blog or podcast RSS feed URL to import every entry as draft resources. No credentials needed --
            feeds are public. Safe to re-run -- entries already imported are skipped.
          </p>
          <BulkImportForm
            action={importFeedAction}
            fieldName="feedUrl"
            fieldLabel="Feed URL"
            placeholder="https://example.com/feed.xml"
            buttonLabel="Import Feed"
            itemNoun="item"
            pendingNote="Fetching and importing entries from this feed..."
          />
        </div>
      )}
    </div>
  );
}
