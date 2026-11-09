"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const ease = [0.22, 1, 0.36, 1] as const;

const ROTATING_LINES = [
  "worth wearing.",
  "that lasts.",
  "for your brand.",
  "ready to ship.",
  "teams love.",
];

export function Hero() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section className="relative isolate min-h-[min(88vh,780px)] overflow-hidden bg-ink">
      <Image
        src="/images/home/hero-warehouse.jpg"
        alt="Plus One Caps embroidery production warehouse"
        fill
        priority
        quality={92}
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
      />

      <Container className="relative flex min-h-[min(88vh,780px)] items-center py-20 md:py-24">
        <div className="max-w-xl">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease }}
            className="text-display text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
          >
            Make a hat
            <span className="relative mt-1 block h-[1.15em] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ROTATING_LINES[index]}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease }}
                  className="absolute inset-x-0 top-0 whitespace-nowrap text-white"
                >
                  {ROTATING_LINES[index]}
                </motion.span>
              </AnimatePresence>
              <span className="invisible" aria-hidden>
                {ROTATING_LINES[0]}
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease, delay: 0.04 }}
            className="mt-5 max-w-md text-base leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] md:text-lg"
          >
            Pick a blank, choose embroidery or a patch, upload your art, and
            approve a mockup before we produce. Clean process. Clear pricing.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease, delay: 0.08 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
              Start your order
            </Button>
            <Button
              href="/shop"
              variant="outline"
              size="lg"
              className="w-full border-white bg-white text-ink-mid hover:border-white hover:bg-white hover:text-ink-mid sm:w-auto"
            >
              Browse hats
            </Button>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease, delay: 0.14 }}
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-white/75"
          >
            <span>No hat minimum</span>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <span>Mockup before production</span>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <span>Free shipping on 24+</span>
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
