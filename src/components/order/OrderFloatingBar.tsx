"use client";

import {
  ArrowRight,
  Check,
  Loader2,
  Pencil,
  Star,
  Truck,
} from "lucide-react";
import { resolvePriceBreaks, unitPriceAtQty } from "@/lib/priceBreaks";
import { cn } from "@/lib/utils";

const MILESTONES = [
  {
    qty: 12,
    label: "12+ hats",
    perk: "Free art setup",
    Icon: Pencil,
  },
  {
    qty: 24,
    label: "24+ hats",
    perk: "Free shipping",
    Icon: Truck,
  },
  {
    qty: 48,
    label: "48+ hats",
    perk: "Volume pricing",
    Icon: Star,
  },
] as const;

const ARTWORK_SETUP = 50;

type Props = {
  qty: number;
  methodId?: string;
  /** When set (from cart + product breaks), overrides method-table hats math. */
  hatsSubtotal?: number | null;
  itemLabel?: string;
  ctaLabel: string;
  onContinue: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/** Largest qty break threshold that is still ≤ current qty. */
function unitPriceFor(qty: number, methodId?: string): number {
  const breaks = resolvePriceBreaks(null, methodId);
  return unitPriceAtQty(breaks, qty) ?? 26;
}

function nextPriceBreak(qty: number, methodId?: string) {
  const breaks = resolvePriceBreaks(null, methodId);
  const current = unitPriceFor(Math.max(qty, 1), methodId);
  for (const b of breaks) {
    if (b.qty <= Math.max(qty, 1)) continue;
    if (b.price < current) {
      return {
        at: b.qty,
        price: b.price,
        save: Math.round((current - b.price) * 100) / 100,
      };
    }
  }
  return null;
}

function nextMilestone(qty: number) {
  return MILESTONES.find((m) => qty < m.qty) || null;
}

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function OrderFloatingBar({
  qty,
  methodId,
  hatsSubtotal,
  itemLabel,
  ctaLabel,
  onContinue,
  disabled,
  loading,
}: Props) {
  const unit = unitPriceFor(Math.max(qty, 1), methodId);
  const setup = qty > 0 && qty < 12 ? ARTWORK_SETUP : 0;
  const hatsTotal =
    qty > 0
      ? hatsSubtotal != null && Number.isFinite(hatsSubtotal)
        ? hatsSubtotal
        : unit * qty
      : 0;
  const total = hatsTotal + setup;
  const nextBreak = nextPriceBreak(qty, methodId);
  const milestone = nextMilestone(qty);
  const progressMax = MILESTONES[MILESTONES.length - 1].qty;
  const progressPct = Math.min(100, (qty / progressMax) * 100);

  const need = milestone ? milestone.qty - qty : 0;
  const nudge =
    qty <= 0
      ? "Add hats to unlock free perks"
      : milestone
        ? (
            <>
              Add{" "}
              <span className="mx-0.5 inline-flex items-center rounded-md bg-ink px-1.5 py-0.5 text-[0.8125rem] font-bold uppercase tracking-wide text-white">
                {need} more
              </span>{" "}
              → {milestone.perk}
            </>
          )
        : "All volume perks unlocked";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6"
      role="region"
      aria-label="Order progress"
    >
      <div className="pointer-events-auto mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-white shadow-[0_-8px_40px_rgba(10,10,10,0.12)]">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:px-5 md:py-4">
          {/* Progress + messaging */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-ink md:text-[0.8125rem]">
              {nudge}
            </p>
            {nextBreak ? (
              <p className="mt-1 text-sm text-ink-soft md:text-sm">
                Next price break at{" "}
                <span className="font-semibold text-ink">{nextBreak.at} hats</span>
                :{" "}
                <span className="font-bold text-pastel-link">
                  {money(nextBreak.price)}/hat
                </span>
                , you save {money(nextBreak.save)} on every hat
              </p>
            ) : qty > 0 ? (
              <p className="mt-1 text-sm text-ink-soft md:text-sm">
                You&apos;re on the best listed volume rate for this finish.
              </p>
            ) : (
              <p className="mt-1 text-sm text-ink-soft md:text-sm">
                Free artwork setup at 12 · free shipping at 24 · volume rates from
                there.
              </p>
            )}

            {/* Milestone track */}
            <div className="relative mt-4 hidden sm:block">
              <div className="absolute left-0 right-0 top-[13px] h-[3px] rounded-full bg-[#e8eef4]" />
              <div
                className="absolute left-0 top-[13px] h-[3px] rounded-full bg-pastel-sky transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
              <ul className="relative m-0 flex list-none justify-between gap-2 p-0">
                {MILESTONES.map((m) => {
                  const unlocked = qty >= m.qty;
                  const isNext = milestone?.qty === m.qty;
                  const Icon = m.Icon;
                  return (
                    <li
                      key={m.qty}
                      className="flex min-w-0 flex-1 flex-col items-center"
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white transition-colors",
                          unlocked
                            ? "border-ink bg-ink text-white"
                            : isNext
                              ? "border-pastel-sky text-ink"
                              : "border-[#d7dee8] text-ink-soft",
                        )}
                      >
                        {unlocked ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <Icon size={13} strokeWidth={2.25} />
                        )}
                      </span>
                      <p
                        className={cn(
                          "mt-1.5 whitespace-nowrap text-center text-[0.8125rem] font-bold leading-tight",
                          unlocked || isNext ? "text-ink" : "text-ink-soft",
                        )}
                      >
                        {m.label}
                      </p>
                      <p className="whitespace-nowrap text-center text-sm leading-tight text-ink-soft">
                        {m.perk}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Compact milestones on mobile */}
            <div className="mt-3 flex gap-2 sm:hidden">
              {MILESTONES.map((m) => {
                const unlocked = qty >= m.qty;
                return (
                  <span
                    key={m.qty}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-sm font-semibold",
                      unlocked
                        ? "border-ink bg-ink text-white"
                        : "border-border bg-canvas text-ink-soft",
                    )}
                  >
                    {unlocked ? <Check size={10} strokeWidth={3} /> : null}
                    {m.qty}+
                  </span>
                );
              })}
            </div>
          </div>

          {/* Summary + CTA */}
          <div className="flex shrink-0 items-center gap-4 border-t border-border pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="min-w-[6.5rem]">
              <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-ink">
                {qty > 0 ? money(total) : "—"}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-snug text-ink-soft">
                {qty > 0 ? (
                  <>
                    {qty} {itemLabel || "hat"}
                    {qty === 1 ? "" : "s"}
                    {setup > 0 ? ` (+${money(setup)} setup)` : ""}
                    <span className="block tabular-nums">
                      {money(unit)}/hat
                    </span>
                  </>
                ) : (
                  "Build your order"
                )}
              </p>
              {qty > 0 && qty < 12 ? (
                <span className="mt-1.5 inline-flex rounded-full bg-pastel-sky/70 px-2 py-0.5 text-sm font-bold text-ink">
                  Price drops at 12
                </span>
              ) : qty >= 24 ? (
                <span className="mt-1.5 inline-flex rounded-full bg-pastel-sky/70 px-2 py-0.5 text-sm font-bold text-ink">
                  Free shipping unlocked
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onContinue}
              disabled={disabled || loading}
              className={cn(
                "group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-mid disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
