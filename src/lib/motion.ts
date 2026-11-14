import { Variants } from "framer-motion";

/**
 * Shared Motion System Tokens
 * Durations: 150 / 250 / 400 / 700ms
 * Easing: [0.22, 1, 0.36, 1] (Cubic-bezier for premium feel)
 * Stagger: 40 - 80ms
 */
export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.25,
    smooth: 0.4,
    slow: 0.7,
  },
  ease: [0.22, 1, 0.36, 1] as const,
  stagger: {
    fast: 0.04,
    base: 0.06,
    slow: 0.08,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.smooth,
      ease: MOTION.ease,
      delay: custom * MOTION.stagger.base,
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION.duration.base,
      ease: MOTION.ease,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION.stagger.base,
      delayChildren: 0.05,
    },
  },
};

export const cardHoverVariants = {
  rest: { y: 0, scale: 1, transition: { duration: MOTION.duration.base, ease: MOTION.ease } },
  hover: { y: -3, scale: 1.005, transition: { duration: MOTION.duration.base, ease: MOTION.ease } },
  tap: { scale: 0.99, transition: { duration: MOTION.duration.fast, ease: MOTION.ease } },
};
