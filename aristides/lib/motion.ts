import type { Variants, Transition } from "framer-motion";

/**
 * Motion system (§30). Physical weight, mechanical easing, no bounce or
 * elastic. UI transitions live at 150–250ms; editorial reveals at 500–900ms.
 */

export const EASE_MECH: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_UI: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const uiTransition: Transition = { duration: 0.2, ease: EASE_UI };
export const editorialTransition: Transition = { duration: 0.8, ease: EASE_MECH };

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: editorialTransition,
  },
};

export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE_MECH } },
};
