# Light on a Hill Photography

A bespoke, editorial, conversion-focused website for Light on a Hill Photography —
wedding, portrait, and lifestyle photography in North Carolina and beyond.

**This is a standalone project.** It lives inside the same repository but is
completely independent of the Ruach application — its own dependencies, design
system, and toolchain. Nothing is shared. It is intentionally _not_ part of the
root `pnpm` workspace (which globs `apps/*` and `packages/*`); it manages its own
`package.json` / `package-lock.json` and builds on its own.

## Stack

- **Next.js 15** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS** for the design system
- **Framer Motion** for the motion system
- **Zod** for the inquiry contract
- Fonts: **Cormorant Garamond** (editorial serif) + **Inter** (grotesk), via `next/font`

## Run it

```bash
cd light-on-a-hill
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production build
npm run typecheck  # tsc --noEmit
```

No database or third-party credentials are required to run or build.

## What's here

A guided, cinematic experience built around a signature **aperture navigation**,
photography-first editorial layouts, and a premium inquiry funnel.

### Signature interactions

| Piece | File |
| --- | --- |
| Aperture icon (transform-only blade animation) | `components/ApertureIcon.tsx` |
| Full-screen aperture menu (hover-driven imagery, focus trap, Esc) | `components/ApertureNav.tsx` |
| Contextual desktop cursor (`data-cursor` driven) | `components/CustomCursor.tsx` |
| Autofocus microinteraction | `components/FocusImage.tsx` |
| Scroll-driven horizontal portfolio reel | `components/home/PortfolioReel.tsx` |
| Aperture-progress inquiry wizard | `components/InquiryWizard.tsx` |
| Page-transition iris reveal | `app/template.tsx` |
| Closing CTA with giant faint aperture | `components/CTASection.tsx` |

All motion respects `prefers-reduced-motion`.

### Routes

- `/` — homepage (emotion → portfolio → services → process → proof → booking)
- `/[service]` — high-conversion sales template (`weddings`, `couples`, `families`, `seniors`, `maternity`, `branding`)
- `/investment`, `/about`, `/the-experience`
- `/journal` + `/journal/[slug]`
- `/locations` + `/locations/[slug]` (Raleigh, Durham, Cary, Chapel Hill, destination — genuine local-SEO pages)
- `/inquire` — multi-step booking concierge
- `/legal/[slug]`, `/sitemap.xml`, `/robots.txt`, custom `not-found`

## Content is CMS-shaped

There is no CMS wired up yet, but all content lives in typed modules under
`content/` that map 1:1 to the intended CMS collections. Swapping in Payload (or
equivalent) is a matter of pointing these reads at the CMS — the components don't
change.

| `content/` module | Intended CMS collection |
| --- | --- |
| `site.ts` | Site Settings (global) |
| `navigation.ts` | Navigation |
| `services.ts` | Services (+ FAQs, Investment, hub-and-spoke links) |
| `images.ts` | Portfolio Images / Galleries |
| `testimonials.ts` | Testimonials |
| `journal.ts` | Journal Posts |
| `locations.ts` | Locations |

**Imagery** is currently Unsplash placeholders, centralised in `content/images.ts`.
Replace each `id` with the studio's real gallery asset (or a local `/public` path)
and the whole site re-skins from that one file. `next.config.mjs` `remotePatterns`
should be updated to the final asset host at launch.

## SEO

- Per-page metadata + canonical URLs (`lib/seo.ts`, `buildMetadata`)
- Open Graph + Twitter cards
- JSON-LD: `ProfessionalService` / LocalBusiness (site-wide), `BreadcrumbList`,
  `FAQPage` (service + location pages), `Article` (journal posts)
- `sitemap.xml` + `robots.txt` generated from content
- Semantic HTML, single `<h1>` per page, skip link, keyboard-navigable menu

## Analytics & conversion tracking

`lib/analytics.ts` is a provider-agnostic seam that pushes typed funnel events to
the GTM `dataLayer` / GA4 `gtag`. Set `NEXT_PUBLIC_GTM_ID` to inject the container
(see `.env.example`). Events include `navigation_service_click`, `portfolio_view`,
`gallery_open`, `investment_view`, `availability_click`, `inquiry_started`,
`inquiry_step_completed`, `inquiry_submitted`, `journal_cta_click`,
`location_page_conversion`.

## Inquiries / lead management

`POST /api/inquire` validates with the shared Zod schema (`lib/inquiry.ts`) and
persists the lead (best-effort JSONL in dev). Two production seams are clearly
marked in `app/api/inquire/route.ts`:

1. `persistLead()` → write to the CMS/database `Inquiries` collection
2. `notify()` → send the photographer notification + the polished client
   confirmation via a transactional-email provider

Lead statuses (`New → Contacted → … → Booked`) are enumerated for the eventual
lead-management view.

## Accuracy note — verify before launch

Confirmed from the current site: portrait/event sessions are **$200/hr, two-hour
minimum, all edited images delivered to a private gallery within four weeks**.
Values marked `PLACEHOLDER` in `content/` (wedding collection pricing, contact
email, social handles) are **not confirmed** and must be set by the owner before
launch.
