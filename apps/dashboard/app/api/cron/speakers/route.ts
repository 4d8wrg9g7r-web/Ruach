import { NextRequest, NextResponse } from "next/server";
import { SpeakerService, getAIProvider } from "@ruach/ai";
import { invalidateLibraryCatalog } from "../../../../lib/sermon-library";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Per run. ~1 small AI call each; a 1,300-message archive is filled in within a few hours. */
const BATCH_SIZE = 150;
/** Stop picking up new work with this much of maxDuration left, so in-flight calls can finish. */
const TIME_BUDGET_MS = 240_000;

/**
 * Speaker backfill: fills Resource.speakerName for resources imported before speaker
 * detection existed (new ones get it during categorization). Same shared-secret gate
 * as /api/cron/sync. Once everything has been checked this costs one indexed query
 * per run and no AI calls.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await new SpeakerService(getAIProvider()).backfill({
    limit: BATCH_SIZE,
    deadline: Date.now() + TIME_BUDGET_MS,
  });
  for (const organizationId of result.changedOrgs) invalidateLibraryCatalog(organizationId);

  return NextResponse.json({
    checked: result.checked,
    found: result.found,
    failed: result.failed,
    leftInBatch: result.leftInBatch,
    orgsUpdated: result.changedOrgs.length,
  });
}
