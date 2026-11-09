import type { CartItem } from "@/lib/cart";
import { newCartItemId } from "@/lib/cart";
import type { CustomerDesign, CustomerOrder, CustomerOrderItem } from "@/lib/customerApi";
import type { ExtraLocationDetail, FrontPlacementId, EmbroideryStyleId, ThreadArtPin } from "@/data/decorationOptions";

export const DESIGN_REUSE_KEY = "poc-design-reuse";
export const ORDER_REUSE_KEY = "poc-order-reuse";

export type DesignReusePayload = {
  artworkUrl?: string;
  notes?: string;
  hasArtwork: boolean;
  fileName?: string;
  method?: string;
  locations?: string[];
};

/** Preload for /order — specs only, never past prices or promo codes. */
export type OrderReusePayload = {
  /** productSlug → color → size → qty */
  cart: Record<string, Record<string, Record<string, number>>>;
  hatSlug?: string;
  method?: string;
  frontPlacement?: FrontPlacementId;
  extraLocations?: string[];
  extraLocationDetails?: Record<string, ExtraLocationDetail>;
  embroideryStyle?: EmbroideryStyleId;
  preferredThreads?: string[];
  threadPins?: ThreadArtPin[];
  threadNotes?: string;
  decorationNotes?: string;
  inkColors?: number;
  artworkUrl?: string;
  artworkFileName?: string;
  designNotes?: string;
  hasArtwork?: boolean;
  /** Land on the last wizard step (decoration). */
  jumpToEnd?: boolean;
  sourceOrderId?: string;
};

function itemQty(item: CustomerOrderItem) {
  return (item.variants || []).reduce(
    (sum, variant) =>
      sum + (variant.sizes || []).reduce((s, line) => s + (line.qty || 0), 0),
    0,
  );
}

function methodIdFrom(method?: string) {
  const raw = String(method || "embroidery")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  if (raw.includes("leather")) return "leather-patch";
  if (raw.includes("pvc")) return "pvc-patch";
  if (raw.includes("screen")) return "screenprint";
  if (raw.includes("embroider")) return "embroidery";
  return raw || "embroidery";
}

function orderLines(order: CustomerOrder): CustomerOrderItem[] {
  if (Array.isArray(order.items) && order.items.length) return order.items;
  if (order.productName || order.decoration || order.design) {
    return [
      {
        productId: undefined,
        productName: order.productName,
        productSlug: order.productSlug,
        imageUrl: order.imageUrl,
        decoration: order.decoration,
        design: order.design,
        variants: [],
      },
    ];
  }
  return [];
}

/** Map a past order into cart drafts the customer can confirm before checkout. */
export function orderToCartDrafts(order: CustomerOrder): Omit<
  CartItem,
  "id" | "addedAt"
>[] {
  return orderLines(order)
    .map((line) => {
      const qty = itemQty(line) || 1;
      const method = line.decoration?.method || "embroidery";
      const title =
        line.productName ||
        order.productName ||
        "Custom embroidered hats";
      return {
        title,
        blanks: [
          {
            productId: line.productId || "unknown",
            productName: line.productName || title,
            productSlug: line.productSlug || "",
            imageUrl: line.imageUrl || order.imageUrl,
            variants: (line.variants || []).map((v) => ({
              color: {
                name: v.color?.name || "Color",
                hex: v.color?.hex,
              },
              sizes: (v.sizes || [])
                .filter((s) => (s.qty || 0) > 0)
                .map((s) => ({ size: s.size, qty: s.qty })),
            })),
          },
        ],
        decoration: {
          methodId: methodIdFrom(method),
          method,
          locations: line.decoration?.locations || [],
          frontPlacement: line.decoration?.frontPlacement,
          extraLocations: line.decoration?.extraLocations,
          colors: line.decoration?.colors,
          embroideryStyle: line.decoration?.embroideryStyle,
          preferredThreads: line.decoration?.preferredThreads,
          threadPins: line.decoration?.threadPins,
          threadNotes: line.decoration?.threadNotes,
          notes: line.decoration?.notes,
        },
        design: {
          hasArtwork: Boolean(
            line.design?.hasArtwork || line.design?.artworkUrl,
          ),
          notes: line.design?.notes,
          artworkUrl: line.design?.artworkUrl,
          artworkPreview: line.design?.artworkUrl,
          artworkFileName: line.design?.artworkUrl
            ? "Previous artwork"
            : undefined,
        },
        totalQty: qty,
        merchandiseEstimate: 0,
      };
    })
    .filter((draft) => draft.blanks[0]?.productId !== "unknown" || draft.totalQty > 0);
}

export function materializeCartItems(
  drafts: Omit<CartItem, "id" | "addedAt">[],
): CartItem[] {
  const now = new Date().toISOString();
  return drafts.map((draft) => ({
    ...draft,
    id: newCartItemId(),
    addedAt: now,
  }));
}

export function saveDesignReuse(payload: DesignReusePayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DESIGN_REUSE_KEY, JSON.stringify(payload));
}

export function readDesignReuse(): DesignReusePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DESIGN_REUSE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DesignReusePayload;
  } catch {
    return null;
  }
}

export function clearDesignReuse() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DESIGN_REUSE_KEY);
}

export function designToReusePayload(design: CustomerDesign): DesignReusePayload {
  return {
    artworkUrl: design.artworkUrl || undefined,
    notes: design.notes || undefined,
    hasArtwork: Boolean(design.hasArtwork || design.artworkUrl),
    fileName: design.artworkUrl ? "Saved artwork" : undefined,
    method: design.method || undefined,
    locations: design.locations || [],
  };
}

function frontPlacementFrom(raw?: string): FrontPlacementId | undefined {
  const s = String(raw || "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("left")) return "left-eye";
  if (s.includes("right")) return "right-eye";
  if (s.includes("center") || s.includes("front")) return "center";
  if (s === "left-eye" || s === "right-eye" || s === "center") {
    return s as FrontPlacementId;
  }
  return undefined;
}

function embroideryStyleFrom(raw?: string): EmbroideryStyleId | undefined {
  const s = String(raw || "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("puff") || s.includes("3d")) return "3d-puff";
  if (s.includes("flat") || s.includes("standard")) return "flat";
  return undefined;
}

/**
 * Map a past order into wizard preload state.
 * Intentionally omits paid totals, shipping, and any promo/discount.
 */
export function orderToReusePayload(order: CustomerOrder): OrderReusePayload | null {
  const lines = orderLines(order);
  if (!lines.length) return null;

  const cart: OrderReusePayload["cart"] = {};
  let hatSlug: string | undefined;

  for (const line of lines) {
    const slug = String(line.productSlug || "").trim();
    if (!slug) continue;
    const qtyMap: Record<string, Record<string, number>> = {};
    for (const variant of line.variants || []) {
      const color = String(variant.color?.name || "").trim() || "Color";
      const sizes: Record<string, number> = {};
      for (const sizeLine of variant.sizes || []) {
        if ((sizeLine.qty || 0) > 0) {
          sizes[sizeLine.size || "OSFA"] = sizeLine.qty;
        }
      }
      if (Object.keys(sizes).length) qtyMap[color] = sizes;
    }
    if (!Object.keys(qtyMap).length) continue;
    cart[slug] = qtyMap;
    if (!hatSlug) hatSlug = slug;
  }

  if (!Object.keys(cart).length) return null;

  const primary =
    lines.find((l) => l.productSlug && cart[l.productSlug || ""]) || lines[0];
  const decoration = primary.decoration || order.decoration;
  const design = primary.design || order.design;
  const extras = (decoration?.extraLocations || []).filter((e) => e?.location);
  const extraLocations = extras.map((e) => e.location);
  const extraLocationDetails: Record<string, ExtraLocationDetail> = {};
  for (const e of extras) {
    extraLocationDetails[e.location] = {
      artworkUrl: e.artworkUrl,
      notes: e.notes,
      fileName: e.artworkUrl ? "Previous artwork" : undefined,
    };
  }

  const locationLabels = decoration?.locations || [];
  const optionalFromLabels = locationLabels.filter(
    (loc) =>
      /back|side/i.test(loc) &&
      !extraLocations.includes(loc),
  );

  return {
    cart,
    hatSlug,
    method: decoration?.method || undefined,
    frontPlacement:
      frontPlacementFrom(decoration?.frontPlacement) ||
      frontPlacementFrom(locationLabels.find((l) => /front|center|eye/i.test(l))),
    extraLocations: [...extraLocations, ...optionalFromLabels],
    extraLocationDetails,
    embroideryStyle: embroideryStyleFrom(decoration?.embroideryStyle),
    preferredThreads: decoration?.preferredThreads || undefined,
    threadPins: (decoration?.threadPins || []).map((p, i) => ({
      id: `reorder-pin-${i}`,
      threadName: p.threadName,
      hex: p.hex,
      x: p.x,
      y: p.y,
    })),
    threadNotes: decoration?.threadNotes || undefined,
    decorationNotes: decoration?.notes || undefined,
    inkColors: decoration?.colors || undefined,
    artworkUrl: design?.artworkUrl || undefined,
    artworkFileName: design?.artworkUrl ? "Previous artwork" : undefined,
    designNotes: design?.notes || undefined,
    hasArtwork: Boolean(design?.hasArtwork || design?.artworkUrl),
    jumpToEnd: true,
    sourceOrderId: order.id,
  };
}

export function saveOrderReuse(payload: OrderReusePayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ORDER_REUSE_KEY, JSON.stringify(payload));
}

export function readOrderReuse(): OrderReusePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ORDER_REUSE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderReusePayload;
  } catch {
    return null;
  }
}

export function clearOrderReuse() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ORDER_REUSE_KEY);
}

/** Customer-facing order status labels (paid flow only). */
export function formatOrderStatus(status?: string) {
  const key = String(status || "").toLowerCase().replace(/\s+/g, "_");
  const labels: Record<string, string> = {
    payment_authorized: "Confirmed",
    paid: "Paid",
    reviewing: "In review",
    awaiting_approval: "Proof sent",
    proof_sent: "Proof sent",
    produced: "Produced",
    changes_requested: "Changes requested",
    scheduled: "Scheduled",
    quoted: "Quote ready",
    approved: "Approved",
    in_production: "In production",
    shipped: "Shipped",
    completed: "Completed",
    refunded: "Refunded",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };
  if (labels[key]) return labels[key];
  const s = key.replace(/_/g, " ").trim();
  if (!s) return "Confirmed";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Orders the customer should see — excludes unpaid checkout drafts. */
export function isCustomerVisibleOrder(status?: string) {
  const key = String(status || "").toLowerCase();
  return ![
    "pending_payment",
    "new",
    "payment_failed",
  ].includes(key);
}

export function formatMoney(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
