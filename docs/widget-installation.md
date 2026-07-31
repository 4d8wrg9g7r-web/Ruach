# Widget installation

Each widget has a public install snippet, shown on its detail page in the dashboard
(`/widgets/[widgetId]`):

```html
<script src="https://<your-app-domain>/widget-loader.js" data-widget-id="<publicWidgetId>" defer></script>
```

Paste this into the `<head>` of the subscriber's website. The loader
(`apps/dashboard/public/widget-loader.js`):

1. Reads `data-widget-id` and the script's own origin (so it works regardless of
   which domain serves it).
2. Fetches the widget's public config (`/api/widget/[publicWidgetId]/config`), passing
   `window.location.hostname` as a `host` query parameter.
3. Renders a floating launcher button styled with the widget's configured label and
   color -- no other global CSS or scripts are injected.
4. Creates the chat iframe (`/widget/embed/[publicWidgetId]?host=...`) lazily, only
   when the visitor first clicks the launcher, so installing the widget costs
   near-zero on host-page load.

## Domain restriction

`host` is passed through to both the config and chat API calls. The server validates
it against the website's `primaryDomain`/`allowedDomains`/`stagingDomains`
(`websiteService.isDomainAllowed`) and refuses to serve the widget on unapproved
domains. This is a page-controlled parameter, not a cryptographically verified one --
sufficient for milestone 1, where the main goal is preventing accidental cross-site
use, not defending against a determined attacker with page-injection access (who could
already do worse). A postMessage handshake or signed embedding token would be the
next hardening step if that threat model matters for a given deployment.

## Not yet built

Iframe resizing via `postMessage` (the panel is a fixed size for milestone 1), and
distributing `widget-loader.js` from a dedicated CDN rather than the app's own
`/public` directory.
