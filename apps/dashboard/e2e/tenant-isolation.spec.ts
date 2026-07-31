import bcrypt from "bcryptjs";
import { expect, test } from "@playwright/test";
import { organizationService, resourceService, userService, websiteService, widgetService } from "@ruach/database";
import { importResourceFromUrl } from "@ruach/providers";
import { CategorizationService, MockAIProvider } from "@ruach/ai";
import { LocalRetrievalProvider } from "@ruach/retrieval";

/**
 * The dedicated cross-tenant isolation test called for in the build plan (brief §6):
 * the public chat endpoint has no session to fall back on, so publicWidgetId ->
 * organizationId resolution is the ONLY thing standing between a visitor and another
 * organization's resources. This hits widget B with a query that strongly matches
 * organization A's seeded content and asserts none of it leaks across.
 */
test("cross-tenant isolation: widget B never surfaces organization A's resources", async ({ request }) => {
  const orgA = await organizationService.getOrganizationBySlug("riverside-demo");
  if (!orgA) throw new Error("Run `pnpm db:seed` before running this test.");
  const widgetsA = await widgetService.listWidgets(orgA.id);
  const widgetA = widgetsA[0];
  if (!widgetA) throw new Error("Seed org has no widget -- run `pnpm db:seed`.");

  const anxietyResourceA = await resourceService.findResourceBySource(orgA.id, "YOUTUBE", "mock-yt-anxiety-01");
  if (!anxietyResourceA) throw new Error("Seed org is missing the anxiety resource -- run `pnpm db:seed`.");

  // Org B: a fresh, unrelated tenant with no anxiety-related content.
  const ownerEmail = `isolation-owner-${Date.now()}@ruach.dev`;
  const owner = await userService.createUser({ email: ownerEmail, passwordHash: await bcrypt.hash("isolation-test", 10) });
  const orgB = await organizationService.createOrganizationWithOwner({
    name: `Isolation Test Org ${Date.now()}`,
    slug: `isolation-test-${Date.now()}`,
    ownerUserId: owner.id,
  });
  const websiteB = await websiteService.createWebsite({
    organizationId: orgB.id,
    name: "Org B Website",
    primaryDomain: "localhost:3000",
  });
  const widgetB = await widgetService.createWidget({
    organizationId: orgB.id,
    websiteId: websiteB.id,
    name: "Org B Widget",
  });

  const importResult = await importResourceFromUrl(orgB.id, "https://www.youtube.com/watch?v=mock-yt-leadership-01");
  const resourceB = importResult.resource!;
  await new CategorizationService(new MockAIProvider()).categorize(orgB.id, resourceB.id);
  const approvedB = await resourceService.approveResource(orgB.id, resourceB.id);
  const retrieval = new LocalRetrievalProvider();
  await retrieval.indexResource({
    resourceId: approvedB!.id,
    organizationId: orgB.id,
    resourceType: approvedB!.resourceType,
    title: approvedB!.title,
    searchDocument: approvedB!.searchDocument ?? approvedB!.title,
    status: approvedB!.status,
  });

  // Positive control: org A's own widget still finds its own anxiety resource.
  const controlResponse = await request.post(`/api/widget/${widgetA.publicWidgetId}/chat`, {
    data: { publicWidgetId: widgetA.publicWidgetId, sessionId: "isolation-control", message: "Do you have anything about anxiety?" },
  });
  const controlBody = await controlResponse.json();
  expect(controlBody.resources.some((r: { resourceId: string }) => r.resourceId === anxietyResourceA!.id)).toBe(true);

  // The actual isolation check: org B's widget must never return org A's resource,
  // even asked the exact question that strongly matches it in org A.
  const isolationResponse = await request.post(`/api/widget/${widgetB.publicWidgetId}/chat`, {
    data: { publicWidgetId: widgetB.publicWidgetId, sessionId: "isolation-check", message: "Do you have anything about anxiety?" },
  });
  const isolationBody = await isolationResponse.json();
  expect(isolationBody.resources.some((r: { resourceId: string }) => r.resourceId === anxietyResourceA!.id)).toBe(false);
  expect(isolationBody.responseType).toBe("NO_RESULTS");

  // Also confirm widget B can still recommend its OWN resource for an on-topic query
  // (proves isolation isn't just "widget B is broken and returns nothing ever").
  const ownResourceResponse = await request.post(`/api/widget/${widgetB.publicWidgetId}/chat`, {
    data: { publicWidgetId: widgetB.publicWidgetId, sessionId: "isolation-own", message: "I need help with leadership" },
  });
  const ownResourceBody = await ownResourceResponse.json();
  expect(ownResourceBody.resources.some((r: { resourceId: string }) => r.resourceId === approvedB!.id)).toBe(true);
});
