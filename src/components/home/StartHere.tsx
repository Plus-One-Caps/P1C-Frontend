"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

function IlluBlank({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy="78" rx="38" ry="6" fill="#a4d8ff" opacity="0.45" />
      <path
        d="M28 52c2-14 14-24 32-24s30 10 32 24v6H28v-6Z"
        fill="#fff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path
        d="M24 58h72c2 0 4 2 4 4.5S98 67 96 67H24c-2 0-4-2-4-4.5S22 58 24 58Z"
        fill="#a4d8ff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path
        d="M42 36c4-6 12-10 18-10s14 4 18 10"
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="40" r="3" fill="#0a0a0a" />
    </svg>
  );
}

function IlluFinish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy="80" rx="34" ry="5" fill="#a4d8ff" opacity="0.4" />
      <rect
        x="34"
        y="28"
        width="52"
        height="40"
        rx="8"
        fill="#fff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
      />
      <path
        d="M46 42h28M46 52h18"
        stroke="#a4d8ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M46 42h28M46 52h18"
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M78 22l8 8-22 22H56V44l22-22Z"
        fill="#a4d8ff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <circle cx="82" cy="26" r="2" fill="#0a0a0a" />
    </svg>
  );
}

function IlluPricing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy="80" rx="34" ry="5" fill="#a4d8ff" opacity="0.4" />
      <rect
        x="30"
        y="24"
        width="60"
        height="48"
        rx="10"
        fill="#fff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
      />
      <path
        d="M42 58V46M54 58V38M66 58V42M78 58V34"
        stroke="#a4d8ff"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M42 58V46M54 58V38M66 58V42M78 58V34"
        stroke="#0a0a0a"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <circle
        cx="84"
        cy="30"
        r="12"
        fill="#a4d8ff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
      />
      <path
        d="M84 24v12M80 28h8"
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IlluOrder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="60" cy="80" rx="34" ry="5" fill="#a4d8ff" opacity="0.4" />
      <rect
        x="28"
        y="22"
        width="64"
        height="46"
        rx="8"
        fill="#fff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
      />
      <rect x="34" y="28" width="52" height="28" rx="4" fill="#eef6fc" />
      <path
        d="M48 42l8 8 16-16"
        stroke="#0a0a0a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 62h40"
        stroke="#a4d8ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="78"
        cy="58"
        r="14"
        fill="#a4d8ff"
        stroke="#0a0a0a"
        strokeWidth="2.25"
      />
      <path
        d="M78 52v12M72 58h12"
        stroke="#0a0a0a"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

const steps = [
  {
    n: "01",
    title: "Pick a blank",
    text: "Trucker, snapback, fitted, or beanie — start with the silhouette that fits your brand.",
    href: "/shop",
    Illu: IlluBlank,
  },
  {
    n: "02",
    title: "Choose a finish",
    text: "Embroidery, leather, PVC, or screen print — each finish has its own look and minimum.",
    href: "/decorations",
    Illu: IlluFinish,
  },
  {
    n: "03",
    title: "Check pricing",
    text: "Blank + decoration by quantity. One clear number before you commit.",
    href: "/pricing",
    Illu: IlluPricing,
  },
  {
    n: "04",
    title: "Start your order",
    text: "Upload art, checkout, then approve the mockup before anything is made.",
    href: "/order",
    Illu: IlluOrder,
  },
] as const;

/** Compact path for first-time visitors — ties the info architecture together. */
export function StartHere() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-canvas py-16 md:py-20"
      aria-label="How to get started"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(164,216,255,0.28),transparent_58%)]"
        aria-hidden
      />

      <Container className="relative">
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-eyebrow text-pastel-link">New here?</p>
            <h2 className="mt-3 text-section-title text-ink">
              Four clear stops
              <span className="block text-ink-soft">before you order.</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
              A simple path from blank to brand — no guessing what comes next.
            </p>
          </div>
          <Link
            href="/process"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-pastel-link no-underline hover:text-ink"
          >
            Or read the full process
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Reveal>

        <ol className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 0.05}>
              <Link
                href={step.href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-[#e8eef4] bg-white text-ink no-underline",
                  "shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-[transform,box-shadow,border-color] duration-200",
                  "hover:-translate-y-0.5 hover:border-[#d1d5db] hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]",
                )}
              >
                <div className="relative flex h-[7.5rem] items-center justify-center bg-[#eef6fc]">
                  <step.Illu className="h-[5.25rem] w-auto transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-4 top-4 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-ink px-2 text-[0.8125rem] font-bold tabular-nums text-white">
                    {step.n}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-base font-bold tracking-tight md:text-lg">
                    {step.title}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {step.text}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pastel-link">
                    Go
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
