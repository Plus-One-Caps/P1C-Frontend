/** Client cart for configured custom-hat builds (localStorage). */

export type CartBlankVariant = {
  color: { name: string; hex?: string };
  sizes: Array<{ size: string; qty: number }>;
};

export type CartBlank = {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  variants: CartBlankVariant[];
};

export type CartDecoration = {
  methodId: string;
  method: string;
  locations: string[];
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

export type CartDesign = {
  hasArtwork: boolean;
  notes?: string;
  artworkUrl?: string;
  artworkFileName?: string;
  /** May be a blob URL — useful for UI only; order submit uses artworkUrl. */
  artworkPreview?: string;
  /** True when art was reused from a past order/design — setup fees waived. */
  reusedArtwork?: boolean;
};

export type CartItem = {
  id: string;
  addedAt: string;
  title: string;
  blanks: CartBlank[];
  decoration: CartDecoration;
  design: CartDesign;
  totalQty: number;
  merchandiseEstimate: number;
};

export type CartState = {
  items: CartItem[];
};

export const CART_STORAGE_KEY = "plus-one-caps-cart-v1";

export function emptyCart(): CartState {
  return { items: [] };
}

export function readCart(): CartState {
  if (typeof window === "undefined") return emptyCart();
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return { items: parsed.items.filter(Boolean) };
  } catch {
    return emptyCart();
  }
}

export function writeCart(state: CartState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("poc-cart-change"));
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.totalQty || 0), 0);
}

export function cartMerchandiseTotal(items: CartItem[]) {
  return Math.round(
    items.reduce((sum, item) => sum + (item.merchandiseEstimate || 0), 0) * 100,
  ) / 100;
}

export function newCartItemId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
