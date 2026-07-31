# Deployment

**Status: local development only.** Milestone 1's acceptance criteria are all about
local, credential-free correctness (brief §66's closing list) -- production deployment
topology hasn't been decided or built yet.

When it is: `apps/dashboard` is a standard Next.js app and should deploy to Vercel (or
any Next.js-compatible host) without structural changes, since the public/
authenticated surface separation described in `docs/architecture.md` was chosen
specifically so this remains true. It needs a managed PostgreSQL instance (`DATABASE_URL`),
a real `AUTH_SECRET`, and `NEXTAUTH_URL` set to the production domain. Serving
`widget-loader.js` from a dedicated CDN rather than the app's own `/public` directory
is called out as a deferred improvement in `docs/widget-installation.md`.
