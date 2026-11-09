import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Plus One Caps is a local custom headwear shop with 15+ years in custom goods. Mockup-first process, clear pricing, quality hats on time.",
};

const values = [
  [
    "Quality made to last",
    "Solid blanks and clean decoration that hold up long after the first wear — checked before they leave the shop.",
  ],
  [
    "Clear before production",
    "You approve a digital mockup and a fair blank + decoration price first. No surprises on delivery day.",
  ],
  [
    "Access without the runaround",
    "Our mission is timely access to quality custom hats — whether you need one or a full program.",
  ],
  [
    "A partner, not a ticket queue",
    "Real people answer art questions, timelines, and reorders from first request to tracking number.",
  ],
];

const facts = [
  { label: "Experience", value: "15+ years in custom goods" },
  { label: "Approach", value: "Mockup before anything is made" },
  { label: "Finishes", value: "Embroidery, leather, PVC, screen print" },
  { label: "Shipping", value: "Free on orders of 24+ hats" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A local shop built for custom hats that turn out right."
        description="Plus One Caps is a women-owned team with more than 15 years of hands-on experience in custom goods. We help people get quality headwear in a timely manner — without guesswork or blank-only pricing tricks."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <Button href="/process" variant="outline" size="lg">
            See how it works
          </Button>
        </div>
      </PageHeader>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[1.15rem]">
              <Image
                src="/images/home/about-facility.jpg"
                alt="Inside the Plus One Caps shop"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </Reveal>
            <div>
              <h2 className="text-section-title text-ink">
                One goal: great custom hats, on time.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft">
                We&apos;re a local business focused on custom headwear end to
                end — blanks, decoration, proofing, production, and shipping.
                Pick a style, choose a finish, send your art, and we handle the
                rest with clear communication at every step.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                Whether it&apos;s a single hat, a team set, or an ongoing brand
                program, the standard stays the same: mockup first, quality you
                can feel, and timelines we respect.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <li
                    key={fact.label}
                    className="rounded-[12px] border border-[#e8eef4] bg-canvas px-4 py-3"
                  >
                    <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
                      {fact.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {fact.value}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-canvas py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-section-title text-ink">What we stand for</h2>
            <p className="mt-3 text-base text-ink-soft">
              The same principles you&apos;ll feel on the homepage, in pricing,
              and in every mockup we send.
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-2">
            {values.map(([title, text], i) => (
              <Reveal as="li" key={title} delay={i * 0.04} className="border-l-2 border-ink pl-4">
                <p className="font-bold text-ink">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {text}
                </p>
              </Reveal>
            ))}
          </ul>
          <p className="mt-10 text-sm text-ink-soft">
            Curious about finishes or timelines?{" "}
            <Link
              href="/decorations"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              Explore decorations
            </Link>
            {" · "}
            <Link
              href="/pricing"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              View pricing
            </Link>
            {" · "}
            <Link
              href="/contact"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              Contact the team
            </Link>
            .
          </p>
        </Container>
      </section>

      <PageCTA
        title="Ready to make a hat worth wearing?"
        description="Start an order whenever you’re ready — we’ll send a mockup before anything goes into production."
        secondaryHref="/shop"
        secondaryLabel="Browse blanks"
      />
    </>
  );
}
