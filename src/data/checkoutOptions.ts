/** Checkout helpers: shipping tiers, production expediting, promo codes. */

export type ExpediteId = "standard" | "rush-7" | "rush-3";

export type ExpediteOption = {
  id: ExpediteId;
  label: string;
  /** Inclusive business-day window for estimated production complete. */
  businessDaysMin: number;
  businessDaysMax: number;
  /** Markup on merchandise subtotal (0.3 = +30%). */
  markupPercent: number;
};

export const expediteOptions: ExpediteOption[] = [
  {
    id: "standard",
    label: "Standard turn around",
    businessDaysMin: 10,
    businessDaysMax: 14,
    markupPercent: 0,
  },
  {
    id: "rush-7",
    label: "7–10 business days",
    businessDaysMin: 7,
    businessDaysMax: 10,
    markupPercent: 0.3,
  },
  {
    id: "rush-3",
    label: "3–5 business days",
    businessDaysMin: 3,
    businessDaysMax: 5,
    markupPercent: 0.6,
  },
];

/** Flat shipping by hat qty — competitor-style, free at 24. */
export function shippingForQty(qty: number): {
  amount: number;
  label: string;
} {
  if (qty <= 0) return { amount: 0, label: "—" };
  if (qty >= 24) return { amount: 0, label: "Free" };
  if (qty >= 12) return { amount: 15, label: "$15" };
  return { amount: 10, label: "$10" };
}

export type PromoResult =
  | { ok: true; code: string; label: string; amount: number }
  | { ok: false; error: string };

/** Demo promo codes until Stripe/admin discounts are wired. */
export function applyPromoCode(
  raw: string,
  merchandise: number,
): PromoResult {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a promo code." };
  if (!Number.isFinite(merchandise) || merchandise <= 0) {
    return { ok: false, error: "Add items before applying a code." };
  }

  if (code === "PLUS10") {
    const amount = Math.round(merchandise * 0.1 * 100) / 100;
    return { ok: true, code, label: "10% off", amount };
  }
  if (code === "WELCOME5") {
    const amount = Math.min(5, merchandise);
    return { ok: true, code, label: "$5 off", amount };
  }
  if (code === "FREESHIP") {
    return { ok: true, code, label: "Free shipping", amount: 0 };
  }
  return { ok: false, error: "That code isn’t valid." };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Add N business days (Mon–Fri) from a start date. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = startOfDay(from);
  let left = Math.max(0, days);
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return d;
}

function formatShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function productionDateRange(
  option: ExpediteOption,
  from: Date = new Date(),
): { start: Date; end: Date; label: string } {
  const start = addBusinessDays(from, option.businessDaysMin);
  const end = addBusinessDays(from, option.businessDaysMax);
  return {
    start,
    end,
    label: `${formatShort(start)} – ${formatShort(end)}`,
  };
}

function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return startOfDay(date);
}

/**
 * Pick the cheapest expedite tier that can have production underway
 * by the need-by (in-hand) date. If the date is tighter than every
 * window, fall back to the fastest rush option.
 */
export function expediteForNeedBy(
  needByISO: string,
  from: Date = new Date(),
): ExpediteId {
  const needBy = parseISODate(needByISO);
  if (!needBy) return "standard";

  for (const opt of expediteOptions) {
    const { start } = productionDateRange(opt, from);
    if (start.getTime() <= needBy.getTime()) {
      return opt.id;
    }
  }

  return expediteOptions[expediteOptions.length - 1]?.id || "rush-3";
}

export function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}
