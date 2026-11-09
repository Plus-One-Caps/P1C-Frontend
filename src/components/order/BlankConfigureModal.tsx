"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import {
  activeBreakForQty,
  formatBreakLabel,
  resolvePriceBreaks,
} from "@/lib/priceBreaks";
import { HatSilhouette, hatColorViews, hatHex } from "@/components/shop/HatVisual";
import { ButtonNative } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type QtyMap = Record<string, Record<string, number>>;

type Props = {
  product: CatalogProduct;
  initialQty?: QtyMap;
  methodId?: string;
  open: boolean;
  onClose: () => void;
  onAdd: (qty: QtyMap) => void;
};

function totalFor(qty: QtyMap): number {
  return Object.values(qty).reduce(
    (sum, sizes) => sum + Object.values(sizes).reduce((a, b) => a + b, 0),
    0,
  );
}

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

const ONE_SIZE_RE = /^(osfa|one\s*size|onesize|adjustable)$/i;

/** True fitted / stretch-fit styles keep multi-size runs (S/M · L/XL, numeric, etc.). */
function isFittedStyle(product: CatalogProduct): boolean {
  const text = `${product.type || ""} ${product.name || ""} ${product.slug || ""}`.toLowerCase();
  return /\b(fitted|r-?flex|stretch\s*fit|closed\s*back)\b/.test(text);
}

/**
 * Snapbacks, truckers, beanies, and classic Richardson 112s are one-size
 * adjustable — even when S&S incorrectly lists M/L · XL SKUs.
 */
function isAdjustableBlank(product: CatalogProduct): boolean {
  if (isFittedStyle(product)) return false;
  const type = String(product.type || "").toLowerCase();
  const text = `${product.name || ""} ${product.slug || ""}`.toLowerCase();
  if (
    ["trucker", "snapback", "beanie", "dad-hat", "dad", "five-panel", "5-panel"].includes(
      type,
    )
  ) {
    return true;
  }
  if (/\b(snapback|trucker|beanie|adjustable)\b/.test(text)) return true;
  // Richardson 112 family is always OSFA (110 R-Flex is handled by isFittedStyle).
  if (/richardson\s*112\b/.test(text)) return true;
  return false;
}

/** Drop One Size when fitted sizes exist; force Adjustable for snapback/trucker blanks. */
function resolveSizes(product: CatalogProduct): string[] {
  if (isAdjustableBlank(product)) return ["Adjustable"];
  const list = (product.sizes || []).filter(Boolean);
  const real = list.filter((s) => !ONE_SIZE_RE.test(String(s).trim()));
  if (real.length) return real;
  if (list.length) return list;
  return ["Adjustable"];
}

function isOsfaLabel(size: string) {
  return ONE_SIZE_RE.test(String(size).trim());
}

export function BlankConfigureModal({
  product,
  initialQty,
  methodId,
  open,
  onClose,
  onAdd,
}: Props) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const searchId = useId();
  const sizes = resolveSizes(product);
  const singleSize = sizes.length === 1;
  const sizeIsOsfa = singleSize && isOsfaLabel(sizes[0]);

  const [colorName, setColorName] = useState(
    product.showcaseColor || product.colors[0]?.name || "",
  );
  const [colorQuery, setColorQuery] = useState("");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [qty, setQty] = useState<QtyMap>(initialQty || {});
  const [viewIndex, setViewIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});

  useEffect(() => {
    if (!open) return;
    const nextQty = initialQty || {};
    setQty(nextQty);
    setColorQuery("");
    setColorMenuOpen(false);
    setHighlightIndex(0);
    setViewIndex(0);
    setFailedUrls({});
    const fromCart = Object.entries(nextQty).find(([, sizeMap]) =>
      Object.values(sizeMap).some((n) => n > 0),
    )?.[0];
    setColorName(
      fromCart || product.showcaseColor || product.colors[0]?.name || "",
    );
  }, [open, product.slug]); // eslint-disable-line react-hooks/exhaustive-deps -- reset only when opening a product

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (colorMenuOpen) {
          setColorMenuOpen(false);
          setColorQuery("");
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, colorMenuOpen]);

  useEffect(() => {
    setViewIndex(0);
    setFailedUrls({});
  }, [colorName]);

  const activeColor =
    product.colors.find((c) => c.name === colorName) || product.colors[0];
  const views = useMemo(
    () =>
      hatColorViews(product, colorName).filter((v) => !failedUrls[v.url]),
    [product, colorName, failedUrls],
  );
  const safeIndex = Math.min(viewIndex, Math.max(views.length - 1, 0));
  const activeView = views[safeIndex];
  const lineTotal = totalFor(qty);

  useEffect(() => {
    if (viewIndex !== safeIndex) setViewIndex(safeIndex);
  }, [viewIndex, safeIndex]);

  const matchedColors = useMemo(() => {
    const q = colorQuery.trim().toLowerCase();
    if (!q) return product.colors;
    return product.colors.filter((c) => c.name.toLowerCase().includes(q));
  }, [product.colors, colorQuery]);

  const showColorMenu = colorMenuOpen && colorQuery.trim().length > 0;

  useEffect(() => {
    setHighlightIndex(0);
  }, [colorQuery]);

  const breaks = useMemo(
    () => resolvePriceBreaks(product.pricing, methodId),
    [product.pricing, methodId],
  );

  const activeBreak = useMemo(
    () => activeBreakForQty(breaks, lineTotal),
    [breaks, lineTotal],
  );

  function selectColor(name: string) {
    setColorName(name);
    setColorQuery("");
    setColorMenuOpen(false);
    setHighlightIndex(0);
  }

  function setSizeQty(size: string, next: number) {
    const v = Math.max(0, Math.min(9999, next));
    setQty((prev) => ({
      ...prev,
      [colorName]: { ...(prev[colorName] || {}), [size]: v },
    }));
  }

  function setSingleQty(next: number) {
    setSizeQty(sizes[0], next);
  }

  function handleAdd() {
    if (lineTotal <= 0) return;
    // Strip any leftover One Size keys when fitted sizes are used.
    const cleaned: QtyMap = {};
    for (const [color, sizeMap] of Object.entries(qty)) {
      const nextSizes: Record<string, number> = {};
      for (const [size, n] of Object.entries(sizeMap)) {
        if (n <= 0) continue;
        if (!singleSize && ONE_SIZE_RE.test(size)) continue;
        if (!sizes.includes(size) && !(singleSize && size === sizes[0])) continue;
        nextSizes[size] = n;
      }
      if (Object.keys(nextSizes).length) cleaned[color] = nextSizes;
    }
    onAdd(Object.keys(cleaned).length ? cleaned : qty);
  }

  const singleQty = qty[colorName]?.[sizes[0]] || 0;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
                  Configure blank
                </p>
                <h2
                  id={titleId}
                  className="mt-1 truncate text-lg font-bold tracking-tight text-ink sm:text-xl"
                >
                  {product.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft transition-colors hover:border-ink hover:text-ink"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                {/* Image + angle controls */}
                <div className="border-b border-border bg-white p-5 md:border-b-0 md:border-r md:p-7">
                  <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[var(--radius-md)] bg-white">
                    {activeView?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={activeView.url}
                        src={activeView.url}
                        alt={`${product.name}, ${colorName}, ${activeView.label}`}
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
                          className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-ink shadow-sm transition hover:border-ink"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() =>
                            setViewIndex((i) => (i + 1) % views.length)
                          }
                          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-ink shadow-sm transition hover:border-ink"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-ink">
                      {activeColor?.name}
                      {activeView ? (
                        <span className="text-ink-soft">
                          {" "}
                          · {activeView.label}
                        </span>
                      ) : null}
                    </p>
                    {views.length > 1 ? (
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {views.map((v, i) => (
                          <button
                            key={v.label + v.url}
                            type="button"
                            onClick={() => setViewIndex(i)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                              i === viewIndex
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

                {/* Color + qty */}
                <div className="flex flex-col gap-6 p-5 sm:p-6">
                  <div>
                    <label
                      htmlFor={searchId}
                      className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-soft"
                    >
                      Selected color
                    </label>
                    <div className="relative mt-2">
                      <div className="flex min-h-12 items-center gap-2.5 rounded-[var(--radius-md)] border border-border bg-white px-3 focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15">
                        <span
                          className="h-7 w-7 shrink-0 rounded-[6px] border border-black/15"
                          style={{
                            backgroundColor: activeColor?.hex || "#e8e4de",
                          }}
                          aria-hidden
                        />
                        <Search
                          size={15}
                          className="shrink-0 text-ink-soft"
                          aria-hidden
                        />
                        <input
                          id={searchId}
                          type="search"
                          role="combobox"
                          aria-expanded={showColorMenu}
                          aria-controls={`${searchId}-listbox`}
                          aria-autocomplete="list"
                          value={colorQuery}
                          onChange={(e) => {
                            setColorQuery(e.target.value);
                            setColorMenuOpen(true);
                          }}
                          onFocus={() => setColorMenuOpen(true)}
                          onBlur={() => {
                            // Delay so dropdown click can register first.
                            window.setTimeout(() => setColorMenuOpen(false), 120);
                          }}
                          onKeyDown={(e) => {
                            if (!showColorMenu && e.key === "ArrowDown") {
                              setColorMenuOpen(true);
                              return;
                            }
                            if (!showColorMenu) return;
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setHighlightIndex((i) =>
                                matchedColors.length
                                  ? (i + 1) % matchedColors.length
                                  : 0,
                              );
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setHighlightIndex((i) =>
                                matchedColors.length
                                  ? (i - 1 + matchedColors.length) %
                                    matchedColors.length
                                  : 0,
                              );
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              const pick = matchedColors[highlightIndex];
                              if (pick) selectColor(pick.name);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              e.stopPropagation();
                              setColorMenuOpen(false);
                              setColorQuery("");
                            }
                          }}
                          placeholder={activeColor?.name || "Search colors…"}
                          className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink-soft"
                          autoComplete="off"
                        />
                        {colorQuery ? (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setColorQuery("");
                              setColorMenuOpen(false);
                            }}
                            className="text-xs font-semibold text-ink-soft hover:text-ink"
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>

                      {showColorMenu ? (
                        <ul
                          id={`${searchId}-listbox`}
                          role="listbox"
                          aria-label="Matching colors"
                          className="absolute left-0 right-0 z-20 mt-1.5 max-h-52 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white py-1 shadow-lg"
                        >
                          {matchedColors.length === 0 ? (
                            <li className="px-3 py-2.5 text-sm text-ink-soft">
                              No colors match “{colorQuery.trim()}”
                            </li>
                          ) : (
                            matchedColors.map((color, i) => {
                              const selected = color.name === colorName;
                              const active = i === highlightIndex;
                              return (
                                <li key={color.name} role="option" aria-selected={selected}>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setHighlightIndex(i)}
                                    onClick={() => selectColor(color.name)}
                                    className={cn(
                                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                                      active ? "bg-canvas" : "bg-white",
                                    )}
                                  >
                                    <span
                                      className="h-5 w-5 shrink-0 rounded-[4px] border border-black/15"
                                      style={{
                                        backgroundColor: color.hex || "#e8e4de",
                                      }}
                                    />
                                    <span className="min-w-0 flex-1 truncate font-medium text-ink">
                                      {color.name}
                                    </span>
                                    {selected ? (
                                      <Check
                                        size={14}
                                        strokeWidth={3}
                                        className="shrink-0 text-ink"
                                      />
                                    ) : null}
                                  </button>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      ) : null}
                    </div>

                    <div
                      className="mt-3 grid grid-cols-8 gap-1.5 sm:grid-cols-10"
                      role="listbox"
                      aria-label="Hat colors"
                    >
                      {product.colors.map((color) => {
                        const selected = color.name === colorName;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            title={color.name}
                            aria-label={color.name}
                            onClick={() => selectColor(color.name)}
                            className={cn(
                              "relative aspect-square rounded-[6px] border transition",
                              selected
                                ? "border-ink ring-2 ring-ink/20"
                                : "border-black/10 hover:border-ink/40",
                            )}
                            style={{
                              backgroundColor: color.hex || "#e8e4de",
                            }}
                          >
                            {selected ? (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Check
                                  size={14}
                                  strokeWidth={3}
                                  className={cn(
                                    "drop-shadow",
                                    (color.hex || "").toLowerCase() ===
                                      "#ffffff" ||
                                      (color.hex || "").toLowerCase() === "#fff"
                                      ? "text-ink"
                                      : "text-white",
                                  )}
                                />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                      {singleSize
                        ? sizeIsOsfa
                          ? "Quantity"
                          : `Quantity · ${sizes[0]}`
                        : "Quantity by size"}
                    </p>

                    {singleSize ? (
                      <div className="mt-2 inline-flex items-center rounded-[var(--radius-md)] border border-border bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setSingleQty(singleQty - 1)}
                          className="inline-flex h-12 w-12 items-center justify-center text-ink-soft hover:text-ink"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={singleQty || ""}
                          placeholder="0"
                          onChange={(e) =>
                            setSingleQty(parseInt(e.target.value, 10) || 0)
                          }
                          className="h-12 w-16 border-x border-border bg-transparent text-center text-base font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          aria-label={`${colorName} quantity`}
                        />
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setSingleQty(singleQty + 1)}
                          className="inline-flex h-12 w-12 items-center justify-center text-ink-soft hover:text-ink"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {sizes.map((size) => {
                          const sizeQty = qty[colorName]?.[size] || 0;
                          return (
                            <div
                              key={size}
                              className="rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5"
                            >
                              <p className="text-center text-xs font-semibold text-ink-soft">
                                {size}
                              </p>
                              <div className="mt-2 inline-flex w-full items-stretch overflow-hidden rounded-[10px] border border-[#e8eef4]">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${size}`}
                                  onClick={() =>
                                    setSizeQty(size, sizeQty - 1)
                                  }
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft transition hover:bg-canvas hover:text-ink"
                                >
                                  <Minus size={16} />
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={sizeQty || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setSizeQty(
                                      size,
                                      parseInt(e.target.value, 10) || 0,
                                    )
                                  }
                                  className="h-11 min-w-0 flex-1 border-x border-[#e8eef4] bg-transparent text-center text-base font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  aria-label={`${colorName}, size ${size}`}
                                />
                                <button
                                  type="button"
                                  aria-label={`Increase ${size}`}
                                  onClick={() =>
                                    setSizeQty(size, sizeQty + 1)
                                  }
                                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-soft transition hover:bg-canvas hover:text-ink"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full-width price breaks under both columns */}
              <div className="border-t border-border bg-canvas/40 px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                      Price breaks
                    </p>
                  </div>
                  {activeBreak?.price != null && lineTotal > 0 ? (
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      Your tier · {money(activeBreak.price)}/hat
                    </p>
                  ) : null}
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {breaks.map((b) => {
                    const active = activeBreak?.qty === b.qty;
                    return (
                      <li
                        key={b.qty}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-sm",
                          active
                            ? "border-ink bg-white ring-1 ring-ink/15"
                            : "border-border bg-white",
                        )}
                      >
                        <span
                          className={cn(
                            "font-semibold",
                            active ? "text-ink" : "text-ink-soft",
                          )}
                        >
                          {formatBreakLabel(b.qty)}
                        </span>
                        <span
                          className={cn(
                            "tabular-nums",
                            active
                              ? "font-bold text-ink"
                              : "font-medium text-ink",
                          )}
                        >
                          {money(b.price)}
                          <span className="text-ink-soft">/hat</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs text-ink-soft">This blank</p>
                <p className="text-lg font-bold tabular-nums text-ink">
                  {lineTotal} hat{lineTotal === 1 ? "" : "s"}
                  {activeBreak?.price != null && lineTotal > 0 ? (
                    <span className="ml-2 text-sm font-semibold text-ink-soft">
                      · from {money(activeBreak.price)}/hat
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex gap-2">
                <ButtonNative variant="outline" size="lg" onClick={onClose}>
                  Cancel
                </ButtonNative>
                <ButtonNative
                  variant="secondary"
                  size="lg"
                  arrow
                  disabled={lineTotal <= 0}
                  onClick={handleAdd}
                >
                  Add to order
                </ButtonNative>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
