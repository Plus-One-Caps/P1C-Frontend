"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import type { CatalogProduct, DecorationMethod } from "@/lib/catalog";
import { normalizeMethodId } from "@/lib/catalog";
import { ButtonNative } from "@/components/ui/Button";
import {
  HatSilhouette,
  hatColorViews,
  hatHex,
} from "@/components/shop/HatVisual";
import {
  decorationShowcase,
  pricingDecorationMethods,
  type PricingMethodId,
} from "@/data/site";
import {
  activeBreakForQty,
  formatBreakLabel,
  normalizePricingMethod,
  resolvePriceBreaks,
  unitPriceAtQty,
} from "@/lib/priceBreaks";
import { cn } from "@/lib/utils";

function plainText(html?: string) {
  return html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
}

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

const ONE_SIZE_RE = /^(osfa|one\s*size|onesize|adjustable)$/i;

function isFittedStyle(product: CatalogProduct): boolean {
  const text =
    `${product.type || ""} ${product.name || ""} ${product.slug || ""}`.toLowerCase();
  return /\b(fitted|r-?flex|stretch\s*fit|closed\s*back)\b/.test(text);
}

function resolveSizes(product: CatalogProduct): string[] {
  if (!isFittedStyle(product)) return ["Adjustable"];
  const list = (product.sizes || []).filter(Boolean);
  const real = list.filter((s) => !ONE_SIZE_RE.test(String(s).trim()));
  if (real.length) return real;
  if (list.length) return list;
  return ["Adjustable"];
}

function methodMeta(id: string) {
  const n = normalizeMethodId(id) as PricingMethodId;
  return (
    pricingDecorationMethods.find((m) => m.id === n) ||
    decorationShowcase.find((m) => m.id === n) ||
    null
  );
}

function methodMinQty(id: string): number {
  const meta = pricingDecorationMethods.find(
    (m) => m.id === normalizePricingMethod(id),
  );
  return meta?.minQty || 1;
}

export function HatDetail({
  product,
  methods,
}: {
  product: CatalogProduct;
  methods: DecorationMethod[];
}) {
  const router = useRouter();
  const sizes = useMemo(() => resolveSizes(product), [product]);
  const singleSize = sizes.length === 1;

  const [colorName, setColorName] = useState(
    product.showcaseColor || product.colors[0]?.name || "",
  );
  const [size, setSize] = useState(sizes[0] || "Adjustable");
  const [qty, setQty] = useState(1);
  const [methodId, setMethodId] = useState(
    () =>
      methods.find((m) => normalizeMethodId(m.id) === "embroidery")?.id ||
      methods[0]?.id ||
      "embroidery",
  );
  const [starting, setStarting] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});

  const description = plainText(product.description);
  const activeMethod =
    methods.find((m) => m.id === methodId) || methods[0] || null;
  const activeMeta = activeMethod ? methodMeta(activeMethod.id) : null;

  useEffect(() => {
    setViewIndex(0);
    setFailedUrls({});
  }, [colorName]);

  useEffect(() => {
    if (!methods.length) return;
    if (!methods.some((m) => m.id === methodId)) {
      setMethodId(
        methods.find((m) => normalizeMethodId(m.id) === "embroidery")?.id ||
          methods[0].id,
      );
    }
  }, [methods, methodId]);

  const views = useMemo(
    () =>
      hatColorViews(product, colorName).filter((v) => !failedUrls[v.url]),
    [product, colorName, failedUrls],
  );
  const safeIndex = Math.min(viewIndex, Math.max(views.length - 1, 0));
  const activeView = views[safeIndex];

  useEffect(() => {
    if (viewIndex !== safeIndex) setViewIndex(safeIndex);
  }, [viewIndex, safeIndex]);

  const breaks = useMemo(
    () => resolvePriceBreaks(product.pricing, methodId),
    [product.pricing, methodId],
  );
  const activeBreak = useMemo(
    () => activeBreakForQty(breaks, qty),
    [breaks, qty],
  );
  const unitPrice = useMemo(
    () => unitPriceAtQty(breaks, qty),
    [breaks, qty],
  );
  const lineTotal =
    unitPrice != null ? Math.round(unitPrice * qty * 100) / 100 : null;
  const fromPrice = useMemo(() => {
    if (!breaks.length) return null;
    return Math.min(...breaks.map((b) => b.price));
  }, [breaks]);

  function bumpQty(delta: number) {
    const min = methodMinQty(methodId);
    setQty((n) => Math.max(min, Math.min(5000, n + delta)));
  }

  function chooseMethod(id: string) {
    setMethodId(id);
    const min = methodMinQty(id);
    setQty((n) => Math.max(min, n));
  }

  function startOrder() {
    if (!colorName && product.colors.length > 0) return;
    setStarting(true);
    const params = new URLSearchParams({
      hat: product.slug,
      color: colorName || product.colors[0]?.name || "Default",
      qty: String(qty),
      size: size || sizes[0] || "Adjustable",
      step: "art",
    });
    if (activeMethod?.id) params.set("method", activeMethod.id);
    router.push(`/order?${params.toString()}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
      <div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white shadow-[0_12px_40px_-18px_rgba(15,23,42,0.28)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${colorName}-${activeView?.url || "empty"}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {activeView?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeView.url}
                  alt={`${product.name}${colorName ? `, ${colorName}` : ""}${activeView.label ? `, ${activeView.label}` : ""}`}
                  className="h-full w-full object-contain"
                  onError={() => {
                    const url = activeView.url;
                    setFailedUrls((prev) =>
                      prev[url] ? prev : { ...prev, [url]: true },
                    );
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-[12%]">
                  <HatSilhouette hex={hatHex(product, colorName)} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {views.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setViewIndex(
                    (i) => (i - 1 + views.length) % views.length,
                  )
                }
                className="absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-ink shadow-sm transition hover:border-ink"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setViewIndex((i) => (i + 1) % views.length)
                }
                className="absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-ink shadow-sm transition hover:border-ink"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {colorName ? (
            <p className="text-sm text-ink-soft">
              Color:{" "}
              <span className="font-semibold text-ink">{colorName}</span>
              {activeView ? (
                <span className="text-ink-soft">
                  {" "}
                  · {activeView.label}
                </span>
              ) : null}
            </p>
          ) : (
            <span />
          )}
          {views.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {views.map((v, i) => (
                <button
                  key={v.label + v.url}
                  type="button"
                  onClick={() => setViewIndex(i)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    i === safeIndex
                      ? "bg-ink text-white"
                      : "bg-canvas text-ink-soft hover:text-ink",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-eyebrow text-pastel-link">
          {[product.brand, product.type].filter(Boolean).join(" · ") ||
            "Custom blank"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          {product.name}
        </h1>

        <div className="mt-3">
          {unitPrice != null ? (
            <>
              <p className="text-lg font-semibold text-ink">
                {money(unitPrice)}
                <span className="ml-1.5 text-sm font-medium text-ink-soft">
                  / hat
                </span>
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {activeMethod?.label || "Decoration"}
                {activeBreak
                  ? ` · ${formatBreakLabel(activeBreak.qty)} tier`
                  : ""}
                {lineTotal != null ? ` · ${money(lineTotal)} total` : ""}
              </p>
            </>
          ) : fromPrice != null ? (
            <p className="text-lg font-semibold text-ink">
              From {money(fromPrice)}
            </p>
          ) : (
            <p className="text-lg font-semibold text-ink">Request a quote</p>
          )}
        </div>

        {description && (
          <div className="mt-6 border-y border-border">
            <button
              type="button"
              aria-expanded={descOpen}
              onClick={() => setDescOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-ink">
                Product details
              </span>
              <ChevronDown
                size={18}
                strokeWidth={2.25}
                className={cn(
                  "shrink-0 text-ink-soft transition-transform duration-200",
                  descOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {descOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-sm leading-relaxed text-ink-soft">
                    {description}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}

        {product.colors.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-ink">
              Color
              <span className="ml-2 font-medium text-ink-soft">{colorName}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={color.name === colorName}
                  onClick={() => setColorName(color.name)}
                  className={cn(
                    "h-9 w-9 rounded-full border transition",
                    color.name === colorName
                      ? "border-ink ring-2 ring-ink ring-offset-2"
                      : "border-black/15 hover:border-ink/50",
                  )}
                  style={{ backgroundColor: color.hex || "#e8e4de" }}
                />
              ))}
            </div>
          </div>
        )}

        {!singleSize && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-ink">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-h-10 rounded-[10px] border px-3.5 text-sm font-semibold transition",
                    size === s
                      ? "border-ink bg-ink text-white"
                      : "border-[#e8eef4] bg-white text-ink hover:border-[#d1d5db]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <p className="text-sm font-semibold text-ink">Quantity</p>
          <div className="mt-3 inline-flex items-stretch overflow-hidden rounded-[12px] border border-[#e8eef4] bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => bumpQty(-1)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink transition hover:bg-canvas"
            >
              <Minus size={16} strokeWidth={2.25} />
            </button>
            <div className="flex h-11 w-[4.25rem] items-center justify-center border-x border-[#e8eef4]">
              <input
                type="number"
                min={methodMinQty(methodId)}
                max={5000}
                value={qty}
                onChange={(e) => {
                  const min = methodMinQty(methodId);
                  setQty(
                    Math.max(
                      min,
                      Math.min(5000, Number(e.target.value) || min),
                    ),
                  );
                }}
                className="h-full w-full bg-transparent text-center text-sm font-bold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => bumpQty(1)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink transition hover:bg-canvas"
            >
              <Plus size={16} strokeWidth={2.25} />
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Free shipping on 24+. You&apos;ll upload art next — nothing is made
            until you approve the mockup.
          </p>
        </div>

        {methods.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-ink">Decoration method</p>
            <p className="mt-1 text-xs text-ink-soft">
              Pick a finish — pricing updates below.
            </p>
            <div
              className="mt-3 grid gap-2.5 sm:grid-cols-2"
              role="radiogroup"
              aria-label="Decoration method"
            >
              {methods.map((m) => {
                const selected = m.id === activeMethod?.id;
                const meta = methodMeta(m.id);
                const methodBreaks = resolvePriceBreaks(product.pricing, m.id);
                const previewUnit = unitPriceAtQty(
                  methodBreaks,
                  Math.max(qty, methodMinQty(m.id)),
                );
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseMethod(m.id)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-[12px] border bg-white px-3.5 py-3.5 text-left transition",
                      selected
                        ? "border-ink ring-2 ring-ink/15"
                        : "border-[#e8eef4] hover:border-[#d1d5db]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{m.label}</p>
                      {meta && "delta" in meta && meta.delta ? (
                        <p className="mt-1 text-xs leading-snug text-ink-soft">
                          {meta.delta}
                        </p>
                      ) : meta && "line" in meta && meta.line ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-snug text-ink-soft">
                          {meta.line}
                        </p>
                      ) : m.locations.length ? (
                        <p className="mt-1 text-xs text-ink-soft">
                          {m.locations.join(", ")}
                        </p>
                      ) : null}
                      {previewUnit != null ? (
                        <p className="mt-2 text-xs font-semibold tabular-nums text-ink">
                          {money(previewUnit)}
                          <span className="font-medium text-ink-soft">/hat</span>
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-ink bg-ink" : "border-border",
                      )}
                    >
                      {selected ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-white"
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {breaks.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-[14px] border border-[#e8eef4] bg-canvas">
            <div className="flex items-center justify-between gap-3 border-b border-[#e8eef4] bg-white px-4 py-3">
              <div>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                  Pricing
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {activeMethod?.label || "Decoration"} by quantity
                </p>
              </div>
              {unitPrice != null && (
                <p className="text-right text-sm font-bold text-pastel-link">
                  {money(unitPrice)}
                  <span className="font-medium text-ink-soft">/hat</span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e8eef4] sm:grid-cols-4">
              {breaks.map((b) => {
                const active = activeBreak?.qty === b.qty;
                const belowMin = b.qty < methodMinQty(methodId);
                return (
                  <button
                    key={b.qty}
                    type="button"
                    disabled={belowMin}
                    onClick={() => setQty(b.qty)}
                    className={cn(
                      "bg-white px-3 py-3 text-left transition",
                      belowMin
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-[#eef6fc]",
                      active &&
                        !belowMin &&
                        "bg-[#eef6fc] ring-1 ring-inset ring-pastel-sky",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[0.8125rem] font-bold uppercase tracking-[0.06em]",
                        active && !belowMin
                          ? "text-pastel-link"
                          : "text-ink-soft",
                      )}
                    >
                      {formatBreakLabel(b.qty)}
                    </p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-ink">
                      {money(b.price)}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="border-t border-[#e8eef4] bg-white px-4 py-2.5 text-[0.8125rem] leading-relaxed text-ink-soft">
              {activeMeta && "delta" in activeMeta && activeMeta.delta
                ? activeMeta.delta
                : "Blank + decoration estimate"}
              {" — final quote with your mockup."}
            </p>
          </div>
        )}

        <ButtonNative
          type="button"
          variant="primary"
          size="lg"
          className="mt-8 w-full sm:w-auto"
          onClick={startOrder}
          disabled={starting || (product.colors.length > 0 && !colorName)}
        >
          {starting ? "Starting order…" : "Start order with this hat"}
        </ButtonNative>
        <p className="mt-3 text-xs text-ink-soft">
          Next: artwork → decoration → checkout. Payment holds your spot;
          production starts after mockup approval.
        </p>
      </div>
    </div>
  );
}
