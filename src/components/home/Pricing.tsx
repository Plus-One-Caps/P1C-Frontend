"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import {
  pricingByMethod,
  pricingDecorationMethods,
  pricingQtyLabels,
  type PricingMethodId,
} from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type PricingProps = {
  /** When true, skip the big homepage heading (used on /pricing). */
  hideIntro?: boolean;
};

export function Pricing({ hideIntro = false }: PricingProps) {
  const reduce = useReducedMotion();
  const [methodId, setMethodId] = useState<PricingMethodId>("embroidery");

  const method =
    pricingDecorationMethods.find((m) => m.id === methodId) ??
    pricingDecorationMethods[0];

  const breaks = pricingByMethod[methodId];

  return (
    <section
      id="pricing"
      className={cn(
        "scroll-mt-28 relative overflow-hidden bg-canvas",
        hideIntro ? "py-10 md:py-14" : "py-20 md:py-28",
      )}
      aria-labelledby={hideIntro ? undefined : "pricing-heading"}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_0%_0%,rgba(164,216,255,0.32),transparent_55%)]"
        aria-hidden
      />

      <Container className="relative">
        {!hideIntro ? (
          <Reveal className="max-w-2xl">
            <p className="text-eyebrow text-pastel-link">Transparent pricing</p>
            <h2 id="pricing-heading" className="mt-3 text-section-title text-ink">
              Blank + decoration,
              <span className="block text-ink-soft">One clear price.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Tap a finish below — the chart updates live. Every number includes
              the hat and decoration. Exact dollars still vary slightly by blank
              in the order flow.
            </p>
          </Reveal>
        ) : null}

        {/* Method picker */}
        <div
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          role="tablist"
          aria-label="Decoration method"
        >
          {pricingDecorationMethods.map((item, index) => {
            const selected = item.id === methodId;
            return (
              <Reveal key={item.id} delay={0.04 + index * 0.05}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMethodId(item.id)}
                  className={cn(
                    "group flex w-full flex-col overflow-hidden rounded-[14px] border bg-white text-left transition-[border-color,box-shadow,transform] duration-200",
                    selected
                      ? "border-ink shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
                      : "border-[#e8eef4] hover:-translate-y-0.5 hover:border-[#d1d5db] hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]",
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f7f8fa]">
                    <Image
                      src={item.image}
                      alt={`${item.name} example`}
                      fill
                      sizes="(min-width: 640px) 30vw, 90vw"
                      className="object-cover object-center"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-bold tracking-tight text-ink">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-sm font-bold uppercase tracking-wide",
                          selected
                            ? "bg-ink text-white"
                            : "bg-[rgba(164,216,255,0.35)] text-pastel-link",
                        )}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {item.summary}
                    </p>
                    <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {item.notes.map((note) => (
                        <li
                          key={note}
                          className="flex items-start gap-2 text-xs text-ink md:text-sm"
                        >
                          <Check
                            size={14}
                            className="mt-0.5 shrink-0 text-pastel-link"
                            strokeWidth={2.5}
                          />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Live qty chart */}
        <Reveal delay={0.12} className="mt-10">
          <div className="overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white">
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
              <table className="w-full min-w-[36rem] table-fixed border-collapse text-left">
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
                      <td
                        key={row.qty}
                        className="px-3 py-5 text-center md:px-4"
                      >
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
              oversized sizes may add $2. Artwork setup is free at 12+ hats — and
              always waived when you reorder with previous art. You always
              approve a mockup before production.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-10 flex flex-wrap items-center gap-3">
          <Button href={`/order?method=${methodId}`} variant="primary" size="lg">
            Start with {method.name.toLowerCase()}
          </Button>
          <Button href="/pricing" variant="outline" size="lg">
            Full pricing details
          </Button>
          <Button href="/decorations" variant="ghost" size="lg">
            Compare finishes
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
