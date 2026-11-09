"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

export function FaqAccordion({
  items,
  className,
  idPrefix = "faq",
  defaultOpen = 0,
}: {
  items: FaqItem[];
  className?: string;
  /** Unique prefix when multiple accordions share a page. */
  idPrefix?: string;
  /** Index to open initially, or null for all closed. */
  defaultOpen?: number | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const reduce = useReducedMotion();

  return (
    <div
      className={cn("divide-y divide-border border-y border-border", className)}
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${idPrefix}-panel-${index}`;
        const buttonId = `${idPrefix}-button-${index}`;

        return (
          <div key={item.q}>
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left md:py-6"
              >
                <span className="text-lg font-bold tracking-tight text-ink md:text-xl">
                  {item.q}
                </span>
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8eef4] bg-white text-ink transition-transform duration-200",
                    open && "rotate-180",
                  )}
                  aria-hidden
                >
                  <ChevronDown size={18} strokeWidth={2.25} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-12 text-sm leading-relaxed text-ink-soft md:pb-6 md:text-base">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
