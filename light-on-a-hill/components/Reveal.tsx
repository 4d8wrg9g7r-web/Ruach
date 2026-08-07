"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Scroll-triggered entrance. Quick, restrained, reduced-motion aware (framer
 *  drops the transform automatically when the user prefers reduced motion). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span" | "li" | "section";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
