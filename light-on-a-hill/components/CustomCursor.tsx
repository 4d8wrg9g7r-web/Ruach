"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Contextual cursor (desktop, fine-pointer only). A small dot by default; over
 * any element carrying `data-cursor="explore|view|drag"` it grows into a label.
 * Disabled entirely on touch devices and when reduced motion is requested.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
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
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(target?.dataset.cursor ?? null);
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
  const expanded = Boolean(label);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:flex"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/70 bg-paper/10 uppercase tracking-label text-paper backdrop-blur-[1px] mix-blend-difference"
        animate={{
          width: expanded ? 84 : down ? 10 : 14,
          height: expanded ? 84 : down ? 10 : 14,
          fontSize: expanded ? 10 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
