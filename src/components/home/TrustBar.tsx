"use client";

import { trustItems, trustStats } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function TrustBar() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-canvas"
      aria-labelledby="trust-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_8%_-10%,rgba(164,216,255,0.4),transparent_52%),linear-gradient(180deg,#fff_0%,transparent_42%)]"
        aria-hidden
      />

      <Container className="relative py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-eyebrow text-pastel-link">The Plus One promise</p>
          <h2 id="trust-heading" className="mt-3 text-section-title text-ink">
            Hats you can count on.
            <span className="block text-ink-soft">For anyone who needs one.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            One hat for yourself, a run for the team, or a full brand program —
            same mockup-first process, clear blank + decoration pricing, and
            clean reorders when you come back.
          </p>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border md:grid-cols-4">
          {trustStats.map((stat, i) => (
            <Reveal
              as="li"
              key={stat.label}
              delay={0.04 + i * 0.05}
              className="bg-white px-5 py-7 text-center md:px-6 md:py-8"
            >
              <p className="text-stat text-ink">{stat.value}</p>
              <p className="mt-2 text-sm font-medium leading-snug text-ink-soft">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </ul>

        <ul className="mt-10 grid gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {trustItems.map((item, i) => (
            <Reveal as="li" key={item.title} delay={0.1 + i * 0.05}>
              <p className="text-base font-bold tracking-tight text-ink">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
