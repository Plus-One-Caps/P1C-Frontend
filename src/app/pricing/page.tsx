import type { Metadata } from "next";
import { pricingTiers } from "@/data/site";
import { Pricing } from "@/components/home/Pricing";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent custom hat pricing: blank + decoration in one number. Compare embroidery, leather, PVC, and screen print by quantity — free shipping on 24+.",
};

const included = [
  {
    title: "Blank + decoration",
    text: "The chart price is an all-in estimate for the hat and the finish you pick — not a blank-only tease.",
  },
  {
    title: "No setup on reorders",
    text: "Reuse previous artwork and we waive setup fees — a simple way to keep repeat runs lean.",
  },
  {
    title: "Digital mockup",
    text: "You see a preview and a clear quote before production. Revise until it looks right.",
  },
  {
    title: "Tracked shipping",
    text: "Orders of 24+ hats ship free. Smaller runs ship with tracking at a simple rate.",
  },
];

const factors = [
  {
    title: "Quantity",
    text: "The biggest lever. Unit cost drops as you move from 1 to 12, 24, 48, 96, 144, and beyond.",
  },
  {
    title: "Decoration method",
    text: "Embroidery and screen print are the baseline. Leather adds about $2 (12 min). PVC adds about $5 (48 min).",
  },
  {
    title: "Blank style",
    text: "Trucker, snapback, fitted, and beanie blanks can shift the number slightly in the order flow.",
  },
  {
    title: "Extra locations",
    text: "Side and back marks add to the per-hat rate. We’ll show that clearly on your mockup quote.",
  },
];

const faqs = [
  {
    q: "Is this the final price?",
    a: "It’s a clear starting number for blank + decoration by quantity. Exact totals can shift slightly by blank style, extra locations, or specialty sizes — you’ll approve the quote with your mockup.",
  },
  {
    q: "Do I pay before I see a mockup?",
    a: "Yes — payment is at checkout so we can prioritize your order. We still send a digital mockup and sew-out for approval before anything is produced.",
  },
  {
    q: "When is shipping free?",
    a: "Free shipping on orders of 24 hats or more. Under 24, shipping is tracked and quoted with your order.",
  },
  {
    q: "Can I mix styles and colors?",
    a: "Yes — mix blanks and colors in one order. Volume pricing follows your total quantity for the run.",
  },
  {
    q: "Do reorders still charge setup?",
    a: "No — when you reuse previous artwork, artwork and location setup fees are waived. You pay the blank + decoration rate for the new quantity.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Blank + decoration. One clear price."
        description="Tap a finish, read the chart, and know what you’re working with before you start. No blank-only bait — every number includes the hat and decoration."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <Button href="/decorations" variant="outline" size="lg">
            Explore finishes
          </Button>
        </div>
      </PageHeader>

      <Pricing hideIntro />

      <section className="border-t border-border bg-white py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-section-title text-ink">What’s included</h2>
            <p className="mt-3 text-base text-ink-soft">
              Pricing should feel like a partnership — clear inputs, no surprise
              fees after you fall in love with the mockup.
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.04}>
                <p className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-pastel-link">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.text}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-4">
              <h2 className="text-section-title text-ink">
                What moves the number
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                Use these levers when you’re planning a drop, a team set, or a
                full program.
              </p>
            </Reveal>
            <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:col-span-8">
              {factors.map((factor, i) => (
                <Reveal
                  as="li"
                  key={factor.title}
                  delay={i * 0.04}
                  className="border-l-2 border-ink pl-4"
                >
                  <h3 className="text-lg font-bold text-ink">{factor.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {factor.text}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal className="mt-14">
            <h3 className="text-xl font-bold tracking-tight text-ink">
              Quantity at a glance
            </h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pricingTiers.map((tier) => (
                <li
                  key={tier.id}
                  className="rounded-[14px] border border-[#e8eef4] bg-white p-5"
                >
                  <p className="text-eyebrow text-pastel-link">{tier.name}</p>
                  <p className="mt-1 text-lg font-bold text-ink">{tier.range}</p>
                  <p className="mt-2 text-sm text-ink-soft">
                    from ${tier.priceFrom}/hat · {tier.note}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <Reveal>
            <h2 className="text-section-title text-ink">Pricing questions</h2>
          </Reveal>
          <Reveal delay={0.04} className="mt-8 md:mt-10">
            <FaqAccordion items={faqs} />
          </Reveal>
        </Container>
      </section>

      <PageCTA
        title="Lock in a quantity and finish."
        description="Start your order with the method you like — we’ll confirm exact pricing with your mockup."
        secondaryHref="/process"
        secondaryLabel="See the process"
      />
    </>
  );
}
