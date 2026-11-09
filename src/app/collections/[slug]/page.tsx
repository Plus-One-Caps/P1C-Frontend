import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { HatCard } from "@/components/shop/HatCard";
import { silhouettes } from "@/data/site";
import { fetchCollectionBySlug } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCollectionBySlug(slug);
  if (!data) return { title: "Collection" };
  return {
    title: data.collection.name,
    description:
      data.collection.pageDescription ||
      data.collection.description ||
      `Browse ${data.collection.name} from Plus One Caps.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchCollectionBySlug(slug);
  if (!data) notFound();

  const { collection, products } = data;

  return (
    <>
      <PageHeader
        eyebrow="Blank styles"
        title={collection.name}
        description={
          collection.pageDescription ||
          collection.description ||
          `Browse ${collection.name}, pick a color, then start your custom order.`
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="md">
            Start your order
          </Button>
          <Button href="/shop" variant="outline" size="md">
            View all hats
          </Button>
        </div>
      </PageHeader>

      <section className="py-12 md:py-16">
        <Container>
          <nav
            aria-label="Blank styles"
            className="-mt-2 mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border"
          >
            <Link
              href="/shop"
              className="-mb-px border-b-2 border-transparent py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              All
            </Link>
            {silhouettes.map((s) => {
              const active = s.href === `/collections/${slug}`;
              return (
                <Link
                  key={s.id}
                  href={s.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px border-b-2 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "border-ink text-ink"
                      : "border-transparent text-ink-soft hover:text-ink",
                  )}
                >
                  {s.name}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} />
            All hats
          </Link>

          <p className="mb-6 text-sm text-ink-soft">
            {products.length} blank{products.length === 1 ? "" : "s"}. Open a
            style to pick color and quantity, then continue to artwork.
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">
            {products.map((product) => (
              <HatCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm text-ink-soft">
                Hats for this collection are coming soon.
              </p>
              <Button href="/shop" variant="outline" className="mt-5">
                Browse all hats
              </Button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
