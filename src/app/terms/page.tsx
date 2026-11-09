import type { Metadata } from "next";
import { PageHeader as PageHero } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Terms governing use of the Plus One Caps website and services."
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="prose-taupe mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-grey-olive md:text-base">
            <p>
              By using the {siteConfig.name} website, you agree to these terms.
              If you do not agree, please do not use this site.
            </p>
            <div>
              <h2 className="text-lg font-semibold text-taupe">Services</h2>
              <p className="mt-2">
                {siteConfig.name} provides custom embroidered, patched, and
                screen printed headwear. Mockups, timelines, and pricing are
                confirmed with you before production begins.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-taupe">
                Website content
              </h2>
              <p className="mt-2">
                Content on this site is provided for general information. We
                reserve the right to update product offerings, pricing, and
                site content at any time without notice.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-taupe">Contact</h2>
              <p className="mt-2">
                For questions about these terms, contact{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-medium text-taupe underline-offset-2 hover:underline"
                >
                  {siteConfig.email}
                </a>
                .
              </p>
            </div>
            <p className="text-xs text-grey-olive">
              Last updated: July 2026
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
