import { Filter, MessageSquare } from "lucide-react";
import Link from "next/link";
import { conversationService, widgetService } from "@ruach/database";
import { AutoSubmitSelect } from "../../../components/AutoSubmitSelect";
import { ConversationList } from "../../../components/ConversationList";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { getCurrentOrganization } from "../../../lib/session";

const PAGE_SIZE = 25;

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; widgetId?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const widgetId = params.widgetId || undefined;

  const [{ conversations, total, totalPages }, widgets] = await Promise.all([
    conversationService.listConversations(organization.id, { page, pageSize: PAGE_SIZE, widgetId }),
    widgetService.listWidgets(organization.id),
  ]);

  const rows = conversations.map((c) => ({
    id: c.id,
    widgetName: c.widgetName,
    messageCount: c.messageCount,
    lastMessagePreview: c.lastMessage?.content ?? null,
    updatedAt: c.updatedAt,
  }));

  const pageHref = (targetPage: number) => {
    const qs = new URLSearchParams({ page: String(targetPage), ...(widgetId ? { widgetId } : {}) });
    return `/conversations?${qs.toString()}`;
  };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Conversations</h1>
          <p className="text-sm text-ink-secondary">
            Every conversation visitors have had with your widgets -- {total.toLocaleString()} total.
          </p>
        </div>
        {widgets.length > 1 && (
          <form action="/conversations" className="relative shrink-0">
            <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <AutoSubmitSelect
              name="widgetId"
              defaultValue={widgetId ?? ""}
              options={[{ value: "", label: "All widgets" }, ...widgets.map((w) => ({ value: w.id, label: w.name }))]}
              className="appearance-none rounded-sm border border-border-strong bg-surface py-2 pl-8 pr-6 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </form>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          bare={false}
          icon={<MessageSquare size={28} strokeWidth={1.5} />}
          title="No conversations yet"
          description={
            widgetId
              ? "No conversations for this widget yet -- try a different widget, or check back once visitors start asking questions."
              : "Once visitors start asking your widget questions, their conversations will show up here."
          }
        />
      ) : (
        <>
          <Card padding="md">
            <ConversationList conversations={rows} />
          </Card>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-3">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="text-accent-dark hover:underline">
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className="text-accent-dark hover:underline">
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
