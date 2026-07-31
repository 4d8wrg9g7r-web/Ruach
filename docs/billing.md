# Billing

**Status: not built, deliberately.** Brief instruction #25: don't build billing
before organization/website/widget/resource architecture is stable. There are no
`Subscription`, `UsageRecord`, or entitlement tables in the schema yet.

When this phase starts: add plan-entitlement fields (`maxWebsites`, `maxWidgets`,
`maxMonthlyMessages`, etc., per the brief's suggested list) to a new `Subscription`
model, wire Stripe webhooks for subscription state, and add usage-metering writes at
the points that already exist for exactly this purpose -- e.g. every chat request in
`apps/dashboard/app/api/widget/[publicWidgetId]/chat/route.ts` and every resource
import in `packages/providers/src/import-service.ts`. Do not hard-code prices into
application logic (brief §48).
