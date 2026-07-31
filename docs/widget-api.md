# Widget API

Two public, unauthenticated routes, both scoped by `publicWidgetId` (see
`docs/multi-tenancy.md` for the tenant-boundary discussion):

### `GET /api/widget/[publicWidgetId]/config?host=<hostname>`

Returns branding/behavior config (`assistantName`, `welcomeMessage`, `primaryColor`,
`suggestedPrompts`, etc.) needed to render the launcher and chat panel. 404 if the
widget doesn't exist or is inactive; 403 if `host` is present and not in the website's
allowed domains.

### `POST /api/widget/[publicWidgetId]/chat`

Body: `{ publicWidgetId, sessionId, message }` (validated against `ChatRequestSchema`,
`packages/shared-types`). Runs the message through `ChatPipeline` (see
`docs/architecture.md`) and returns a `ChatResponse` (`packages/shared-types`).
Persists both the visitor's message and the assistant's response to `Conversation`/
`ConversationMessage`, scoped by the widget's `organizationId`.

## Not yet built

Conversation-retention expiry jobs (`WidgetConfiguration.conversationRetentionDays`
exists as a field but nothing enforces it yet), a "clear conversation" endpoint, and
feedback submission (`helpful`/`not helpful`).
