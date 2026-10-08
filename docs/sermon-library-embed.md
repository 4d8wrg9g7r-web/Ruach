# Sermon library embed

A filterable message archive a church places on its own sermon page, for site builders
whose sermon engines can't filter well. Every widget has one; its install code is on
the widget's detail page (`/widgets/[widgetId]` → "Sermon library embed").

```html
<div id="ruach-sermon-library"></div>
<script src="https://<app>/sermon-library.js" data-widget-id="<publicWidgetId>" defer></script>
```

Optional script attributes: `data-target="<selector>"` to mount elsewhere, and
`data-chat="off"` to hide the chat box. If the site builder doesn't allow scripts, a plain
`<iframe src="https://<app>/widget/library/<publicWidgetId>">` works too, but it won't
resize to fit its content.

## What it shows

- Resources with status `ACTIVE` and type SERMON, VIDEO, AUDIO, PODCAST or DEVOTIONAL
  (`LIBRARY_RESOURCE_TYPES` in `packages/shared-types/src/library.ts`).
- **Multi-campus:** the same rule as chat. A widget belongs to one campus (Website), so
  its library lists org-wide resources plus that campus's own, never another campus's.
- Filters: speaker, subject (`primaryTopic` + `topics`), scripture book then key verse
  (`scriptures`), message type (`resourceType`), series, and keyword search. Option
  counts are faceted: each dropdown counts against every *other* active filter.
- Chat: posts to the existing `/api/widget/[publicWidgetId]/chat`, so it uses the same
  `ChatPipeline`, conversation log, rate limits and usage meter as the assistant widget.

## Database cost

`apps/dashboard/lib/sermon-library.ts` caches both the widget lookup and the campus
catalog in Next's data cache for 10 minutes, so a page view normally costs zero queries.
The catalog is one `findMany` selecting only card/filter columns (no transcripts), capped
at 2,000 items, and all filtering runs in the visitor's browser. Approving, archiving,
re-scoping a resource and saving widget settings invalidate the cache by tag; changes made
elsewhere (e.g. the hourly sync's approvals go through `approveAndIndexResources`, which
also invalidates) otherwise show up within the TTL.
