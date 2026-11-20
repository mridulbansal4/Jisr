"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, type Variants } from "motion/react";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Honours prefers-reduced-motion for every motion component below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

/** Quiet opacity fade when scrolled into view. No movement, no delay chains. */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </M>
  );
}

const staggerParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const staggerChild: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
};

export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M className={className} variants={staggerParent} initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      {children}
    </M>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const M = motion[as];
  return (
    <M className={className} variants={staggerChild}>
      {children}
    </M>
  );
}

/** Page-level enter transition: a short fade. */
export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: EASE }}>
      {children}
    </motion.div>
  );
}

export { motion, useReducedMotion };
