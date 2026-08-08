# Aristides Instruments — Website Rebuild

A ground-up rebuild of the Aristides Instruments digital experience, designed to
feel like a €3,000–€5,000+ high-performance engineered product brand rather than
a conventional boutique guitar site. The central metaphor is Aristides'
construction itself — **exoskeleton + core**: hard precision on the surface,
resonant energy underneath.

> **Standalone app.** This lives beside (not inside) the surrounding repository's
> pnpm workspace so it never touches that project. It has its own `package.json`
> and is built/run independently from this `aristides/` directory.

## Stack

- **Next.js 15** (App Router) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS** — design tokens in `tailwind.config.ts`, base layer in `app/globals.css`
- **Framer Motion** — scroll-driven and micro-interactions (§30 motion rules)
- Instruments are drawn as **self-contained SVG** (`components/visual/GuitarVisual.tsx`)
  and driven entirely by data, so real renders/photography swap in behind the
  same props later. No external assets or network calls.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes prerender)
npm run typecheck
```

## Information architecture

| Route              | Purpose                                                            |
| ------------------ | ----------------------------------------------------------------- |
| `/`                | Cinematic homepage — 10 narrative sections (hero → Arium → models → performance → extended range → finish lab → human craft → custom builds → artists → final CTA) |
| `/arium`           | The Arium story — scroll narrative + interactive cross-section     |
| `/models`          | Model finder (intent quiz + spec filters) and comparison table    |
| `/models/[slug]`   | Cinematic per-family model page (all six families, from data)      |
| `/build`           | The guided configurator — the flagship feature                    |
| `/production`      | Cinematic build-process sequence (mold → final inspection)        |
| `/gallery`         | Editorial masonry gallery + lightbox → configurator funnel        |
| `/in-stock`        | Ready-to-ship instruments + newsletter empty state                |
| `/artists`         | Editorial artist portraits + detail                               |
| `/story`           | Concise timeline (1995 → today)                                   |

## Where the creative direction lives

- **Design tokens** (§4, §5, §38): `tailwind.config.ts` + `app/globals.css`
  (near-black environment, graphite elevation scale, one ice accent, machined
  small radii, mechanical easing).
- **Primitives** (§38): `components/ui/*` — `SectionLabel`, `DisplayHeading`,
  `TechSpec`, `ModelBadge`, `FinishSwatch`, `CTAButton`, `EditorialImage`, `Reveal`.
- **Instrument-adaptive UI** (§4): sections set `--instrument-tint` so the
  interface reflects the featured finish (see `.instrument-ambient`).
- **The configurator engine** (§11–§22): configuration is **data, not scattered
  conditions**. Platforms, options and compatibility live in
  `lib/data/configurator.ts`; pricing/validation/build-codes in `lib/build.ts`.
  Invalid combinations disappear or are disabled with an explanation. Every step
  teaches while you configure (§40).
- **Model/finish data** (CMS-ready shape): `lib/data/models.ts`, `lib/data/finishes.ts`.

## Data-first, CMS-ready

`models.ts`, `finishes.ts`, `configurator.ts` and `artists.ts` express the
catalogue and configuration rules as typed data — the exact shape a CMS
(Payload/Sanity, §35) would own. Swapping the source to a CMS is a data-layer
change, not a UI rewrite.

## SEO & accessibility

- Structured data (Organization / Product / FAQ), `sitemap.ts`, `robots.ts`, and
  legacy-URL redirects in `next.config.mjs` (§36).
- Crawlable copy is real DOM text, never buried in WebGL. Keyboard-navigable
  configurator, visible focus rings, `prefers-reduced-motion` respected globally
  (§37).

## Prototype notes

- Instrument visuals and photography plates (`EditorialImage`) are self-contained
  placeholders; real renders/photography drop in behind the same components.
- "Start Order" (§23) simulates the structured-inquiry send; wire it to Aristides'
  sales pipeline + customer email in production.
- Saved builds encode the full configuration into a shareable link
  (`/build?b=…`); a persistent short-URL store is a backend follow-up (§22).
