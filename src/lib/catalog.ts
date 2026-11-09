export type ProductColor = {
  name: string;
  hex?: string;
  imageUrl?: string;
  /** Optional alternate angles from S&S (side / back). */
  sideImageUrl?: string;
  backImageUrl?: string;
  swatchUrl?: string;
};

export type ProductPriceBreak = {
  qty: number;
  price: number;
};

export type ProductPricing = {
  displayMode: "from" | "range" | "fixed" | "hidden";
  currency: string;
  basePrice?: number;
  /** S&S / supplier blank cost before decoration. */
  supplierPrice?: number;
  markupPercent?: number;
  priceNote?: string;
  /** All-in hat + decoration unit prices by minimum qty. */
  priceBreaks?: ProductPriceBreak[];
  decoration?: {
    screenprintFrom?: number;
    embroideryFrom?: number;
  };
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  imageThumbUrl?: string;
  gallery?: string[];
  galleryThumbs?: string[];
  colors: ProductColor[];
  sizes: string[];
  showcaseColor?: string;
  decorationOptions: string[];
  /** methodId → allowed locations for this product */
  decorationLocations?: Record<string, string[]>;
  pricing: ProductPricing;
  source: "manual" | "ss";
  published?: boolean;
  featured?: boolean;
  /** Hat style, e.g. "trucker", "snapback", "fitted", "beanie". */
  type?: string;
  tags?: string[];
};

export type OrderRequestPayload = {
  /** Multi-product cart format (preferred). */
  items?: Array<{
    productId: string;
    productName?: string;
    productSlug?: string;
    imageUrl?: string;
    variants: Array<{
      color: { name: string; hex?: string };
      sizes: Array<{ size: string; qty: number }>;
    }>;
    decoration: {
      method: string;
      locations?: string[];
      frontPlacement?: string;
      extraLocations?: Array<{
        location: string;
        artworkUrl?: string;
        notes?: string;
      }>;
      colors?: number;
      embroideryStyle?: string;
      preferredThreads?: string[];
      threadPins?: Array<{
        threadName: string;
        hex: string;
        x: number;
        y: number;
      }>;
      threadNotes?: string;
      notes?: string;
    };
    design: {
      hasArtwork: boolean;
      notes?: string;
      artworkUrl?: string;
    };
  }>;
  /** Legacy single-product fields (optional when `items` is set). */
  productId?: string;
  productName?: string;
  productSlug?: string;
  delivery: {
    speed: string;
    needByDate?: string;
    notes?: string;
  };
  shipping?: {
    id?: string;
    label?: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    formatted?: string | null;
  } | null;
  color?: {
    name: string;
    hex?: string;
  };
  decoration?: {
    method: string;
    locations?: string[];
    frontPlacement?: string;
    extraLocations?: Array<{
      location: string;
      artworkUrl?: string;
      notes?: string;
    }>;
    colors?: number;
    embroideryStyle?: string;
    preferredThreads?: string[];
    threadPins?: Array<{
      threadName: string;
      hex: string;
      x: number;
      y: number;
    }>;
    threadNotes?: string;
    notes?: string;
  };
  design?: {
    hasArtwork: boolean;
    notes?: string;
    artworkUrl?: string;
  };
  sizes?: Array<{ size: string; qty: number }>;
  contact: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  estimatedTotal?: number;
  specialInstructions?: string;
  promo?: {
    code: string;
    label?: string;
    type?: string;
    amount?: number;
  };
  totals?: {
    merchandise?: number;
    expedite?: number;
    shipping?: number;
    discount?: number;
    total?: number;
  };
};

const HAT_DECORATION_LOCATIONS: Record<string, string[]> = {
  embroidery: ["Front panel", "Left side", "Right side", "Back"],
  "leather-patch": ["Front panel"],
  "pvc-patch": ["Front panel"],
  screenprint: ["Front panel", "Back"],
};

/** Locations hidden from the order UI (front is assumed; cuff not offered). */
export function isOrderPlacementOption(loc: string): boolean {
  return !/^(front panel|front cuff|above cuff)$/i.test(String(loc).trim());
}

const HAT_COLORS: ProductColor[] = [
  { name: "Black", hex: "#111111" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Khaki", hex: "#c3b091" },
  { name: "White", hex: "#ffffff" },
];

/** Shown only when the catalog API is unreachable, so pages still render. */
const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: "fallback-trucker",
    slug: "classic-trucker",
    name: "Classic Trucker",
    brand: "Richardson",
    description:
      "Mesh-back trucker — ready for embroidery, patches, or screen print. Final pricing confirmed after we review your request.",
    category: "Hats",
    type: "trucker",
    colors: HAT_COLORS,
    sizes: ["OSFA"],
    decorationOptions: ["embroidery", "leather-patch", "pvc-patch", "screenprint"],
    decorationLocations: HAT_DECORATION_LOCATIONS,
    pricing: {
      displayMode: "from",
      currency: "USD",
      basePrice: 13,
      priceBreaks: [
        { qty: 1, price: 26 },
        { qty: 12, price: 22 },
        { qty: 24, price: 20 },
        { qty: 48, price: 19 },
        { qty: 96, price: 18 },
        { qty: 144, price: 17 },
        { qty: 288, price: 15 },
        { qty: 432, price: 13 },
      ],
      priceNote: "Volume pricing — final quote after mockup",
    },
    source: "manual",
    published: true,
    featured: true,
  },
  {
    id: "fallback-snapback",
    slug: "flat-brim-snapback",
    name: "Flat Brim Snapback",
    brand: "Yupoong",
    description:
      "Structured flat-brim snapback. Embroidery, patches, and print all work well here.",
    category: "Hats",
    type: "snapback",
    colors: HAT_COLORS,
    sizes: ["OSFA"],
    decorationOptions: ["embroidery", "leather-patch", "pvc-patch", "screenprint"],
    decorationLocations: HAT_DECORATION_LOCATIONS,
    pricing: {
      displayMode: "from",
      currency: "USD",
      basePrice: 13,
      priceBreaks: [
        { qty: 1, price: 26 },
        { qty: 12, price: 22 },
        { qty: 24, price: 20 },
        { qty: 48, price: 19 },
        { qty: 96, price: 18 },
        { qty: 144, price: 17 },
        { qty: 288, price: 15 },
        { qty: 432, price: 13 },
      ],
      priceNote: "Volume pricing — final quote after mockup",
    },
    source: "manual",
    published: true,
    featured: true,
  },
  {
    id: "fallback-fitted",
    slug: "stretch-fit-cap",
    name: "Stretch Fit Cap",
    brand: "Flexfit",
    description: "Comfortable stretch-fit cap in S/M and L/XL.",
    category: "Hats",
    type: "fitted",
    colors: HAT_COLORS,
    sizes: ["S/M", "L/XL"],
    decorationOptions: ["embroidery", "leather-patch", "pvc-patch", "screenprint"],
    decorationLocations: HAT_DECORATION_LOCATIONS,
    pricing: {
      displayMode: "from",
      currency: "USD",
      basePrice: 13,
      priceBreaks: [
        { qty: 1, price: 26 },
        { qty: 12, price: 22 },
        { qty: 24, price: 20 },
        { qty: 48, price: 19 },
        { qty: 96, price: 18 },
        { qty: 144, price: 17 },
        { qty: 288, price: 15 },
        { qty: 432, price: 13 },
      ],
      priceNote: "Volume pricing — final quote after mockup",
    },
    source: "manual",
    published: true,
    featured: true,
  },
  {
    id: "fallback-beanie",
    slug: "cuffed-beanie",
    name: "Cuffed Beanie",
    brand: "Sportsman",
    description: "Classic cuffed knit beanie — embroidery or patch on the cuff.",
    category: "Hats",
    type: "beanie",
    colors: HAT_COLORS.slice(0, 4),
    sizes: ["OSFA"],
    decorationOptions: ["embroidery", "leather-patch", "pvc-patch", "screenprint"],
    decorationLocations: {
      embroidery: ["Front panel"],
      "leather-patch": ["Front panel"],
      "pvc-patch": ["Front panel"],
      screenprint: ["Front panel"],
    },
    pricing: {
      displayMode: "from",
      currency: "USD",
      basePrice: 13,
      priceBreaks: [
        { qty: 1, price: 26 },
        { qty: 12, price: 22 },
        { qty: 24, price: 20 },
        { qty: 48, price: 19 },
        { qty: 96, price: 18 },
        { qty: 144, price: 17 },
        { qty: 288, price: 15 },
        { qty: 432, price: 13 },
      ],
      priceNote: "Volume pricing — final quote after mockup",
    },
    source: "manual",
    published: true,
    featured: false,
  },
];

function catalogBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:4001"
  ).replace(/\/$/, "");
}

export type DecorationMethod = {
  id: string;
  label: string;
  askInkColors?: boolean;
  locations: string[];
};

const FALLBACK_DECORATION_METHODS: DecorationMethod[] = [
  {
    id: "embroidery",
    label: "Embroidery",
    askInkColors: false,
    locations: ["Front panel", "Left side", "Right side", "Back"],
  },
  {
    id: "leather-patch",
    label: "Leather Patch",
    askInkColors: false,
    locations: ["Front panel"],
  },
  {
    id: "pvc-patch",
    label: "PVC Patch",
    askInkColors: false,
    locations: ["Front panel"],
  },
  {
    id: "screenprint",
    label: "Screen Print",
    askInkColors: true,
    locations: ["Front panel", "Back"],
  },
];

/** Backend products use `leather_patch`, settings use `leather-patch` — compare normalized. */
export function normalizeMethodId(id: string): string {
  return id.trim().toLowerCase().replace(/_/g, "-");
}

/** Default location sets when a product omits a method’s locations. */
const DEFAULT_METHOD_LOCATIONS: Record<string, string[]> = {
  embroidery: ["Front panel", "Left side", "Right side", "Back"],
  "leather-patch": ["Front panel"],
  "pvc-patch": ["Front panel"],
  screenprint: ["Front panel", "Back"],
};

/**
 * Decoration methods available for a hat on the storefront.
 * Always offers the full site decoration catalog (embroidery, leather,
 * PVC, screen print) so legacy product option lists can’t hide finishes.
 * Product-specific locations still win when present.
 */
export function resolveProductDecoration(
  product: CatalogProduct,
  catalog: DecorationMethod[],
): DecorationMethod[] {
  const source = catalog.length ? catalog : FALLBACK_DECORATION_METHODS;

  const productLocs = new Map<string, string[]>();
  for (const [key, locs] of Object.entries(product.decorationLocations || {})) {
    productLocs.set(normalizeMethodId(key), locs);
  }

  return source
    .map((m) => {
      const id = normalizeMethodId(m.id);
      const locs = productLocs.get(id);
      const fallback =
        DEFAULT_METHOD_LOCATIONS[id] ||
        HAT_DECORATION_LOCATIONS[id] ||
        m.locations;
      const raw = locs?.length ? locs : fallback;
      return {
        ...m,
        // Drop cuff options from the order flow; front stays for payload defaults.
        locations: raw.filter(
          (loc) => !/^(front cuff|above cuff)$/i.test(String(loc).trim()),
        ),
      };
    })
    .filter((m) => m.locations.length > 0);
}

export async function fetchDecorationMethods(): Promise<DecorationMethod[]> {
  try {
    const res = await fetch(`${catalogBaseUrl()}/api/settings/decoration`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Decoration API ${res.status}`);
    const data = (await res.json()) as { decorationMethods?: DecorationMethod[] };
    if (data.decorationMethods?.length) return data.decorationMethods;
  } catch {
    // fall through
  }
  return FALLBACK_DECORATION_METHODS;
}

export type CatalogCollection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  pageDescription?: string;
};

/** Style collections shown as sections in the order blank picker. */
export const ORDER_BLANK_COLLECTION_SLUGS = [
  "truckers",
  "fitted",
  "snapbacks",
  "beanies",
  "dad-caps",
] as const;

export type OrderBlankGroup = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  products: CatalogProduct[];
};

export async function fetchCollectionBySlug(
  slug: string,
): Promise<{ collection: CatalogCollection; products: CatalogProduct[] } | null> {
  try {
    const res = await fetch(
      `${catalogBaseUrl()}/api/collections/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      collection: CatalogCollection;
      products: CatalogProduct[];
    };
    return {
      collection: data.collection,
      products: data.products || [],
    };
  } catch {
    return null;
  }
}

/**
 * Load curated style groups for the order blank picker.
 * Products appear once (first matching collection wins); leftovers go in "More".
 */
export async function fetchOrderBlankGroups(
  allProducts: CatalogProduct[],
): Promise<OrderBlankGroup[]> {
  const results = await Promise.all(
    ORDER_BLANK_COLLECTION_SLUGS.map((slug) => fetchCollectionBySlug(slug)),
  );

  const seen = new Set<string>();
  const groups: OrderBlankGroup[] = [];

  for (const result of results) {
    if (!result?.collection) continue;
    const products = (result.products || []).filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    if (!products.length) continue;
    groups.push({
      id: result.collection.id,
      slug: result.collection.slug,
      name: result.collection.name,
      description: result.collection.description,
      products,
    });
  }

  const leftovers = allProducts.filter((p) => !seen.has(p.id));
  if (leftovers.length) {
    groups.push({
      id: "more",
      slug: "more",
      name: "More blanks",
      description: "Additional styles not in a collection yet.",
      products: leftovers,
    });
  }

  return groups;
}

export function formatDisplayPrice(product: CatalogProduct): string {
  const parts = formatPriceParts(product);
  if (parts.kind === "quote") return "Request quote";
  if (parts.kind === "fixed") return parts.amount;
  return `From ${parts.amount}`;
}

export function formatPriceParts(product: CatalogProduct): {
  kind: "quote" | "fixed" | "from";
  amount: string;
  label: string;
} {
  const { pricing } = product;
  if (!pricing || pricing.displayMode === "hidden") {
    return { kind: "quote", amount: "", label: "Request quote" };
  }

  // Prefer cheapest volume break so cards show the best available rate.
  let value: number | null = null;
  if (Array.isArray(pricing.priceBreaks) && pricing.priceBreaks.length) {
    const prices = pricing.priceBreaks
      .map((b) => Number(b.price))
      .filter((n) => Number.isFinite(n) && n >= 0);
    if (prices.length) value = Math.min(...prices);
  }
  // Default embroidery schedule lowest tier when product has no breaks yet.
  if (value == null && pricing.displayMode === "from") {
    value = 13;
  }
  if (value == null && pricing.basePrice != null) {
    value = pricing.basePrice;
  }
  if (value == null) {
    return { kind: "quote", amount: "", label: "Request quote" };
  }

  const amount = value.toLocaleString("en-US", {
    style: "currency",
    currency: pricing.currency || "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  if (pricing.displayMode === "fixed") {
    return { kind: "fixed", amount, label: amount };
  }
  return { kind: "from", amount, label: `From ${amount}` };
}

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(
      `${catalogBaseUrl()}/api/products?published=true`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`Catalog API ${res.status}`);
    const data = (await res.json()) as { products: CatalogProduct[] };
    if (!data.products?.length) return FALLBACK_PRODUCTS;
    return data.products;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchCatalogProduct(
  slug: string,
): Promise<CatalogProduct | null> {
  try {
    const res = await fetch(
      `${catalogBaseUrl()}/api/products/${encodeURIComponent(slug)}?published=true`,
      { next: { revalidate: 30 } },
    );
    if (res.ok) {
      const data = (await res.json()) as { product: CatalogProduct };
      return data.product;
    }
  } catch {
    // fall through to local seed
  }
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export type HomepageCollection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productsPerRow?: number;
  rows?: number;
} | null;

/** Products for the homepage featured row (admin-selected collection). */
export async function fetchHomepageProducts(): Promise<{
  collection: HomepageCollection;
  products: CatalogProduct[];
  productsPerRow: number;
  rows: number;
}> {
  try {
    const res = await fetch(`${catalogBaseUrl()}/api/collections/homepage`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`Homepage API ${res.status}`);
    const data = (await res.json()) as {
      collection: HomepageCollection;
      products: CatalogProduct[];
      productsPerRow?: number;
      rows?: number;
    };
    if (data.products?.length) {
      const productsPerRow =
        data.productsPerRow ||
        data.collection?.productsPerRow ||
        4;
      const rows = data.rows || data.collection?.rows || 2;
      return {
        collection: data.collection || null,
        products: data.products,
        productsPerRow,
        rows,
      };
    }
  } catch {
    // fall through
  }

  const featured = FALLBACK_PRODUCTS.filter((p) => p.featured);
  return {
    collection: null,
    products: featured.length ? featured : FALLBACK_PRODUCTS.slice(0, 8),
    productsPerRow: 4,
    rows: 2,
  };
}

export async function submitOrderRequest(
  payload: OrderRequestPayload,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  orderRequest?: { id: string; status?: string; estimatedTotal?: number };
}> {
  const res = await fetch(`${catalogBaseUrl()}/api/order-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      error:
        typeof data.error === "string"
          ? data.error
          : "Could not submit request. Please try again or contact us.",
    };
  }
  return {
    success: true,
    message: data.message,
    orderRequest: data.orderRequest,
  };
}

export async function validateDiscountCode(
  code: string,
  merchandise: number,
): Promise<
  | { ok: true; code: string; label: string; type?: string; amount: number }
  | { ok: false; error: string }
> {
  try {
    const res = await fetch(`${catalogBaseUrl()}/api/discounts/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, merchandise }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error:
          typeof data.error === "string"
            ? data.error
            : "That code isn’t valid.",
      };
    }
    return {
      ok: true,
      code: data.code,
      label: data.label || data.code,
      type: data.type,
      amount: Number(data.amount) || 0,
    };
  } catch {
    return { ok: false, error: "Could not validate that code right now." };
  }
}

export async function createStripePaymentIntent(input: {
  orderRequestId: string;
  amount?: number;
}): Promise<{
  ok: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}> {
  try {
    const res = await fetch(
      `${catalogBaseUrl()}/api/stripe/create-payment-intent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error:
          typeof data.error === "string"
            ? data.error
            : "Could not start payment.",
      };
    }
    return {
      ok: true,
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch {
    return { ok: false, error: "Could not reach payment server." };
  }
}

export async function confirmStripeOrder(input: {
  orderRequestId: string;
  paymentIntentId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${catalogBaseUrl()}/api/stripe/confirm-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error:
          typeof data.error === "string"
            ? data.error
            : "Could not confirm payment.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not confirm payment." };
  }
}

export function stripePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export async function uploadArtworkFile(file: File): Promise<{
  ok: boolean;
  url?: string;
  thumbUrl?: string | null;
  fileName?: string;
  error?: string;
}> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const fileBase64 = btoa(binary);

    const res = await fetch(`${catalogBaseUrl()}/api/uploads/artwork`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileBase64,
        contentType: file.type || "application/octet-stream",
        fileName: file.name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error:
          typeof data.error === "string"
            ? data.error
            : "Could not upload artwork",
      };
    }
    return {
      ok: true,
      url: data.asset?.url,
      thumbUrl: data.asset?.thumbUrl,
      fileName: data.asset?.fileName || file.name,
    };
  } catch {
    return { ok: false, error: "Could not upload artwork" };
  }
}
