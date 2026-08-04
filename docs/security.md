# Security

## SSRF protection

`packages/providers/src/ssrf-guard.ts` guards every fetch of a subscriber-supplied URL
(currently: `GenericUrlProvider`). It requires HTTPS, resolves the hostname via DNS
and rejects private/loopback/link-local ranges (including the `169.254.169.254` cloud
metadata address) **on the resolved IP, not just the hostname string** -- so a
DNS-rebinding-style bypass that points a public-looking hostname at a private IP is
still caught. Redirects are followed manually (not via `fetch`'s automatic redirect
handling) so each hop is re-validated, capped at 3 redirects, with a 5-second timeout
and a 2 MB response-size cap.

## Tenant isolation

See `docs/multi-tenancy.md` for the full three-layer strategy (service layer, runtime
guard, CI check) plus the dedicated cross-tenant isolation test.

## Prompt-injection posture

Imported transcripts, descriptions, and documents are treated as untrusted reference
material, never as instructions. `OpenAIProvider`'s system prompts (`packages/ai/src/
OpenAIProvider.ts`) explicitly instruct the model not to follow instructions found in
resource text, not to reveal the system prompt, and not to fabricate excerpts. More
structurally: the model's output is never used to construct a trusted resource
card field directly -- see `ChatPipeline`'s database-validation step in
`docs/architecture.md`. `MockAIProvider` has no prompt-injection surface at all (no
model, no free-text instruction-following).

## Secrets

`OPENAI_API_KEY` and (when live integrations are added) provider tokens are read only
server-side (`process.env`, never passed to the browser or into any Client Component
prop). The public widget/chat API routes return only the fields defined in
`ChatResponseSchema`/the config route's explicit response shape -- no internal IDs,
stack traces, or provider error details are ever serialized into a public response.

## Auth

NextAuth v5, Credentials provider, JWT session strategy (see `apps/dashboard/auth.ts`
for why no Prisma adapter is used). Auth routes and middleware run on the Node
runtime, not edge, since `bcryptjs` and the Prisma client don't run on edge.

## Rate limiting

`apps/dashboard/lib/rate-limit.ts` implements an in-memory sliding-window limiter,
applied to the public chat endpoint (`app/api/widget/[publicWidgetId]/chat/route.ts`)
before any AI provider call, so an over-limit request never generates OpenAI cost.
Two independent limits, both scoped per-widget: 20 messages / 10 minutes per
`sessionId` (catches one runaway client), 60 / 10 minutes per client IP (catches
someone cycling `sessionId` -- a client-generated, unauthenticated value -- to dodge
the per-session limit). Rejected requests get `429` with a `Retry-After` header.

This is single-process, in-memory state -- it does not share limits across multiple
server instances or serverless invocations. Fine for the current single-instance
deployment model; would need a shared store (Redis or similar) to hold once the app
runs on more than one instance.

## Not yet built

CSRF protection beyond NextAuth's built-in handling, Content Security Policy headers,
dependency scanning, signed internal job requests (no background job system exists
yet), and file-upload validation (no file upload UI exists yet -- transcripts are
pasted as text).
