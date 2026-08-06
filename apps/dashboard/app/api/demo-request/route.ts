import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { demoRequestService } from "@ruach/database";
import { getEmailProvider } from "@ruach/email";
import { demoRequestSchema } from "../../../lib/marketing/demo-request-schema";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";

export const runtime = "nodejs";

const DEMO_REQUEST_NOTIFICATION_EMAIL = process.env.DEMO_REQUEST_NOTIFICATION_EMAIL ?? "hello@ruachplatform.com";

/** Public, unauthenticated endpoint (marketing "Request a Demo" form) -- rate-limited by IP the same way the public prayer-wall/chat endpoints are. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rateCheck = checkRateLimit(`demo-request:${ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests -- please try again in a bit." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = demoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const demoRequest = await demoRequestService.createDemoRequest(parsed.data);

  // Best-effort notification -- the lead is already saved regardless of whether this send succeeds.
  try {
    await getEmailProvider().sendEmail({
      to: DEMO_REQUEST_NOTIFICATION_EMAIL,
      subject: `New demo request: ${parsed.data.churchName}`,
      text: [
        `Name: ${parsed.data.name} (${parsed.data.role})`,
        `Church: ${parsed.data.churchName}`,
        `Email: ${parsed.data.email}`,
        parsed.data.churchWebsite ? `Website: ${parsed.data.churchWebsite}` : null,
        `Attendance: ${parsed.data.attendanceRange}`,
        parsed.data.campusCount ? `Campuses: ${parsed.data.campusCount}` : null,
        parsed.data.currentPlatform ? `Current platform: ${parsed.data.currentPlatform}` : null,
        parsed.data.contentPlatforms ? `Content platforms: ${parsed.data.contentPlatforms}` : null,
        parsed.data.preferredContact ? `Preferred contact: ${parsed.data.preferredContact}` : null,
        parsed.data.message ? `\nWhat they'd like help with:\n${parsed.data.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Failed to send demo-request notification email:", err);
    Sentry.captureException(err);
  }

  return NextResponse.json({ id: demoRequest.id });
}
