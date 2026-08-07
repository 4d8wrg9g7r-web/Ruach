"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Contextual cursor (desktop, fine-pointer only).
 *
 *   default                     → small dot
 *   [data-cursor-ring="sm"]     → thin focus ring (menu links)
 *   [data-cursor-ring="lg"]     → expanded focus ring (the aperture control)
 *   [data-cursor="explore|view|drag"] → labelled ring over imagery
 *
 * Disabled on touch devices and under prefers-reduced-motion.
 */
type Mode =
  | { kind: "dot" }
  | { kind: "ring"; size: number }
  | { kind: "label"; text: string };

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: "dot" });
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 });

  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      const labelled = t?.closest?.("[data-cursor]") as HTMLElement | null;
      const label = labelled?.dataset.cursor;
      if (label) {
        setMode({ kind: "label", text: label });
        return;
      }
      const ring = (t?.closest?.("[data-cursor-ring]") as HTMLElement | null)?.dataset.cursorRing;
      if (ring) {
        setMode({ kind: "ring", size: ring === "lg" ? 52 : 34 });
        return;
      }
      setMode({ kind: "dot" });
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  const size =
    mode.kind === "label" ? 84 : mode.kind === "ring" ? (down ? mode.size - 6 : mode.size) : down ? 10 : 13;
  const isDot = mode.kind === "dot";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:flex"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full uppercase tracking-label text-paper mix-blend-difference"
        animate={{
          width: size,
          height: size,
          fontSize: mode.kind === "label" ? 10 : 0,
          backgroundColor: isDot ? "rgba(244,242,237,0.9)" : "rgba(244,242,237,0.04)",
          borderWidth: isDot ? 0 : 1,
        }}
        style={{ borderStyle: "solid", borderColor: "rgba(244,242,237,0.75)" }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {mode.kind === "label" ? mode.text : null}
      </motion.div>
    </motion.div>
  );
}
