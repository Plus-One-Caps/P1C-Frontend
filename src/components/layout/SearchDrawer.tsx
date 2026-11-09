"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CatalogProduct, formatPriceParts } from "@/lib/catalog";
import {
  addRecentSearch,
  getRecentSearches,
  removeRecentSearch,
} from "@/lib/recentSearches";
import { cn } from "@/lib/utils";

const PREVIEW = 5;

const POPULAR = [
  { label: "Truckers", q: "trucker" },
  { label: "Snapbacks", q: "snapback" },
  { label: "Fitted", q: "fitted" },
  { label: "Beanies", q: "beanie" },
  { label: "Dad Hats", q: "dad" },
  { label: "5-Panel", q: "5-panel" },
  { label: "Mesh", q: "mesh" },
];

function catalogApiBase() {
  return (process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:4001").replace(
    /\/$/,
    "",
  );
}

function matchesQuery(product: CatalogProduct, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    product.name,
    product.brand,
    product.category,
    product.type,
    product.description,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  const formId = useId();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasQuery = Boolean(query.trim());

  const filtered = useMemo(
    () => products.filter((p) => matchesQuery(p, query)),
    [products, query],
  );

  const display = useMemo(() => {
    const list = hasQuery ? filtered : products;
    return list.slice(0, PREVIEW);
  }, [hasQuery, filtered, products]);

  // Keep in DOM for exit animation; double-rAF so the off-screen frame paints first
  useEffect(() => {
    if (open) {
      setMounted(true);
      setExpanded(false);
      setQuery("");
      setRecent(getRecentSearches());
      setLoading(true);
      let frame2 = 0;
      const frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setExpanded(true));
      });
      void fetch(`${catalogApiBase()}/api/products?published=true`)
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as { products?: CatalogProduct[] };
          setProducts(data.products ?? []);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
      return () => {
        cancelAnimationFrame(frame1);
        cancelAnimationFrame(frame2);
      };
    }
    setExpanded(false);
    const t = window.setTimeout(() => setMounted(false), 560);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!expanded) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 120);
    return () => clearTimeout(t);
  }, [expanded]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Freeze page scroll without overflow/padding — avoids any layout shift behind the drawer
  useEffect(() => {
    if (!open) return;

    function isInDrawerScroll(target: EventTarget | null) {
      const root = scrollRef.current;
      return !!(root && target instanceof Node && root.contains(target));
    }

    function onWheel(e: WheelEvent) {
      if (isInDrawerScroll(e.target)) {
        const el = scrollRef.current;
        if (!el) return;
        const atTop = el.scrollTop <= 0 && e.deltaY < 0;
        const atBottom =
          el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
        if (atTop || atBottom) e.preventDefault();
        return;
      }
      e.preventDefault();
    }

    function onTouchMove(e: TouchEvent) {
      if (isInDrawerScroll(e.target)) return;
      e.preventDefault();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [open]);

  function goToSearch(term?: string) {
    const t = (term ?? query).trim();
    if (t) addRecentSearch(t);
    onClose();
    router.push(t ? `/shop?q=${encodeURIComponent(t)}` : "/shop");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    goToSearch();
  }

  function chipGo(q: string) {
    addRecentSearch(q);
    setRecent(getRecentSearches());
    onClose();
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[200] transition-[opacity,visibility] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        expanded ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
      )}
      style={{ background: "rgba(0, 0, 0, 0.2)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close search"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-x-0 top-0 z-[1] flex max-h-[min(92vh,760px)] w-full flex-col overflow-hidden bg-white shadow-[0_18px_48px_-12px_rgba(15,23,42,0.18),0_8px_16px_-8px_rgba(15,23,42,0.08)] will-change-transform transition-transform duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "translate-y-0" : "-translate-y-[105%]",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex shrink-0 items-center justify-center px-12 pb-5 pt-4">
            <Logo
              variant="header"
              className="relative z-[1]"
              href="/"
              onClick={onClose}
            />
            <button
              type="button"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-[1.75rem] leading-none text-ink transition hover:bg-[#f4f4f5]"
              onClick={onClose}
              aria-label="Close search"
            >
              ×
            </button>
          </div>

          <form
            id={formId}
            onSubmit={onSubmit}
            className="mx-auto w-full max-w-[52rem] shrink-0 box-border px-6 pb-4"
          >
            <div className="flex w-full min-w-0 items-center gap-[0.65rem] rounded-full border border-ink bg-white px-4 py-[0.35rem]">
              <span className="flex shrink-0 text-[#52525b]" aria-hidden>
                <Search size={20} strokeWidth={2} />
              </span>
              <input
                ref={inputRef}
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                type="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent py-[0.65rem] text-base font-medium text-ink outline-none placeholder:text-[#a1a1aa]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full border border-ink-mid bg-ink-mid px-5 py-[0.65rem] text-sm font-semibold tracking-[0.01em] text-white transition hover:border-[#454a4e] hover:bg-[#454a4e]"
              >
                Search
              </button>
            </div>
          </form>

          <div
            ref={scrollRef}
            className="mx-auto min-h-0 w-full max-w-[52rem] flex-1 overflow-y-auto overscroll-contain px-6 pb-5 pt-2 [-webkit-overflow-scrolling:touch]"
          >
            {loading ? (
              <p className="m-0 text-[0.8125rem] text-[#71717a]" role="status">
                Loading products…
              </p>
            ) : null}

            {!loading && hasQuery && filtered.length === 0 ? (
              <p className="m-0 text-[0.8125rem] text-[#71717a]">
                No products found for “{query.trim()}”
              </p>
            ) : null}

            {!loading && display.length > 0 ? (
              <div className="mb-5 w-full">
                <h3 className="mb-[0.65rem] text-xs font-bold uppercase tracking-[0.06em] text-[#71717a]">
                  Products
                </h3>
                <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,9.25rem),1fr))] gap-[0.65rem] p-0">
                  {display.map((product, index) => (
                    <li key={product.id} className="m-0 min-w-0 p-0">
                      <ProductTile
                        product={product}
                        priority={index < 4}
                        onNavigate={onClose}
                      />
                    </li>
                  ))}
                </ul>
                {hasQuery && filtered.length > PREVIEW ? (
                  <Link
                    href={`/shop?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => {
                      addRecentSearch(query.trim());
                      onClose();
                    }}
                    className="mt-3 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    Show all products
                  </Link>
                ) : null}
              </div>
            ) : null}

            {!hasQuery && !loading ? (
              <div className="flex w-full flex-col gap-[0.35rem]">
                {recent.length > 0 ? (
                  <section className="pt-2.5" aria-label="Recent searches">
                    <h3 className="mb-[0.65rem] text-[0.8125rem] font-semibold tracking-[0.02em] text-[#71717a]">
                      Recent searches
                    </h3>
                    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                      {recent.map((q) => (
                        <li key={q}>
                          <div className="inline-flex items-center gap-0.5">
                            <button
                              type="button"
                              className="inline-flex items-center gap-[0.35rem] rounded-full border border-[#d4d4d8] bg-white px-[0.85rem] py-[0.45rem] text-sm font-medium text-ink transition hover:shadow-[0_5px_14px_-4px_rgba(15,23,42,0.18)]"
                              onClick={() => chipGo(q)}
                            >
                              <Search size={14} strokeWidth={2} aria-hidden />
                              <span>{q}</span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#71717a] hover:bg-[#f4f4f5] hover:text-ink"
                              aria-label={`Remove "${q}" from recent searches`}
                              onClick={(e) => {
                                e.preventDefault();
                                removeRecentSearch(q);
                                setRecent(getRecentSearches());
                              }}
                            >
                              <X size={12} strokeWidth={2} aria-hidden />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="pt-2.5" aria-label="Popular searches">
                  <h3 className="mb-[0.65rem] text-[0.8125rem] font-semibold tracking-[0.02em] text-[#71717a]">
                    Popular searches
                  </h3>
                  <ul className="m-0 flex list-none flex-wrap gap-2 gap-x-[0.65rem] p-0">
                    {POPULAR.map(({ label, q }) => (
                      <li key={q}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-[0.35rem] rounded-full border border-[#d4d4d8] bg-white px-[0.85rem] py-[0.45rem] text-sm font-medium text-ink transition hover:shadow-[0_5px_14px_-4px_rgba(15,23,42,0.18)]"
                          onClick={() => chipGo(q)}
                        >
                          <Search size={14} strokeWidth={2} aria-hidden />
                          <span>{label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function ProductTile({
  product,
  priority,
  onNavigate,
}: {
  product: CatalogProduct;
  priority?: boolean;
  onNavigate: () => void;
}) {
  const img = product.imageThumbUrl || product.imageUrl || product.galleryThumbs?.[0] || product.gallery?.[0];
  const price = formatPriceParts(product);
  const priceLabel =
    price.kind === "quote"
      ? "Request quote"
      : price.kind === "fixed"
        ? price.amount
        : `From ${price.amount}`;

  return (
    <Link
      href={`/shop/${product.slug}`}
      onClick={onNavigate}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white text-inherit no-underline transition hover:-translate-y-px hover:border-[#d1d5db] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]"
    >
      <div className="aspect-square overflow-hidden bg-white">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            width={240}
            height={240}
            className="h-full w-full object-contain object-center"
            priority={priority}
            unoptimized
          />
        ) : (
          <div className="h-full min-h-[5.5rem] w-full bg-[#fafafa]" aria-hidden />
        )}
      </div>
      <h3 className="m-0 line-clamp-2 px-[0.65rem] pt-[0.45rem] text-[0.8125rem] font-bold leading-[1.35] text-ink">
        {product.name}
      </h3>
      {product.brand ? (
        <p className="m-0 px-[0.65rem] pt-1 text-[0.8125rem] leading-[1.4] text-[#9ca3af]">
          {product.brand}
        </p>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-2 px-[0.65rem] pb-[0.65rem] pt-[0.45rem]">
        <p className="m-0 min-w-0 flex-1 text-[0.8125rem] font-bold text-ink">
          {priceLabel}
        </p>
      </div>
    </Link>
  );
}
