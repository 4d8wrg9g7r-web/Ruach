import Link from "next/link";
import { Wordmark } from "@/components/layout/Wordmark";
import { CATALOG_FROM_PRICE } from "@/lib/data/models";

const COLUMNS = [
  {
    title: "Instruments",
    links: [
      { href: "/models/0-standard", label: "0 Standard" },
      { href: "/models/s-multiscale", label: "S Multiscale" },
      { href: "/models/h-headless", label: "H Headless" },
      { href: "/models/t-style", label: "T Style" },
      { href: "/models/stx", label: "STX" },
      { href: "/models/sb-bass", label: "S/B Bass" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/arium", label: "Arium" },
      { href: "/production", label: "Production" },
      { href: "/gallery", label: "Gallery" },
      { href: "/artists", label: "Artists" },
      { href: "/story", label: "Story" },
    ],
  },
  {
    title: "Own one",
    links: [
      { href: "/build", label: "Build Your Aristides" },
      { href: "/models", label: "Compare Models" },
      { href: "/in-stock", label: "In Stock" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-graphite-line bg-graphite">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Wordmark className="h-4 w-auto text-chalk" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-steel">
              Hand-built in Haarlem, The Netherlands. Engineered around Arium — a rigid exoskeleton
              over a resonant core. Science × Craft, one instrument.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-steel">
              <span>HAARLEM / NL</span>
              <span>ARIUM CORE</span>
              <span>HAND BUILT</span>
              <span>FROM €{CATALOG_FROM_PRICE}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="tech-label mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-steel transition-colors hover:text-chalk">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-graphite-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-steel-dim">
            © {new Date().getFullYear()} Aristides Instruments — prototype rebuild
          </p>
          <div className="flex gap-6 font-mono text-[11px] text-steel-dim">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
