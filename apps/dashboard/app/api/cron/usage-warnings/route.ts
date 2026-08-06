import { NextRequest, NextResponse } from "next/server";
import { checkAllOrganizationsUsage } from "../../../../lib/usage-warnings";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Scheduled usage-warning check (see lib/usage-warnings.ts). Same bearer-token cron
 * pattern as api/cron/sync/route.ts -- no dashboard session exists in a cron context.
 * Runs once daily (see vercel.json); each org's 75%/90% threshold email fires at
 * most once per billing period regardless of how often this runs.
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

  const outcomes = await checkAllOrganizationsUsage();
  return NextResponse.json({
    checkedOrganizations: outcomes.length,
    warningsSent: outcomes.filter((o) => o.sent).length,
    outcomes,
  });
}
