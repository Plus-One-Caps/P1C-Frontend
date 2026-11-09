"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShoppingBag, X } from "lucide-react";
import { Button, ButtonNative } from "@/components/ui/Button";
import { QtyBadge } from "@/components/checkout/QtyBadge";
import type { CartItem } from "@/lib/cart";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  item: CartItem | null;
  onClose: () => void;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function AddToCartModal({ open, item, onClose }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const thumb = item?.blanks[0]?.imageUrl;
  const title = item?.title || "Custom hats";

  return (
    <AnimatePresence>
      {open && item ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="atc-title"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.25rem] border border-border bg-white shadow-[0_24px_64px_rgba(10,10,10,0.18)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-canvas hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="px-6 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                <Check size={22} strokeWidth={3} />
              </div>
              <h2
                id="atc-title"
                className="mt-4 text-center text-xl font-bold tracking-tight text-ink"
              >
                Added to cart
              </h2>
              <p className="mt-1.5 text-center text-sm text-ink-soft">
                Ready when you are — checkout securely, or keep building.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-canvas/50 p-3">
                <div className="relative shrink-0">
                  <div className="h-16 w-16 overflow-hidden rounded-[0.65rem] bg-white">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-soft">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>
                  <QtyBadge qty={item.totalQty} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {item.decoration.method}
                    {item.design.hasArtwork ? " · Artwork attached" : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                    {money(item.merchandiseEstimate)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    href="/cart"
                    variant="outline"
                    size="lg"
                    arrow={false}
                    className="w-full"
                  >
                    View cart
                  </Button>
                  <Button
                    href="/checkout"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    Checkout
                  </Button>
                </div>
                <ButtonNative
                  type="button"
                  variant="ghost"
                  size="md"
                  arrow={false}
                  onClick={onClose}
                  className={cn("w-full text-ink-soft")}
                >
                  Keep building
                </ButtonNative>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
