"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { primaryNav, silhouettes, siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HeaderBottomNav } from "@/components/layout/HeaderBottomNav";
import { SearchDrawer } from "@/components/layout/SearchDrawer";
import { useCart } from "@/components/cart/CartProvider";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import { cn } from "@/lib/utils";

const phoneDigits = siteConfig.phone.replace(/\D/g, "");

export function Header() {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();
  const { isAuthenticated, user, loading: authLoading } = useCustomerAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMobileGroup(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#e8ecf1] bg-white text-ink transition-shadow",
        scrolled && "shadow-[0_1px_3px_rgba(0,0,0,0.1)]",
      )}
    >
      {/* Top bar — Blanks-style: logo · search · phone · sign in · cart */}
      <div className="relative mx-auto flex min-h-[3.65rem] items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 md:min-h-[5.5rem] md:gap-5 md:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink hover:bg-canvas md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
          <Logo variant="header" />
        </div>

        <button
          type="button"
          className="absolute left-1/2 top-1/2 hidden w-[min(36rem,calc(100%-28rem))] max-w-xl -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2.5 text-left text-[0.8125rem] font-medium text-ink-soft transition hover:border-[#d1d5db] hover:bg-[#f1f5f9] md:inline-flex"
          onClick={() => setSearchOpen(true)}
          aria-label="Search hats"
        >
          <Search size={18} strokeWidth={2.25} aria-hidden />
          <span className="truncate">Search hats, styles, brands…</span>
        </button>

        <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink hover:bg-canvas md:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={20} strokeWidth={2.25} />
          </button>

          <a
            href={`tel:${phoneDigits}`}
            className="hidden items-center gap-2.5 text-ink no-underline lg:inline-flex"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pastel-sky/40 text-pastel-link">
              <Phone size={16} strokeWidth={2.25} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[0.8125rem] font-semibold text-ink-soft">
                Talk to a hat expert
              </span>
              <span className="whitespace-nowrap text-[0.8125rem] font-bold tracking-tight">
                {siteConfig.phone}
              </span>
            </span>
          </a>

          <nav className="flex items-center gap-0.5 sm:gap-1.5" aria-label="Account and cart">
            <Link
              href="/account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink no-underline transition hover:bg-canvas sm:h-auto sm:min-h-[2.35rem] sm:w-auto sm:gap-1.5 sm:border sm:border-border sm:px-3 sm:py-2 sm:text-[0.8125rem] sm:font-semibold sm:tracking-tight sm:hover:border-[#d1d5db] sm:hover:bg-[#f3f4f6]"
            >
              <User size={22} strokeWidth={2.1} className="sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden sm:inline">
                {authLoading
                  ? "Account"
                  : isAuthenticated
                    ? user?.name?.split(" ")[0] || "Account"
                    : "Sign In"}
              </span>
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-ink no-underline transition hover:bg-canvas sm:h-auto sm:min-h-[2.35rem] sm:w-auto sm:gap-1.5 sm:border sm:border-border sm:px-3 sm:py-2 sm:text-[0.8125rem] sm:font-semibold sm:tracking-tight sm:hover:border-[#d1d5db] sm:hover:bg-[#f3f4f6]"
            >
              <ShoppingCart size={20} strokeWidth={2.25} className="sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              {hydrated && itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-bold text-white sm:-right-1.5 sm:-top-1.5">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
      </div>

      <HeaderBottomNav />

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/25 md:hidden"
            style={{ top: "3.65rem" }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-full z-50 max-h-[min(78vh,640px)] overflow-y-auto border-b border-[#e8ecf1] bg-white shadow-lg md:hidden">
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {primaryNav.map((item) => {
                if (!item.mega) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href || "/"}
                      className="rounded-[10px] px-3 py-3 text-[0.95rem] font-bold text-ink"
                    >
                      {item.title}
                    </Link>
                  );
                }

                const open = mobileGroup === item.id;
                const children =
                  item.mega === "shop"
                    ? [
                        { title: "All hats", href: "/shop", blurb: "Full catalog" },
                        ...silhouettes.map((s) => ({
                          title: s.name,
                          href: s.href,
                          blurb: s.blurb,
                        })),
                      ]
                    : item.children || [];

                return (
                  <div key={item.id} className="border-b border-[#eef2f6] last:border-b-0">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-[10px] px-3 py-3 text-left text-[0.95rem] font-bold text-ink"
                      aria-expanded={open}
                      onClick={() =>
                        setMobileGroup((prev) => (prev === item.id ? null : item.id))
                      }
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        size={16}
                        strokeWidth={2.5}
                        className={cn(
                          "text-ink-soft transition-transform duration-150",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open ? (
                      <ul className="mb-2 ml-1 space-y-0.5 border-l border-[#e8ecf1] pl-3">
                        {children.map((child) => (
                          <li key={child.href + child.title}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-2.5 py-2.5"
                            >
                              <span className="block text-sm font-bold text-ink">
                                {child.title}
                              </span>
                              {child.blurb ? (
                                <span className="mt-0.5 block text-xs text-ink-soft">
                                  {child.blurb}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              <Button href="/order" variant="primary" size="lg" className="mt-3 w-full">
                Start your order
              </Button>
              <a
                href={`tel:${phoneDigits}`}
                className="mt-3 text-center text-sm font-semibold text-ink"
              >
                {siteConfig.phone}
              </a>
            </div>
          </div>
        </>
      )}

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
