import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { decorationServices } from "@/data/decorationServices";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Decorations",
  description:
    "Compare custom hat finishes: embroidery, leather patch, PVC patch, and screen print. Pick the service that fits your art, quantity, and timeline.",
};

const guide = [
  {
    title: "Need flexibility & no minimum?",
    text: "Start with embroidery — classic stitch, any quantity, works on almost every blank.",
    href: "/decorations/embroidery",
  },
  {
    title: "Want heritage texture?",
    text: "Leather patch adds a sewn badge with engraved or printed detail — 12-hat minimum.",
    href: "/decorations/leather-patch",
  },
  {
    title: "Need bold outdoor presence?",
    text: "PVC is die-cut to your logo with molded color — 48-hat minimum, longer lead time.",
    href: "/decorations/pvc-patch",
  },
  {
    title: "Is the art the hero?",
    text: "Screen print lays flat ink for large graphics and illustrations that want coverage.",
    href: "/decorations/screenprint",
  },
];

export default function DecorationsHubPage() {
  return (
    <>
      <PageHeader
        eyebrow="Decorations"
        title="Compare finishes. Then go deep."
        description="Each decoration is its own service — with different looks, minimums, timelines, and art needs. Browse the overview, then open the full page for the finish you’re considering."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <Button href="/pricing" variant="outline" size="lg">
            See pricing
          </Button>
        </div>
      </PageHeader>

      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <ul className="grid list-none gap-5 p-0 lg:grid-cols-2">
            {decorationServices.map((service, index) => (
              <Reveal as="li" key={service.id} delay={index * 0.04}>
                <Link
                  href={`/decorations/${service.slug}`}
                  className="group grid h-full overflow-hidden rounded-[1.15rem] border border-[#e8eef4] bg-white text-ink no-underline transition hover:-translate-y-0.5 hover:border-[#d1d5db] hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] sm:grid-cols-[1.05fr_1fr]"
                >
                  <div className="relative min-h-[180px] overflow-hidden bg-[#f4f6f8] sm:min-h-full">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col p-6 md:p-7">
                    <p className="text-eyebrow text-pastel-link">
                      {service.eyebrow}
                    </p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
                      {service.name}
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                      {service.compareBlurb}
                    </p>
                    <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-ink-soft">
                      {service.highlights.slice(0, 3).map((h) => (
                        <li key={h.label}>
                          <span className="font-semibold text-ink">
                            {h.label}:
                          </span>{" "}
                          {h.value}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm font-bold text-pastel-link group-hover:text-ink">
                      Open {service.shortName.toLowerCase()} page →
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-section-title text-ink">Quick chooser</h2>
            <p className="mt-3 text-base text-ink-soft">
              Still deciding? Match the question to a service page.
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-5 p-0 md:grid-cols-2">
            {guide.map((item, i) => (
              <Reveal as="li" key={item.href} delay={i * 0.04}>
                <Link
                  href={item.href}
                  className="block rounded-[14px] border border-[#e8eef4] bg-canvas p-6 text-ink no-underline transition hover:border-[#d1d5db] hover:bg-white"
                >
                  <h3 className="text-lg font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.text}
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
        title="Know your finish?"
        description="Start an order with the decoration method you want — mockup first, then we produce."
        secondaryHref="/process"
        secondaryLabel="See the process"
      />
    </>
  );
}
