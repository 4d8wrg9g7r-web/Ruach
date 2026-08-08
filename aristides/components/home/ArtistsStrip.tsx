import Link from "next/link";
import { SectionLabel } from "@/components/ui/primitives";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ARTISTS } from "@/lib/data/artists";

/**
 * Section 9 — Artists (§8). Dark editorial portraits, horizontal browsing —
 * never a logo wall.
 */
export function ArtistsStrip() {
  return (
    <section className="border-t border-graphite-line bg-graphite py-24">
      <div className="shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <SectionLabel index="/ 09">Artists</SectionLabel>
            <h2 className="mt-6 font-display text-display-sm font-medium">
              PLAYED WHERE
              <br />
              <span className="text-steel">IT MATTERS.</span>
            </h2>
          </div>
          <Link href="/artists" className="hidden font-mono text-[12px] uppercase tracking-wide-tech text-steel hover:text-chalk sm:block">
            All artists →
          </Link>
        </div>
      </div>

      <div className="mt-12 flex snap-x gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-14">
        {ARTISTS.map((a, i) => (
          <Link
            key={a.id}
            href="/artists"
            className="group w-[75vw] shrink-0 snap-start sm:w-[42vw] lg:w-[26vw]"
          >
            <EditorialImage
              tone="mono"
              seed={i}
              aspect="4 / 5"
              className="grayscale transition-all duration-500 group-hover:grayscale-0"
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(80% 60% at 50% 80%, rgba(${a.finishTint.join(",")},0.28), transparent 70%)` }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="font-display text-xl">{a.name}</div>
                <div className="tech-label mt-1">{a.genre}</div>
                <div className="mt-0.5 font-mono text-[11px] text-steel">{a.model}</div>
              </div>
            </EditorialImage>
          </Link>
        ))}
      </div>
    </section>
  );
}
