export interface GettingStartedGuide {
  id: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  steps: string[];
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Animations live in public/getting-started/*.gif -- real screen recordings against
 * the actual dashboard UI (seeded demo org), captured with Playwright and encoded
 * with ffmpeg, not mockups. If a page's design changes, re-record the matching
 * walkthrough (apps/dashboard/scripts/record-getting-started.mjs) rather than
 * letting this drift into showing stale UI.
 */
export const GETTING_STARTED_GUIDES: GettingStartedGuide[] = [
  {
    id: "website",
    title: "Add your first website",
    summary: "A website is where a widget lives -- most churches only need one, even with several pages on their site.",
    image: "/getting-started/website-add.gif",
    imageAlt: "The Websites page, showing the add-a-website form and one connected website",
    steps: [
      "Go to Websites in the sidebar.",
      "Enter a Name (e.g. \"Main Website\") and your site's Primary domain.",
      "Click Add website.",
    ],
    ctaLabel: "Go to Websites",
    ctaHref: "/websites",
  },
  {
    id: "widget",
    title: "Create a widget",
    summary: "The widget is the chat assistant itself -- each website gets at least one.",
    image: "/getting-started/widget-create.gif",
    imageAlt: "The Widgets page, showing the create-a-widget form and one active widget",
    steps: [
      "Go to Widgets in the sidebar.",
      "Enter a Name and choose which Website it belongs to.",
      "Click Create widget, then click into it to customize it.",
    ],
    ctaLabel: "Go to Widgets",
    ctaHref: "/widgets",
  },
  {
    id: "content",
    title: "Import your content",
    summary: "Sermons, podcasts, articles, and pages -- paste a URL, sync a channel, or track an RSS feed.",
    image: "/getting-started/resource-import.gif",
    imageAlt: "The Resources page's import panel, with tabs for a single URL, a YouTube channel, and an RSS feed",
    steps: [
      "Go to Resources in the sidebar.",
      "Paste a URL for a single item, or use the YouTube channel / RSS feed tab to import in bulk.",
      "Check \"Keep checking for new...\" on a channel or feed to keep it syncing automatically.",
      "Review imported items in the Review Queue and approve the ones you want visitors to see.",
    ],
    ctaLabel: "Go to Resources",
    ctaHref: "/resources",
  },
  {
    id: "customize",
    title: "Customize and install your widget",
    summary: "Set the assistant's name, welcome message, and brand color, then copy the install snippet onto your site.",
    image: "/getting-started/widget-customize.gif",
    imageAlt: "A widget's customize panel with live preview, and the installation embed snippet at the bottom",
    steps: [
      "Open a widget from the Widgets page.",
      "Set the assistant name, welcome message, suggested prompts, and brand color -- the preview on the right updates live.",
      "Click Publish Changes.",
      "Copy the <script> snippet from the Installation card and paste it into your website's <head>.",
    ],
    ctaLabel: "Go to Widgets",
    ctaHref: "/widgets",
  },
  {
    id: "prayer-wall-setup",
    title: "Enable the Prayer Wall",
    summary: "A public page where visitors can submit prayer requests and pray for one another -- entirely optional.",
    image: "/getting-started/prayer-wall-enable.gif",
    imageAlt: "The Settings page's Prayer Wall card, with the enable checkbox, forwarding email, branding, and a live preview",
    steps: [
      "Go to Settings in the sidebar.",
      "Check Enable the public prayer wall.",
      "Add a staff email under \"Forward new submissions to\" so your team gets notified.",
      "Set a brand color and logo to match your church, then click Save.",
    ],
    ctaLabel: "Go to Settings",
    ctaHref: "/settings",
  },
  {
    id: "moderate",
    title: "Moderate prayer requests",
    summary: "Nothing reaches the public wall unreviewed -- approve, categorize, and respond from one place.",
    image: "/getting-started/moderate.gif",
    imageAlt: "The Prayer Wall moderation page, showing a request with make-private, mark-answered, and delete actions",
    steps: [
      "Go to Prayer Wall in the sidebar.",
      "Review each request and click Make public (or leave it private) based on what the requester chose.",
      "Click Mark answered once a request has been fulfilled.",
      "Use the category dropdown and internal notes field to keep your team organized (available on Growth and above).",
    ],
    ctaLabel: "Go to Prayer Wall",
    ctaHref: "/prayer-wall",
  },
  {
    id: "team",
    title: "Invite your team",
    summary: "Bring in staff to help manage content, moderate prayer requests, or just view analytics.",
    image: "/getting-started/team-invite.gif",
    imageAlt: "The Team page, showing the invite-a-teammate form and one existing member",
    steps: [
      "Go to Team in the sidebar.",
      "Enter their email and choose a role -- Admin, Content Manager, Analytics Viewer, or (on eligible plans) Prayer Moderator.",
      "Click Send invite. They'll get an email with login instructions.",
    ],
    ctaLabel: "Go to Team",
    ctaHref: "/team",
  },
  {
    id: "analytics",
    title: "Check your analytics",
    summary: "See exactly what people are asking, what's working, and where your content library has gaps.",
    image: "/getting-started/analytics-tour.gif",
    imageAlt: "The Analytics page, showing engagement over time, search trends, and recent questions",
    steps: [
      "Go to Analytics in the sidebar.",
      "Check Content gaps for questions that came back with no matching resource -- the clearest signal of what to import next.",
      "Check Search trends and Most recommended resources to see what's already working.",
    ],
    ctaLabel: "Go to Analytics",
    ctaHref: "/analytics",
  },
];
