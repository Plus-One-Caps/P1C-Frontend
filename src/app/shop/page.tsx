import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { HatCard } from "@/components/shop/HatCard";
import { silhouettes } from "@/data/site";
import { fetchCatalogProducts } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop custom hats",
  description:
    "Browse truckers, snapbacks, fitted caps, and beanies from Plus One Caps. Pick a style and start your custom hat order.",
};

type Props = {
  searchParams: Promise<{ type?: string; style?: string; q?: string }>;
};

const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const all = await fetchCatalogProducts();
  const typeFilter =
    (params.style || params.type)?.trim().toLowerCase() || "";
  const q = params.q?.trim().toLowerCase() || "";

  const types = Array.from(
    new Set(all.map((p) => p.type?.toLowerCase()).filter(Boolean) as string[]),
  ).sort();

  const products = all.filter((p) => {
    if (typeFilter && p.type?.toLowerCase() !== typeFilter) return false;
    if (!q) return true;
    const hay = [p.name, p.brand, p.type, p.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title={typeFilter ? `${typeLabel(typeFilter)} hats` : "Pick your blank."}
        description="Quality blanks ready for embroidery, leather, PVC, or screen print. Choose a style here, then decorate it in the order flow — with a mockup before production."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="md">
            Start your order
          </Button>
          <Button href="/decorations" variant="outline" size="md">
            Compare finishes
          </Button>
        </div>
      </PageHeader>

      <section className="py-12 md:py-16">
        <Container>
          <nav
            aria-label="Hat styles"
            className="-mt-2 mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border"
          >
            <Link
              href="/shop"
              aria-current={!typeFilter ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 py-3 text-sm font-semibold transition-colors",
                !typeFilter
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-soft hover:text-ink",
              )}
            >
              All
            </Link>
            {silhouettes.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="-mb-px border-b-2 border-transparent py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                {s.name}
              </Link>
            ))}
            {types.length > 1 &&
              types.map((t) => {
                const active = t === typeFilter;
                return (
                  <Link
                    key={t}
                    href={`/shop?type=${encodeURIComponent(t)}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "-mb-px border-b-2 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-ink text-ink"
                        : "border-transparent text-ink-soft hover:text-ink",
                    )}
                  >
                    {typeLabel(t)}
                  </Link>
                );
              })}
          </nav>

          <p className="mb-6 text-sm text-ink-soft">
            {products.length} style{products.length === 1 ? "" : "s"}. Catalog
            cards show blank reference pricing — your order uses blank +
            decoration rates{" "}
            <Link
              href="/pricing"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              (see the chart)
            </Link>
            , confirmed with your mockup.
          </p>

          <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
            {products.map((product, i) => (
              <Reveal
                key={product.id}
                delay={Math.min(i, 7) * 0.04}
                className="h-full"
              >
                <HatCard product={product} />
              </Reveal>
            ))}
          </div>

          {products.length === 0 && (
            <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-grey-olive">
              No hats published yet. Check back soon.
            </p>
          )}

          <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-border pt-10 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-bold tracking-tight text-ink">
                Not sure which hat?
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Start an order and tell us the look you want — or{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-pastel-link underline-offset-4 hover:underline"
                >
                  ask a hat expert
                </Link>
                .
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
                Start your order
              </Button>
              <Button href="/process" variant="outline" size="lg" className="w-full sm:w-auto">
                See the process
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
