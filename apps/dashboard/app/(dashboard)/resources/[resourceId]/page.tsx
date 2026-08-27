import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, ExternalLink, RefreshCw, User, X, XCircle } from "lucide-react";
import { auditService, billingService, resourceService, websiteService } from "@ruach/database";
import { CategorizationService, getAIProvider } from "@ruach/ai";
import { extractReadableText, refreshResourceTranscript, safeFetch, UnsafeUrlError } from "@ruach/providers";
import { LocalRetrievalProvider } from "@ruach/retrieval";
import { AutoSubmitSelect } from "../../../../components/AutoSubmitSelect";
import { Badge } from "../../../../components/ui/Badge";
import { buttonClasses } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { Textarea } from "../../../../components/ui/Input";
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

/**
 * Re-fetch the page and store its visible body text.
 *
 * Text extraction only runs when a resource is first imported, so anything imported
 * before GenericUrlProvider learned to read page bodies has metadata alone -- and
 * re-importing the URL hits duplicate detection and changes nothing. This is the
 * per-resource counterpart to `pnpm backfill:page-text`, as useful for a page whose
 * content has since changed as for one that never had text.
 *
 * Outcomes other than success are expected (a JS-rendered page this regex extractor
 * can't see into, a link that has since died), so they redirect back with ?linkError=
 * like approveLinkedDocumentAction rather than hitting the error boundary.
 */
async function refreshPageTextAction(resourceId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  let errorMessage: string | null = null;
  try {
    const result = await refreshResourceTranscript(organization.id, resourceId);
    if (result.status === "no-text") {
      errorMessage = "No readable text found on that page.";
    } else if (result.status === "unsupported") {
      errorMessage = "This resource's provider can't extract page text.";
    } else if (result.status === "not-found") {
      errorMessage = "Resource not found.";
    }
  } catch (err) {
    errorMessage = err instanceof UnsafeUrlError ? err.message : "Couldn't reach that page.";
  }

  if (errorMessage) {
    redirect(`/resources/${resourceId}?linkError=${encodeURIComponent(errorMessage)}`);
  }

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "resource.page_text_refreshed",
    targetType: "Resource",
    targetId: resourceId,
  });
  revalidatePath(`/resources/${resourceId}`);
}

/**
 * Fetches and includes a link discovered in the resource's description (brief
 * §22-23). Failures (dead link, blocked by safeFetch's SSRF guardrails, not an HTML
 * page) redirect back with a query-param error rather than throwing -- a broken
 * external link is an expected, recoverable outcome here, not a validation bug, so
 * it gets the same "redirect with ?error=" treatment as the prayer-wall forms rather
 * than crashing to the error boundary.
 */
async function approveLinkedDocumentAction(resourceId: string, sourceDocumentId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const documents = await resourceService.listSourceDocuments(organization.id, resourceId);
  const doc = documents.find((d) => d.id === sourceDocumentId);
  if (!doc?.sourceUrl) throw new Error("Link not found");

  let errorMessage: string | null = null;
  try {
    const result = await safeFetch(doc.sourceUrl);
    if (!result.contentType?.includes("text/html")) {
      errorMessage = "That link isn't a readable web page.";
    } else {
      const text = extractReadableText(result.body);
      if (!text) {
        errorMessage = "Couldn't find any readable text at that link.";
      } else {
        await resourceService.approveSourceDocument(organization.id, resourceId, sourceDocumentId, {
          originalText: text,
          cleanText: text,
        });
      }
    }
  } catch (err) {
    errorMessage =
      err instanceof UnsafeUrlError ? err.message : "Couldn't fetch that link -- it may be down or blocking automated requests.";
  }

  if (errorMessage) {
    redirect(`/resources/${resourceId}?linkError=${encodeURIComponent(errorMessage)}`);
  }
  revalidatePath(`/resources/${resourceId}`);
}

async function dismissLinkedDocumentAction(resourceId: string, sourceDocumentId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  await resourceService.rejectSourceDocument(organization.id, resourceId, sourceDocumentId);
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

  const plan = billingService.getPlan(organization.planKey);
  const activeCount = await resourceService.countActiveResources(organization.id);
  billingService.assertUnderCap(activeCount, plan.maxIndexedResources, "indexed-resource");

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

async function setCampusAction(resourceId: string, websiteId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  if (!billingService.planHasFeature(organization.planKey, "campusScopedContentLibraries")) return;

  if (websiteId === "") {
    await resourceService.setResourceWebsiteScope(organization.id, resourceId, null);
  } else {
    // getWebsite is org-scoped -- this both validates the id belongs to this org and
    // confirms it's a real campus before attaching it to the resource.
    const website = await websiteService.getWebsite(organization.id, websiteId);
    if (!website) return;
    await resourceService.setResourceWebsiteScope(organization.id, resourceId, website.id);
  }
  revalidatePath(`/resources/${resourceId}`);
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

export default async function ResourceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ resourceId: string }>;
  searchParams: Promise<{ linkError?: string }>;
}) {
  const { resourceId } = await params;
  const sp = await searchParams;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const resource = await resourceService.getResource(organization.id, resourceId);
  if (!resource) notFound();

  // Only providers that read a page body offer this -- YouTube/Vimeo transcripts come
  // from a captions API keyed by id, where re-fetching is a different job.
  const canRefreshPageText = resource.sourceProvider === "GENERIC_URL";

  const boundSetTranscript = setTranscriptAction.bind(null, resourceId);
  const boundRefreshPageText = refreshPageTextAction.bind(null, resourceId);
  const boundCategorize = categorizeAction.bind(null, resourceId);
  const boundApprove = approveAction.bind(null, resourceId);
  const boundReject = rejectAction.bind(null, resourceId);
  const boundSetCampus = setCampusAction.bind(null, resourceId);

  const canScopeCampus = billingService.planHasFeature(organization.planKey, "campusScopedContentLibraries");
  const websites = canScopeCampus ? await websiteService.listWebsites(organization.id) : [];

  const pendingLinks = resource.sourceDocuments.filter(
    (doc) => doc.sourceType === "WEB_PAGE" && doc.discoveredAutomatically && !doc.approvedByUser,
  );
  const otherDocuments = resource.sourceDocuments.filter((doc) => !pendingLinks.includes(doc));

  return (
    <div>
      <Link
        href="/resources"
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <ArrowLeft size={14} /> Resources
      </Link>

      {sp.linkError && (
        <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{sp.linkError}</p>
      )}

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
          <Card padding="none">
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
                <a
                  href={resource.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-sm text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Open source <ExternalLink size={12} />
                </a>
              </dd>
            </dl>
          </Card>

          {websites.length > 1 && (
            <Card padding="none" className="p-4">
              <h2 className="mb-1 text-sm font-semibold text-ink">Campus</h2>
              <p className="mb-3 text-xs text-ink-muted">
                Which campus this resource is available to. Org-wide resources are available to every campus&rsquo;s widget.
              </p>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await boundSetCampus(String(formData.get("websiteId") ?? ""));
                }}
              >
                {/* Must be the client AutoSubmitSelect, not ui/Select: this page is a Server
                    Component, and handing an onChange function to a client component throws
                    "Event handlers cannot be passed to Client Component props" -- which took
                    the whole page to the error boundary for any org with 2+ campuses. */}
                <AutoSubmitSelect
                  name="websiteId"
                  defaultValue={resource.websiteId ?? ""}
                  options={[
                    { value: "", label: "All campuses (org-wide)" },
                    ...websites.map((website) => ({ value: website.id, label: website.name })),
                  ]}
                  className="block w-full rounded-sm border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                />
              </form>
            </Card>
          )}

          <Card padding="none" className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">Transcript</h2>
              {canRefreshPageText && (
                <form action={boundRefreshPageText}>
                  <button type="submit" className={`${buttonClasses("ghost", "sm")} gap-1.5`} title="Re-read this page and store its current text">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re-fetch page text
                  </button>
                </form>
              )}
            </div>
            {resource.cleanTranscript ? (
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-surface-muted p-3 text-sm text-ink-secondary">
                {resource.cleanTranscript}
              </div>
            ) : (
              <form action={boundSetTranscript} className="flex flex-col gap-2">
                {canRefreshPageText && (
                  <p className="text-sm text-ink-secondary">
                    This page was imported before Ruach could read page text. Use &ldquo;Re-fetch page text&rdquo; above to pull it in, or paste a transcript below.
                  </p>
                )}
                <Textarea name="transcript" rows={5} placeholder="Paste a transcript..." />
                <button type="submit" className={`${buttonClasses("secondary", "sm")} self-start`}>
                  Save transcript
                </button>
              </form>
            )}
          </Card>

          <Card padding="none" className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink">Supporting documents</h2>
            {otherDocuments.length === 0 && pendingLinks.length === 0 ? (
              <EmptyState description="None yet." />
            ) : (
              <>
                {otherDocuments.length > 0 && (
                  <ul className="flex flex-col gap-2 text-sm">
                    {otherDocuments.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-ink-secondary">
                        <span className="font-medium text-ink">{doc.sourceType}</span>
                        {doc.discoveredAutomatically && <Badge variant="neutral">auto-discovered</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
                {pendingLinks.length > 0 && (
                  <div className={otherDocuments.length > 0 ? "mt-4 border-t border-border pt-4" : ""}>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                      Links found in description ({pendingLinks.length})
                    </p>
                    <p className="mb-3 text-xs text-ink-muted">
                      Not fetched or used yet -- include the ones worth pulling in as sermon notes or study guides.
                    </p>
                    <ul className="flex flex-col gap-2">
                      {pendingLinks.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-border-strong px-3 py-2"
                        >
                          <a
                            href={doc.sourceUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-0 flex-1 truncate text-sm text-accent hover:underline"
                          >
                            {doc.sourceUrl}
                          </a>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <form action={approveLinkedDocumentAction.bind(null, resourceId, doc.id)}>
                              <button type="submit" className={buttonClasses("secondary", "sm")}>
                                Include
                              </button>
                            </form>
                            <form action={dismissLinkedDocumentAction.bind(null, resourceId, doc.id)}>
                              <button
                                type="submit"
                                aria-label="Dismiss this link"
                                className="rounded-sm p-2 text-ink-muted transition-colors duration-180 hover:bg-danger-bg hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                              >
                                <X size={14} />
                              </button>
                            </form>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Right: AI categorization + evidence */}
        <div className="flex flex-col gap-6">
          <Card padding="none" className="p-4">
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
          </Card>
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
