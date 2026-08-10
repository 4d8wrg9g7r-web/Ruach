import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { conversationService, resourceService } from "@ruach/database";
import { Card } from "../../../../components/ui/Card";
import { getCurrentOrganization } from "../../../../lib/session";

function formatTimestamp(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const { conversationId } = await params;
  const conversation = await conversationService.getConversationDetail(organization.id, conversationId);
  if (!conversation) notFound();

  // Resolve every recommended resource referenced anywhere in the transcript in one
  // query, rather than per-message -- most transcripts reference a handful of
  // resources at most, and this keeps the page to a single extra round-trip.
  const recommendedIds = [...new Set(conversation.messages.flatMap((m) => m.recommendedResourceIds))];
  const resources = recommendedIds.length > 0 ? await resourceService.getResourcesByIds(organization.id, recommendedIds) : [];
  const resourceById = new Map(resources.map((r) => [r.id, r]));

  return (
    <div>
      <Link
        href="/conversations"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} /> Conversations
      </Link>

      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">{conversation.widget.name}</h1>
      <p className="mb-8 text-sm text-ink-secondary">
        Started {formatTimestamp(conversation.createdAt)} &middot; {conversation.messages.length}{" "}
        {conversation.messages.length === 1 ? "message" : "messages"}
      </p>

      <Card padding="md">
        <ul className="flex flex-col gap-5">
          {conversation.messages.map((message) => {
            const isUser = message.role === "USER";
            const recommendations = message.recommendedResourceIds
              .map((id) => resourceById.get(id))
              .filter((r): r is NonNullable<typeof r> => Boolean(r));

            return (
              <li key={message.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                    isUser ? "bg-accent text-white" : "bg-surface-muted text-ink"
                  }`}
                >
                  {message.content}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  <span>{isUser ? "Visitor" : "Assistant"}</span>
                  <span>&middot;</span>
                  <span>{formatTimestamp(message.createdAt)}</span>
                </div>
                {recommendations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recommendations.map((r) => (
                      <Link
                        key={r.id}
                        href={`/resources/${r.id}`}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-ink-secondary hover:border-accent hover:text-accent-dark"
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
