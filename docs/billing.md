# Billing

**Status: mock UI, no real payment processing.** There are still no `Subscription`,
`UsageRecord`, or entitlement tables in the schema, and no Stripe integration --
that still needs a real Stripe account and a pricing decision this codebase can't
make on its own. What exists today (`packages/database/src/services/billing-service.ts`,
`apps/dashboard/app/(dashboard)/billing/page.tsx`) is the same mock-provider pattern
used for email/storage: a single static plan tier (`CURRENT_PLAN`), but real usage
numbers (`getCurrentUsage`) counted from actual `ConversationMessage` rows for the
current calendar month, not a hardcoded constant.

When real billing starts: add plan-entitlement fields (`maxWebsites`, `maxWidgets`,
`maxMonthlyMessages`, etc., per the brief's suggested list) to a new `Subscription`
model, wire Stripe webhooks for subscription state, and replace `CURRENT_PLAN`'s
static value with a real per-organization plan lookup. Usage-metering writes already
exist at the right points (`ConversationMessage` rows are created on every chat
request) -- `getCurrentUsage` is the seam a real implementation replaces. Do not
hard-code prices into application logic (brief §48).
