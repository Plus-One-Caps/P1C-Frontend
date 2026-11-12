"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  pricingByMethod,
  pricingDecorationMethods,
  pricingQtyLabels,
  type PricingMethodId,
} from "@/data/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type PricingChartProps = {
  initialMethodId?: PricingMethodId;
  showActions?: boolean;
  className?: string;
};

/** Compact live pricing chart — method tabs without images. */
export function PricingChart({
  initialMethodId = "embroidery",
  showActions = true,
  className,
}: PricingChartProps) {
  const reduce = useReducedMotion();
  const safeInitial = pricingByMethod[initialMethodId]
    ? initialMethodId
    : "embroidery";
  const [methodId, setMethodId] = useState<PricingMethodId>(safeInitial);

  const method =
    pricingDecorationMethods.find((m) => m.id === methodId) ??
    pricingDecorationMethods[0];
  const breaks = pricingByMethod[methodId];

  return (
    <div className={cn("w-full", className)}>
      <div
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        role="tablist"
        aria-label="Decoration method"
      >
        {pricingDecorationMethods.map((item) => {
          const selected = item.id === methodId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMethodId(item.id)}
              className={cn(
                "rounded-[12px] border px-3 py-3 text-left transition-colors",
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-[#e8eef4] bg-white text-ink hover:border-[#d1d5db]",
              )}
            >
              <span className="block text-sm font-bold tracking-tight">
                {item.name}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[0.8125rem] font-semibold",
                  selected ? "text-white/70" : "text-ink-soft",
                )}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#eef2f6] px-5 py-4 md:px-6">
          <div className="min-w-0">
            <p className="text-eyebrow text-ink-soft">Live pricing</p>
            <h3 className="mt-1 text-lg font-bold tracking-tight text-ink">
              Price per hat by quantity
            </h3>
            <p className="mt-1 min-h-[1.25rem] text-sm text-ink-soft">
              <span className="font-semibold text-ink">{method.name}</span>
              {" · "}
              blank + decoration included
              {method.minQty
                ? ` · ${method.minQty}-hat minimum`
                : " · no minimum"}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-pastel-link">
            Free shipping on 24+
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] table-fixed border-collapse text-left sm:min-w-[36rem]">
            <thead>
              <tr className="border-b border-[#eef2f6] bg-[#f8fafc]">
                {pricingQtyLabels.map((qty) => (
                  <th
                    key={qty}
                    scope="col"
                    className="w-[12.5%] px-3 py-3 text-center text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-ink-soft md:px-4"
                  >
                    {qty}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {breaks.map((row) => (
                  <td key={row.qty} className="px-3 py-5 text-center md:px-4">
                    <span className="relative mx-auto flex h-8 w-full items-center justify-center md:h-9">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={`${methodId}-${row.qty}-${row.price ?? "na"}`}
                          className={cn(
                            "absolute inset-0 flex items-center justify-center text-xl font-extrabold tracking-tight tabular-nums md:text-2xl",
                            row.price == null ? "text-ink-soft" : "text-ink",
                          )}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduce ? undefined : { opacity: 0 }}
                          transition={{ duration: 0.2, ease }}
                        >
                          {row.price == null ? "—" : `$${row.price}`}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="border-t border-[#eef2f6] px-5 py-3.5 text-xs leading-relaxed text-ink-soft md:px-6">
          Extra print locations add to the per-hat rate. Specialty colors /
          oversized sizes may add $2. You always approve a mockup before
          production.
        </p>
      </div>

      {showActions ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button href={`/order?method=${methodId}`} variant="primary" size="lg">
            Start with {method.name.toLowerCase()}
          </Button>
          <Button href="/shop" variant="outline" size="lg">
            Browse blanks first
          </Button>
        </div>
      ) : null}
    </div>
  );
}
