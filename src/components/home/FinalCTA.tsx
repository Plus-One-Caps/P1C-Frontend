"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative isolate overflow-hidden bg-canvas pb-20 pt-4 md:pb-28 md:pt-6"
      aria-labelledby="final-cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(164,216,255,0.32),transparent_58%)]"
      />

      <motion.div
        className="relative z-10 mb-10 md:mb-14"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandsMarquee />
      </motion.div>

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
            <p className="text-eyebrow text-pastel-link">When you&apos;re ready</p>
            <h2
              id="final-cta-heading"
              className="mt-3 text-section-title text-ink md:text-5xl"
            >
              Start your custom order.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
              Pick a blank, send your art, and we&apos;ll send a mockup before
              anything goes into production.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                href="/order"
                variant="primary"
                size="lg"
                className="w-full px-8 sm:w-auto"
              >
                Start custom order
              </Button>
              <Button
                href="/shop"
                variant="outline"
                size="lg"
                className="w-full px-8 sm:w-auto"
              >
                Browse hats
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
