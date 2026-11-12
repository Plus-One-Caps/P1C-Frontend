"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  count?: number;
};

type Props = {
  brand: string;
  brands: Option[];
  style: string;
  styles: Option[];
  /** Total catalog size (for “All” option counts). */
  totalCount: number;
  /** Currently visible / filtered product count. */
  resultCount: number;
  onBrandChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onClear: () => void;
};

function FilterMenu({
  label,
  value,
  options,
  searchable = false,
  searchPlaceholder = "Search…",
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected =
    options.find((o) => o.value === value) ||
    options[0] || { value: "all", label: "All" };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    if (searchable) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:max-w-[16rem]">
      <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <button
        type="button"
        id={`${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-[12px] border bg-white px-3.5 text-left text-sm font-semibold text-ink transition",
          open
            ? "border-ink ring-2 ring-ink/10"
            : "border-[#e8eef4] hover:border-[#d1d5db]",
          value !== "all" && "border-ink/30",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        {selected.count != null ? (
          <span className="shrink-0 tabular-nums text-ink-soft">
            {selected.count}
          </span>
        ) : null}
        <ChevronDown
          size={16}
          strokeWidth={2.25}
          className={cn(
            "shrink-0 text-ink-soft transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-trigger`}
          className="absolute left-0 right-0 z-30 mt-1.5 overflow-hidden rounded-[12px] border border-[#e8eef4] bg-white shadow-[0_16px_40px_-18px_rgba(15,23,42,0.35)]"
        >
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-[#eef2f6] px-3">
              <Search size={15} className="shrink-0 text-ink-soft" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                // 16px+ on iOS prevents focus zoom that resizes the viewport
                className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="search"
              />
            </div>
          ) : null}

          <ul className="m-0 max-h-64 list-none overflow-y-auto overscroll-contain p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-soft">No matches</li>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => choose(o.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm transition",
                        active
                          ? "bg-ink text-white"
                          : "text-ink hover:bg-canvas",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {o.label}
                      </span>
                      {o.count != null ? (
                        <span
                          className={cn(
                            "tabular-nums",
                            active ? "text-white/70" : "text-ink-soft",
                          )}
                        >
                          {o.count}
                        </span>
                      ) : null}
                      {active ? (
                        <Check size={15} strokeWidth={2.5} className="shrink-0" />
                      ) : (
                        <span className="w-[15px] shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function OrderBlankFilters({
  brand,
  brands,
  style,
  styles,
  totalCount,
  resultCount,
  onBrandChange,
  onStyleChange,
  onClear,
}: Props) {
  const hasFilters = brand !== "all" || style !== "all";
  const brandOptions: Option[] = [
    { value: "all", label: "All brands", count: totalCount },
    ...brands,
  ];
  const styleOptions: Option[] = [
    { value: "all", label: "All styles", count: totalCount },
    ...styles,
  ];

  return (
    <div className="mb-6 rounded-[14px] border border-[#e8eef4] bg-white p-3 sm:mb-7 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
        {brands.length > 0 ? (
          <FilterMenu
            label="Brand"
            value={brand}
            options={brandOptions}
            searchable
            searchPlaceholder="Search brands…"
            onChange={onBrandChange}
          />
        ) : null}
        {styles.length > 0 ? (
          <FilterMenu
            label="Style"
            value={style}
            options={styleOptions}
            onChange={onStyleChange}
          />
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#eef2f6] pt-3">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold tabular-nums text-ink">
            {resultCount}
          </span>{" "}
          blank{resultCount === 1 ? "" : "s"}
          {hasFilters ? " matching filters" : " available"}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4"
          >
            <X size={14} strokeWidth={2.25} />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
