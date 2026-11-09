import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageCTA } from "@/components/ui/PageCTA";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about custom hats? Contact Plus One Caps about embroidery, patches, screen print, quantities, and timing.",
};

const info = [
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\D/g, "")}`,
  },
  { icon: Clock, label: "Reply time", value: "Within 1 business day" },
];

const helpfulLinks = [
  {
    title: "Process",
    text: "See mockup, production, and shipping steps.",
    href: "/process",
  },
  {
    title: "Decorations",
    text: "Compare embroidery, leather, PVC, and print.",
    href: "/decorations",
  },
  {
    title: "Pricing",
    text: "Blank + decoration rates by quantity.",
    href: "/pricing",
  },
];

const faqs = [
  {
    q: "Should I contact you or just start an order?",
    a: "If you already know the blank, finish, and quantity, start an order — we’ll mock it up before production. If you’re unsure about art, timeline, or which finish fits, send a note here and we’ll help you choose.",
  },
  {
    q: "What should I include in my message?",
    a: "Hat style (if you have one), rough quantity, decoration preference, deadline or event date, and your artwork if you have it. Even a rough brief is enough to get started.",
  },
  {
    q: "How fast do you reply?",
    a: "We aim to reply within one business day. Urgent event dates? Call us — a hat expert can usually help faster by phone.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to a real person."
        description="Questions about art, quantities, finishes, or timing? Ask here. Already know what you want? Start your order and we’ll take it from the mockup."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/order" variant="primary" size="lg">
            Start your order
          </Button>
          <a
            href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink-mid bg-white px-7 py-3 text-[0.8125rem] font-semibold text-ink-mid no-underline transition hover:border-[#454a4e] hover:bg-[#454a4e] hover:text-white"
          >
            Call {siteConfig.phone}
          </a>
        </div>
      </PageHeader>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <aside className="space-y-8 lg:col-span-4">
              {info.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <item.icon
                    size={20}
                    className="mt-0.5 text-ink"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-eyebrow text-ink-soft">{item.label}</p>
                    {"href" in item && item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm font-semibold text-ink hover:text-pastel-link"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <p className="border-l-2 border-ink pl-4 text-sm leading-relaxed text-ink-soft">
                Helpful to include: hat style, rough quantity, decoration type,
                deadline, and a link or file for your art.
              </p>

              <div>
                <p className="text-eyebrow text-ink-soft">Browse first</p>
                <ul className="mt-3 space-y-3">
                  {helpfulLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group block rounded-[12px] border border-[#e8eef4] bg-canvas px-4 py-3 no-underline transition hover:border-[#d1d5db] hover:bg-white"
                      >
                        <span className="text-sm font-bold text-ink group-hover:text-pastel-link">
                          {link.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {link.text}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="lg:col-span-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-canvas py-14 md:py-20">
        <Container>
          <Reveal>
            <h2 className="text-section-title text-ink">Before you write</h2>
          </Reveal>
          <Reveal delay={0.04} className="mt-8 md:mt-10">
            <FaqAccordion items={faqs} />
          </Reveal>
        </Container>
      </section>

      <PageCTA
        title="Ready to skip the back-and-forth?"
        description="Start an order with your blank and finish — we’ll send a mockup and quote before production."
        secondaryHref="/shop"
        secondaryLabel="Browse blanks"
      />
    </>
  );
}
