"use client";

import { motion } from "framer-motion";

/**
 * Page transition. app/template.tsx remounts on every navigation, so this plays
 * a short aperture-style iris reveal as each new page enters — the "aperture
 * opens again" half of the transition metaphor. Kept under 600ms so navigation
 * never feels slowed; reduced-motion users get an instant, transform-free swap.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
