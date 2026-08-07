"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Iris page transition. app/template.tsx remounts on navigation, so each new
 * page is revealed through an expanding circular opening from the viewport
 * centre — the receiving half of the aperture metaphor (the sending half is
 * the menu's blades sealing before route change). Short enough (~550ms) that
 * navigation never feels slowed; reduced-motion gets a plain fade.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ clipPath: "circle(4% at 50% 50%)", opacity: 0.6 }}
      animate={{ clipPath: "circle(120% at 50% 50%)", opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
