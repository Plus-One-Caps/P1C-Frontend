import Link from "next/link";
import { siteConfig, navLinks } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const resourceLinks = [
  { label: "Embroidery", href: "/decorations/embroidery" },
  { label: "Leather patch", href: "/decorations/leather-patch" },
  { label: "PVC patch", href: "/decorations/pvc-patch" },
  { label: "Screen print", href: "/decorations/screenprint" },
  { label: "How it works", href: "/process" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-footer text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(164,216,255,0.18),transparent_55%)]"
        aria-hidden
      />
      <Container className="relative py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Logo variant="footer" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Local custom headwear with 15+ years behind every order. Mockup
              first, blank + decoration pricing, free shipping on 24+.
            </p>
            <Button href="/order" variant="sky" size="sm" className="mt-6">
              Start your order
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-eyebrow text-white/40">Explore</p>
              <ul className="mt-4 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-1.5 text-sm text-white/65 transition-colors hover:text-pastel-sky"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-eyebrow text-white/40">Finishes</p>
              <ul className="mt-4 space-y-1">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-1.5 text-sm text-white/65 transition-colors hover:text-pastel-sky"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-eyebrow text-white/40">Contact</p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="block break-all py-1.5 text-white/65 transition-colors hover:text-pastel-sky"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                    className="block py-1.5 text-white/65 transition-colors hover:text-pastel-sky"
                  >
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="block py-1.5 text-sm text-white/65 transition-colors hover:text-pastel-sky"
                  >
                    Contact form
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="block py-1.5 text-sm text-white/65 transition-colors hover:text-pastel-sky"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-center text-xs text-white/40 md:text-left">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="/faq" className="transition-colors hover:text-white/70">
              FAQ
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white/70">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white/70">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
