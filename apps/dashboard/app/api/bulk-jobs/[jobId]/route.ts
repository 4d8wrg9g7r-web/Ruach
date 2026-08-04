import { NextResponse } from "next/server";
import { bulkJobService } from "@ruach/database";
import { getCurrentOrganization } from "../../../../lib/session";

export const runtime = "nodejs";

/**
 * Plain Route Handler, not a Server Action -- it must never join the App Router's
 * transition queue the way a Server Action call does (that's the exact mechanism
 * that let a slow bulk action block sidebar navigation before this feature).
 * ResourcesTable.tsx polls this on a plain interval while a BulkJob is in flight.
 */
export async function GET(_req: Request, context: { params: Promise<{ jobId: string }> }) {
  const organization = await getCurrentOrganization();
  if (!organization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const job = await bulkJobService.getBulkJob(organization.id, jobId);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    type: job.type,
    totalCount: job.totalCount,
    processedCount: job.processedCount,
    successCount: job.successCount,
    failureCount: job.failureCount,
    resultSummary: job.resultSummary,
    errorMessage: job.errorMessage,
  });
}
