"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  primaryNav,
  silhouettes,
  type PrimaryNavItem,
} from "@/data/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinkClass =
  "inline-flex items-center gap-[0.28rem] border-b-2 border-transparent bg-transparent px-[0.7rem] py-[0.7rem] text-[0.8125rem] font-bold tracking-[-0.01em] text-ink no-underline whitespace-nowrap transition-[color,border-color,background] duration-150 hover:border-ink hover:text-ink focus-visible:outline-none";

export function HeaderBottomNav() {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    if (!openId) return;
    function onDoc(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  function scheduleOpen(id: string) {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenId(id);
  }

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenId(null), 140);
  }

  return (
    <div className="relative hidden border-t border-[#e8ecf1] bg-white md:block">
      <nav
        ref={navRef}
        className="mx-auto flex min-h-[2.85rem] w-full items-stretch gap-x-[0.35rem] overflow-visible px-5 md:px-8 lg:px-12"
        aria-label="Primary"
      >
        {primaryNav.map((item) => {
          const hasMega = Boolean(item.mega);
          const isOpen = openId === item.id;

          if (!hasMega) {
            return (
              <Link
                key={item.id}
                href={item.href || "/"}
                className={navLinkClass}
              >
                {item.title}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              className={cn("relative flex items-stretch", isOpen && "is-open")}
              onMouseEnter={() => scheduleOpen(item.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={cn(navLinkClass, "cursor-pointer", isOpen && "border-ink")}
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() =>
                  setOpenId((prev) => (prev === item.id ? null : item.id))
                }
              >
                {item.title}
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  aria-hidden
                  className={cn(
                    "opacity-75 transition-transform duration-150",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen ? (
                <div
                  className={cn(
                    "absolute top-[calc(100%-1px)] z-[120] pt-[0.65rem]",
                    item.mega === "shop"
                      ? "left-0 w-[min(42rem,calc(100vw-1.5rem))]"
                      : "left-0 w-max min-w-[16.5rem] max-w-[min(20rem,calc(100vw-1.5rem))]",
                  )}
                  role="menu"
                  onMouseEnter={() => scheduleOpen(item.id)}
                  onMouseLeave={scheduleClose}
                >
                  <MegaPanel item={item} onNavigate={() => setOpenId(null)} />
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="ml-auto flex items-center py-1.5 pl-3">
          <Button href="/order" variant="primary" size="sm">
            Start order
          </Button>
        </div>
      </nav>
    </div>
  );
}

function MegaPanel({
  item,
  onNavigate,
}: {
  item: PrimaryNavItem;
  onNavigate: () => void;
}) {
  if (item.mega === "shop") {
    return <ShopMegaPanel onNavigate={onNavigate} />;
  }

  return (
    <ListMegaPanel
      title={item.title}
      lede={item.blurb || ""}
      items={item.children || []}
      onNavigate={onNavigate}
    />
  );
}

function ShopMegaPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white text-ink shadow-[0_4px_6px_rgba(15,23,42,0.04),0_18px_40px_rgba(15,23,42,0.12)]">
      <header className="flex items-start justify-between gap-3 px-[1.05rem] pb-[0.7rem] pt-[0.95rem]">
        <div>
          <h2 className="m-0 text-[1.05rem] font-extrabold tracking-[-0.025em] leading-tight text-ink">
            Shop by style.
          </h2>
          <p className="mt-1 max-w-md text-sm font-medium leading-snug text-ink-soft">
            Truckers, snapbacks, fitteds, and beanies — ready to decorate.
          </p>
        </div>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold text-pastel-link no-underline hover:text-ink"
        >
          View all hats
          <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
        </Link>
      </header>

      <div className="border-t border-[#eef2f6] px-[1.05rem] py-3">
        <p className="mb-2 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
          Blank styles
        </p>
        <ul className="m-0 flex list-none flex-col p-0">
          {silhouettes.map((s) => (
            <li key={s.id}>
              <Link
                href={s.href}
                onClick={onNavigate}
                className="group -mx-[0.35rem] flex items-center justify-between gap-3 rounded-[10px] px-[0.55rem] py-[0.65rem] text-ink no-underline transition-colors hover:bg-[rgba(164,216,255,0.22)]"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="text-[0.8125rem] font-extrabold tracking-[-0.02em] transition-colors group-hover:text-pastel-link">
                    {s.name}
                  </strong>
                  <span className="text-sm font-medium leading-snug text-ink-soft">
                    {s.blurb}
                  </span>
                </span>
                <ArrowRight
                  size={15}
                  strokeWidth={2.5}
                  aria-hidden
                  className="shrink-0 text-pastel-link transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ListMegaPanel({
  title,
  lede,
  items,
  onNavigate,
}: {
  title: string;
  lede: string;
  items: { title: string; href: string; blurb?: string }[];
  onNavigate: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white text-ink shadow-[0_4px_6px_rgba(15,23,42,0.04),0_18px_40px_rgba(15,23,42,0.12)]">
      <header className="px-[0.95rem] pb-1 pt-[0.85rem]">
        <h2 className="m-0 text-[1.05rem] font-extrabold tracking-[-0.025em] leading-tight text-ink">
          {title}
        </h2>
        {lede ? (
          <p className="mt-1 text-sm font-medium leading-snug text-ink-soft">
            {lede}
          </p>
        ) : null}
      </header>
      <ul className="m-0 flex list-none flex-col gap-1 px-2 pb-2.5 pt-1">
        {items.map((child) => {
          const external =
            child.href.startsWith("mailto:") || child.href.startsWith("tel:");
          const className =
            "group flex items-center justify-between gap-3 rounded-[11px] px-3 py-2.5 text-ink no-underline transition-colors hover:bg-[rgba(164,216,255,0.22)]";
          const inner = (
            <>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-[0.8125rem] font-extrabold tracking-[-0.02em] transition-colors group-hover:text-pastel-link">
                  {child.title}
                </strong>
                {child.blurb ? (
                  <span className="text-sm font-medium leading-snug text-ink-soft">
                    {child.blurb}
                  </span>
                ) : null}
              </span>
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                aria-hidden
                className="shrink-0 text-pastel-link transition-transform group-hover:translate-x-0.5"
              />
            </>
          );
          return (
            <li key={child.href + child.title}>
              {external ? (
                <a href={child.href} className={className} onClick={onNavigate}>
                  {inner}
                </a>
              ) : (
                <Link href={child.href} className={className} onClick={onNavigate}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
