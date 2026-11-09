import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const highlights = [
  {
    label: "15+ years",
    text: "Hands-on in custom goods — we know what holds up and what ships on time.",
  },
  {
    label: "Local team",
    text: "A real shop you can reach. Questions go to people who work the orders.",
  },
  {
    label: "Our mission",
    text: "Help more people get quality custom hats without the wait or the runaround.",
  },
] as const;

const pillars = [
  {
    title: "Quality you can feel",
    text: "Solid blanks, clean decoration, and a final check before anything leaves the shop.",
  },
  {
    title: "Clear before we stitch",
    text: "You approve a digital mockup and a fair price first — no surprises on delivery day.",
  },
  {
    title: "Timelines that respect yours",
    text: "Fast turnarounds when you need them, with tracking once your order ships.",
  },
] as const;

export function WhyPlusOne() {
  return (
    <section
      className="relative overflow-hidden bg-sand py-20 md:py-28"
      aria-labelledby="why-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(164,216,255,0.22),transparent)]"
      />

      <Container className="relative">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="text-eyebrow text-ink">Why Plus One Caps</p>
            <h2 id="why-heading" className="mt-3 text-section-title text-ink">
              A local shop with years behind every order.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              We&apos;re a local business built on more than 15 years in the custom
              goods industry. Our biggest mission is simple: help people get
              access to quality headwear in a timely manner — without the
              guesswork, the delays, or the one-size-fits-none catalog experience.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
              Whether you&apos;re ordering one hat or building a full program, we
              walk you through style, decoration, and proofing so what shows up
              matches what you pictured. Real people. Clear communication. Hats
              made to be worn.
            </p>

            <dl className="mt-10 grid gap-6 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label}>
                  <dt className="text-sm font-bold uppercase tracking-[0.1em] text-ink">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.text}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/about" variant="primary" size="lg">
                Our story
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Talk to the team
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] sm:aspect-[5/6] lg:aspect-auto lg:min-h-[560px]">
              <Image
                src="/images/home/about-facility.jpg"
                alt="Inside the Plus One Caps shop"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-center"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
              />
              <p className="absolute bottom-6 left-6 right-6 text-sm font-medium leading-snug text-white md:text-base">
                Quality goods, on time — that&apos;s the standard we hold every
                order to.
              </p>
            </div>
          </Reveal>
        </div>

        <ul className="mt-16 grid list-none gap-8 border-t border-border p-0 pt-12 md:grid-cols-3 md:gap-10">
          {pillars.map((pillar, index) => (
            <Reveal as="li" key={pillar.title} delay={0.05 + index * 0.06}>
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-ink/45">
                0{index + 1}
              </p>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {pillar.text}
              </p>
            </Reveal>
          ))}
        </ul>

        <p className="mt-10 text-sm text-ink-soft">
          Want the full picture?{" "}
          <Link
            href="/about"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            Read more about us
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
