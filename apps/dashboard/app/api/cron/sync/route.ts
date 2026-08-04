import { NextRequest, NextResponse } from "next/server";
import { syncAllDueSources } from "../../../../lib/content-sync";

export const runtime = "nodejs";
// No job queue exists yet (by design -- see docs/architecture.md), so this runs the
// full sync synchronously within the request. An external scheduler (Vercel Cron,
// a cron(1) job, etc.) is expected to call this on an interval; it's not triggered
// by anything inside the app itself.
export const maxDuration = 300;

/**
 * Auto-sync entry point (brief follow-up: "new videos on channels and blog posts
 * automatically are imported and analyzed"). Not session-authenticated -- there's no
 * dashboard user in a cron context -- so it's gated by a shared secret instead,
 * matching the Vercel Cron convention (`Authorization: Bearer <CRON_SECRET>`).
 * Iterates every org's autoSyncEnabled ContentSource rows; see
 * lib/content-sync.ts for the per-source sync + categorize + optional-approve logic.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const outcomes = await syncAllDueSources();
  return NextResponse.json({
    syncedSources: outcomes.length,
    totalCreated: outcomes.reduce((sum, o) => sum + o.created, 0),
    outcomes,
  });
}
