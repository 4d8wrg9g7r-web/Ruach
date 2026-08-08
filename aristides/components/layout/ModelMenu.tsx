"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FAMILIES } from "@/lib/data/models";
import { GuitarVisual } from "@/components/visual/GuitarVisual";

/**
 * The cinematic model menu (§7). Not a dropdown — a full-width panel where each
 * family is an isolated silhouette. Hovering a family enlarges it, reveals its
 * description and string counts, and tints the background toward its finish.
 */
export function ModelMenu({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(FAMILIES[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-16 z-40 hidden border-b border-graphite-line lg:block"
      style={{
        background: `radial-gradient(120% 140% at 85% 0%, rgba(${active.tint.join(",")},0.14), transparent 55%), rgba(11,12,14,0.96)`,
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="shell grid grid-cols-[1.1fr_1fr] gap-10 py-10">
        {/* left — family list */}
        <div>
          <div className="tech-label mb-5">Select a platform</div>
          <ul>
            {FAMILIES.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/models/${f.slug}`}
                  onMouseEnter={() => setActive(f)}
                  onClick={onClose}
                  className="group flex items-baseline justify-between border-b border-graphite-line py-3.5 transition-colors"
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      className="font-display text-3xl font-medium transition-colors"
                      style={{ color: active.id === f.id ? `rgb(${f.tint.join(",")})` : undefined }}
                    >
                      {f.glyph}
                    </span>
                    <span className="font-display text-xl text-chalk">{f.name}</span>
                  </span>
                  <span className="font-mono text-[11px] text-steel">
                    {f.variants.map((v) => v.strings).join(" · ")} str
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-6 text-[11px]">
            <Link href="/models" onClick={onClose} className="tech-label hover:text-chalk">
              Compare all →
            </Link>
            <Link href="/build" onClick={onClose} className="tech-label text-ice hover:text-chalk">
              Build yours →
            </Link>
          </div>
        </div>

        {/* right — featured silhouette */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col"
        >
          <div className="relative h-48 overflow-hidden">
            <GuitarVisual
              construction={active.construction[0]}
              strings={active.variants[active.variants.length - 1].strings}
              detail="card"
              className="absolute left-1/2 top-0 h-[520px] -translate-x-1/2"
            />
          </div>
          <div className="mt-auto">
            <div className="font-display text-2xl">{active.name}</div>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-steel">{active.blurb}</p>
            <div className="mt-3 font-mono text-[11px] text-steel">
              From €{Math.min(...active.variants.map((v) => v.fromPrice))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
