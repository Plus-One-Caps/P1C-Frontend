import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Best available image for a hat in a given color. */
export function hatImageUrl(
  product: CatalogProduct,
  colorName?: string,
  thumb = false,
): string {
  const color =
    product.colors.find((c) => c.name === colorName) ||
    product.colors.find((c) => c.name === product.showcaseColor) ||
    product.colors[0];
  return (
    color?.imageUrl ||
    (thumb ? product.imageThumbUrl : "") ||
    product.imageUrl ||
    product.imageThumbUrl ||
    product.gallery?.[0] ||
    ""
  );
}

export function hatHex(product: CatalogProduct, colorName?: string): string {
  const color =
    product.colors.find((c) => c.name === colorName) ||
    product.colors.find((c) => c.name === product.showcaseColor) ||
    product.colors[0];
  return color?.hex || "#d9d3c7";
}

/** Infer S&S side/back paths from a front image (`…_f_fm.jpg` → `_d_` / `_b_`). */
function inferSsAngle(frontUrl: string, token: "_d_" | "_b_"): string {
  const u = (frontUrl || "").trim();
  if (!u.includes("_f_")) return "";
  return u.replace("_f_", token);
}

/** Front / side / back views available for a color (deduped). */
export function hatColorViews(
  product: CatalogProduct,
  colorName?: string,
): Array<{ label: string; url: string }> {
  const color =
    product.colors.find((c) => c.name === colorName) ||
    product.colors.find((c) => c.name === product.showcaseColor) ||
    product.colors[0];
  const views: Array<{ label: string; url: string }> = [];
  const push = (label: string, url?: string) => {
    const u = (url || "").trim();
    if (!u) return;
    if (views.some((v) => v.url === u)) return;
    views.push({ label, url: u });
  };
  const front =
    color?.imageUrl || product.imageUrl || product.gallery?.[0] || "";
  push("Front", front);
  push("Side", color?.sideImageUrl || inferSsAngle(front, "_d_"));
  push("Back", color?.backImageUrl || inferSsAngle(front, "_b_"));
  return views;
}

/** Simple cap illustration tinted to the selected color. Used when a product has no photo yet. */
export function HatSilhouette({
  hex,
  className,
}: {
  hex: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 150"
      role="img"
      aria-label="Hat"
      className={cn("h-full w-full", className)}
    >
      <ellipse cx="112" cy="132" rx="84" ry="7" fill="#000" opacity="0.07" />
      <path
        d="M38 98C36 48 70 18 114 18c44 0 74 32 72 80z"
        fill={hex}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.5"
      />
      <path
        d="M114 18c-14 22-18 52-16 80M114 18c22 20 32 50 30 80"
        fill="none"
        stroke="rgba(0,0,0,0.16)"
        strokeWidth="1.2"
      />
      <path
        d="M38 98c-16 1-30 6-33 14 40 12 120 10 181-14z"
        fill={hex}
        stroke="rgba(0,0,0,0.22)"
        strokeWidth="1.5"
      />
      <path
        d="M10 110c40 9 110 8 172-12"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.2"
      />
      <circle cx="114" cy="17" r="4" fill={hex} stroke="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function HatVisual({
  product,
  colorName,
  className,
  thumb = false,
  fit = "contain",
}: {
  product: CatalogProduct;
  colorName?: string;
  className?: string;
  thumb?: boolean;
  fit?: "contain" | "cover";
}) {
  const src = hatImageUrl(product, colorName, thumb);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${product.name}${colorName ? `, ${colorName}` : ""}`}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
          className,
        )}
      />
    );
  }
  return (
    <div className={cn("flex h-full w-full items-center justify-center p-[12%]", className)}>
      <HatSilhouette hex={hatHex(product, colorName)} />
    </div>
  );
}
