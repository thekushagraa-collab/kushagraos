/* ============================================================================
   KushagraOS — motion presets (framer-motion)
   transform/opacity ONLY. Spring-leaning easings. One orchestrated, staggered
   page-load reveal beats scattered micro-interactions.
   ========================================================================== */

import type { Variants, Transition } from "framer-motion";

export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];
export const EASE_SPRING: Transition["ease"] = [0.34, 1.56, 0.64, 1];

/** Parent container that staggers its children on reveal. */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Child item: rises and fades in. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: EASE_OUT_EXPO },
  },
};

/** Child item: scales up subtly from 96%. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

/** Window open/close spring physics (OS shell, Phase 2). Weighty + a touch of
    overshoot so a window reads as having mass when it opens (~600ms settle). */
export const windowSpring: Transition = {
  type: "spring",
  stiffness: 210,
  damping: 22,
  mass: 1,
};
