"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { decorationServices } from "@/data/decorationServices";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function Decoration() {
  return (
    <section
      id="decoration"
      className="scroll-mt-28 relative overflow-hidden bg-white py-20 md:py-28"
      aria-labelledby="decoration-heading"
    >
      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow text-pastel-link">Decorations</p>
          <h2 id="decoration-heading" className="mt-3 text-section-title text-ink">
            Choose how your brand lands on the hat.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Embroidery, leather, PVC, or screen print — each finish has different
            minimums, timelines, and looks. Pick a path, then read the full
            service page before you order.
          </p>
        </Reveal>

        <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {decorationServices.map((service, index) => (
            <Reveal as="li" key={service.id} delay={index * 0.05}>
              <Link
                href={`/decorations/${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-[#e8eef4] bg-canvas text-ink no-underline transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#d1d5db] hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[#f4f6f8]">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold tracking-tight md:text-lg">
                      {service.shortName}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-0.5 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pastel-link"
                    />
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {service.compareBlurb}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-pastel-link">
                    {service.highlights[0]?.value}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal
          delay={0.18}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button href="/decorations" variant="primary" size="lg">
            Compare all finishes
          </Button>
          <Button href="/pricing" variant="outline" size="lg">
            See pricing
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
