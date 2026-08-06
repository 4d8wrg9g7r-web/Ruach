import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="border-b border-sidebar-border bg-sidebar py-2 text-center text-xs text-white/70">
      Ruach is now available for churches.{" "}
      <Link href="/pricing" className="rounded-sm text-white underline decoration-white/40 underline-offset-2 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light">
        See pricing
      </Link>
    </div>
  );
}
