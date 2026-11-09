"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  FileImage,
  Loader2,
  Minus,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import type {
  CatalogProduct,
  DecorationMethod,
  OrderBlankGroup,
} from "@/lib/catalog";
import {
  isOrderPlacementOption,
  normalizeMethodId,
  resolveProductDecoration,
  uploadArtworkFile,
} from "@/lib/catalog";
import { Container } from "@/components/ui/Container";
import { Field, fieldClass } from "@/components/ui/Field";
import { Button, ButtonNative } from "@/components/ui/Button";
import { HatCard } from "@/components/shop/HatCard";
import {
  HatVisual,
  hatHex,
  hatImageUrl,
} from "@/components/shop/HatVisual";
import { OrderFloatingBar } from "@/components/order/OrderFloatingBar";
import {
  BlankConfigureModal,
  type QtyMap,
} from "@/components/order/BlankConfigureModal";
import { DecorationStep } from "@/components/order/DecorationStep";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { useCart } from "@/components/cart/CartProvider";
import {
  embroideryStyles,
  frontPlacements,
  placementAddOns,
  threadColors,
  type EmbroideryStyleId,
  type ExtraLocationDetail,
  type FrontPlacementId,
  type ThreadArtPin,
} from "@/data/decorationOptions";
import { ArtworkThreadMap } from "@/components/order/ArtworkThreadMap";
import { estimateHatsSubtotal } from "@/lib/priceBreaks";
import type { CartItem } from "@/lib/cart";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import {
  fetchCustomerDesigns,
  type CustomerDesign,
} from "@/lib/customerApi";
import {
  clearDesignReuse,
  clearOrderReuse,
  formatShortDate,
  readDesignReuse,
  readOrderReuse,
} from "@/lib/reorder";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ARTWORK_SETUP_FEE = 50;
const ARTWORK_SETUP_FREE_AT = 12;

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

type Props = {
  products: CatalogProduct[];
  methods: DecorationMethod[];
  /** Curated style sections for the blank picker (from admin collections). */
  blankGroups?: OrderBlankGroup[];
  initialHat?: string;
  initialMethod?: string;
  /** Prefill from PDP “Start order with this hat”. */
  initialColor?: string;
  initialQty?: number;
  initialSize?: string;
  /** Jump to a step id (e.g. `art`) once the blank is seeded. */
  initialStep?: string;
};

type CartMap = Record<string, QtyMap>;

const STEPS = [
  { id: "hat", label: "Pick blanks" },
  { id: "art", label: "Artwork" },
  { id: "decoration", label: "Decoration" },
] as const;

const MAX_ART_BYTES = 8 * 1024 * 1024; // backend JSON limit is 12 MB base64

const ART_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  ai: "application/illustrator",
  eps: "application/postscript",
};

function artContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ART_TYPES[ext] || "";
}

function totalFor(qty: QtyMap): number {
  return Object.values(qty).reduce(
    (sum, sizes) => sum + Object.values(sizes).reduce((a, b) => a + b, 0),
    0,
  );
}

export function OrderWizard({
  products,
  methods,
  blankGroups = [],
  initialHat,
  initialMethod,
  initialColor,
  initialQty,
  initialSize,
  initialStep,
}: Props) {
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const topRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const summaryAnchorRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [summaryPinned, setSummaryPinned] = useState(false);
  const [summaryPin, setSummaryPin] = useState({
    top: 160,
    left: 0,
    width: 0,
    height: 0,
    maxHeight: 480,
  });

  const startHat = useMemo(
    () => products.find((p) => p.slug === initialHat || p.id === initialHat) || null,
    [products, initialHat],
  );

  const seededFromPdp = useMemo(() => {
    if (!startHat || !initialQty || initialQty < 1) return null;
    const color =
      (initialColor &&
        startHat.colors.find(
          (c) => c.name.toLowerCase() === initialColor.toLowerCase(),
        )?.name) ||
      startHat.showcaseColor ||
      startHat.colors[0]?.name ||
      "Default";
    const size = initialSize?.trim() || "Adjustable";
    const qtyMap: QtyMap = { [color]: { [size]: initialQty } };
    return { color, qtyMap };
  }, [startHat, initialColor, initialQty, initialSize]);

  const startStepIndex = useMemo(() => {
    if (!seededFromPdp || !initialStep) return 0;
    const idx = STEPS.findIndex((s) => s.id === initialStep);
    return idx >= 0 ? idx : 0;
  }, [seededFromPdp, initialStep]);

  const groups = useMemo<OrderBlankGroup[]>(() => {
    if (blankGroups.length) return blankGroups;
    return [
      {
        id: "all",
        slug: "all",
        name: "All blanks",
        products,
      },
    ];
  }, [blankGroups, products]);

  const [step, setStep] = useState(startStepIndex);
  const [direction, setDirection] = useState(1);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [hatSlug, setHatSlug] = useState<string | null>(startHat?.slug ?? null);
  const [cart, setCart] = useState<CartMap>(() =>
    startHat && seededFromPdp
      ? { [startHat.slug]: seededFromPdp.qtyMap }
      : {},
  );
  const [modalProduct, setModalProduct] = useState<CatalogProduct | null>(
    // PDP handoff already seeded qty — don't reopen configure modal
    seededFromPdp ? null : startHat,
  );
  const [previewColor, setPreviewColor] = useState(
    seededFromPdp?.color ||
      startHat?.showcaseColor ||
      startHat?.colors[0]?.name ||
      "",
  );

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const brand = String(p.brand || "").trim();
      if (!brand) continue;
      counts.set(brand, (counts.get(brand) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const visibleGroups = useMemo(() => {
    const byCollection =
      groupFilter === "all"
        ? groups
        : groups.filter((g) => g.slug === groupFilter);

    if (brandFilter === "all") return byCollection;

    return byCollection
      .map((g) => ({
        ...g,
        products: g.products.filter(
          (p) =>
            String(p.brand || "").trim().toLowerCase() ===
            brandFilter.toLowerCase(),
        ),
      }))
      .filter((g) => g.products.length > 0);
  }, [groups, groupFilter, brandFilter]);

  const filteredProductCount = useMemo(
    () => visibleGroups.reduce((sum, g) => sum + g.products.length, 0),
    [visibleGroups],
  );

  const [methodId, setMethodId] = useState(() => {
    if (!startHat || !initialMethod) return "";
    const available = resolveProductDecoration(startHat, methods);
    return (
      available.find(
        (m) => normalizeMethodId(m.id) === normalizeMethodId(initialMethod),
      )?.id || ""
    );
  });
  /** Optional side/back locations only. */
  const [extraLocations, setExtraLocations] = useState<string[]>([]);
  const [extraLocationDetails, setExtraLocationDetails] = useState<
    Record<string, ExtraLocationDetail>
  >({});
  const [extraUploadingLoc, setExtraUploadingLoc] = useState<string | null>(
    null,
  );
  const [frontPlacement, setFrontPlacement] =
    useState<FrontPlacementId>("center");
  const [inkColors, setInkColors] = useState(1);
  const [embroideryStyle, setEmbroideryStyle] =
    useState<EmbroideryStyleId>("flat");
  const [preferredThreads, setPreferredThreads] = useState<string[]>([]);
  const [threadPins, setThreadPins] = useState<ThreadArtPin[]>([]);
  const [threadNotes, setThreadNotes] = useState("");
  const [decorationNotes, setDecorationNotes] = useState("");

  const [art, setArt] = useState<{ url: string; fileName: string; preview?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [noArtYet, setNoArtYet] = useState(false);
  const [notes, setNotes] = useState("");
  const [rights, setRights] = useState(false);
  const [savedDesignNotice, setSavedDesignNotice] = useState(false);
  const [reorderNotice, setReorderNotice] = useState(false);
  const [previousDesigns, setPreviousDesigns] = useState<CustomerDesign[]>([]);
  const [previousDesignsLoading, setPreviousDesignsLoading] = useState(false);
  const [previousArtworkOpen, setPreviousArtworkOpen] = useState(false);
  const [selectedPreviousId, setSelectedPreviousId] = useState<string | null>(
    null,
  );
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  function applySavedArtwork(opts: {
    artworkUrl?: string | null;
    fileName?: string;
    notes?: string | null;
    method?: string | null;
    locations?: string[] | null;
    designId?: string | null;
    notice?: boolean;
  }) {
    if (opts.artworkUrl) {
      setArt({
        url: opts.artworkUrl,
        fileName: opts.fileName || "Saved artwork",
        preview: opts.artworkUrl,
      });
      setNoArtYet(false);
      setRights(true);
      setUploadError("");
      setError("");
      setSelectedPreviousId(opts.designId || null);
      if (opts.notice !== false) setSavedDesignNotice(true);
    }
    if (opts.notes) setNotes(opts.notes);
    if (opts.method) {
      const match = methods.find(
        (m) =>
          normalizeMethodId(m.id) === normalizeMethodId(opts.method || "") ||
          normalizeMethodId(m.label) === normalizeMethodId(opts.method || ""),
      );
      if (match) setMethodId(match.id);
    }
    if (opts.locations?.length) {
      setExtraLocations(
        opts.locations.filter((loc) => isOrderPlacementOption(loc)),
      );
    }
  }

  useEffect(() => {
    const orderReuse = readOrderReuse();
    if (orderReuse) {
      const nextCart: CartMap = {};
      for (const [slug, qtyMap] of Object.entries(orderReuse.cart || {})) {
        if (products.some((p) => p.slug === slug)) {
          nextCart[slug] = qtyMap;
        }
      }
      if (Object.keys(nextCart).length) {
        setCart(nextCart);
        const primarySlug =
          (orderReuse.hatSlug && nextCart[orderReuse.hatSlug]
            ? orderReuse.hatSlug
            : Object.keys(nextCart)[0]) || null;
        if (primarySlug) {
          setHatSlug(primarySlug);
          const p = products.find((x) => x.slug === primarySlug);
          if (p) {
            setPreviewColor(
              Object.keys(nextCart[primarySlug] || {})[0] ||
                p.showcaseColor ||
                p.colors[0]?.name ||
                "",
            );
          }
        }
      }

      if (orderReuse.artworkUrl) {
        applySavedArtwork({
          artworkUrl: orderReuse.artworkUrl,
          fileName: orderReuse.artworkFileName || "Previous artwork",
          notes: orderReuse.designNotes,
          method: orderReuse.method,
          locations: orderReuse.extraLocations,
          notice: false,
        });
      } else if (orderReuse.designNotes) {
        setNotes(orderReuse.designNotes);
        if (!orderReuse.hasArtwork) setNoArtYet(true);
      } else if (orderReuse.method || orderReuse.extraLocations?.length) {
        applySavedArtwork({
          method: orderReuse.method,
          locations: orderReuse.extraLocations,
          notice: false,
        });
      }

      if (orderReuse.frontPlacement) {
        setFrontPlacement(orderReuse.frontPlacement);
      }
      if (orderReuse.extraLocationDetails) {
        setExtraLocationDetails(orderReuse.extraLocationDetails);
      }
      if (orderReuse.embroideryStyle) {
        setEmbroideryStyle(orderReuse.embroideryStyle);
      }
      if (orderReuse.preferredThreads?.length) {
        setPreferredThreads(orderReuse.preferredThreads);
      }
      if (orderReuse.threadPins?.length) {
        setThreadPins(orderReuse.threadPins);
      }
      if (orderReuse.threadNotes) setThreadNotes(orderReuse.threadNotes);
      if (orderReuse.decorationNotes) {
        setDecorationNotes(orderReuse.decorationNotes);
      }
      if (orderReuse.inkColors && orderReuse.inkColors > 0) {
        setInkColors(orderReuse.inkColors);
      }

      setReorderNotice(true);
      setSavedDesignNotice(false);
      if (orderReuse.jumpToEnd !== false) {
        setDirection(1);
        setStep(STEPS.length - 1);
      }
      clearOrderReuse();
      return;
    }

    const reuse = readDesignReuse();
    if (!reuse) return;
    if (reuse.artworkUrl) {
      applySavedArtwork({
        artworkUrl: reuse.artworkUrl,
        fileName: reuse.fileName || "Saved artwork",
        notes: reuse.notes,
        method: reuse.method,
        locations: reuse.locations,
        notice: true,
      });
    } else if (reuse.notes) {
      setNotes(reuse.notes);
      setNoArtYet(true);
      setSavedDesignNotice(true);
    }
    clearDesignReuse();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot session preload
  }, [methods, products]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setPreviousDesigns([]);
      return;
    }
    let cancelled = false;
    setPreviousDesignsLoading(true);
    void (async () => {
      try {
        const data = await fetchCustomerDesigns();
        if (cancelled) return;
        const withArt = (data.designs || []).filter((d) =>
          Boolean(d.artworkUrl || d.previewImageUrl),
        );
        setPreviousDesigns(withArt);
      } catch {
        if (!cancelled) setPreviousDesigns([]);
      } finally {
        if (!cancelled) setPreviousDesignsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  const [atcOpen, setAtcOpen] = useState(false);
  const [atcItem, setAtcItem] = useState<CartItem | null>(null);
  const [error, setError] = useState("");

  const product = useMemo(
    () => products.find((p) => p.slug === hatSlug) || null,
    [products, hatSlug],
  );
  const productMethods = useMemo(
    () => (product ? resolveProductDecoration(product, methods) : []),
    [product, methods],
  );
  const activeMethod =
    productMethods.find((m) => m.id === methodId) || productMethods[0] || null;

  const totalQty = useMemo(
    () =>
      Object.values(cart).reduce((sum, qtyMap) => sum + totalFor(qtyMap), 0),
    [cart],
  );

  /** Hats subtotal from price breaks (same math as the bottom bar). */
  const hatsEstimate = useMemo(() => {
    const lines = Object.entries(cart)
      .map(([slug, qtyMap]) => {
        const p = products.find((x) => x.slug === slug);
        if (!p) return null;
        return { qty: totalFor(qtyMap), pricing: p.pricing };
      })
      .filter((line): line is NonNullable<typeof line> => line != null);
    return estimateHatsSubtotal(
      lines,
      activeMethod?.id || methodId,
      totalQty,
    );
  }, [cart, products, activeMethod?.id, methodId, totalQty]);

  const optionalPlacements = useMemo(
    () => extraLocations.filter(isOrderPlacementOption),
    [extraLocations],
  );

  const orderExtras = useMemo(() => {
    const qty = Math.max(totalQty, 0);
    const lines: Array<{ label: string; value: string; amount: number }> = [];

    const isEmbroidery =
      activeMethod &&
      normalizeMethodId(activeMethod.id).includes("embroidery");

    if (isEmbroidery && embroideryStyle === "3d-puff" && qty > 0) {
      const perHat =
        embroideryStyles.find((s) => s.id === "3d-puff")?.addOnPerHat ?? 8;
      const amount = perHat * qty;
      lines.push({
        label: "3D puff",
        value: `+${money(amount)}`,
        amount,
      });
    }

    for (const loc of optionalPlacements) {
      const addon = placementAddOns[loc];
      if (!addon || qty <= 0) {
        lines.push({
          label: loc,
          value: "Quoted",
          amount: 0,
        });
        continue;
      }
      const amount = addon.perHat * qty + addon.setup;
      lines.push({
        label: loc,
        value: `+${money(amount)}`,
        amount,
      });
    }

    if (qty > 0) {
      const setupFree = qty >= ARTWORK_SETUP_FREE_AT;
      lines.push({
        label: "Artwork setup",
        value: setupFree ? "Free" : `+${money(ARTWORK_SETUP_FEE)}`,
        amount: setupFree ? 0 : ARTWORK_SETUP_FEE,
      });
    }

    return lines;
  }, [
    activeMethod,
    embroideryStyle,
    optionalPlacements,
    totalQty,
  ]);

  /** Hats + decoration extras — checkout adds shipping / expedite / promo. */
  const estimateTotal = useMemo(() => {
    const base = hatsEstimate ?? 0;
    const extras = orderExtras.reduce((sum, line) => sum + line.amount, 0);
    if (hatsEstimate == null && extras <= 0) return null;
    return Math.round((base + extras) * 100) / 100;
  }, [hatsEstimate, orderExtras]);

  // Keep progress bar under the site header, and lock the order summary
  // in place on desktop (fixed, never scrolls away / under chrome).
  useLayoutEffect(() => {
    const sync = () => {
      const header = document.querySelector("header");
      const headerH = header?.getBoundingClientRect().height ?? 0;
      setHeaderOffset(headerH);

      const progressH = progressRef.current?.getBoundingClientRect().height ?? 0;
      const topChrome = headerH + progressH + 16;
      const bottomClear = 120;

      if (step === 0) {
        setSummaryPinned(false);
        return;
      }

      const anchor = summaryAnchorRef.current;
      const card = summaryCardRef.current;
      if (!anchor || !card) return;

      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!desktop) {
        setSummaryPinned(false);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const measured = card.getBoundingClientRect().height;
      // Always locked on desktop once past blank pick — no scroll lag.
      setSummaryPinned(true);
      setSummaryPin((prev) => ({
        top: topChrome,
        left: rect.left,
        width: rect.width,
        height: measured > 0 ? measured : prev.height,
        maxHeight: Math.max(220, window.innerHeight - topChrome - bottomClear),
      }));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [
    step,
    totalQty,
    extraLocations,
    frontPlacement,
    embroideryStyle,
    preferredThreads,
    art,
    noArtYet,
    hatsEstimate,
    orderExtras,
    estimateTotal,
    activeMethod?.id,
  ]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setError("");
    if (STEPS[next]?.id === "decoration") {
      let slug = hatSlug;
      if (!slug || totalFor(cart[slug] || {}) <= 0) {
        slug =
          Object.entries(cart).find(([, qtyMap]) => totalFor(qtyMap) > 0)?.[0] ||
          null;
        if (slug) setHatSlug(slug);
      }
      const p = products.find((x) => x.slug === slug) || null;
      const available = p ? resolveProductDecoration(p, methods) : [];
      const method =
        available.find((m) => m.id === methodId) || available[0] || null;
      if (method && !methodId) setMethodId(method.id);
    }
    setStep(next);
    // Instant jump — never animate scroll between order steps.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      topRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }

  function openConfigure(p: CatalogProduct) {
    setModalProduct(p);
    setPreviewColor(p.showcaseColor || p.colors[0]?.name || "");
  }

  function addBlankToOrder(p: CatalogProduct, qtyMap: QtyMap) {
    setCart((prev) => ({ ...prev, [p.slug]: qtyMap }));
    setHatSlug(p.slug);
    setPreviewColor(
      Object.entries(qtyMap).find(([, sizes]) =>
        Object.values(sizes).some((n) => n > 0),
      )?.[0] ||
        p.showcaseColor ||
        p.colors[0]?.name ||
        "",
    );
    const available = resolveProductDecoration(p, methods);
    if (!available.some((m) => m.id === methodId)) setMethodId("");
    setExtraLocations([]);
    setExtraLocationDetails({});
    setModalProduct(null);
    setError("");
  }

  function chooseMethod(id: string) {
    setMethodId(id);
    const method = productMethods.find((m) => m.id === id);
    const allowed = new Set(method?.locations || []);
    setExtraLocations((prev) => prev.filter((l) => allowed.has(l)));
    setExtraLocationDetails((prev) => {
      const next: Record<string, ExtraLocationDetail> = {};
      for (const [loc, detail] of Object.entries(prev)) {
        if (allowed.has(loc)) next[loc] = detail;
      }
      return next;
    });
    if (!normalizeMethodId(id).includes("embroidery")) {
      setEmbroideryStyle("flat");
      setPreferredThreads([]);
      setThreadPins([]);
      setThreadNotes("");
      setFrontPlacement("center");
    }
  }

  function toggleExtraLocation(loc: string) {
    setExtraLocations((prev) => {
      if (prev.includes(loc)) {
        setExtraLocationDetails((details) => {
          const next = { ...details };
          delete next[loc];
          return next;
        });
        return prev.filter((l) => l !== loc);
      }
      return [...prev, loc];
    });
  }

  function updateExtraLocationDetail(
    loc: string,
    patch: Partial<ExtraLocationDetail> | null,
  ) {
    setExtraLocationDetails((prev) => {
      if (patch == null) {
        const next = { ...prev };
        delete next[loc];
        return next;
      }
      return {
        ...prev,
        [loc]: { ...(prev[loc] || {}), ...patch },
      };
    });
  }

  async function uploadExtraLocationArt(loc: string, file: File) {
    const contentType = artContentType(file);
    if (!contentType || !Object.values(ART_TYPES).includes(contentType)) {
      setError("Please upload a PNG, JPG, SVG, PDF, AI, or EPS file.");
      return;
    }
    if (file.size > MAX_ART_BYTES) {
      setError("That file is over 8 MB. Please upload a smaller file.");
      return;
    }
    setExtraUploadingLoc(loc);
    setError("");
    const typed = file.type
      ? file
      : new File([file], file.name, { type: contentType });
    const result = await uploadArtworkFile(typed);
    setExtraUploadingLoc(null);
    if (!result.ok || !result.url) {
      setError(result.error || "Could not upload artwork. Please try again.");
      return;
    }
    updateExtraLocationDetail(loc, {
      artworkUrl: result.url,
      fileName: result.fileName || file.name,
      preview: contentType.startsWith("image/")
        ? URL.createObjectURL(file)
        : result.thumbUrl || undefined,
    });
  }

  function toggleThread(name: string) {
    setPreferredThreads((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function addThreadPin(pin: Omit<ThreadArtPin, "id">) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setThreadPins((prev) => [...prev, { ...pin, id }]);
    setPreferredThreads((prev) =>
      prev.includes(pin.threadName) ? prev : [...prev, pin.threadName],
    );
  }

  function removeThreadPin(id: string) {
    setThreadPins((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    const contentType = artContentType(file);
    if (!contentType || !Object.values(ART_TYPES).includes(contentType)) {
      setUploadError("Please upload a PNG, JPG, SVG, PDF, AI, or EPS file.");
      return;
    }
    if (file.size > MAX_ART_BYTES) {
      setUploadError("That file is over 8 MB. Please upload a smaller file.");
      return;
    }
    setUploading(true);
    const typed = file.type ? file : new File([file], file.name, { type: contentType });
    const result = await uploadArtworkFile(typed);
    setUploading(false);
    if (!result.ok || !result.url) {
      setUploadError(result.error || "Could not upload artwork. Please try again.");
      return;
    }
    setThreadPins([]);
    setSelectedPreviousId(null);
    setSavedDesignNotice(false);
    setArt({
      url: result.url,
      fileName: result.fileName || file.name,
      preview: contentType.startsWith("image/")
        ? URL.createObjectURL(file)
        : result.thumbUrl || undefined,
    });
    setNoArtYet(false);
    setError("");
  }

  function selectPreviousDesign(design: CustomerDesign) {
    const url = design.artworkUrl || design.previewImageUrl;
    if (!url) return;
    setThreadPins([]);
    applySavedArtwork({
      artworkUrl: url,
      fileName: "Previous artwork",
      notes: design.notes,
      method: design.method,
      locations: design.locations,
      designId: design.id,
      notice: true,
    });
  }

  /** Returns an error message if the current step is not complete. */
  function validate(at: number): string {
    switch (STEPS[at]?.id) {
      case "hat":
        return totalQty > 0 ? "" : "Add at least one blank to continue.";
      case "art":
        if (uploading) return "Hold on, your file is still uploading.";
        if (!art && !noArtYet)
          return "Upload your artwork, or tell us you do not have it yet.";
        if (art && !rights)
          return "Please confirm you have the rights to use this artwork.";
        return "";
      case "decoration":
        if (!activeMethod) return "Choose a decoration method.";
        if (
          normalizeMethodId(activeMethod.id).includes("embroidery") &&
          !frontPlacement
        ) {
          return "Choose a front placement.";
        }
        return "";
      default:
        return "";
    }
  }

  function buildCartDraft(): Omit<CartItem, "id" | "addedAt"> | null {
    if (!activeMethod || totalQty <= 0) return null;

    const blanks = Object.entries(cart)
      .map(([slug, qtyMap]) => {
        const p = products.find((x) => x.slug === slug);
        if (!p || totalFor(qtyMap) <= 0) return null;
        const firstColor =
          Object.entries(qtyMap).find(([, sizes]) =>
            Object.values(sizes).some((n) => n > 0),
          )?.[0] ||
          p.showcaseColor ||
          p.colors[0]?.name ||
          "";
        const variants = Object.entries(qtyMap)
          .map(([colorName, sizes]) => {
            const lines = Object.entries(sizes)
              .filter(([, n]) => n > 0)
              .map(([size, n]) => ({ size, qty: n }));
            if (!lines.length) return null;
            const color = p.colors.find((c) => c.name === colorName);
            return {
              color: { name: colorName, hex: color?.hex },
              sizes: lines,
            };
          })
          .filter((v): v is NonNullable<typeof v> => v !== null);
        return {
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          imageUrl: hatImageUrl(p, firstColor, true) || undefined,
          variants,
        };
      })
      .filter((blank): blank is NonNullable<typeof blank> => blank !== null);

    if (!blanks.length) return null;

    const title =
      blanks.length === 1
        ? blanks[0].productName
        : `${blanks[0].productName} +${blanks.length - 1} more`;

    const designNotes =
      [
        notes.trim(),
        normalizeMethodId(activeMethod.id).includes("embroidery")
          ? `Front placement: ${
              frontPlacements.find((p) => p.id === frontPlacement)?.name ||
              frontPlacement
            }`
          : "",
        preferredThreads.length
          ? `Preferred threads: ${preferredThreads.join(", ")}`
          : "",
        threadPins.length
          ? `Thread map: ${threadPins
              .map(
                (p, i) =>
                  `${i + 1}) ${p.threadName} @ ${Math.round(p.x)}%,${Math.round(p.y)}%`,
              )
              .join("; ")}`
          : "",
        ...extraLocations.map((loc) => {
          const d = extraLocationDetails[loc];
          const bits = [
            d?.fileName ? `art: ${d.fileName}` : "",
            d?.notes?.trim() ? `note: ${d.notes.trim()}` : "",
          ].filter(Boolean);
          return bits.length ? `${loc}: ${bits.join(" · ")}` : `${loc}: requested`;
        }),
        threadNotes.trim() ? `Thread notes: ${threadNotes.trim()}` : "",
        decorationNotes.trim()
          ? `Decoration notes: ${decorationNotes.trim()}`
          : "",
        embroideryStyle !== "flat" &&
        normalizeMethodId(activeMethod.id).includes("embroidery")
          ? `Embroidery style: 3D puff`
          : "",
      ]
        .filter(Boolean)
        .join("\n") || undefined;

    return {
      title,
      blanks,
      decoration: {
        methodId: activeMethod.id,
        method: activeMethod.label,
        locations: [
          ...(normalizeMethodId(activeMethod.id).includes("embroidery")
            ? [
                `Front panel · ${
                  frontPlacements.find((p) => p.id === frontPlacement)?.name ||
                  "Center"
                }`,
              ]
            : ["Front panel"]),
          ...extraLocations,
        ],
        frontPlacement: normalizeMethodId(activeMethod.id).includes("embroidery")
          ? frontPlacement
          : undefined,
        extraLocations: extraLocations.length
          ? extraLocations.map((loc) => ({
              location: loc,
              artworkUrl: extraLocationDetails[loc]?.artworkUrl,
              notes: extraLocationDetails[loc]?.notes?.trim() || undefined,
            }))
          : undefined,
        colors: activeMethod.askInkColors ? inkColors : undefined,
        embroideryStyle: normalizeMethodId(activeMethod.id).includes("embroidery")
          ? embroideryStyle
          : undefined,
        preferredThreads: preferredThreads.length ? preferredThreads : undefined,
        threadPins: threadPins.length
          ? threadPins.map((p) => ({
              threadName: p.threadName,
              hex: p.hex,
              x: p.x,
              y: p.y,
            }))
          : undefined,
        threadNotes: threadNotes.trim() || undefined,
        notes: decorationNotes.trim() || undefined,
      },
      design: {
        hasArtwork: Boolean(art),
        notes: designNotes,
        artworkUrl: art?.url,
        artworkFileName: art?.fileName,
        artworkPreview: art?.preview,
      },
      totalQty,
      merchandiseEstimate:
        estimateTotal != null && Number.isFinite(estimateTotal)
          ? Math.round(estimateTotal * 100) / 100
          : 0,
    };
  }

  function addConfiguredOrderToCart() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    const draft = buildCartDraft();
    if (!draft) {
      setError("Add at least one blank to your order.");
      return;
    }
    const item = addItem(draft);
    setAtcItem(item);
    setAtcOpen(true);
    setError("");
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    if (step < STEPS.length - 1) goTo(step + 1);
    else addConfiguredOrderToCart();
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -36 }),
  };

  const stepId = STEPS[step]?.id;
  const pastArtwork = stepId === "decoration";
  const ctaLabel =
    step === STEPS.length - 1
      ? "Add to cart"
      : step === 0
        ? totalQty > 0
          ? "Next · Artwork"
          : "Add a blank"
        : "Next step";

  return (
    <div className="bg-canvas/40 pb-36 md:pb-32">
      <div ref={topRef} className="scroll-mt-20" />

      {/* Status / progress — stays under the site header while scrolling */}
      <div
        ref={progressRef}
        className="sticky z-40 border-b border-border bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md"
        style={{ top: headerOffset }}
      >
        <Container className="py-3 sm:py-3.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <ButtonNative
              variant="ghost"
              size="sm"
              arrow={false}
              disabled={step === 0}
              onClick={() => step > 0 && goTo(step - 1)}
              className="shrink-0 gap-1.5 px-3.5 sm:px-4"
              aria-label="Back"
            >
              <ArrowLeft
                size={15}
                strokeWidth={2.25}
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-[3px] group-focus-visible:-translate-x-[3px]"
              />
              <span className="hidden sm:inline">Back</span>
            </ButtonNative>

            <div className="min-w-0 flex-1">
              <ol
                className="hidden items-center gap-2 sm:flex"
                aria-label="Order progress"
              >
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const current = i === step;
                  return (
                    <li
                      key={s.id}
                      className="flex flex-1 items-center gap-2 last:flex-none"
                    >
                      <button
                        type="button"
                        disabled={i > step}
                        onClick={() => i < step && goTo(i)}
                        aria-current={current ? "step" : undefined}
                        className={cn(
                          "flex items-center gap-2 text-sm font-semibold transition-colors",
                          current
                            ? "text-ink"
                            : done
                              ? "text-ink/70 hover:text-ink"
                              : "text-grey-olive/60",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                            current || done
                              ? "bg-ink text-white"
                              : "bg-surface text-grey-olive",
                          )}
                        >
                          {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="hidden md:inline">{s.label}</span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <span
                          className="relative h-px flex-1 bg-border"
                          aria-hidden
                        >
                          <motion.span
                            className="absolute inset-y-0 left-0 bg-ink"
                            initial={false}
                            animate={{ width: done ? "100%" : "0%" }}
                            transition={{
                              duration: 0.45,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="sm:hidden">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{STEPS[step].label}</span>
                  <span className="text-grey-olive">
                    {step + 1}/{STEPS.length}
                  </span>
                </div>
                <div className="mt-2 h-1 bg-border">
                  <motion.div
                    className="h-full bg-ink"
                    initial={false}
                    animate={{
                      width: `${((step + 1) / STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>

            <ButtonNative
              variant="secondary"
              size="sm"
              arrow={step < STEPS.length - 1}
              onClick={next}
              disabled={uploading || (step === 0 && totalQty <= 0)}
              className="shrink-0 min-w-[5.75rem] px-4 sm:min-w-[6.5rem] sm:px-5"
              aria-label={ctaLabel}
            >
              {step === STEPS.length - 1 ? (
                <>
                  <span>Add</span>
                  <Check size={15} strokeWidth={2.5} />
                </>
              ) : (
                <span>Next</span>
              )}
            </ButtonNative>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div
          className={cn(
            "grid gap-8",
            step > 0 && "lg:grid-cols-12 lg:items-start lg:gap-12",
          )}
        >
          <div className={cn("min-w-0", step > 0 && "lg:col-span-8")}>
            {reorderNotice ? (
              <div className="mb-5 rounded-[var(--radius-md)] border border-pastel-sky/60 bg-sky px-4 py-3 text-sm text-ink">
                Reorder loaded with your previous blanks, artwork, and
                decoration. Estimates use{" "}
                <span className="font-semibold">today&apos;s pricing</span> —
                past discount codes are not applied.
              </div>
            ) : null}
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <StepShell
                    title="Pick your blanks"
                    subtitle="Filter by brand or style, then tap a hat to choose colors and quantity."
                  >
                    {brands.length > 1 ? (
                      <div className="mb-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                          Brand
                        </p>
                        <div
                          className="flex flex-wrap gap-2"
                          role="tablist"
                          aria-label="Filter by brand"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={brandFilter === "all"}
                            onClick={() => setBrandFilter("all")}
                            className={cn(
                              "inline-flex min-h-10 items-center rounded-[var(--radius-md)] border px-3.5 text-sm font-semibold transition-colors",
                              brandFilter === "all"
                                ? "border-ink bg-ink text-white"
                                : "border-border bg-white text-ink-soft hover:border-ink/40 hover:text-ink",
                            )}
                          >
                            All brands
                            <span className="ml-1.5 tabular-nums opacity-70">
                              {products.length}
                            </span>
                          </button>
                          {brands.map((b) => (
                            <button
                              key={b.name}
                              type="button"
                              role="tab"
                              aria-selected={brandFilter === b.name}
                              onClick={() => setBrandFilter(b.name)}
                              className={cn(
                                "inline-flex min-h-10 items-center rounded-[var(--radius-md)] border px-3.5 text-sm font-semibold transition-colors",
                                brandFilter === b.name
                                  ? "border-ink bg-ink text-white"
                                  : "border-border bg-white text-ink-soft hover:border-ink/40 hover:text-ink",
                              )}
                            >
                              {b.name}
                              <span className="ml-1.5 tabular-nums opacity-70">
                                {b.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {groups.length > 1 ? (
                      <div className="mb-7">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                          Style
                        </p>
                        <div
                          className="flex flex-wrap gap-2"
                          role="tablist"
                          aria-label="Blank collections"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={groupFilter === "all"}
                            onClick={() => setGroupFilter("all")}
                            className={cn(
                              "inline-flex min-h-10 items-center rounded-[var(--radius-md)] border px-3.5 text-sm font-semibold transition-colors",
                              groupFilter === "all"
                                ? "border-ink bg-ink text-white"
                                : "border-border bg-white text-ink-soft hover:border-ink/40 hover:text-ink",
                            )}
                          >
                            All
                            <span className="ml-1.5 tabular-nums opacity-70">
                              {products.length}
                            </span>
                          </button>
                          {groups.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              role="tab"
                              aria-selected={groupFilter === g.slug}
                              onClick={() => setGroupFilter(g.slug)}
                              className={cn(
                                "inline-flex min-h-10 items-center rounded-[var(--radius-md)] border px-3.5 text-sm font-semibold transition-colors",
                                groupFilter === g.slug
                                  ? "border-ink bg-ink text-white"
                                  : "border-border bg-white text-ink-soft hover:border-ink/40 hover:text-ink",
                              )}
                            >
                              {g.name}
                              <span className="ml-1.5 tabular-nums opacity-70">
                                {g.products.length}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-10">
                      {visibleGroups.map((g) => (
                        <section key={g.id} aria-labelledby={`blank-group-${g.slug}`}>
                          {groups.length > 1 ? (
                            <div className="mb-4">
                              <h2
                                id={`blank-group-${g.slug}`}
                                className="text-lg font-bold tracking-tight text-ink"
                              >
                                {g.name}
                              </h2>
                              {g.description ? (
                                <p className="mt-1 text-sm text-grey-olive">
                                  {g.description}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
                            {g.products.map((p) => {
                              const qtyInOrder = totalFor(cart[p.slug] || {});
                              return (
                                <HatCard
                                  key={p.id}
                                  product={p}
                                  compact
                                  selected={qtyInOrder > 0}
                                  orderQty={qtyInOrder}
                                  onSelect={() => openConfigure(p)}
                                />
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>

                    {products.length === 0 ? (
                      <p className="text-sm text-grey-olive">
                        No hats are available right now. Please check back soon.
                      </p>
                    ) : filteredProductCount === 0 ? (
                      <p className="rounded-[var(--radius-md)] border border-dashed border-border bg-white/70 px-4 py-8 text-center text-sm text-ink-soft">
                        No blanks match these filters.{" "}
                        <button
                          type="button"
                          className="font-semibold text-ink underline decoration-ink/25 underline-offset-2"
                          onClick={() => {
                            setBrandFilter("all");
                            setGroupFilter("all");
                          }}
                        >
                          Clear filters
                        </button>
                      </p>
                    ) : null}
                  </StepShell>
                )}

                {stepId === "art" && (
                  <StepShell
                    title="Upload your artwork"
                    subtitle="A logo file is perfect. PNG, JPG, SVG, PDF, AI, or EPS up to 8 MB. Signed-in customers can also reuse previous artwork."
                  >
                    {savedDesignNotice ? (
                      <div className="mb-5 rounded-[var(--radius-md)] border border-pastel-sky/60 bg-sky px-4 py-3 text-sm text-ink">
                        We loaded artwork from your account. Confirm it still
                        looks right — you can replace the file anytime.
                      </div>
                    ) : null}
                    {art ? (
                      <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-ink bg-white p-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-[#f6f2ea]">
                          {art.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={art.preview} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            <FileImage className="text-grey-olive" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{art.fileName}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink">
                            <CheckCircle2 size={14} />{" "}
                            {selectedPreviousId ? "From your account" : "Uploaded"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setArt(null);
                            setThreadPins([]);
                            setRights(false);
                            setSelectedPreviousId(null);
                            setSavedDesignNotice(false);
                          }}
                          aria-label="Remove artwork"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-grey-olive hover:bg-surface hover:text-ink"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragging(false);
                          void handleFile(e.dataTransfer.files?.[0]);
                        }}
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed bg-white px-6 py-12 text-center transition-colors",
                          dragging
                            ? "border-ink bg-ink-soft"
                            : "border-border hover:border-ink/70",
                          noArtYet && "opacity-50",
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="animate-spin text-ink" size={32} />
                        ) : (
                          <motion.span
                            animate={reduce ? undefined : { y: [0, -4, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <UploadCloud className="text-ink" size={34} />
                          </motion.span>
                        )}
                        <span className="text-sm font-semibold">
                          {uploading ? "Uploading..." : "Drop your file here, or tap to browse"}
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.ai,.eps,image/*,application/pdf"
                          disabled={uploading}
                          onChange={(e) => {
                            void handleFile(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}

                    {uploadError && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-red-700">
                        <AlertCircle size={16} /> {uploadError}
                      </p>
                    )}

                    {!authLoading && isAuthenticated ? (
                      <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border border-border bg-white">
                        <button
                          type="button"
                          aria-expanded={previousArtworkOpen}
                          onClick={() =>
                            setPreviousArtworkOpen((open) => !open)
                          }
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-canvas/60"
                        >
                          {(() => {
                            const selectedDesign = previousDesigns.find(
                              (d) => d.id === selectedPreviousId,
                            );
                            const selectedPreview =
                              selectedDesign?.previewImageUrl ||
                              selectedDesign?.artworkUrl;
                            return selectedPreview ? (
                              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-canvas">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={selectedPreview}
                                  alt=""
                                  className="h-full w-full object-contain p-0.5"
                                />
                              </span>
                            ) : (
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-canvas text-ink-soft">
                                <FileImage size={16} />
                              </span>
                            );
                          })()}
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-ink">
                                Use previous artwork
                              </span>
                              {!previousDesignsLoading &&
                              previousDesigns.length > 0 ? (
                                <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-soft ring-1 ring-border">
                                  {previousDesigns.length}
                                </span>
                              ) : null}
                              {selectedPreviousId ? (
                                <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">
                                  Selected
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-ink-soft">
                              {previousDesignsLoading
                                ? "Loading your saved files…"
                                : previousDesigns.length > 0
                                  ? "Reuse a logo from a past order"
                                  : "No saved artwork on this account yet"}
                            </span>
                          </span>
                          {previousDesignsLoading ? (
                            <Loader2
                              size={16}
                              className="shrink-0 animate-spin text-ink-soft"
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              className={cn(
                                "shrink-0 text-ink-soft transition-transform duration-200",
                                previousArtworkOpen && "rotate-180 text-ink",
                              )}
                            />
                          )}
                        </button>

                        <div
                          className={cn(
                            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            previousArtworkOpen
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]",
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-border px-4 pb-4 pt-3">
                              {previousDesigns.length > 0 ? (
                                <>
                                  <p className="mb-3 text-xs text-ink-soft">
                                    Tap a file to use it on this order.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {previousDesigns.map((design) => {
                                      const preview =
                                        design.previewImageUrl ||
                                        design.artworkUrl;
                                      const selected =
                                        selectedPreviousId === design.id;
                                      return (
                                        <button
                                          key={design.id}
                                          type="button"
                                          onClick={() => {
                                            selectPreviousDesign(design);
                                            setPreviousArtworkOpen(false);
                                          }}
                                          title={
                                            [
                                              design.method
                                                ? String(design.method).replace(
                                                    /-/g,
                                                    " ",
                                                  )
                                                : "Saved artwork",
                                              formatShortDate(design.lastUsedAt),
                                              design.productNames?.[0],
                                            ]
                                              .filter(Boolean)
                                              .join(" · ")
                                          }
                                          className={cn(
                                            "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white transition",
                                            selected
                                              ? "border-ink ring-1 ring-ink/20"
                                              : "border-border hover:border-ink/50",
                                          )}
                                        >
                                          {preview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={preview}
                                              alt=""
                                              className="h-full w-full object-contain p-1"
                                            />
                                          ) : (
                                            <div className="flex h-full items-center justify-center text-ink-soft">
                                              <FileImage size={14} />
                                            </div>
                                          )}
                                          {selected ? (
                                            <span className="absolute right-0.5 top-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ink text-white">
                                              <Check size={8} strokeWidth={3} />
                                            </span>
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : !previousDesignsLoading ? (
                                <p className="rounded-lg border border-dashed border-border bg-canvas/50 px-3 py-4 text-center text-xs text-ink-soft">
                                  Upload a file above — it will show up here next
                                  time.
                                </p>
                              ) : (
                                <p className="py-3 text-center text-xs text-ink-soft">
                                  Loading…
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : !authLoading ? (
                      <p className="mt-6 text-sm text-ink-soft">
                        Have artwork from a past order?{" "}
                        <Link
                          href="/account?tab=designs"
                          className="font-semibold text-pastel-link underline-offset-2 hover:underline"
                        >
                          Sign in
                        </Link>{" "}
                        to reuse it here.
                      </p>
                    ) : null}

                    {!art && (
                      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={noArtYet}
                          onChange={(e) => {
                            setNoArtYet(e.target.checked);
                            if (e.target.checked) {
                              setSelectedPreviousId(null);
                              setSavedDesignNotice(false);
                            }
                            setError("");
                          }}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-coral"
                        />
                        <span>
                          I do not have artwork yet. I will email it, or describe it below.
                        </span>
                      </label>
                    )}

                    <Field label="Notes for our team" htmlFor="art-notes" className="mt-8">
                      <textarea
                        id="art-notes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={cn(fieldClass, "resize-none")}
                        placeholder="Thread or ink colors, sizing, anything we should know."
                      />
                    </Field>

                    {art && (
                      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={rights}
                          onChange={(e) => {
                            setRights(e.target.checked);
                            setError("");
                          }}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-coral"
                        />
                        <span>
                          I confirm I own this artwork or have permission to use it on custom
                          hats.
                        </span>
                      </label>
                    )}
                  </StepShell>
                )}

                {stepId === "decoration" && product && (
                  <StepShell
                    title="Decoration"
                    subtitle="Pick a finish, stitch style, placements, and any color notes."
                  >
                    <DecorationStep
                      methods={productMethods}
                      methodId={activeMethod?.id || methodId}
                      onMethodChange={chooseMethod}
                      frontPlacement={frontPlacement}
                      onFrontPlacementChange={setFrontPlacement}
                      extraLocations={extraLocations}
                      onToggleExtraLocation={toggleExtraLocation}
                      extraLocationDetails={extraLocationDetails}
                      onExtraLocationDetailChange={updateExtraLocationDetail}
                      onUploadExtraLocationArt={uploadExtraLocationArt}
                      extraUploadingLoc={extraUploadingLoc}
                      embroideryStyle={embroideryStyle}
                      onEmbroideryStyleChange={setEmbroideryStyle}
                      preferredThreads={preferredThreads}
                      onToggleThread={toggleThread}
                      threadPins={threadPins}
                      onAddThreadPin={addThreadPin}
                      onRemoveThreadPin={removeThreadPin}
                      threadNotes={threadNotes}
                      onThreadNotesChange={setThreadNotes}
                      decorationNotes={decorationNotes}
                      onDecorationNotesChange={setDecorationNotes}
                      inkColors={inkColors}
                      onInkColorsChange={setInkColors}
                      totalQty={totalQty}
                      artworkPreview={art?.preview || art?.url}
                      artworkFileName={art?.fileName}
                    />
                  </StepShell>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Step actions */}
            <div className="mt-8">
              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2 rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-between gap-3">
                {step > 0 ? (
                  <ButtonNative
                    variant="outline"
                    size="lg"
                    arrow={false}
                    onClick={() => goTo(step - 1)}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </ButtonNative>
                ) : (
                  <Button href="/shop" variant="ghost" size="lg" arrow={false}>
                    Browse hats
                  </Button>
                )}
                <ButtonNative
                  variant="secondary"
                  size="lg"
                  onClick={next}
                  disabled={uploading || (step === 0 && totalQty <= 0)}
                >
                  {ctaLabel}
                </ButtonNative>
              </div>
            </div>
          </div>

          {/* Summary — shown after blanks are added */}
          {step > 0 ? (
            <aside
              className="lg:col-span-4 lg:self-start"
              aria-label="Order summary"
            >
              <div
                ref={summaryAnchorRef}
                className="relative w-full"
                style={
                  summaryPinned
                    ? { minHeight: summaryPin.height || undefined }
                    : undefined
                }
              >
              <div
                ref={summaryCardRef}
                className={cn(
                  "overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white p-5 shadow-sm",
                  summaryPinned && "z-30",
                )}
                style={
                  summaryPinned
                    ? {
                        position: "fixed",
                        top: summaryPin.top,
                        left: summaryPin.left,
                        width: summaryPin.width,
                        maxHeight: summaryPin.maxHeight,
                      }
                    : undefined
                }
              >
                <p className="text-sm font-bold tracking-tight text-ink">
                  Order summary
                </p>

                <ul className="mt-4 space-y-3">
                  {Object.entries(cart)
                    .filter(([, qtyMap]) => totalFor(qtyMap) > 0)
                    .map(([slug, qtyMap]) => {
                      const p = products.find((x) => x.slug === slug);
                      if (!p) return null;
                      const firstColor =
                        Object.entries(qtyMap).find(([, sizes]) =>
                          Object.values(sizes).some((n) => n > 0),
                        )?.[0] ||
                        p.showcaseColor ||
                        p.colors[0]?.name ||
                        "";
                      const n = totalFor(qtyMap);
                      return (
                        <li key={slug} className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white">
                            <HatVisual product={p} colorName={firstColor} thumb />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold leading-snug">
                              {p.name}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-grey-olive">
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-black/15"
                                style={{
                                  backgroundColor: hatHex(p, firstColor),
                                }}
                              />
                              {n} · {firstColor}
                              {Object.keys(qtyMap).filter((c) =>
                                Object.values(qtyMap[c] || {}).some((q) => q > 0),
                              ).length > 1
                                ? " +"
                                : ""}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <dl className="mt-5 divide-y divide-border border-t border-border text-sm">
                  <SummaryRow
                    label={totalQty ? `${totalQty} hats` : "Quantity"}
                    value={
                      activeMethod && pastArtwork
                        ? activeMethod.label
                        : "Not set"
                    }
                  />
                  {pastArtwork &&
                  activeMethod &&
                  normalizeMethodId(activeMethod.id).includes("embroidery") ? (
                    <SummaryRow
                      label="Style"
                      value={
                        embroideryStyle === "3d-puff" ? "3D puff" : "Flat"
                      }
                    />
                  ) : null}
                  {pastArtwork &&
                  activeMethod &&
                  normalizeMethodId(activeMethod.id).includes("embroidery") ? (
                    <SummaryRow
                      label="Placement"
                      value={
                        frontPlacements.find((p) => p.id === frontPlacement)
                          ?.name || "Center"
                      }
                    />
                  ) : null}
                  {pastArtwork && extraLocations.length > 0 ? (
                    <SummaryRow
                      label="Extras"
                      value={extraLocations.join(", ")}
                    />
                  ) : null}
                  <div className="flex items-start justify-between gap-3 py-3">
                    <span className="text-ink-soft">Logo</span>
                    {art ? (
                      <div className="flex max-w-[11rem] flex-col items-end gap-2">
                        <ArtworkThreadMap
                          previewUrl={art.preview || art.url}
                          fileName={art.fileName}
                          pins={threadPins}
                          activeThread={null}
                          onActiveThreadChange={() => {}}
                          onAddPin={() => {}}
                          onRemovePin={() => {}}
                          readOnly
                        />
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
                          <CheckCircle2 size={14} className="text-ink" />
                          {art.fileName.length > 22
                            ? `${art.fileName.slice(0, 20)}…`
                            : art.fileName}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium text-ink">
                        {noArtYet ? "Sending later" : "Not set"}
                      </span>
                    )}
                  </div>
                  {step > 0
                    ? orderExtras.map((line) => (
                        <SummaryRow
                          key={line.label}
                          label={line.label}
                          value={
                            <span
                              className={cn(
                                "tabular-nums",
                                line.amount > 0
                                  ? "font-semibold text-ink"
                                  : "font-medium text-ink",
                              )}
                            >
                              {line.value}
                            </span>
                          }
                        />
                      ))
                    : null}
                  {pastArtwork &&
                  (preferredThreads.length > 0 || threadPins.length > 0) ? (
                    <div className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-ink-soft">Threads</span>
                        <div className="flex max-w-[12rem] flex-wrap justify-end gap-1.5">
                          {(threadPins.length
                            ? [...new Set(threadPins.map((p) => p.threadName))]
                            : preferredThreads
                          ).map((name) => {
                            const hex =
                              threadPins.find((p) => p.threadName === name)
                                ?.hex ||
                              threadColors.find((c) => c.name === name)?.hex ||
                              "#64748b";
                            return (
                              <span
                                key={name}
                                className="inline-flex items-center gap-1 rounded-full border border-border bg-canvas/50 py-0.5 pl-1 pr-2 text-xs font-medium text-ink"
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: hex }}
                                />
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </dl>

                {estimateTotal != null && totalQty > 0 ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-bold text-ink">
                        Est. total
                      </span>
                      <span className="text-xl font-bold tabular-nums text-ink">
                        {money(estimateTotal)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-grey-olive">
                      Estimates only — shipping, expedite, and promo apply at
                      secure checkout.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-grey-olive">
                    Decoration and final pricing are confirmed with your mockup.
                  </p>
                )}
              </div>
              </div>
            </aside>
          ) : null}
        </div>
      </Container>

      {modalProduct && (
        <BlankConfigureModal
          product={modalProduct}
          initialQty={cart[modalProduct.slug]}
          methodId={activeMethod?.id || methodId}
          open={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
          onAdd={(qtyMap) => addBlankToOrder(modalProduct, qtyMap)}
        />
      )}

      <OrderFloatingBar
        qty={totalQty}
        methodId={activeMethod?.id || methodId}
        hatsSubtotal={hatsEstimate}
        ctaLabel={ctaLabel}
        onContinue={next}
        disabled={uploading || (step === 0 && totalQty <= 0)}
      />

      <AddToCartModal
        open={atcOpen}
        item={atcItem}
        onClose={() => setAtcOpen(false)}
      />
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-grey-olive md:text-base">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-grey-olive">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
  return (
    <div className="inline-flex items-center rounded-[var(--radius-md)] border border-border bg-white">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(clamp(value - 1))}
        className="inline-flex h-11 w-11 items-center justify-center text-grey-olive hover:text-ink"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value || (min === 0 ? "" : min)}
        placeholder="0"
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
        className="h-11 w-14 border-x border-border bg-transparent text-center text-sm font-semibold tabular-nums outline-none focus:bg-canvas/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(clamp(value + 1))}
        className="inline-flex h-11 w-11 items-center justify-center text-grey-olive hover:text-ink"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

