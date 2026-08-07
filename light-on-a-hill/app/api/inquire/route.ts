import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { inquirySchema } from "@/lib/inquiry";
import { SITE } from "@/content/site";

export const runtime = "nodejs";

/**
 * Inquiry intake.
 *
 * Validates with the shared zod schema, then persists the lead. Persistence
 * here is a best-effort append to a local JSONL file so nothing is lost in
 * development — the production seam is marked below: swap `persistLead` for a
 * CMS/database write (the `Inquiries` collection) and `notify` for a real
 * transactional-email send (photographer notification + client confirmation).
 */

type StoredLead = ReturnType<typeof buildLead>;

function buildLead(data: import("@/lib/inquiry").InquiryInput) {
  return {
    ...data,
    status: "New" as const,
    submittedAt: new Date().toISOString(),
  };
}

async function persistLead(lead: StoredLead): Promise<void> {
  // TODO(production): replace with a CMS/database write to the Inquiries collection.
  try {
    const dir = path.join(process.cwd(), ".data");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, "inquiries.jsonl"), JSON.stringify(lead) + "\n", "utf8");
  } catch {
    // Non-fatal in read-only/serverless environments — the lead still returns success
    // and, in production, the CMS/database write above is the source of truth.
  }
}

function notify(lead: StoredLead): void {
  // TODO(production): send two emails via the studio's transactional provider —
  //   1) notification to the photographer (new lead + details)
  //   2) polished confirmation to the client (received, response time, next steps)
  // Templates are intended to be CMS-editable. Logged here as the integration seam.
  console.info(`[inquiry] ${lead.shootType} from ${lead.name} <${lead.email}> — notify ${SITE.email}`);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const lead = buildLead(parsed.data);
  await persistLead(lead);
  notify(lead);

  return NextResponse.json({ ok: true, message: SITE.responseTime });
}
