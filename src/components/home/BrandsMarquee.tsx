"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { partnerBrands } from "@/data/site";
import { cn } from "@/lib/utils";

function BrandChip({ brand }: { brand: (typeof partnerBrands)[number] }) {
  const body = brand.logo ? (
    <Image
      src={brand.logo}
      alt={brand.name}
      width={140}
      height={48}
      className="h-8 w-auto max-w-[8rem] object-contain opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 md:h-9"
      unoptimized
    />
  ) : (
    <span className="text-sm font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
      {brand.name}
    </span>
  );

  const className =
    "group flex h-14 min-w-[9.5rem] items-center justify-center rounded-xl border border-[#e8eef4] bg-[#f8fafc] px-6 transition-colors hover:border-[#d1d9e2] hover:bg-white md:h-16 md:min-w-[11rem]";

  if (brand.href) {
    return (
      <Link
        href={brand.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={brand.name}
      >
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export function BrandsMarquee({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const loop = [...partnerBrands, ...partnerBrands];

  return (
    <div className={cn("relative z-10", className)}>
      <p className="mb-5 text-center text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-ink-soft">
        Brands we&apos;ve worked with
      </p>

      <div className="relative mx-auto max-w-[90rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-canvas to-transparent md:w-24"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-canvas to-transparent md:w-24"
        />

        <div className="overflow-hidden py-1">
          <ul
            className={cn(
              "m-0 flex w-max list-none items-center gap-3 p-0 md:gap-4",
              !reduce && "animate-marquee hover:[animation-play-state:paused]",
            )}
          >
            {loop.map((brand, index) => (
              <li
                key={`${brand.name}-${index}`}
                className="shrink-0"
                aria-hidden={index >= partnerBrands.length}
              >
                <BrandChip brand={brand} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
