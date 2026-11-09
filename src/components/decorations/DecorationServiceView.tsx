import Image from "next/image";
import Link from "next/link";
import {
  decorationServices,
  type DecorationService,
} from "@/data/decorationServices";
import type { PricingMethodId } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageCTA } from "@/components/ui/PageCTA";
import { Reveal } from "@/components/ui/Reveal";
import { PricingChartModal } from "@/components/pricing/PricingChartModal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

function toPricingMethodId(method: string): PricingMethodId {
  if (
    method === "leather-patch" ||
    method === "pvc-patch" ||
    method === "screenprint"
  ) {
    return method;
  }
  return "embroidery";
}

export function DecorationServiceView({
  service,
}: {
  service: DecorationService;
}) {
  const others = decorationServices.filter((s) => s.id !== service.id);
  const pricingMethodId = toPricingMethodId(service.orderMethod);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_100%_0%,rgba(164,216,255,0.28),transparent_55%)]"
        />
        <Container className="relative py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow text-pastel-link">{service.eyebrow}</p>
              <h1 className="mt-3 text-section-title text-ink md:text-5xl">
                {service.headline}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
                {service.lede}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  href={`/order?method=${service.orderMethod}`}
                  variant="primary"
                  size="lg"
                >
                  Start an order
                </Button>
                <Button href="/shop" variant="outline" size="lg">
                  Browse hats
                </Button>
              </div>
            </Reveal>
            <Reveal
              delay={0.06}
              className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#f4f6f8] lg:col-span-6"
            >
              <Image
                src={service.image}
                alt={`${service.name} example`}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </Reveal>
          </div>

          <ul className="mt-12 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {service.highlights.map((item, i) => (
              <Reveal
                as="li"
                key={item.label}
                delay={i * 0.04}
                className="rounded-[14px] border border-[#e8eef4] bg-canvas px-5 py-4"
              >
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm font-bold leading-snug text-ink md:text-base">
                  {item.value}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Options */}
      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-eyebrow text-pastel-link">Your options</p>
            <h2 className="mt-3 text-section-title text-ink">
              {service.optionsTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {service.optionsLede}
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-5 p-0 md:grid-cols-2">
            {service.options.map((opt, i) => (
              <Reveal
                as="li"
                key={opt.title}
                delay={i * 0.04}
                className="rounded-[14px] border border-[#e8eef4] bg-white p-6 md:p-7"
              >
                <h3 className="text-lg font-bold tracking-tight text-ink">
                  {opt.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">
                  {opt.text}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Why */}
      <section className="bg-white py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-eyebrow text-pastel-link">Why Plus One Caps</p>
            <h2 className="mt-3 text-section-title text-ink">{service.whyTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              {service.whyLede}
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2">
            {service.why.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.04}>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-pastel-link">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">
                  {item.text}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Process */}
      <section className="relative overflow-hidden bg-ink py-14 text-white md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(164,216,255,0.18),transparent_55%)]"
        />
        <Container className="relative">
          <Reveal className="max-w-2xl">
            <p className="text-eyebrow text-pastel-sky">How it works</p>
            <h2 className="mt-3 text-section-title">{service.processTitle}</h2>
          </Reveal>
          <ol className="mt-10 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <Reveal as="li" key={step.step} delay={i * 0.04}>
                <p className="text-2xl font-bold tabular-nums text-pastel-sky">
                  {step.step}
                </p>
                <h3 className="mt-3 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.text}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Artwork + specs */}
      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <h2 className="text-section-title text-ink">
                {service.artworkTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                {service.artworkLede}
              </p>
              <ul className="mt-6 space-y-3">
                {service.artworkPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-relaxed text-ink-soft md:text-[0.95rem]"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pastel-link"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.05} className="lg:col-span-5">
              <div className="rounded-[14px] border border-[#e8eef4] bg-white p-6 md:p-7">
                <h3 className="text-lg font-bold text-ink">Service specs</h3>
                <dl className="mt-5 divide-y divide-border">
                  {service.specs.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[7.5rem_1fr] gap-3 py-3 text-sm"
                    >
                      <dt className="font-semibold text-ink">{row.label}</dt>
                      <dd className="text-ink-soft">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <PricingChartModal
                  initialMethodId={pricingMethodId}
                  className="mt-6"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Best for + industries */}
      <section className="border-y border-border bg-white py-14 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h2 className="text-section-title text-ink">
                {service.bestForTitle}
              </h2>
              <ul className="mt-6 space-y-3">
                {service.bestFor.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-ink pl-4 text-sm font-medium leading-relaxed text-ink-soft md:text-base"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-section-title text-ink">Common industries</h2>
              <p className="mt-3 text-sm text-ink-soft">
                Not a limit — just where this finish shows up often.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {service.industries.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-[#e8eef4] bg-canvas px-3.5 py-1.5 text-sm font-semibold text-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <Reveal>
            <h2 className="text-section-title text-ink">
              {service.shortName} questions
            </h2>
          </Reveal>
          <Reveal delay={0.04} className="mt-8 md:mt-10">
            <FaqAccordion items={service.faqs} />
          </Reveal>
        </Container>
      </section>

      {/* Compare other services */}
      <section className="bg-white py-14 md:py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-section-title text-ink">Compare finishes</h2>
              <p className="mt-2 max-w-lg text-sm text-ink-soft md:text-base">
                Not sure this is the one? Look at the other decoration services —
                or start on the overview.
              </p>
            </div>
            <Link
              href="/decorations"
              className="text-sm font-bold text-pastel-link no-underline hover:text-ink"
            >
              All decorations →
            </Link>
          </Reveal>
          <ul className="mt-8 grid list-none gap-4 p-0 md:grid-cols-3">
            {others.map((item, i) => (
              <Reveal as="li" key={item.id} delay={i * 0.04}>
                <Link
                  href={`/decorations/${item.slug}`}
                  className="group flex h-full flex-col rounded-[14px] border border-[#e8eef4] bg-canvas p-5 text-ink no-underline transition hover:border-[#d1d5db] hover:bg-white hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                >
                  <p className="text-lg font-bold tracking-tight group-hover:text-pastel-link">
                    {item.shortName}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {item.compareBlurb}
                  </p>
                  <p className="mt-4 text-sm font-bold text-pastel-link">
                    Learn more →
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <PageCTA
        title={`Ready for ${service.shortName.toLowerCase()}?`}
        description="Start an order with this finish — we’ll send a digital mockup before anything goes into production."
        primaryHref={`/order?method=${service.orderMethod}`}
        primaryLabel="Start an order"
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
      />
    </>
  );
}
