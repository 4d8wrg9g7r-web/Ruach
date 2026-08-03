import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, ExternalLink, RefreshCw, User, XCircle } from "lucide-react";
import { auditService, resourceService } from "@ruach/database";
import { CategorizationService, getAIProvider } from "@ruach/ai";
import { LocalRetrievalProvider } from "@ruach/retrieval";
import { Badge } from "../../../../components/ui/Badge";
import { buttonClasses } from "../../../../components/ui/Button";
import { confidenceLevel, resourceStatusLabel, resourceStatusTone } from "../../../../lib/format";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../../lib/session";

async function setTranscriptAction(resourceId: string, formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const transcript = String(formData.get("transcript") ?? "").trim();
  if (!transcript) throw new Error("Transcript is required");

  await resourceService.setTranscript(organization.id, resourceId, transcript, "MANUAL_TRANSCRIPT");
  await resourceService.addSourceDocument({
    organizationId: organization.id,
    resourceId,
    sourceType: "TRANSCRIPT",
    originalText: transcript,
    cleanText: transcript,
    approvedByUser: true,
  });
  revalidatePath(`/resources/${resourceId}`);
}

async function categorizeAction(resourceId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const service = new CategorizationService(getAIProvider());
  await service.categorize(organization.id, resourceId);
  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "resource.categorized",
    targetType: "Resource",
    targetId: resourceId,
  });
  revalidatePath(`/resources/${resourceId}`);
  revalidatePath("/dashboard");
}

async function approveAction(resourceId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const resource = await resourceService.approveResource(organization.id, resourceId);
  if (resource) {
    const retrieval = new LocalRetrievalProvider();
    await retrieval.indexResource({
      resourceId: resource.id,
      organizationId: organization.id,
      resourceType: resource.resourceType,
      title: resource.title,
      searchDocument: resource.searchDocument ?? resource.title,
      status: resource.status,
    });
    const user = await getCurrentUser();
    // Approval is the action that makes a resource publicly recommendable to
    // website visitors, so it's audited even though nothing reviews this log yet
    // (build-plan decision: write path now, viewer UI later).
    await auditService.recordAuditEvent({
      organizationId: organization.id,
      actorUserId: user?.id,
      action: "resource.approved",
      targetType: "Resource",
      targetId: resource.id,
    });
  }
  revalidatePath(`/resources/${resourceId}`);
  revalidatePath("/resources");
}

async function rejectAction(resourceId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  await resourceService.archiveResource(organization.id, resourceId);
  revalidatePath("/resources");
  redirect("/resources");
}

const CONFIDENCE_TONE = { High: "success", Medium: "warning", Low: "danger" } as const;

export default async function ResourceDetailPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const resource = await resourceService.getResource(organization.id, resourceId);
  if (!resource) notFound();

  const boundSetTranscript = setTranscriptAction.bind(null, resourceId);
  const boundCategorize = categorizeAction.bind(null, resourceId);
  const boundApprove = approveAction.bind(null, resourceId);
  const boundReject = rejectAction.bind(null, resourceId);

  return (
    <div>
      <Link href="/resources" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> Resources
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{resource.title}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={resourceStatusTone(resource.status)}>{resourceStatusLabel(resource.status)}</Badge>
            <span className="text-xs text-ink-muted">{resource.sourceProvider}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: metadata + transcript */}
        <div className="flex flex-col gap-6">
          <div className="shadow-panel overflow-hidden rounded-lg border border-border bg-surface">
            {resource.thumbnailUrl && (
              <div className="aspect-video w-full bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resource.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 p-4 text-sm">
              {resource.speakerName && (
                <>
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <User size={13} /> Speaker
                  </dt>
                  <dd className="text-ink">{resource.speakerName}</dd>
                </>
              )}
              {resource.seriesTitle && (
                <>
                  <dt className="text-ink-muted">Series</dt>
                  <dd className="text-ink">{resource.seriesTitle}</dd>
                </>
              )}
              {resource.publishedAt && (
                <>
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Calendar size={13} /> Published
                  </dt>
                  <dd className="text-ink">{resource.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</dd>
                </>
              )}
              {resource.durationSeconds && (
                <>
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Clock size={13} /> Duration
                  </dt>
                  <dd className="text-ink">{Math.round(resource.durationSeconds / 60)} min</dd>
                </>
              )}
              <dt className="text-ink-muted">Source</dt>
              <dd>
                <a href={resource.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:text-accent-dark">
                  Open source <ExternalLink size={12} />
                </a>
              </dd>
            </dl>
          </div>

          <div className="shadow-panel rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Transcript</h2>
            {resource.cleanTranscript ? (
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-surface-muted p-3 text-sm text-ink-secondary">
                {resource.cleanTranscript}
              </div>
            ) : (
              <form action={boundSetTranscript} className="flex flex-col gap-2">
                <textarea
                  name="transcript"
                  rows={5}
                  placeholder="Paste a transcript..."
                  className="rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                />
                <button type="submit" className={`${buttonClasses("secondary", "sm")} self-start`}>
                  Save transcript
                </button>
              </form>
            )}
          </div>

          <div className="shadow-panel rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Supporting documents</h2>
            {resource.sourceDocuments.length === 0 ? (
              <p className="text-sm text-ink-muted">None yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {resource.sourceDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-ink-secondary">
                    <span className="font-medium text-ink">{doc.sourceType}</span>
                    {doc.discoveredAutomatically && <Badge variant="neutral">auto-discovered</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: AI categorization + evidence */}
        <div className="flex flex-col gap-6">
          <div className="shadow-panel rounded-lg border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">AI Suggestions</h2>
              <form action={boundCategorize}>
                <button type="submit" className={buttonClasses("secondary", "sm")}>
                  <RefreshCw size={13} /> {resource.primaryTopic ? "Regenerate" : "Generate"}
                </button>
              </form>
            </div>

            {resource.primaryTopic ? (
              <div className="flex flex-col gap-4 text-sm">
                {resource.summary && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">Summary</p>
                    <p className="text-ink-secondary">{resource.summary}</p>
                  </div>
                )}
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">Primary topic</p>
                  <Badge variant="info">{resource.primaryTopic}</Badge>
                </div>
                {resource.secondaryTopics.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">Secondary topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.secondaryTopics.map((topic) => (
                        <Badge key={topic} variant="neutral">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {resource.questionsAnswered.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">Questions answered</p>
                    <ul className="flex flex-col gap-1">
                      {resource.questionsAnswered.map((q) => (
                        <li key={q} className="text-ink-secondary">
                          &bull; {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {resource.lifeSituations.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">Life situations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.lifeSituations.map((s) => (
                        <Badge key={s} variant="neutral">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Not generated yet -- click Generate to analyze this resource.</p>
            )}

            {resource.evidence.length > 0 && (
              <details className="mt-4 border-t border-border pt-3 text-sm">
                <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Evidence ({resource.evidence.length})
                </summary>
                <ul className="mt-2 flex flex-col gap-2">
                  {resource.evidence.map((e) => {
                    const level = confidenceLevel(e.confidenceScore);
                    return (
                      <li key={e.id} className="flex items-start justify-between gap-3 rounded-md bg-surface-muted p-2.5">
                        <div className="min-w-0">
                          <span className="font-medium text-ink">{e.fieldName}</span>
                          {e.sourceExcerpt && <p className="mt-0.5 truncate text-xs text-ink-muted">&ldquo;{e.sourceExcerpt}&rdquo;</p>}
                        </div>
                        <Badge variant={CONFIDENCE_TONE[level]}>{Math.round(e.confidenceScore * 100)}%</Badge>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
        {resource.status !== "ARCHIVED" && resource.status !== "ACTIVE" && (
          <form action={boundReject}>
            <button type="submit" className={buttonClasses("danger", "md")}>
              <XCircle size={15} /> Reject Resource
            </button>
          </form>
        )}
        <Link href="/resources" className={buttonClasses("secondary", "md")}>
          Save Draft
        </Link>
        {resource.status === "ACTIVE" ? (
          <span className="inline-flex items-center gap-1.5 rounded bg-success-bg px-4 py-2.5 text-sm font-medium text-success">
            <CheckCircle2 size={15} /> Approved and indexed
          </span>
        ) : (
          <form action={boundApprove}>
            <button type="submit" className={buttonClasses("primary", "md")}>
              <CheckCircle2 size={15} /> Approve Resource
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
