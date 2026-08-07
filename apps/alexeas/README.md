# Alexeas Guitars & Mandolins

A boutique luthier-atelier website and instrument configurator for **Alexeas Guitars &
Mandolins** — the workshop of luthier James Alexeas (Clayton, North Carolina), who builds
handcrafted acoustic guitars, mandolins, and stringed instruments individually, and repairs
and restores others.

This is a self-contained Next.js app inside the Ruach monorepo. It shares no code with the
Church-OS packages; it lives here only as a workspace app.

## Stack

- **Next.js 15** (App Router) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS 3** for the design system
- **framer-motion** for restrained, reduced-motion-aware animation
- Fonts: **Cormorant Garamond** (editorial serif) + **Inter** (UI), via `next/font`

No database and no external image assets: every instrument, wood, and craft detail is drawn
in **SVG** (procedural wood grain, layered instrument previews, line-art vignettes), so the
site is fast, fully static, and photography-free by design.

## Run

```bash
pnpm --filter @ruach/alexeas dev     # http://localhost:3100
pnpm --filter @ruach/alexeas build
pnpm --filter @ruach/alexeas typecheck
```

## Layout

```
app/
  page.tsx                     Homepage (hero → philosophy → families → models →
                               smallest details → tonewoods → maker → process →
                               testimonials → CTA)
  instruments/                 Index, model pages, and the completed-build archive
  build/                       The configurator + shareable saved-build routes
  craft/ workshop/ repairs/ contact/
  sitemap.ts robots.ts not-found.tsx
components/
  site-header, site-footer, wordmark, grain-overlay, reveal-provider, ui
  visuals/                     wood (grain), silhouettes, instrument-preview, details
  configurator/                configurator, choice-card, summary, help-me-choose, submit-form
  home/                        hero, smallest-details (scroll sequence)
  model-explorer, wood-explorer
lib/
  site.ts                      Factual business data + structured data (single source)
  data/                        models, woods, options (with compatibility rules), content
  config/                      engine (state · compatibility · pricing · shareable codes),
                               recommend (the "Help Me Choose" questionnaire)
```

## The configurator

`lib/config/engine.ts` is pure, framework-free logic shared by every surface:

- **Slots & steps** — a five-step guided flow (Instrument · Voice · Feel · Details · Review).
- **Compatibility** — options declare `compatibleModels`, `incompatibleOptions`, and
  `requires`; the engine disables impossible choices and explains why, so no one can build
  an instrument that can't be made.
- **Pricing & build time** — estimates only, always shown under the reminder that
  specifications and pricing are confirmed personally before construction begins.
- **Shareable builds** — a configuration is packed into a short, reversible code
  (`/build/OM-3A7Q`), so a build can be reopened, refreshed, or shared with no server state.

The visual preview (`components/visuals/instrument-preview.tsx`) composes one SVG layer per
choice — soundboard grain, binding, rosette, fret inlay, arm bevel — the layered engine the
brief calls for, and the seam where a future 3D or photographic renderer could slot in.

## Content

Models, tonewoods, configurator options, completed builds, and testimonials are all
structured data in `lib/data/` — the shape a CMS would populate, so ordinary updates need no
code changes. Testimonials and completed builds ship as clearly-labelled placeholder content
for the workshop to replace. Audio/video slots are reserved throughout (the UI already
renders the affordances) so samples drop in later without a schema change.
