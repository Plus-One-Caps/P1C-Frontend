import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { HatCard } from "@/components/shop/HatCard";

function styleLabel(type?: string) {
  const t = (type || "").trim();
  if (!t) return "style";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function styleShopLabel(type?: string) {
  const label = styleLabel(type);
  const lower = label.toLowerCase();
  if (lower.endsWith("s")) return lower;
  return `${lower}s`;
}

function Section({
  title,
  href,
  linkLabel,
  products,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  products: CatalogProduct[];
}) {
  if (!products.length) return null;

  return (
    <section className="mt-16 border-t border-border pt-12 md:mt-20 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
          {title}
        </h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="text-sm font-semibold text-pastel-link transition hover:text-ink"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <HatCard key={p.id || p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

export function RelatedHats({
  product,
  catalog,
  limit = 4,
}: {
  product: CatalogProduct;
  catalog: CatalogProduct[];
  limit?: number;
}) {
  const brand = (product.brand || "").trim().toLowerCase();
  const type = (product.type || "").trim().toLowerCase();

  const sameBrand = brand
    ? catalog
        .filter(
          (p) =>
            p.slug !== product.slug &&
            (p.brand || "").trim().toLowerCase() === brand,
        )
        .slice(0, limit)
    : [];

  const sameStyle = type
    ? catalog
        .filter(
          (p) =>
            p.slug !== product.slug &&
            (p.type || "").trim().toLowerCase() === type &&
            !sameBrand.some((b) => b.slug === p.slug),
        )
        .slice(0, limit)
    : [];

  // If brand section ate the style overlap, still fill style from all same-type
  const styleFill =
    sameStyle.length >= limit
      ? sameStyle
      : type
        ? catalog
            .filter(
              (p) =>
                p.slug !== product.slug &&
                (p.type || "").trim().toLowerCase() === type,
            )
            .slice(0, limit)
        : [];

  if (!sameBrand.length && !styleFill.length) return null;

  return (
    <div>
      {sameBrand.length > 0 && product.brand ? (
        <Section
          title={`More from ${product.brand}`}
          href={`/shop?q=${encodeURIComponent(product.brand)}`}
          linkLabel={`Shop ${product.brand}`}
          products={sameBrand}
        />
      ) : null}
      {styleFill.length > 0 && product.type ? (
        <Section
          title={`More ${styleLabel(product.type)} hats`}
          href={`/shop?type=${encodeURIComponent(type)}`}
          linkLabel={`Shop ${styleShopLabel(product.type)}`}
          products={styleFill}
        />
      ) : null}
    </div>
  );
}
