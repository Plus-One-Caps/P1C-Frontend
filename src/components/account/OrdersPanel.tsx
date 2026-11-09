"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ImageIcon,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { Button, ButtonNative } from "@/components/ui/Button";
import {
  fetchCustomerOrder,
  fetchCustomerOrders,
  type CustomerOrder,
  type CustomerOrderItem,
} from "@/lib/customerApi";
import {
  formatMoney,
  formatOrderStatus,
  formatShortDate,
  isCustomerVisibleOrder,
  orderToReusePayload,
  saveOrderReuse,
} from "@/lib/reorder";
import { cn } from "@/lib/utils";
import { ProofReview } from "@/components/account/ProofReview";

function statusTone(status?: string) {
  switch (String(status || "").toLowerCase()) {
    case "payment_authorized":
    case "paid":
    case "approved":
    case "in_production":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "reviewing":
    case "quoted":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "shipped":
    case "completed":
      return "bg-pastel-sky/30 text-pastel-link ring-pastel-sky/60";
    case "refunded":
    case "cancelled":
    case "canceled":
      return "bg-stone-100 text-stone-600 ring-stone-200";
    default:
      return "bg-canvas text-ink-soft ring-border";
  }
}

function orderThumb(order: CustomerOrder) {
  return (
    order.items?.[0]?.imageUrl ||
    order.items?.[0]?.design?.artworkUrl ||
    order.imageUrl ||
    order.design?.artworkUrl ||
    null
  );
}

function orderTitle(order: CustomerOrder) {
  const names = (order.items || [])
    .map((i) => i.productName)
    .filter(Boolean) as string[];
  if (names.length === 0) return order.productName || "Custom hat order";
  if (names.length === 1) return names[0];
  return `${names[0]} + ${names.length - 1} more`;
}

function orderQty(order: CustomerOrder) {
  if (order.totalQty) return order.totalQty;
  return (order.items || []).reduce((sum, item) => {
    return (
      sum +
      (item.variants || []).reduce(
        (s, v) =>
          s + (v.sizes || []).reduce((q, line) => q + (line.qty || 0), 0),
        0,
      )
    );
  }, 0);
}

function orderLines(order: CustomerOrder): CustomerOrderItem[] {
  if (Array.isArray(order.items) && order.items.length) return order.items;
  if (order.productName || order.decoration || order.design) {
    return [
      {
        productName: order.productName,
        productSlug: order.productSlug,
        imageUrl: order.imageUrl,
        decoration: order.decoration,
        design: order.design,
        variants: [],
      },
    ];
  }
  return [];
}

function lineThumb(line: CustomerOrderItem) {
  return line.imageUrl || line.design?.artworkUrl || null;
}

function lineQty(line: CustomerOrderItem) {
  return (line.variants || []).reduce(
    (sum, v) =>
      sum + (v.sizes || []).reduce((q, size) => q + (size.qty || 0), 0),
    0,
  );
}

/** Normalize artwork URLs so the same file only appears once (shared across styles). */
function artworkDedupeKey(url: string) {
  try {
    const parsed = new URL(url, "https://plusonecaps.com");
    let path = parsed.pathname.replace(/\/+$/, "");
    // Treat resized variants (...-lg.webp / ...-thumb.webp) as the same asset.
    path = path.replace(/-(?:lg|sm|thumb|preview)(?=\.[a-z0-9]+$)/i, "");
    return `${parsed.host}${path}`.toLowerCase();
  } catch {
    return String(url)
      .split("?")[0]
      .split("#")[0]
      .replace(/-(?:lg|sm|thumb|preview)(?=\.[a-z0-9]+$)/i, "")
      .toLowerCase();
  }
}

function uniqueOrderArtwork(lines: CustomerOrderItem[]) {
  const seen = new Map<string, { url: string; styleCount: number }>();
  for (const line of lines) {
    const url = String(line.design?.artworkUrl || "").trim();
    if (!url) continue;
    const key = artworkDedupeKey(url);
    const existing = seen.get(key);
    if (existing) existing.styleCount += 1;
    else seen.set(key, { url, styleCount: 1 });
  }
  return Array.from(seen.values());
}

type Props = {
  highlightId?: string | null;
};

export function OrdersPanel({ highlightId }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(
    highlightId || null,
  );
  const [detailById, setDetailById] = useState<Record<string, CustomerOrder>>(
    {},
  );
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomerOrders();
        if (!cancelled) {
          const list = (data.orderRequests || []).filter((o) =>
            isCustomerVisibleOrder(o.status),
          );
          setOrders(list);
          if (!expandedId && list.length === 1) setExpandedId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load orders.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  useEffect(() => {
    if (highlightId) setExpandedId(highlightId);
  }, [highlightId]);

  useEffect(() => {
    if (!expandedId || detailById[expandedId]) return;
    let cancelled = false;
    (async () => {
      setDetailLoadingId(expandedId);
      try {
        const data = await fetchCustomerOrder(expandedId);
        if (!cancelled) {
          setDetailById((prev) => ({
            ...prev,
            [expandedId]: data.orderRequest,
          }));
        }
      } catch {
        // Keep list row data if detail fetch fails.
      } finally {
        if (!cancelled) setDetailLoadingId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expandedId, detailById]);

  function toggleOrder(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
    setError("");
  }

  async function handleReorder(order: CustomerOrder) {
    setReorderBusy(true);
    setError("");
    try {
      const full = detailById[order.id] || order;
      const payload = orderToReusePayload(full);
      if (!payload) {
        setError("This order doesn’t have enough detail to reorder yet.");
        return;
      }
      saveOrderReuse(payload);
      router.push("/order?reorder=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start reorder.");
    } finally {
      setReorderBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[12rem] flex-1 items-center justify-center gap-2 text-ink-soft">
        <Loader2 className="animate-spin" size={18} />
        Loading your orders…
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="rounded-[1rem] border border-border bg-white p-8 text-center">
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-1 flex-col justify-center rounded-[1.25rem] border border-dashed border-border bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-soft">
          <Package size={22} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-ink">No orders yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          When you place an order with this email, it will show up here — ready
          to review or reorder.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button href="/order" variant="primary" size="md">
            Start an order
          </Button>
          <Button href="/shop" variant="outline" size="md">
            Shop hats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {orders.map((order) => {
        const expanded = expandedId === order.id;
        const full = detailById[order.id] || order;
        const lines = orderLines(full);
        const thumb = orderThumb(full);
        const qty = orderQty(full);
        const styleCount = Math.max(lines.length, order.itemCount || 0);
        const loadingDetail =
          detailLoadingId === order.id && !detailById[order.id];
        const artworkItems = uniqueOrderArtwork(lines);

        return (
          <div
            key={order.id}
            className={cn(
              "w-full overflow-hidden rounded-[1rem] border bg-white transition",
              expanded
                ? "border-ink shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                : "border-border hover:border-[#d1d5db]",
            )}
          >
            <button
              type="button"
              onClick={() => toggleOrder(order.id)}
              aria-expanded={expanded}
              className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-canvas">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-soft">
                    <ShoppingBag size={18} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-ink">
                    {orderTitle(full)}
                  </p>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1",
                      statusTone(full.status),
                    )}
                  >
                    {formatOrderStatus(full.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  {full.id ? `${full.id} · ` : ""}
                  {formatShortDate(full.createdAt)}
                  {qty ? ` · ${qty} pcs` : ""}
                  {styleCount > 1 ? ` · ${styleCount} styles` : ""}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {formatMoney(
                    full.payment?.amount ??
                      full.estimatedTotal ??
                      full.totals?.total,
                  )}
                </p>
              </div>

              <ChevronDown
                size={18}
                className={cn(
                  "mt-1 shrink-0 text-ink-soft transition-transform duration-200",
                  expanded && "rotate-180 text-ink",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
                  {loadingDetail ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-ink-soft">
                      <Loader2 className="animate-spin" size={16} />
                      Loading styles…
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:items-start lg:gap-8">
                      <div className="min-w-0 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                          Styles in this order
                        </p>
                        {lines.length ? (
                          lines.map((line, idx) => {
                            const preview = lineThumb(line);
                            const pcs = lineQty(line);
                            return (
                              <div
                                key={`${line.productId || line.productSlug || idx}`}
                                className="flex gap-3 rounded-xl border border-border bg-canvas/50 p-3.5"
                              >
                                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                                  {preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={preview}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-ink-soft">
                                      <ShoppingBag size={16} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-semibold text-ink">
                                      {line.productName || `Style ${idx + 1}`}
                                    </p>
                                    {pcs > 0 ? (
                                      <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-soft">
                                        {pcs} pcs
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-0.5 text-xs text-ink-soft">
                                    {line.decoration?.method
                                      ? String(line.decoration.method).replace(
                                          /-/g,
                                          " ",
                                        )
                                      : "Decoration TBD"}
                                    {line.design?.artworkUrl
                                      ? " · Artwork saved"
                                      : ""}
                                  </p>
                                  {(line.variants || []).length ? (
                                    <ul className="mt-1.5 space-y-0.5 text-xs text-ink-soft">
                                      {(line.variants || []).map((v) => (
                                        <li key={v.color?.name || "color"}>
                                          <span className="font-medium text-ink">
                                            {v.color?.name || "Color"}
                                          </span>
                                          :{" "}
                                          {(v.sizes || [])
                                            .filter((s) => (s.qty || 0) > 0)
                                            .map((s) => `${s.size}×${s.qty}`)
                                            .join(" · ") || "—"}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-ink-soft">
                            Style details aren&apos;t available for this older
                            order.
                          </p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                          Artwork
                        </p>
                        <div className="mt-2 overflow-hidden rounded-xl border border-border bg-canvas">
                          {artworkItems.length ? (
                            <div
                              className={cn(
                                "flex flex-wrap gap-3 p-3",
                                artworkItems.length === 1 && "justify-start",
                              )}
                            >
                              {artworkItems.map((item) => (
                                <div
                                  key={artworkDedupeKey(item.url)}
                                  className="w-[7.5rem]"
                                >
                                  <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.url}
                                      alt=""
                                      className="h-full w-full object-contain p-2.5"
                                    />
                                  </div>
                                  {item.styleCount > 1 ? (
                                    <p className="mt-1.5 text-center text-xs text-ink-soft">
                                      Used on {item.styleCount} styles
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 px-4 py-8 text-ink-soft">
                              <ImageIcon size={22} strokeWidth={1.75} />
                              <p className="text-xs font-medium">
                                No artwork on file for this order
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <ProofReview
                    order={full}
                    onUpdated={(next) =>
                      setDetailById((prev) => ({ ...prev, [full.id]: next }))
                    }
                  />

                  <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      <span className="text-ink-soft">Order total</span>
                      <span className="ml-2 font-semibold text-ink">
                        {formatMoney(
                          full.payment?.amount ??
                            full.estimatedTotal ??
                            full.totals?.total,
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <ButtonNative
                        type="button"
                        variant="primary"
                        size="md"
                        disabled={reorderBusy}
                        onClick={() => void handleReorder(full)}
                        arrow={!reorderBusy}
                        className="w-full sm:w-auto"
                      >
                        {reorderBusy ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Preparing…
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Reorder these hats
                          </>
                        )}
                      </ButtonNative>
                      <p className="max-w-xs text-xs leading-relaxed text-ink-soft sm:text-right">
                        Today&apos;s pricing — past discounts don&apos;t carry
                        over.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <p className="pt-2 text-center text-xs text-ink-soft">
        Need something different?{" "}
        <Link
          href="/order"
          className="font-semibold text-pastel-link underline-offset-2 hover:underline"
        >
          Start a fresh order →
        </Link>
      </p>
    </div>
  );
}
