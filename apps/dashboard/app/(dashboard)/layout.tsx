import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentOrganization } from "../../lib/session";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/websites", label: "Websites" },
  { href: "/widgets", label: "Widgets" },
  { href: "/resources", label: "Resources" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/onboarding");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <span className="font-semibold">Ruach</span>
            <span className="ml-2 text-sm text-slate-500">{organization.name}</span>
          </div>
          <nav className="flex gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
