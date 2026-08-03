import {
  BarChart3,
  ChevronDown,
  Globe,
  Library,
  LayoutDashboard,
  LifeBuoy,
  Monitor,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Wind,
} from "lucide-react";
import { redirect } from "next/navigation";
import { resourceService } from "@ruach/database";
import { SidebarNavItem } from "../../components/ui/SidebarNavItem";
import { signOut } from "../../auth";
import { getCurrentOrganization, getCurrentUser } from "../../lib/session";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/onboarding");

  const user = await getCurrentUser();
  const pendingReview = await resourceService.listResources(organization.id, { status: "REVIEW_REQUIRED" });

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="flex w-[240px] shrink-0 flex-col border-r border-sidebar-border"
        style={{
          background: "linear-gradient(180deg, #090d11 0%, #0c1116 60%, #080b0f 100%)",
        }}
      >
        <div className="flex items-center gap-2 px-5 pb-5 pt-6">
          <Wind size={20} strokeWidth={1.75} className="text-accent-light" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Ruach</span>
        </div>

        <div className="px-3 pb-4">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition-colors duration-180 hover:bg-white/[0.06]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent/25 text-xs font-semibold text-accent-light">
              {initials(organization.name)}
            </span>
            <span className="flex-1 truncate text-sm font-medium text-white">{organization.name}</span>
            <ChevronDown size={14} className="text-white/40" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          <SidebarNavItem href="/dashboard" label="Overview" icon={<LayoutDashboard size={17} strokeWidth={1.75} />} />
          <SidebarNavItem href="/resources" label="Resources" icon={<Library size={17} strokeWidth={1.75} />} />
          <SidebarNavItem
            href="/resources?status=REVIEW_REQUIRED"
            label="Review Queue"
            icon={<Search size={17} strokeWidth={1.75} />}
            badge={pendingReview.length}
          />
          <SidebarNavItem href="/widgets" label="Widgets" icon={<Monitor size={17} strokeWidth={1.75} />} />
          <SidebarNavItem href="/websites" label="Websites" icon={<Globe size={17} strokeWidth={1.75} />} />
          <SidebarNavItem href="/analytics" label="Analytics" icon={<BarChart3 size={17} strokeWidth={1.75} />} />
          <SidebarNavItem href="/settings" label="Settings" icon={<SettingsIcon size={17} strokeWidth={1.75} />} />
        </nav>

        <div className="flex flex-col gap-3 px-3 pb-4">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-accent-light" />
              <span className="text-xs font-semibold text-white">Pro Plan</span>
            </div>
            <p className="mb-2.5 text-[11px] text-white/40">Renews Jul 12, 2026</p>
            <div className="mb-1 flex items-center justify-between text-[11px] text-white/60">
              <span>12,460 / 25,000 queries</span>
            </div>
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent" style={{ width: "50%" }} />
            </div>
            <a href="#" className="text-xs font-medium text-accent-light hover:text-accent">
              View billing →
            </a>
          </div>

          <div className="flex items-center gap-2.5 border-t border-white/[0.06] pt-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {initials(user?.name || user?.email || "?")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{user?.name || "Account"}</div>
              <div className="truncate text-[11px] text-white/40">{user?.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between px-0.5 text-[11px]">
            <a href="#" className="flex items-center gap-1 text-white/40 hover:text-white/70">
              <LifeBuoy size={12} /> Help & Support
            </a>
            <form action={signOutAction}>
              <button type="submit" className="text-white/40 hover:text-white/70">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-8 md:px-10">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
