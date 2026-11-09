"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { howItWorksSteps } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden bg-background py-20 md:py-28"
      aria-labelledby="how-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_100%_at_100%_0%,rgba(164,216,255,0.22),transparent_65%)]"
        aria-hidden
      />

      <Container className="relative">
        <Reveal className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-eyebrow text-pastel-link">How it works</p>
            <h2 id="how-heading" className="mt-3 text-section-title text-ink">
              Three steps.
              <span className="block text-ink-soft">Zero headaches.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Design the order, approve a digital mockup with pricing, then we
              produce and ship. Same checkpoints whether it&apos;s one hat or a
              full program.
            </p>
          </div>
          <div className="lg:col-span-6 lg:flex lg:justify-end">
            <Link
              href="/process"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-pastel-link no-underline hover:text-ink"
            >
              View full process
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          <ol className="flex flex-col gap-0 lg:col-span-6">
            {howItWorksSteps.map((item, index) => (
              <Reveal
                as="li"
                key={item.step}
                delay={index * 0.08}
                className="relative flex gap-5 border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-lg font-bold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal
            delay={0.12}
            className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-lg)] lg:col-span-6 lg:min-h-full"
          >
            <Image
              src="/images/home/how-it-works-mockup.jpg"
              alt="Reviewing a custom hat mockup on a laptop beside blank caps before production"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-sm font-semibold leading-snug text-white md:bottom-6 md:left-6 md:text-[0.95rem]">
              Approve the mockup first — then we stitch, pack, and ship.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
