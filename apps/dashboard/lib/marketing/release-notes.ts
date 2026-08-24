/**
 * Content for /release-notes -- same pattern as pricing-data.ts and llms-pages.ts:
 * page copy lives here, not inline in the page component, so updating an entry never
 * means touching layout/markup.
 *
 * FORMAT FOR FUTURE ENTRIES:
 *   - Add new entries to the TOP of RELEASE_NOTES (reverse chronological), for
 *     readability of this file -- the page itself re-sorts by date and groups by
 *     month regardless of array order, so an entry added out of order still renders
 *     correctly, but keeping the source in order makes diffs easy to read.
 *   - date: "YYYY-MM-DD", the day the change went live in production (not the day it
 *     was written or merged).
 *   - headline: a short, specific verb phrase, sentence case, no trailing period --
 *     "Added content-type priority for chat answers", not "New feature!" or
 *     "Content Priority". Say what changed, not that something changed.
 *   - detail: 2-3 sentences, plain language (this page is customer-facing, not a
 *     commit log) -- what changed, and why it matters to someone running a church
 *     website. Skip internal-only changes (CI, dependency bumps, refactors, bug
 *     fixes with no visible behavior change) unless a customer would actually have
 *     noticed -- a crash or an incorrect result is worth a short, honest entry; a
 *     migration-tooling fix or a code-organization change is not.
 *   - One entry per shipped change, even if several went out the same day -- don't
 *     bundle unrelated changes into one headline.
 */
export interface ReleaseNote {
  date: string;
  headline: string;
  detail: string;
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    date: "2026-08-24",
    headline: "Added a warm reply for greetings and small talk",
    detail:
      'A visitor who just says "hi" or "thanks" used to get the same "I couldn\'t find that" message as a failed search. The assistant now replies warmly, explains what it can help with, and suggests a real question to try -- pulled from your configured suggested questions when you\'ve set any.',
  },
  {
    date: "2026-08-12",
    headline: "Fixed a crash on an invalid link in resource import",
    detail:
      "Pasting text that wasn't a valid URL into the single-link import tab on the Resources page could crash the page instead of explaining what was wrong. It now shows a clear, dismissable message so you can fix the link and try again.",
  },
  {
    date: "2026-08-11",
    headline: "Added content priority for chat answers",
    detail:
      'Choose one resource type -- videos, podcasts, articles, or documents -- to always rank first in the assistant\'s answers, no matter how closely other resources match. Leave it on "No priority" to keep the default relevance-based ranking.',
  },
  {
    date: "2026-08-10",
    headline: "Added Testimonies to the Prayer Wall",
    detail:
      "Alongside prayer requests, visitors can now share testimonies of answered prayer, moderated by your team the same way requests are. It lives on the same Prayer Wall page and carries the same branding, so there's nothing new to set up beyond turning it on.",
  },
  {
    date: "2026-08-10",
    headline: "Added Organizational Links for direct-answer questions",
    detail:
      'Not every question is a content request -- "where can I find the notes?" deserves a link, not a recommended sermon. Organizational Links let you add navigational links from the Resources page that the assistant can hand a visitor directly, kept separate from your content library and from the widget\'s quick-action buttons.',
  },
  {
    date: "2026-08-10",
    headline: "Added guided setup wizards",
    detail:
      'New organizations are now walked through a short setup wizard covering websites, widgets, and content -- plus a second one for Prayer Wall and Testimonies the first time you visit that page. Not ready yet? "Come back later" skips it without losing your place.',
  },
  {
    date: "2026-08-10",
    headline: "Added a conversation logs viewer",
    detail:
      "Staff can now read through the assistant's actual conversations with visitors from the dashboard, not just aggregate analytics. It's the fastest way to spot questions the assistant is struggling to answer well.",
  },
  {
    date: "2026-08-05",
    headline: "Launched pricing plans and the public marketing site",
    detail:
      "Ruach's plans -- Essential, Growth, and Multi-Site -- and the public marketing pages went live, alongside error monitoring and smarter batching for large bulk imports.",
  },
  {
    date: "2026-08-04",
    headline: "Launched the Prayer Wall",
    detail:
      "Churches can now offer a moderated Prayer Wall where visitors submit prayer requests -- publicly, privately, or anonymously -- and the community responds in prayer. It carries your own branding and installs as its own dedicated page.",
  },
  {
    date: "2026-08-04",
    headline: "Added billing, team management, and analytics",
    detail:
      "Subscription billing, invite-based team member roles, and conversation analytics shipped together, rounding out the dashboard beyond the core assistant. A background job queue was also added so large content imports process reliably.",
  },
  {
    date: "2026-08-03",
    headline: "Redesigned the dashboard and marketing site",
    detail:
      "Ruach moved to a new cream, charcoal, and bronze visual design across the dashboard and public site, replacing the original interface with a warmer, more considered look.",
  },
  {
    date: "2026-07-31",
    headline: "Ruach launched: an embeddable AI resource guide for churches",
    detail:
      "The first version of Ruach shipped: import your church's content, install an embeddable widget on your existing website, and let visitors ask questions in plain language and get real recommendations from your own approved resources.",
  },
];
