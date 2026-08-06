"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** "up" fades and rises slightly (default, for section entrances); "none" is a plain opacity fade. */
  direction?: "up" | "none";
}

/**
 * Every marketing section entrance goes through this so prefers-reduced-motion is
 * handled in exactly one place -- useReducedMotion() disables the transform/opacity
 * animation and renders content in its final state immediately, rather than each
 * section re-implementing the same media-query check.
 */
export function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: direction === "up" ? 18 : 0 },
        visible: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
