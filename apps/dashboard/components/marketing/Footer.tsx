import Link from "next/link";
import { Wind } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/how-it-works", label: "How it Works" },
  { href: "/features", label: "Features" },
  { href: "/product/prayer-wall", label: "Prayer Wall" },
  { href: "/pricing", label: "Pricing" },
];

const COMPANY_LINKS = [
  { href: "/why-ruach", label: "Why Ruach" },
  { href: "/faq", label: "FAQ" },
  { href: "/demo", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Wind size={18} strokeWidth={1.75} className="text-accent" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Ruach</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-secondary">
              Helping churches make their digital ministry easier to discover.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Account</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/login" className="rounded-sm text-sm text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/demo" className="rounded-sm text-sm text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-ink-muted">&copy; {new Date().getFullYear()} Ruach. All rights reserved.</p>
          <ul className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded-sm text-xs text-ink-muted hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="rounded-sm text-sm text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
