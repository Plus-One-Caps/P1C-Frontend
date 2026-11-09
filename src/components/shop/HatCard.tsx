"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPriceParts } from "@/lib/catalog";
import { brandLogoUrl } from "@/lib/brandLogos";
import { HatVisual } from "@/components/shop/HatVisual";
import { cn } from "@/lib/utils";

const MAX_SWATCHES = 6;

type Props = {
  product: CatalogProduct;
  className?: string;
  /** Interactive (selectable) mode used inside the order wizard. */
  selected?: boolean;
  onSelect?: () => void;
  /** Denser card for multi-column order grids. */
  compact?: boolean;
  /** Units already in the order — shows a top-right badge when > 0. */
  orderQty?: number;
};

export function HatCard({
  product,
  className,
  selected,
  onSelect,
  compact = false,
  orderQty = 0,
}: Props) {
  const colors = product.colors || [];
  const [activeName, setActiveName] = useState(
    product.showcaseColor || colors[0]?.name || "",
  );
  const price = formatPriceParts(product);
  const selectable = typeof onSelect === "function";
  const visible = colors.slice(0, compact ? 5 : MAX_SWATCHES);
  const extra = colors.length - visible.length;
  const logo = brandLogoUrl(product.brand);

  const swatches =
    colors.length > 0 ? (
      <div
        className={cn(
          "flex min-h-5 items-center gap-1.5",
          compact ? "mt-2" : "mt-2.5",
        )}
      >
        {visible.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            aria-label={`Preview ${color.name}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveName(color.name);
            }}
            className={cn(
              "h-3.5 w-3.5 shrink-0 rounded-full border transition",
              color.name === activeName
                ? "border-ink ring-1 ring-ink/30 ring-offset-1"
                : "border-black/15 hover:border-ink/50",
            )}
            style={{ backgroundColor: color.hex || "#e8e4de" }}
          />
        ))}
        {extra > 0 && (
          <span className="text-xs font-medium text-grey-olive">
            +{extra}
          </span>
        )}
      </div>
    ) : (
      <div className={cn("min-h-5", compact ? "mt-2" : "mt-2.5")} />
    );

  const footer = (
    <div className="mt-auto flex items-end justify-between gap-3 pt-3">
      <div className="min-w-0">
        {price.kind === "quote" ? (
          <p
            className={cn(
              "font-semibold text-ink",
              compact ? "text-xs" : "text-sm",
            )}
          >
            Quote
          </p>
        ) : (
          <>
            <p className="text-xs font-medium leading-none text-grey-olive">
              {price.kind === "from" ? "From" : ""}
            </p>
            <p
              className={cn(
                "font-bold leading-tight text-ink",
                compact ? "text-sm" : "text-[0.95rem]",
              )}
            >
              {price.amount}
            </p>
          </>
        )}
      </div>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={product.brand || "Brand"}
          className={cn(
            "object-contain object-right opacity-80 grayscale",
            compact ? "h-5 max-w-[4.5rem]" : "h-6 max-w-[5.5rem]",
          )}
          loading="lazy"
          decoding="async"
        />
      ) : product.brand ? (
        <span className="max-w-[5rem] truncate text-right text-xs font-bold uppercase tracking-[0.08em] text-grey-olive">
          {product.brand}
        </span>
      ) : null}
    </div>
  );

  const body = (
    <>
      <div
        className={cn(
          "relative overflow-hidden bg-white",
          compact ? "aspect-square p-2" : "aspect-[5/4] p-3",
        )}
      >
        <motion.div
          className="h-full w-full"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <HatVisual product={product} colorName={activeName} thumb />
        </motion.div>
        {orderQty > 0 ? (
          <span
            className={cn(
              "absolute right-1.5 top-1.5 z-10 inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-1.5 font-bold tabular-nums text-white shadow-sm ring-2 ring-white",
              compact ? "h-6 text-xs" : "h-7 text-xs",
            )}
            aria-label={`${orderQty} in order`}
          >
            {orderQty > 999 ? "999+" : orderQty}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          compact ? "px-2.5 pb-2.5 pt-0" : "px-3 pb-3 pt-0",
        )}
      >
        {swatches}

        <h3
          className={cn(
            "mt-2.5 font-semibold leading-snug text-ink",
            // Fixed min-height keeps card footers aligned without clipping
            // the second line of longer names.
            compact
              ? "line-clamp-2 min-h-[2.7em] text-sm"
              : "line-clamp-2 min-h-[2.85em] text-sm",
          )}
        >
          {product.name}
        </h3>
        <p className="mt-0.5 h-[1.1em] truncate text-[0.8125rem] text-grey-olive">
          {[product.brand, `${colors.length} color${colors.length === 1 ? "" : "s"}`]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {footer}
      </div>
    </>
  );

  const shellClass = cn(
    "group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] border bg-white text-left outline-none transition-colors",
    selectable && "cursor-pointer focus-visible:ring-2 focus-visible:ring-coral/25",
    selected
      ? "border-ink ring-2 ring-ink/15"
      : "border-border hover:border-ink/35",
    className,
  );

  if (selectable) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={
          orderQty > 0
            ? `${product.name}, ${orderQty} in order`
            : product.name
        }
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className={shellClass}
      >
        {body}
      </div>
    );
  }

  return (
    <article className={shellClass}>
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        {body}
      </Link>
    </article>
  );
}
