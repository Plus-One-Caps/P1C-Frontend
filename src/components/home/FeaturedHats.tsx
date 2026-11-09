import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { HatCard } from "@/components/shop/HatCard";

export function FeaturedHats({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-background py-20 md:py-28" aria-labelledby="featured-heading">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-eyebrow text-ink">Shop blanks</p>
            <h2 id="featured-heading" className="mt-3 text-section-title text-ink">
              Start with a great hat
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Richardson, FlexFit, YP Classics, and more — ready for your logo.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink"
          >
            Browse all hats
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.06}>
              <HatCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
