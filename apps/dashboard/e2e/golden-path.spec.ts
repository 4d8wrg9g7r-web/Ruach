import bcrypt from "bcryptjs";
import { expect, test } from "@playwright/test";
import { userService } from "@ruach/database";

/**
 * The milestone-1 golden path (build plan / brief §66's closing list): create an org,
 * add a website, create a widget, import a mock YouTube resource, add/confirm a
 * transcript, generate mock AI categories, approve the resource, open the widget
 * preview, ask a question, and receive a real database-backed recommendation.
 *
 * Test data (the login user) is created directly via the service layer rather than
 * through a signup UI -- brief's milestone-1 scope starts from an already-authenticated
 * developer (the seeded dev user pattern), not public registration.
 */
test("golden path: org through database-backed recommendation", async ({ page, context }) => {
  const email = `e2e-${Date.now()}@ruach.dev`;
  const password = "e2e-password-123";
  await userService.createUser({ email, passwordHash: await bcrypt.hash(password, 10) });

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/onboarding");
  await page.getByLabel("Organization name").fill(`E2E Org ${Date.now()}`);
  await page.getByRole("button", { name: "Create organization" }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/websites");
  await page.getByLabel("Name").fill("E2E Website");
  await page.getByLabel("Primary domain").fill("localhost:3000");
  await page.getByRole("button", { name: "Add website" }).click();
  await expect(page.getByText("localhost:3000")).toBeVisible();

  await page.goto("/widgets");
  await page.getByLabel("Name").fill("E2E Widget");
  await page.getByRole("button", { name: "Create widget" }).click();
  await page.waitForURL(/\/widgets\/.+/);

  const snippet = await page.locator("pre").textContent();
  const publicWidgetId = snippet?.match(/data-widget-id="([^"]+)"/)?.[1];
  expect(publicWidgetId).toBeTruthy();

  await page.goto("/resources");
  await page.getByLabel("URL").fill("https://www.youtube.com/watch?v=mock-yt-e2e-01");
  await page.getByRole("button", { name: "Import" }).click();
  await page.waitForURL(/\/resources\/.+/);

  // MockYouTubeProvider auto-fetches a transcript on import, so the review screen
  // should already show transcript text rather than the "paste a transcript" form.
  await expect(page.getByText(/Mock transcript for YouTube video/)).toBeVisible();

  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.getByText("Primary topic:")).toBeVisible();

  await page.getByRole("button", { name: "Approve and index" }).click();
  await expect(page.getByText("Approved and indexed.")).toBeVisible();

  const previewPage = await context.newPage();
  await previewPage.goto(`/widget/embed/${publicWidgetId}`);
  await previewPage.getByPlaceholder("Ask a question...").fill("Do you have a mock youtube video?");
  await previewPage.getByRole("button", { name: "Send" }).click();

  // The card's title comes straight from the database row, not from the model --
  // this is the acceptance-criteria check that the AI never fabricates resource data.
  await expect(previewPage.getByText("YouTube video mock-yt-e2e-01")).toBeVisible({ timeout: 10_000 });
});
