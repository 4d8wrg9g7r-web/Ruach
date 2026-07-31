import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auditService, resourceService } from "@ruach/database";
import { CategorizationService, getAIProvider } from "@ruach/ai";
import { LocalRetrievalProvider } from "@ruach/retrieval";
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
  revalidatePath(`/resources/${resourceId}`);
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

export default async function ResourceDetailPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const resource = await resourceService.getResource(organization.id, resourceId);
  if (!resource) notFound();

  const boundSetTranscript = setTranscriptAction.bind(null, resourceId);
  const boundCategorize = categorizeAction.bind(null, resourceId);
  const boundApprove = approveAction.bind(null, resourceId);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{resource.title}</h1>
      <p className="mb-6 text-sm text-slate-500">
        {resource.sourceProvider} &middot; {resource.status} &middot;{" "}
        <a href={resource.publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
          Open source
        </a>
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-medium">Transcript</h2>
            {resource.cleanTranscript ? (
              <p className="whitespace-pre-wrap text-sm text-slate-700">{resource.cleanTranscript}</p>
            ) : (
              <form action={boundSetTranscript} className="flex flex-col gap-2">
                <textarea
                  name="transcript"
                  rows={5}
                  placeholder="Paste a transcript..."
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="self-start rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save transcript
                </button>
              </form>
            )}
          </div>

          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-medium">Supporting documents</h2>
            {resource.sourceDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">None yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {resource.sourceDocuments.map((doc) => (
                  <li key={doc.id} className="rounded bg-slate-50 p-2">
                    <span className="font-medium">{doc.sourceType}</span>
                    {doc.discoveredAutomatically && <span className="ml-2 text-xs text-slate-500">auto-discovered</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">AI categorization</h2>
              <form action={boundCategorize}>
                <button type="submit" className="rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-900">
                  {resource.primaryTopic ? "Regenerate" : "Generate"}
                </button>
              </form>
            </div>

            {resource.primaryTopic ? (
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="font-medium">Primary topic:</span> {resource.primaryTopic}
                </div>
                {resource.secondaryTopics.length > 0 && (
                  <div>
                    <span className="font-medium">Secondary topics:</span> {resource.secondaryTopics.join(", ")}
                  </div>
                )}
                {resource.summary && (
                  <div>
                    <span className="font-medium">Summary:</span> {resource.summary}
                  </div>
                )}
                {resource.questionsAnswered.length > 0 && (
                  <div>
                    <span className="font-medium block">Questions answered:</span>
                    <ul className="list-disc pl-5">
                      {resource.questionsAnswered.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resource.lifeSituations.length > 0 && (
                  <div>
                    <span className="font-medium">Life situations:</span> {resource.lifeSituations.join(", ")}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not generated yet.</p>
            )}

            {resource.evidence.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-slate-500">Evidence</summary>
                <ul className="mt-2 flex flex-col gap-1 pl-4">
                  {resource.evidence.map((e) => (
                    <li key={e.id}>
                      <span className="font-medium">{e.fieldName}</span> ({Math.round(e.confidenceScore * 100)}%
                      confidence){e.sourceExcerpt ? `: "${e.sourceExcerpt}"` : ""}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>

          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-medium">Approval</h2>
            {resource.status === "ACTIVE" ? (
              <p className="text-sm text-green-700">Approved and indexed. Recommendable to visitors.</p>
            ) : (
              <form action={boundApprove}>
                <button type="submit" className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
                  Approve and index
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
