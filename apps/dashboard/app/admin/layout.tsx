import { notFound } from "next/navigation";
import Link from "next/link";
import { Wind } from "lucide-react";
import { requirePlatformAdmin } from "../../lib/session";

/**
 * Own minimal shell, sibling to (dashboard) rather than nested inside it -- platform
 * admin is cross-org (you might not even be a member of any organization), so it
 * doesn't make sense inside the org-scoped dashboard layout/sidebar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requirePlatformAdmin();
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Wind size={18} strokeWidth={1.75} className="text-accent" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Ruach admin</span>
          <nav className="ml-6 flex gap-4 text-sm">
            <Link href="/admin/access-codes" className="text-ink-secondary hover:text-ink">
              Access codes
            </Link>
          </nav>
          <Link href="/dashboard" className="ml-auto text-sm text-ink-muted hover:text-ink">
            Back to dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
