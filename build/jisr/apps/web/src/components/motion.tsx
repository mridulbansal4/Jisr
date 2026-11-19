"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig, animate, motion, useInView, useReducedMotion, type Variants } from "motion/react";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Honours prefers-reduced-motion for every motion component below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </MotionConfig>
  );
}

/** Fade-and-rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
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
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const staggerParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
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

/** Page-level enter transition. */
export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/** Counts up to `value` once visible. Renders the final value for reduced motion / SSR. */
export function CountUp({
  value,
  decimals = 0,
  duration = 1.4,
  format,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<number | null>(null);
  const from = useRef(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(from.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);
  const n = reduce || shown === null ? (inView || reduce ? value : 0) : shown;
  const text = format ? format(n) : n.toFixed(decimals);
  return (
    <span ref={ref} className="tabular">
      {text}
    </span>
  );
}

/** Decorative blurred colour orbs (coral → indigo). Static when reduced motion is on. */
export function Aurora({ variant = "hero", className = "" }: { variant?: "hero" | "soft" | "corner"; className?: string }) {
  const reduce = useReducedMotion();
  const float = reduce ? "" : "animate-float";
  if (variant === "corner") {
    return (
      <div aria-hidden className={`aurora ${className}`}>
        <div className={`orb orb-coral ${float}`} style={{ width: 420, height: 420, top: -180, insetInlineEnd: -120 }} />
        <div className={`orb orb-indigo ${float}`} style={{ width: 380, height: 380, top: -120, insetInlineStart: -160, animationDelay: "-5s" }} />
      </div>
    );
  }
  if (variant === "soft") {
    return (
      <div aria-hidden className={`aurora ${className}`}>
        <div className={`orb orb-amber ${float}`} style={{ width: 520, height: 360, top: -200, left: "20%" }} />
        <div className={`orb orb-sky ${float}`} style={{ width: 420, height: 420, top: 40, insetInlineEnd: -200, animationDelay: "-7s" }} />
      </div>
    );
  }
  return (
    <div aria-hidden className={`aurora hero-wash ${className}`}>
      <div className={`orb orb-coral ${float}`} style={{ width: 640, height: 420, top: -220, left: "calc(50% - 320px)" }} />
      <div className={`orb orb-amber ${float}`} style={{ width: 380, height: 300, top: -60, left: "12%", animationDelay: "-4s" }} />
      <div className={`orb orb-indigo ${float}`} style={{ width: 520, height: 520, top: 180, insetInlineEnd: -220, animationDelay: "-8s" }} />
      <div className={`orb orb-sky ${float}`} style={{ width: 460, height: 460, top: 260, insetInlineStart: -220, animationDelay: "-2s" }} />
    </div>
  );
}

export { motion, useReducedMotion };
