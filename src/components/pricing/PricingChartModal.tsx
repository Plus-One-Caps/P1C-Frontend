"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PricingMethodId } from "@/data/site";
import { ButtonNative } from "@/components/ui/Button";
import { PricingChart } from "@/components/pricing/PricingChart";
import { cn } from "@/lib/utils";

type Props = {
  initialMethodId?: PricingMethodId;
  className?: string;
  buttonClassName?: string;
  label?: string;
};

export function PricingChartModal({
  initialMethodId = "embroidery",
  className,
  buttonClassName,
  label = "View pricing chart",
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={className}>
      <ButtonNative
        type="button"
        variant="outline"
        size="md"
        className={cn("w-full", buttonClassName)}
        onClick={() => setOpen(true)}
      >
        {label}
      </ButtonNative>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <div className="fixed inset-0 z-[400] flex items-end justify-center p-0 sm:items-center sm:p-6">
                  <motion.button
                    type="button"
                    aria-label="Close pricing chart"
                    className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setOpen(false)}
                  />

                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    className="relative z-[1] flex max-h-[min(92vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-[1.25rem] border border-[#e8eef4] bg-canvas shadow-[0_28px_80px_-24px_rgba(15,23,42,0.45)] sm:rounded-[1.25rem]"
                    initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e8eef4] bg-white px-5 py-4 md:px-6">
                      <div>
                        <p className="text-eyebrow text-pastel-link">
                          Transparent pricing
                        </p>
                        <h2
                          id={titleId}
                          className="mt-1 text-xl font-bold tracking-tight text-ink md:text-2xl"
                        >
                          Blank + decoration, one clear price.
                        </h2>
                        <p className="mt-1.5 max-w-xl text-sm text-ink-soft">
                          Tap a finish — the chart updates live. Every number
                          includes the hat and decoration.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8eef4] text-ink transition hover:bg-canvas"
                        aria-label="Close"
                      >
                        <X size={18} strokeWidth={2.25} />
                      </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
                      <PricingChart
                        initialMethodId={initialMethodId}
                        showActions
                      />
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
