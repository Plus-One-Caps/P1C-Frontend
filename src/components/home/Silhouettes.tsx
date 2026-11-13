"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const tiles = [
  {
    id: "fit",
    title: "Find your fit",
    text: "Explore trucker, snapback, fitted, and beanie blanks that match your brand’s energy.",
    href: "/shop",
    cta: "Explore blanks",
    image: "/images/home/feature-find-fit.jpg",
    imageAlt: "Custom trucker hat outdoors on a rock",
  },
  {
    id: "yours",
    title: "Make it yours",
    text: "Embroidery, leather, PVC, or screen print — clean details built to represent your brand.",
    href: "/decorations",
    cta: "Explore finishes",
    image: "/images/home/feature-make-yours.jpg",
    imageAlt: "Close-up of custom embroidery on a hat",
  },
  {
    id: "process",
    title: "How it works",
    text: "Order online, approve your mockup and sew-out, then we produce and ship with tracking.",
    href: "/process",
    cta: "See the process",
    image: "/images/home/feature-how-it-works.jpg",
    imageAlt: "Hat production flat lay with blank, art, and mockup",
  },
  {
    id: "sample",
    title: "Order the sample pack",
    text: "Feel the blanks and finishes before you commit to a full run.",
    href: "/contact",
    cta: "Get the sample pack",
    image: "/images/home/feature-sample-pack.jpg",
    imageAlt: "Plus One Caps sample pack shipping box with branded packing tape",
  },
  {
    id: "brands",
    title: "Built for brands that want more",
    text: "From a first drop to larger programs — volume pricing, no setup on reorders, free shipping on 24+.",
    href: "/pricing",
    cta: "View pricing",
    image: "/images/home/feature-brands.jpg",
    imageAlt: "Person wearing a custom hat outdoors",
  },
] as const;

export function Silhouettes() {
  return (
    <section
      className="relative overflow-hidden bg-canvas py-20 md:py-28"
      aria-labelledby="fit-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(164,216,255,0.18),transparent_55%)]"
        aria-hidden
      />

      <Container className="relative">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-pastel-link">Custom headwear</p>
          <h2 id="fit-heading" className="mt-3 text-section-title text-ink">
            From blank to brand — simplified.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Pick a silhouette, choose a finish, approve the mockup. We produce
            custom hats the way teams and brands actually work.
          </p>
        </Reveal>

        <ul className="mt-12 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {tiles.map((tile, index) => (
            <Reveal as="li" key={tile.id} delay={index * 0.05}>
              <Link
                href={tile.href}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[14px] text-white no-underline"
              >
                <Image
                  src={tile.image}
                  alt={tile.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  unoptimized
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="text-[1.35rem] font-extrabold uppercase leading-[1.05] tracking-tight md:text-[1.55rem]">
                    {tile.title}
                  </h3>
                  <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-white/85">
                    {tile.text}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-pastel-sky underline decoration-pastel-sky/50 underline-offset-4 transition group-hover:decoration-pastel-sky">
                    {tile.cta}
                    <ArrowRight
                      size={15}
                      strokeWidth={2.25}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal as="li" delay={0.28}>
            <Link
              href="/order"
              className={cn(
                "group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[14px] bg-pastel-sky p-5 text-ink no-underline md:p-6",
                "transition-[filter] duration-300 hover:brightness-[0.97]",
              )}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-white/35 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-8 right-6 opacity-[0.18]"
                aria-hidden
              >
                <Image
                  src="/brand/logo-mark-gold.png"
                  alt=""
                  width={88}
                  height={116}
                  className="rotate-6"
                  unoptimized
                />
              </div>
              <p className="text-eyebrow text-ink/55">Ready when you are</p>
              <h3 className="mt-3 max-w-[12ch] text-[2rem] font-extrabold leading-[0.95] tracking-tight text-ink md:text-[2.35rem]">
                Let&apos;s build yours.
              </h3>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                Start your order
                <ArrowRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </Reveal>
        </ul>
      </Container>
    </section>
  );
}
