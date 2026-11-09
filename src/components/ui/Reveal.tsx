"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section";
  id?: string;
};

/** Quick fade + rise once when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 12,
  as = "div",
  id,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      id={id}
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.28,
        delay: Math.min(delay, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Comp>
  );
}
