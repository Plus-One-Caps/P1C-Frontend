import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about ordering custom hats with Plus One Caps — payment, mockups, artwork, production times, shipping, and more.",
};

const sections = [
  {
    id: "ordering",
    title: "Ordering & payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse blanks or go straight to Start your order. Pick your hat, decoration, quantity, and upload art (or reuse previous artwork from your account). Checkout locks in the order — we review everything, then send a mockup and sew-out for your approval before production.",
      },
      {
        q: "Do I pay before I see a mockup?",
        a: "Yes — payment is collected at checkout so we can prioritize your order. Nothing is produced until you approve the digital mockup and sew-out. If something needs to change, we’ll work with you before anything is made.",
      },
      {
        q: "What’s the minimum order?",
        a: "You can start with a single hat. Volume pricing improves as quantity goes up — check Pricing for blank + decoration rates by finish and count.",
      },
      {
        q: "Can I mix styles and colors in one order?",
        a: "Yes. Mix blanks and colors in the same run. Volume pricing follows your total quantity across the order.",
      },
      {
        q: "Can I change my order after I pay?",
        a: "Reach out as soon as you can. Before production starts we can usually adjust art, blank, or quantity. Once hats are in production, changes may not be possible — email or call us and we’ll tell you what’s still open.",
      },
    ],
  },
  {
    id: "artwork",
    title: "Artwork & finishes",
    items: [
      {
        q: "What artwork files do you need?",
        a: "Vector files are ideal (AI, EPS, PDF, SVG). A clean high-res PNG or JPG works for a first pass — we’ll digitize for embroidery or prep the file for your finish. Include preferred placement if you have one.",
      },
      {
        q: "Do you digitize or redraw my logo?",
        a: "Yes. For embroidery we create a production digitizing file from your art. For patches and print we prepare the artwork for that process. You’ll see the result on your mockup before anything is made.",
      },
      {
        q: "Can I reuse artwork from a past order?",
        a: "Yes — if you’re signed in, pull previous approved artwork into a new order. Reusing that art waives artwork and location setup fees, so reorders stay simpler and cheaper. New customers upload art once; we save it for next time.",
      },
      {
        q: "Is there a setup fee?",
        a: "Artwork setup is $50 under 12 hats (free at 12+). Extra decoration locations can also include a setup. Reorders that reuse previous artwork waive those setup fees — you only pay the blank + decoration rate.",
      },
      {
        q: "Which decoration should I choose?",
        a: "Embroidery is the classic raised stitch look. Leather and PVC patches are great for bold logos and outdoor brands. Screen print works well for flatter, multi-color graphics. Compare finishes on Decorations, or ask us — we’re happy to recommend.",
      },
    ],
  },
  {
    id: "production",
    title: "Mockups, production & timing",
    items: [
      {
        q: "What happens after I order?",
        a: "We review your blank, art, and specs. Then we send a digital mockup and sew-out for approval. Once you sign off, we produce and ship with tracking. You’ll always know whether we’re on review, waiting on you, in production, or shipping.",
      },
      {
        q: "How long until I get my hats?",
        a: "Mockups usually turn around quickly after we receive the order. After approval, embroidery, leather, and screen print typically take about 1–2 weeks; PVC patch programs are often about 3–4 weeks. We’ll confirm timing on your quote. Event date? Tell us when you order.",
      },
      {
        q: "Can I rush an order?",
        a: "Sometimes — it depends on finish, quantity, and the current schedule. Call or note the deadline on your order and we’ll tell you what’s realistic.",
      },
      {
        q: "Nothing is made until I approve — right?",
        a: "Correct. Payment holds your spot in the queue; production starts only after you approve the mockup and sew-out.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & delivery",
    items: [
      {
        q: "When is shipping free?",
        a: "Free shipping on orders of 24 hats or more. Under 24, shipping is tracked and included with your order total.",
      },
      {
        q: "How do I track my order?",
        a: "When your hats ship, we send tracking by email. You can also check status in your account under Orders.",
      },
      {
        q: "What’s your return or remake policy?",
        a: "Custom decorated hats aren’t returnable like retail blanks, but if something’s wrong with production or we missed the approved mockup, contact us right away — we’ll make it right.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & support",
    items: [
      {
        q: "Do I need an account to order?",
        a: "You can start without one, but an account makes reorders, saved artwork, and order history easier. We’ll email order updates either way.",
      },
      {
        q: "Who do I contact with questions?",
        a: `Email ${siteConfig.email}, call ${siteConfig.phone}, or use the contact form. We aim to reply within one business day — urgent event dates, call us.`,
      },
      {
        q: "Should I email you or just start an order?",
        a: "If you know the blank, finish, and quantity, start an order. If you’re unsure about art, timeline, or which finish fits, send a note or call and we’ll help you choose.",
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Straight answers before you order."
        description="Mockups, payment, artwork, timing, and shipping — the questions we hear most, answered the way we actually work."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <Button href="/contact" variant="outline" size="lg">
            Still have a question?
          </Button>
        </div>
      </PageHeader>

      <section className="border-b border-border bg-canvas py-8 md:py-10">
        <Container>
          <nav aria-label="FAQ sections">
            <ul className="flex list-none flex-wrap gap-2 p-0 md:gap-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex items-center rounded-full border border-[#e8eef4] bg-white px-4 py-2 text-sm font-semibold text-ink no-underline transition hover:border-[#d1d5db] hover:text-pastel-link"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <div className="space-y-16 md:space-y-20">
            {sections.map((section, sectionIndex) => (
              <Reveal key={section.id} delay={sectionIndex * 0.03}>
                <div id={section.id} className="scroll-mt-28">
                  <h2 className="text-section-title text-ink">
                    {section.title}
                  </h2>
                  <div className="mt-8 md:mt-10">
                    <FaqAccordion
                      items={[...section.items]}
                      idPrefix={section.id}
                      defaultOpen={sectionIndex === 0 ? 0 : null}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 border-t border-border pt-12 md:mt-20">
            <p className="text-eyebrow text-ink-soft">Still stuck?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Talk to a real person.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
              Art questions, rush timelines, or picking a finish — we&apos;re
              here. Or skim{" "}
              <Link
                href="/process"
                className="font-semibold text-ink underline decoration-[#d1d5db] underline-offset-4 hover:text-pastel-link"
              >
                how it works
              </Link>{" "}
              and{" "}
              <Link
                href="/pricing"
                className="font-semibold text-ink underline decoration-[#d1d5db] underline-offset-4 hover:text-pastel-link"
              >
                pricing
              </Link>{" "}
              first.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/contact" variant="primary" size="lg">
                Contact us
              </Button>
              <a
                href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink-mid bg-white px-7 py-3 text-[0.8125rem] font-semibold text-ink-mid no-underline transition hover:border-[#454a4e] hover:bg-[#454a4e] hover:text-white"
              >
                Call {siteConfig.phone}
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      <PageCTA
        title="Ready when you are."
        description="Pick a blank, choose a finish, upload art — we’ll send a mockup and sew-out before anything is made."
        secondaryHref="/shop"
        secondaryLabel="Browse blanks"
      />
    </>
  );
}
