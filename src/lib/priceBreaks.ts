import {
  pricingByMethod,
  type PricingMethodId,
} from "@/data/site";
import type { CatalogProduct, ProductPricing } from "@/lib/catalog";

export type PriceBreak = { qty: number; price: number };

/** Default all-in hat + embroidery schedule (matches HatLaunch / order UI). */
export const DEFAULT_EMBROIDERY_BREAKS: PriceBreak[] = [
  { qty: 1, price: 26 },
  { qty: 12, price: 22 },
  { qty: 24, price: 20 },
  { qty: 48, price: 19 },
  { qty: 96, price: 18 },
  { qty: 144, price: 17 },
  { qty: 288, price: 15 },
  { qty: 432, price: 13 },
];

export function normalizePricingMethod(id?: string): PricingMethodId {
  const n = (id || "embroidery").toLowerCase().replace(/_/g, "-");
  if (
    n === "leather-patch" ||
    n === "pvc-patch" ||
    n === "embroidery" ||
    n === "screenprint" ||
    n === "screen-print"
  ) {
    return n === "screen-print" ? "screenprint" : n;
  }
  return "embroidery";
}

function methodTableBreaks(method: PricingMethodId): PriceBreak[] {
  return (pricingByMethod[method] || pricingByMethod.embroidery)
    .filter((b) => b.price != null)
    .map((b) => ({
      qty: Number.parseInt(b.qty, 10) || 1,
      price: b.price as number,
    }))
    .filter((b) => Number.isFinite(b.qty) && Number.isFinite(b.price))
    .sort((a, b) => a.qty - b.qty);
}

/** Normalize admin / API break rows into sorted qty/price pairs. */
export function normalizePriceBreaks(
  raw?: Array<{ qty?: number | string; price?: number | string | null }> | null,
): PriceBreak[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw
    .map((row) => ({
      qty: Number(row.qty),
      price: Number(row.price),
    }))
    .filter(
      (b) =>
        Number.isFinite(b.qty) &&
        b.qty > 0 &&
        Number.isFinite(b.price) &&
        b.price >= 0,
    )
    .sort((a, b) => a.qty - b.qty);
}

/**
 * Resolve the qty table for a product + decoration method.
 * Product-level breaks override the embroidery/screen-print schedule;
 * leather/PVC keep method tables unless the product also defines those later.
 */
export function resolvePriceBreaks(
  pricing?: ProductPricing | null,
  methodId?: string,
): PriceBreak[] {
  const method = normalizePricingMethod(methodId);
  const productBreaks = normalizePriceBreaks(pricing?.priceBreaks);
  if (method === "embroidery" || method === "screenprint") {
    return productBreaks.length ? productBreaks : DEFAULT_EMBROIDERY_BREAKS;
  }
  return methodTableBreaks(method);
}

export function unitPriceAtQty(
  breaks: PriceBreak[],
  qty: number,
): number | null {
  if (!breaks.length) return null;
  const q = Math.max(qty, 1);
  let current = breaks[0];
  for (const b of breaks) {
    if (q >= b.qty) current = b;
  }
  return current?.price ?? null;
}

/** Cheapest listed break — used for card "From $X" pricing. */
export function cheapestBreakPrice(
  pricing?: ProductPricing | null,
): number | null {
  const breaks = normalizePriceBreaks(pricing?.priceBreaks);
  const list = breaks.length ? breaks : DEFAULT_EMBROIDERY_BREAKS;
  if (!list.length) return pricing?.basePrice ?? null;
  return Math.min(...list.map((b) => b.price));
}

export function activeBreakForQty(
  breaks: PriceBreak[],
  qty: number,
): PriceBreak | null {
  if (!breaks.length) return null;
  const q = Math.max(qty, 1);
  let current = breaks[0];
  for (const b of breaks) {
    if (q >= b.qty) current = b;
  }
  return current;
}

/** Hats subtotal for a cart using order-wide qty for the tier. */
export function estimateHatsSubtotal(
  lines: Array<{ qty: number; pricing?: ProductPricing | null }>,
  methodId?: string,
  orderQty?: number,
): number | null {
  const totalQty =
    orderQty ?? lines.reduce((sum, line) => sum + Math.max(0, line.qty), 0);
  if (totalQty <= 0) return null;
  let sum = 0;
  let any = false;
  for (const line of lines) {
    if (line.qty <= 0) continue;
    const breaks = resolvePriceBreaks(line.pricing, methodId);
    const unit = unitPriceAtQty(breaks, totalQty);
    if (unit == null) continue;
    any = true;
    sum += unit * line.qty;
  }
  return any ? Math.round(sum * 100) / 100 : null;
}

export function formatBreakLabel(qty: number) {
  return `${qty}+`;
}
