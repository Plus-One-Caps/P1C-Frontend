import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { processDetails } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How Plus One Caps works: build your order, approve a mockup and quote, we produce, then we ship with tracking. Clear steps from concept to delivery.",
};

const beforeYouStart = [
  {
    title: "Your artwork",
    text: "Vector files are ideal (AI, EPS, PDF, SVG). High-res PNG or JPG works for a first pass — we’ll digitize for production.",
  },
  {
    title: "Rough quantity",
    text: "One hat or a few hundred — knowing the ballpark helps us recommend finish and volume pricing.",
  },
  {
    title: "Timeline",
    text: "Tell us if you have an event date. Embroidery, leather, and screen print usually move faster than PVC.",
  },
  {
    title: "Hat preference",
    text: "Trucker, snapback, fitted, or beanie — or browse blanks first and decide in the order flow.",
  },
];

const timelines = [
  {
    title: "Mockup",
    text: "After you submit, we prepare a digital preview with placement and pricing. Most mockups turn around quickly so you can revise with confidence.",
  },
  {
    title: "Embroidery / leather / screen print",
    text: "Once approved, typical production is about 1–2 weeks depending on quantity and schedule — we’ll confirm on your quote.",
  },
  {
    title: "PVC patch",
    text: "Mold and die-cut work takes longer — plan on roughly 3–4 weeks after approval for PVC programs.",
  },
  {
    title: "Shipping",
    text: "Finished hats ship with tracking. Free shipping on 24+. Rush options may be available — ask when you order.",
  },
];

const promises = [
  [
    "Nothing made until you approve",
    "Production starts only after you sign off on the mockup and quote.",
  ],
  [
    "Clear next step, every time",
    "You’ll always know whether we’re waiting on art, approval, production, or ship.",
  ],
  [
    "Real people on your order",
    "Questions go to the team — not a ticket black hole.",
  ],
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="From concept to delivery."
        description="A clear path for custom hats: build the order, approve the mockup, we produce, then we ship. No guessing what happens next — and nothing is made until you say go."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <Button href="/pricing" variant="outline" size="lg">
            View pricing
          </Button>
        </div>
      </PageHeader>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <ol className="list-none divide-y divide-border border-y border-border p-0">
            {processDetails.map((item, i) => (
              <Reveal
                as="li"
                key={item.step}
                delay={i * 0.04}
                className="grid gap-3 py-8 sm:grid-cols-[5.5rem_1fr] sm:gap-8 md:gap-10"
              >
                <span className="text-3xl font-bold tabular-nums text-ink">
                  {item.step}
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft md:text-base">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-ink py-14 text-white md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(164,216,255,0.18),transparent_55%)]"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-6">
              <p className="text-eyebrow text-pastel-sky">The mockup promise</p>
              <h2 className="mt-3 text-section-title">
                See it before we stitch it.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65">
                Every order gets a digital preview — placement, finish, and
                pricing — before production. Request changes until it matches
                what you pictured. That’s how we keep quality high and surprises
                low.
              </p>
              <ul className="mt-8 space-y-4">
                {promises.map(([title, text]) => (
                  <li key={title} className="border-l-2 border-pastel-sky/70 pl-4">
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm text-white/60">{text}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal
              delay={0.06}
              className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] lg:col-span-6"
            >
              <Image
                src="/images/home/how-it-works-mockup.jpg"
                alt="Reviewing a custom hat mockup before production"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-section-title text-ink">
              What helps before you start
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              You don’t need a perfect brief — but these four things make the
              first mockup sharper.
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {beforeYouStart.map((item, i) => (
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
          <p className="mt-8 text-sm text-ink-soft">
            Prefer to browse first?{" "}
            <Link
              href="/shop"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              Shop blanks
            </Link>{" "}
            or{" "}
            <Link
              href="/decorations"
              className="font-semibold text-pastel-link underline-offset-4 hover:underline"
            >
              compare decoration finishes
            </Link>
            .
          </p>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 className="text-section-title text-ink">Timing & shipping</h2>
            <p className="mt-3 text-base text-ink-soft">
              Exact dates depend on quantity and finish — we’ll lock a timeline
              with your mockup approval.
            </p>
          </Reveal>
          <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-2">
            {timelines.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 0.04}
                className="rounded-[14px] border border-[#e8eef4] bg-canvas p-6"
              >
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.text}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <PageCTA
        title="Ready when you are."
        description="Start an order in a few minutes — mockup first, then we produce and ship."
        secondaryHref="/decorations"
        secondaryLabel="Choose a finish"
      />
    </>
  );
}
