"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Section 4 — Performance (§8). Editorial split statements, each paired with a
 * beautiful visual metaphor rather than a fake scientific claim.
 */

const ROWS = [
  {
    head: ["STABILITY", "WITHOUT THE WEATHER REPORT."],
    copy: "The structure holds its geometry through temperature and humidity. Set it up once; it stays set up.",
    metaphor: "stability" as const,
  },
  {
    head: ["CLARITY", "BELOW STANDARD TUNING."],
    copy: "Low strings keep their definition where wood tends to blur — every note reads, even detuned.",
    metaphor: "clarity" as const,
  },
  {
    head: ["SUSTAIN", "WITHOUT THE FIGHT."],
    copy: "Energy is carried, not absorbed. Notes bloom and hold with almost no effort from the player.",
    metaphor: "sustain" as const,
  },
];

export function Performance() {
  return (
    <section className="border-t border-graphite-line bg-void py-24">
      <div className="shell">
        <SectionLabel index="/ 04">Performance</SectionLabel>
        <div className="mt-14 space-y-px">
          {ROWS.map((r, i) => (
            <Reveal key={i}>
              <div className="grid items-center gap-8 border-t border-graphite-line py-12 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <h3 className="font-display text-display-sm font-medium leading-[0.95]">
                    {r.head[0]}
                    <br />
                    <span className="text-steel">{r.head[1]}</span>
                  </h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-steel">{r.copy}</p>
                </div>
                <div className="h-40 w-full">
                  <Metaphor kind={r.metaphor} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metaphor({ kind }: { kind: "stability" | "clarity" | "sustain" }) {
  if (kind === "stability") {
    // a taut, unwavering line vs a wobbling ghost
    return (
      <svg viewBox="0 0 400 160" className="h-full w-full">
        <motion.path
          d="M10 80 Q100 40 200 80 T390 80"
          fill="none"
          stroke="rgba(138,143,152,0.3)"
          strokeWidth="1.5"
          animate={{ d: ["M10 80 Q100 40 200 80 T390 80", "M10 80 Q100 120 200 80 T390 80", "M10 80 Q100 40 200 80 T390 80"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <line x1="10" y1="80" x2="390" y2="80" stroke="#7FE9E3" strokeWidth="2" />
        <text x="10" y="150" className="font-mono" fill="#565b63" fontSize="10">HELD GEOMETRY</text>
      </svg>
    );
  }
  if (kind === "clarity") {
    // separated frequency bars vs muddy overlap
    return (
      <svg viewBox="0 0 400 160" className="h-full w-full">
        {Array.from({ length: 24 }).map((_, i) => {
          const h = 20 + Math.abs(Math.sin(i * 0.7)) * 90;
          return (
            <motion.rect
              key={i}
              x={10 + i * 16}
              width="7"
              y={120 - h}
              height={h}
              fill={i % 3 === 0 ? "#7FE9E3" : "rgba(138,143,152,0.35)"}
              initial={{ scaleY: 0.3 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "bottom" }}
            />
          );
        })}
        <text x="10" y="150" className="font-mono" fill="#565b63" fontSize="10">DEFINED BANDS</text>
      </svg>
    );
  }
  // sustain — long slow decay envelope
  return (
    <svg viewBox="0 0 400 160" className="h-full w-full">
      <motion.path
        d="M10 80 C60 20 60 140 110 80 C160 30 160 130 210 80 C260 40 260 120 310 80 C350 55 360 105 390 80"
        fill="none"
        stroke="#7FE9E3"
        strokeWidth="1.6"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />
      <line x1="10" y1="80" x2="390" y2="80" stroke="rgba(138,143,152,0.2)" strokeWidth="1" strokeDasharray="3 4" />
      <text x="10" y="150" className="font-mono" fill="#565b63" fontSize="10">SLOW DECAY</text>
    </svg>
  );
}
