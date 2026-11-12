"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { Button, ButtonNative } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/components/cart/CartProvider";
import { QtyBadge } from "@/components/checkout/QtyBadge";
import { shippingForQty } from "@/data/checkoutOptions";
import { cn } from "@/lib/utils";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function CartView() {
  const searchParams = useSearchParams();
  const isReorder = searchParams.get("reorder") === "1";
  const { items, hydrated, itemCount, merchandiseTotal, removeItem } = useCart();
  const ship = shippingForQty(itemCount);

  if (!hydrated) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col bg-canvas/40 py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="h-40 animate-pulse rounded-[var(--radius-md)] border border-border bg-white" />
        </Container>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col justify-center bg-canvas/40 py-16 md:py-24">
        <Container className="max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-ink">
            <ShoppingBag size={24} />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-ink-soft md:text-base">
            Build a custom hat order, add it to your cart, then check out when
            you&apos;re ready.
          </p>
          <Button href="/order" variant="secondary" size="lg" className="mt-8">
            Start your order
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col bg-canvas/40 py-10 md:py-14">
      <Container className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
              Your cart
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              {itemCount} hat{itemCount === 1 ? "" : "s"} configured
            </p>
          </div>
          <Link
            href="/order"
            className="text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4"
          >
            Continue building
          </Link>
        </div>

        {isReorder ? (
          <div className="mt-6 flex gap-3 rounded-[1rem] border border-pastel-sky/50 bg-sky px-4 py-3.5 text-sm text-ink">
            <RefreshCw
              size={18}
              className="mt-0.5 shrink-0 text-pastel-link"
              strokeWidth={2.25}
            />
            <div>
              <p className="font-semibold">Reorder ready for review</p>
              <p className="mt-0.5 text-ink-soft">
                Same blanks, counts, and artwork from your past order. Confirm
                everything looks right, then continue to checkout.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <ul className="space-y-4 lg:col-span-7">
            {items.map((item) => {
              const thumb = item.blanks[0]?.imageUrl;
              return (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-[var(--radius-md)] border border-border bg-white p-4 sm:p-5"
                >
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 overflow-hidden rounded-[0.75rem] bg-canvas">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : null}
                    </div>
                    <QtyBadge qty={item.totalQty} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{item.title}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          {item.decoration.method}
                          {item.design.hasArtwork ? " · Artwork on file" : ""}
                        </p>
                        {item.blanks.length > 1 ? (
                          <p className="mt-1 text-xs text-ink-soft">
                            {item.blanks.length} blank styles
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-ink">
                        {money(item.merchandiseEstimate)}
                      </p>
                    </div>
                    <ButtonNative
                      type="button"
                      variant="ghost"
                      size="sm"
                      arrow={false}
                      onClick={() => removeItem(item.id)}
                      className="mt-3 gap-1.5 px-2 text-ink-soft"
                    >
                      <Trash2 size={14} />
                      Remove
                    </ButtonNative>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:col-span-5">
            <div
              className={cn(
                "rounded-[var(--radius-md)] border border-border bg-white p-5 sm:p-6",
                "lg:sticky lg:top-28",
              )}
            >
              <h2 className="text-lg font-bold text-ink">Order summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {money(merchandiseTotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {ship.amount <= 0 ? "Free" : money(ship.amount)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
                <span className="font-bold text-ink">Estimated total</span>
                <span className="text-xl font-bold tabular-nums text-ink">
                  {money(merchandiseTotal + ship.amount)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Production timing and discounts are set at checkout. Final price
                confirmed with your mockup.
              </p>
              <Button
                href="/checkout"
                variant="secondary"
                size="lg"
                className="mt-5 w-full"
              >
                Checkout
              </Button>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
