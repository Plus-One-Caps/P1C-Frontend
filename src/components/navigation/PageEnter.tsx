"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Quick enter on route change — always from the top. */
export function PageEnter({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
