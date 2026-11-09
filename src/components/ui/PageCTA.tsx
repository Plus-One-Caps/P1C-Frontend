"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type Props = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  eyebrow?: string;
  /** Show the homepage brands carousel above the CTA card. Default true. */
  showBrands?: boolean;
};

/** Homepage-matching bottom block: brands marquee + white CTA card. */
export function PageCTA({
  title,
  description,
  primaryHref = "/order",
  primaryLabel = "Start your order",
  secondaryHref,
  secondaryLabel,
  eyebrow = "When you're ready",
  showBrands = true,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-canvas pb-20 pt-10 md:pb-28 md:pt-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(164,216,255,0.32),transparent_58%)]"
      />

      {showBrands ? (
        <motion.div
          className="mb-10 md:mb-14"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandsMarquee />
        </motion.div>
      ) : null}

      <Container className="relative">
        <motion.div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-[#e8eef4] bg-white px-6 py-12 text-center shadow-[0_24px_60px_-28px_rgba(15,23,42,0.14)] md:px-12 md:py-16"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-[rgba(164,216,255,0.45)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-8 h-48 w-48 rounded-full bg-[rgba(164,216,255,0.25)] blur-3xl"
          />

          <div className="relative">
            <p className="text-eyebrow text-pastel-link">{eyebrow}</p>
            <h2 className="mt-3 text-section-title text-ink md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
              {description}
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                href={primaryHref}
                variant="primary"
                size="lg"
                className="w-full px-8 sm:w-auto"
              >
                {primaryLabel}
              </Button>
              {secondaryHref && secondaryLabel ? (
                <Button
                  href={secondaryHref}
                  variant="outline"
                  size="lg"
                  className="w-full px-8 sm:w-auto"
                >
                  {secondaryLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
