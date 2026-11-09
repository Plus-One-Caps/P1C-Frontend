import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  decorationServices,
  getDecorationService,
} from "@/data/decorationServices";
import { DecorationServiceView } from "@/components/decorations/DecorationServiceView";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return decorationServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getDecorationService(slug);
  if (!service) return { title: "Decoration" };
  return {
    title: service.name,
    description: service.metaDescription,
  };
}

export default async function DecorationServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getDecorationService(slug);
  if (!service) notFound();
  return <DecorationServiceView service={service} />;
}
