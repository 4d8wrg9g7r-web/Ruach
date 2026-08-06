import { NextResponse } from "next/server";
import { after } from "next/server";
import { runBulkJob } from "../../../../../lib/resource-pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Internal-only continuation endpoint for a BulkJob too large to finish within one
 * invocation's time budget -- runBulkJob (see resource-pipeline.ts) calls this
 * itself to hand off to a fresh serverless invocation rather than trying to keep
 * working past its own deadline. Guarded by CRON_SECRET (the same bearer-token
 * pattern as api/cron/sync and api/cron/usage-warnings) since there's no dashboard
 * session in this context and this must never be triggerable by an untrusted
 * caller -- it would let someone else's request burn an organization's paid OpenAI
 * usage by re-running its bulk jobs.
 */
export async function POST(req: Request, context: { params: Promise<{ jobId: string }> }) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const body = (await req.json().catch(() => null)) as { organizationId?: string; userId?: string } | null;
  if (!body?.organizationId) {
    return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
  }

  after(() => runBulkJob(body.organizationId!, jobId, body.userId));
  return NextResponse.json({ ok: true });
}
