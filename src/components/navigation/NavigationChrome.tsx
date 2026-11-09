"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function jumpToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Full overlay only if nav is still pending after this. */
const OVERLAY_DELAY_MS = 140;

/**
 * Fast client navigations stay instant (thin top bar only).
 * Slower ones get a clear overlay so people don’t multi-click.
 */
function NavigationChromeInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || "";

  const [barPending, setBarPending] = useState(false);
  const [barDone, setBarDone] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const isFirstRoute = useRef(true);
  const navActiveRef = useRef(false);
  const overlayShownRef = useRef(false);
  const overlayTimerRef = useRef<number | null>(null);
  const prevPathRef = useRef(pathname);

  const clearOverlayTimer = () => {
    if (overlayTimerRef.current != null) {
      window.clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
  };

  const startNav = () => {
    navActiveRef.current = true;
    overlayShownRef.current = false;
    queueMicrotask(() => {
      setBarDone(false);
      setBarPending(true);
      setShowOverlay(false);
      clearOverlayTimer();
      overlayTimerRef.current = window.setTimeout(() => {
        if (!navActiveRef.current) return;
        overlayShownRef.current = true;
        setShowOverlay(true);
      }, OVERLAY_DELAY_MS);
    });
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    jumpToTop();
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.dataset.noNavProgress === "true") return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      startNav();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", startNav);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", startNav);
      clearOverlayTimer();
    };
  }, []);

  useEffect(() => {
    const pathChanged = prevPathRef.current !== pathname;
    prevPathRef.current = pathname;

    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      jumpToTop();
      return;
    }

    // Account tab swaps — no transition chrome.
    if (!pathChanged && pathname.startsWith("/account")) {
      navActiveRef.current = false;
      clearOverlayTimer();
      setBarPending(false);
      setBarDone(false);
      setShowOverlay(false);
      return;
    }

    jumpToTop();
    const tJump = window.setTimeout(jumpToTop, 0);
    clearOverlayTimer();

    const hadOverlay = overlayShownRef.current;
    navActiveRef.current = false;

    queueMicrotask(() => {
      setBarDone(true);
      setBarPending(true);
      // Drop overlay immediately once the new page is ready.
      setShowOverlay(false);
    });

    const clear = window.setTimeout(
      () => {
        setBarPending(false);
        setBarDone(false);
        overlayShownRef.current = false;
      },
      hadOverlay ? 120 : 90,
    );

    return () => {
      window.clearTimeout(tJump);
      window.clearTimeout(clear);
    };
  }, [pathname, search]);

  useEffect(() => {
    if (!showOverlay) return;
    document.documentElement.setAttribute("aria-busy", "true");
    const prev = document.body.style.cursor;
    document.body.style.cursor = "wait";
    return () => {
      document.documentElement.removeAttribute("aria-busy");
      document.body.style.cursor = prev;
    };
  }, [showOverlay]);

  const barVisible = barPending || barDone;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[310] h-[3px] overflow-hidden"
        aria-hidden
      >
        <div
          className={cn(
            "h-full origin-left bg-pastel-sky shadow-[0_0_10px_rgba(164,216,255,0.9)] transition-[transform,opacity] ease-out",
            !barVisible && "scale-x-0 opacity-0 duration-75",
            barPending && !barDone && "scale-x-[0.7] opacity-100 duration-400",
            barDone && "scale-x-100 opacity-100 duration-100",
          )}
        />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[305] flex items-center justify-center bg-white/90 backdrop-blur-[2px] transition-opacity duration-100",
          showOverlay
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        role="status"
        aria-live="polite"
        aria-busy={showOverlay}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#e8eef4] bg-white px-7 py-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
          <Loader2
            size={28}
            strokeWidth={2.25}
            className="animate-spin text-pastel-link"
          />
          <p className="text-sm font-semibold tracking-tight text-ink">
            Loading page…
          </p>
        </div>
      </div>
    </>
  );
}

export function NavigationChrome() {
  return (
    <Suspense fallback={null}>
      <NavigationChromeInner />
    </Suspense>
  );
}
