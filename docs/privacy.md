# Privacy

## What's implemented

- Public widget sessions are anonymous: `sessionId` is a client-generated UUID stored
  in `localStorage`, never tied to a subscriber account or any PII.
- `Conversation`/`ConversationMessage` store the visitor's raw message text today
  (not yet the "store a category, not the raw text" pattern the brief describes as
  the eventual goal -- see "Not yet built" below).
- `WidgetConfiguration.conversationRetentionDays` and `privacyNotice` exist as
  configurable fields, shown to visitors in the widget panel footer.
- Platform staff have no built-in UI to browse conversations -- there is no platform
  admin app yet at all (see `docs/admin-guide.md`).

## Not yet built

Automatic message-retention expiry/deletion jobs, data export, organization/
conversation/resource deletion flows, anonymized-classification storage in place of
raw visitor text, and cookie/local-storage disclosure documentation for subscriber
sites. None of this is wired up yet -- treat any data stored by this milestone-1
build as retained indefinitely until these are implemented.
