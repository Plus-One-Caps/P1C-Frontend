import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { HatDetail } from "@/components/shop/HatDetail";
import { RelatedHats } from "@/components/shop/RelatedHats";
import {
  fetchCatalogProduct,
  fetchCatalogProducts,
  fetchDecorationMethods,
  resolveProductDecoration,
} from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await fetchCatalogProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchCatalogProduct(slug);
  if (!product) return { title: "Hat" };
  const plain =
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    product.name;
  return {
    title: `Custom ${product.name}`,
    description: plain.slice(0, 160),
  };
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, catalogMethods, allProducts] = await Promise.all([
    fetchCatalogProduct(slug),
    fetchDecorationMethods(),
    fetchCatalogProducts(),
  ]);
  if (!product) notFound();

  const methods = resolveProductDecoration(product, catalogMethods);

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} />
          All hats
        </Link>
        <div className="mt-6">
          <HatDetail product={product} methods={methods} />
        </div>
        <RelatedHats product={product} catalog={allProducts} />
      </Container>
    </section>
  );
}
