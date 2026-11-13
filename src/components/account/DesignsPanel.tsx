"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button, ButtonNative } from "@/components/ui/Button";
import {
  fetchCustomerDesigns,
  fetchCustomerOrder,
  type CustomerDesign,
} from "@/lib/customerApi";
import {
  designToReusePayload,
  formatShortDate,
  orderToReusePayload,
  saveDesignReuse,
  saveOrderReuse,
} from "@/lib/reorder";
import { cn } from "@/lib/utils";

function designTitle(design: CustomerDesign) {
  if (design.productNames?.[0]) {
    return design.productNames.length > 1
      ? `${design.productNames[0]} +${design.productNames.length - 1}`
      : design.productNames[0];
  }
  if (design.method) {
    return String(design.method).replace(/-/g, " ");
  }
  return design.hasArtwork ? "Saved artwork" : "Saved design";
}

function designMethodLabel(design: CustomerDesign) {
  if (!design.method) return null;
  const raw = String(design.method).replace(/-/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function DesignsPanel() {
  const router = useRouter();
  const [designs, setDesigns] = useState<CustomerDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCustomerDesigns();
        if (!cancelled) {
          const list = data.designs || [];
          setDesigns(list);
          if (list.length && !selectedId) setSelectedId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load designs.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- select first design once on load
  }, []);

  const selected = useMemo(
    () => designs.find((d) => d.id === selectedId) || null,
    [designs, selectedId],
  );

  function useOnNewOrder(design: CustomerDesign) {
    saveDesignReuse(designToReusePayload(design));
    router.push("/order?design=saved");
  }

  async function reorderWithDesign(design: CustomerDesign) {
    if (!design.lastOrderId) {
      useOnNewOrder(design);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await fetchCustomerOrder(design.lastOrderId);
      const payload = orderToReusePayload(data.orderRequest);
      if (!payload) {
        useOnNewOrder(design);
        return;
      }
      saveOrderReuse(payload);
      router.push("/order?reorder=1");
    } catch {
      useOnNewOrder(design);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[12rem] flex-1 items-center justify-center gap-2 text-ink-soft">
        <Loader2 className="animate-spin" size={18} />
        Loading your designs…
      </div>
    );
  }

  if (error && !designs.length) {
    return (
      <div className="rounded-[1rem] border border-border bg-white p-8 text-center">
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!designs.length) {
    return (
      <div className="flex flex-1 flex-col justify-center rounded-[1.25rem] border border-dashed border-border bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-soft">
          <Sparkles size={22} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-ink">No saved artwork yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          Artwork from your orders appears here so you can reuse it on a new
          blank or reorder the same run.
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
      <div className="space-y-3">
        {error ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {designs.map((design) => {
          const active = design.id === selectedId;
          const preview = design.previewImageUrl || design.artworkUrl;
          const method = designMethodLabel(design);
          return (
            <button
              key={design.id}
              type="button"
              onClick={() => setSelectedId(design.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-[1rem] border bg-white p-4 text-left transition",
                active
                  ? "border-ink ring-1 ring-ink/10"
                  : "border-border hover:border-[#d1d5db]",
              )}
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-canvas">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-soft">
                    <ImageIcon size={18} strokeWidth={1.75} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-ink">
                    {designTitle(design)}
                  </p>
                  {method ? (
                    <span className="inline-flex rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-soft ring-1 ring-border">
                      {method}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Last used {formatShortDate(design.lastUsedAt)}
                  {design.orderIds?.length
                    ? ` · ${design.orderIds.length} order${
                        design.orderIds.length === 1 ? "" : "s"
                      }`
                    : ""}
                </p>
                {design.notes ? (
                  <p className="mt-2 line-clamp-1 text-xs text-ink-soft">
                    {design.notes}
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-medium text-ink">
                    {design.hasArtwork || preview
                      ? "Artwork ready to reuse"
                      : "Notes only"}
                  </p>
                )}
              </div>
              <ArrowRight
                size={16}
                className={cn(
                  "mt-1 shrink-0 text-ink-soft transition",
                  active && "text-ink",
                )}
              />
            </button>
          );
        })}
      </div>

      <aside className="lg:self-start">
        {!selected ? (
          <div className="rounded-[1rem] border border-border bg-canvas/60 p-6 text-sm text-ink-soft">
            Select a design to preview artwork and reuse it.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.15rem] border border-border bg-white">
            <div className="border-b border-border bg-canvas/50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Design detail
              </p>
              <h3 className="mt-1 text-lg font-bold text-ink">
                {designTitle(selected)}
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                Last used {formatShortDate(selected.lastUsedAt)}
                {designMethodLabel(selected)
                  ? ` · ${designMethodLabel(selected)}`
                  : ""}
              </p>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="overflow-hidden rounded-xl border border-border bg-canvas">
                <div className="relative aspect-[4/3]">
                  {selected.previewImageUrl || selected.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        selected.previewImageUrl || selected.artworkUrl || ""
                      }
                      alt=""
                      className="h-full w-full object-contain p-5"
                    />
                  ) : (
                    <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 text-ink-soft">
                      <ImageIcon size={28} strokeWidth={1.75} />
                      <span className="text-xs font-medium">Notes only</span>
                    </div>
                  )}
                </div>
              </div>

              {selected.productNames?.length ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                    Used on
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {selected.productNames.map((name) => (
                      <li
                        key={name}
                        className="text-sm font-medium text-ink"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {selected.notes ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                    Notes
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {selected.notes}
                  </p>
                </div>
              ) : null}

              <div className="rounded-xl bg-canvas px-4 py-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-ink-soft">Orders with this art</span>
                  <span className="font-semibold text-ink">
                    {selected.orderIds?.length || 0}
                  </span>
                </div>
              </div>

              <ButtonNative
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => useOnNewOrder(selected)}
              >
                Use on new order
              </ButtonNative>
              <ButtonNative
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={busy}
                arrow={false}
                onClick={() => void reorderWithDesign(selected)}
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Preparing…
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Reorder last run
                  </>
                )}
              </ButtonNative>
              <p className="text-center text-xs leading-relaxed text-ink-soft">
                Reusing this artwork waives setup fees. Reorder opens the full
                builder with today&apos;s pricing — past discounts don&apos;t
                carry over.
              </p>
              <Link
                href="/order"
                className="block text-center text-xs font-semibold text-pastel-link hover:underline"
              >
                Or start a fresh order →
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
