/**
 * Re-records every /getting-started walkthrough GIF against the real dashboard UI.
 * Requires: `pnpm dev` running against a seeded local DB (see prisma/seed.ts) and a
 * working ffmpeg (`brew reinstall ffmpeg` if you hit a missing-dylib error).
 *
 * Usage: node scripts/record-getting-started.mjs
 */
import { execFile } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";

const run = promisify(execFile);

const VIDEO_DIR = "/tmp/gs-videos";
const OUT_DIR = new URL("../public/getting-started/", import.meta.url).pathname;
const VIEWPORT = { width: 1280, height: 800 };
const BASE_URL = "http://localhost:3000";

rmSync(VIDEO_DIR, { recursive: true, force: true });
mkdirSync(VIDEO_DIR, { recursive: true });

const browser = await chromium.launch();

const loginPage = await browser.newPage({ viewport: VIEWPORT });
await loginPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
await loginPage.fill('input[name="email"]', "owner@ruach.dev");
await loginPage.fill('input[name="password"]', "devpassword123");
await Promise.all([loginPage.waitForNavigation({ waitUntil: "networkidle" }), loginPage.click('button[type="submit"]')]);
const storageState = await loginPage.context().storageState();
await loginPage.close();

async function record(name, fn) {
  const dir = join(VIDEO_DIR, name);
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ viewport: VIEWPORT, storageState, recordVideo: { dir, size: VIEWPORT } });
  const page = await context.newPage();
  await fn(page);
  await context.close(); // finalizes the video file
  const file = readdirSync(dir).find((f) => f.endsWith(".webm"));
  const dest = join(VIDEO_DIR, `${name}.webm`);
  renameSync(join(dir, file), dest);
  rmSync(dir, { recursive: true, force: true });
  console.log(`recorded ${name}`);
}

const pause = (page, ms) => page.waitForTimeout(ms);

await record("website-add", async (page) => {
  await page.goto(`${BASE_URL}/websites`, { waitUntil: "networkidle" });
  await pause(page, 500);
  const name = page.getByPlaceholder("Main Website");
  await name.click();
  await name.pressSequentially("Youth Ministry Site", { delay: 45 });
  const domain = page.getByPlaceholder("localhost:3000");
  await domain.click();
  await domain.pressSequentially("youth.example.org", { delay: 45 });
  await pause(page, 400);
  await page.getByRole("button", { name: "Add website" }).click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("widget-create", async (page) => {
  await page.goto(`${BASE_URL}/widgets`, { waitUntil: "networkidle" });
  await pause(page, 500);
  const name = page.getByPlaceholder("Main Resource Assistant");
  await name.click();
  await name.pressSequentially("Youth Ministry Assistant", { delay: 45 });
  await pause(page, 500);
  await page.getByRole("button", { name: "Create widget" }).click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("resource-import", async (page) => {
  await page.goto(`${BASE_URL}/resources`, { waitUntil: "networkidle" });
  await pause(page, 500);
  await page.getByRole("tab", { name: "YouTube channel" }).click();
  await pause(page, 700);
  await page.getByRole("tab", { name: "RSS feed" }).click();
  await pause(page, 700);
  await page.getByRole("tab", { name: "Paste a URL" }).click();
  await pause(page, 500);
  const url = page.getByPlaceholder("https://...");
  await url.click();
  await url.pressSequentially("https://www.youtube.com/watch?v=dQw4w9WgXcQ", { delay: 30 });
  await pause(page, 900);
});

await record("organizational-links-add", async (page) => {
  await page.goto(`${BASE_URL}/resources`, { waitUntil: "networkidle" });
  // Scoped to the Organizational Links form specifically -- the page's main import
  // panel has its own "https://..." URL field with the same placeholder.
  const form = page.locator('form:has(input[placeholder="Notes"])');
  await form.scrollIntoViewIfNeeded();
  await pause(page, 500);
  const label = form.locator('input[name="label"]');
  await label.click();
  await label.pressSequentially("Sermon Notes", { delay: 45 });
  const url = form.locator('input[name="url"]');
  await url.click();
  await url.pressSequentially("https://example.org/notes", { delay: 30 });
  const description = form.locator('textarea[name="description"]');
  await description.click();
  await description.pressSequentially("This week's sermon notes and study guide", { delay: 20 });
  await pause(page, 600);
  await form.getByRole("button", { name: "Add link" }).click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("widget-customize", async (page) => {
  await page.goto(`${BASE_URL}/widgets`, { waitUntil: "networkidle" });
  await page.locator('a[href^="/widgets/"]').first().click();
  await page.waitForLoadState("networkidle");
  await pause(page, 400);
  // Picking a style first so the live preview's shell visibly changes on camera --
  // targets the radio by its value (the WidgetDisplayStyle key) rather than its
  // label text, since the label also contains the style's description.
  await page.locator('input[name="displayStyle"][value="GREETER"]').click({ force: true });
  await pause(page, 700);
  const welcome = page.getByLabel("Welcome message");
  await welcome.click();
  await welcome.fill("");
  await welcome.pressSequentially("Hi! Looking for a sermon, article, or way to get connected?", { delay: 25 });
  await pause(page, 600);
  await page.getByRole("button", { name: "Publish Changes" }).click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("prayer-wall-enable", async (page) => {
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
  await pause(page, 500);
  const checkbox = page.getByLabel("Enable the public prayer wall");
  await checkbox.click();
  await pause(page, 500);
  const forward = page.getByPlaceholder("staff@example.org");
  await forward.click();
  await forward.pressSequentially("prayer-team@example.org", { delay: 40 });
  await pause(page, 700);
});

await record("testimonies-enable", async (page) => {
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });

  // The testimonies checkbox only renders once the org already has the prayer wall
  // enabled server-side (same form, gated by a server-rendered prop, not live
  // checkbox state) -- the recording above never actually saves, so enable and save
  // it for real here first if this is a fresh org.
  let testimoniesCheckbox = page.getByLabel(/Enable testimonies/);
  if ((await testimoniesCheckbox.count()) === 0) {
    await page.getByLabel("Enable the public prayer wall").click();
    await page.getByRole("button", { name: "Save" }).first().click();
    await page.waitForLoadState("networkidle");
    await page.reload({ waitUntil: "networkidle" });
    testimoniesCheckbox = page.getByLabel(/Enable testimonies/);
  }

  await pause(page, 400);
  await testimoniesCheckbox.scrollIntoViewIfNeeded();
  await pause(page, 400);
  await testimoniesCheckbox.click();
  await pause(page, 400);
  const pageName = page.locator('input[name="testimoniesPageName"]');
  await pageName.click();
  await pageName.fill("");
  await pageName.pressSequentially("Praise Reports", { delay: 40 });
  await pause(page, 700);
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("moderate", async (page) => {
  await page.goto(`${BASE_URL}/prayer-wall`, { waitUntil: "networkidle" });
  await pause(page, 600);
  const markAnswered = page.getByRole("button", { name: "Mark answered" }).first();
  if (await markAnswered.count()) {
    await markAnswered.click();
    await page.waitForLoadState("networkidle");
  }
  await pause(page, 900);
});

await record("team-invite", async (page) => {
  await page.goto(`${BASE_URL}/team`, { waitUntil: "networkidle" });
  await pause(page, 500);
  const email = page.getByPlaceholder("teammate@example.org");
  await email.click();
  await email.pressSequentially("jane@example.org", { delay: 45 });
  await pause(page, 400);
  await page.getByLabel("Role").selectOption({ label: "Analytics Viewer" });
  await pause(page, 700);
});

await record("conversations-review", async (page) => {
  // Seeds a real conversation by chatting with the widget as a visitor first, in the
  // same browser context -- shows a populated list rather than an empty state,
  // without writing to the database directly.
  await page.goto(`${BASE_URL}/widgets`, { waitUntil: "networkidle" });
  await page.locator('a[href^="/widgets/"]').first().click();
  await page.waitForLoadState("networkidle");
  const previewHref = await page.locator('a[href^="/widget/embed/"]').first().getAttribute("href");
  await page.goto(`${BASE_URL}${previewHref}`, { waitUntil: "networkidle" });
  await pause(page, 800);
  const chatInput = page.getByRole("textbox");
  await chatInput.click();
  await chatInput.pressSequentially("Do you have anything about anxiety?", { delay: 30 });
  await page.getByRole("button", { name: "Send" }).click();
  await pause(page, 2500);

  await page.goto(`${BASE_URL}/conversations`, { waitUntil: "networkidle" });
  await pause(page, 600);
  await page.locator('a[href^="/conversations/"]').first().click();
  await page.waitForLoadState("networkidle");
  await pause(page, 900);
});

await record("analytics-tour", async (page) => {
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: "networkidle" });
  await pause(page, 500);
  for (const y of [300, 700, 1100, 1500]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), y);
    await pause(page, 500);
  }
});

await browser.close();

console.log("Converting to GIFs...");
const webmFiles = readdirSync(VIDEO_DIR).filter((f) => f.endsWith(".webm"));
for (const file of webmFiles) {
  const name = file.replace(/\.webm$/, "");
  const src = join(VIDEO_DIR, file);
  const dest = join(OUT_DIR, `${name}.gif`);
  await run("ffmpeg", [
    "-y",
    "-i",
    src,
    "-vf",
    "fps=10,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer",
    dest,
  ]);
  console.log(`converted ${name}.gif`);
}

rmSync(VIDEO_DIR, { recursive: true, force: true });
console.log("Done -- GIFs written to public/getting-started/");
