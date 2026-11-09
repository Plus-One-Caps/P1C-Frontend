import type { Metadata } from "next";
import { PageHeader as PageHero } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name} — how we collect, use, and protect your information.`,
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

const sections: Array<{
  title: string;
  paragraphs: string[];
  bullets?: string[];
}> = [
  {
    title: "Who we are",
    paragraphs: [
      `${siteConfig.name} (“we,” “us,” or “our”) provides custom headwear: embroidered, patched, and screen printed hats. This Privacy Policy explains how we collect, use, share, and protect personal information when you visit ${siteConfig.url}, use our website features (including our order request tools and contact form), or otherwise interact with us online.`,
      "By using our website or submitting information to us, you agree to this Privacy Policy.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide directly and information collected automatically when you use our site.",
    ],
    bullets: [
      "Contact details: name, email address, phone number, and company name you submit.",
      "Order and quote details: product selections, quantities, sizes, decoration preferences, artwork or design files, shipping addresses, timelines, and special instructions.",
      "Communications: messages you send through contact forms, email, phone, or other channels.",
      "Technical and usage data: IP address, browser type, device information, pages viewed, referring URLs, and approximate location derived from IP, collected through cookies, pixels, and similar technologies.",
      "Advertising and analytics data: interactions with our ads and website that help us measure performance (for example, Meta Pixel / Facebook and Instagram advertising tools, when enabled).",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: ["We use personal information to:"],
    bullets: [
      "Respond to inquiries and prepare quotes.",
      "Process order requests, fulfill jobs, and communicate about production and delivery.",
      "Operate, secure, and improve our website and services.",
      "Measure marketing performance and show relevant ads (including on Meta platforms when you have interacted with our ads or site).",
      "Comply with legal obligations and protect our rights.",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We do not sell your personal information. We may share information with trusted service providers who help us run our business, such as hosting, email delivery, analytics, advertising platforms (including Meta), payment or fulfillment partners when applicable, and professional advisors — only as needed to provide our services.",
      "We may also disclose information if required by law, to protect safety or our rights, or in connection with a business transaction such as a merger or sale of assets.",
    ],
  },
  {
    title: "Cookies, pixels, and advertising",
    paragraphs: [
      "We and our partners may use cookies, pixels, and similar technologies to remember preferences, understand how the site is used, and measure or improve advertising. This may include Meta (Facebook/Instagram) pixels or related tools that help us understand ad performance and reach people who may be interested in our services.",
      "You can control cookies through your browser settings. Meta also provides ad preference and data controls in your Facebook or Instagram account settings. Disabling certain cookies may limit site functionality.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We retain personal information for as long as needed to provide our services, maintain business records (such as mockups and order history), resolve disputes, and meet legal or accounting requirements. When information is no longer needed, we take reasonable steps to delete or de-identify it.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures to protect personal information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, or obtain a copy of certain personal information, or to opt out of certain processing such as targeted advertising. To make a request, contact us using the details below. We may need to verify your identity before fulfilling a request.",
      "You may unsubscribe from marketing emails using the link in those messages. Transactional messages about quotes or orders may still be sent as needed to provide the service.",
    ],
  },
  {
    title: "Children’s privacy",
    paragraphs: [
      "Our website and services are directed to businesses and adults. We do not knowingly collect personal information from children under 13 (or under 16 where applicable). If you believe a child has provided us information, contact us and we will take appropriate steps to delete it.",
    ],
  },
  {
    title: "International visitors",
    paragraphs: [
      "Our website is operated from the United States. If you access the site from outside the U.S., your information may be processed in the United States or other countries where our service providers operate, which may have different data-protection laws than your country.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. The “Last updated” date at the bottom of this page will change when we do. Continued use of the site after an update means you accept the revised policy.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      `If you have questions about this Privacy Policy or how we handle personal information, contact ${siteConfig.name} at ${siteConfig.email} or ${siteConfig.phone}.`,
      `Website: ${siteConfig.url}`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How ${siteConfig.name} collects, uses, and protects your information.`}
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="prose-taupe mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-grey-olive md:text-base">
            <p>
              This Privacy Policy applies to {siteConfig.name} and the website
              at{" "}
              <a
                href={siteConfig.url}
                className="font-medium text-taupe underline-offset-2 hover:underline"
              >
                {siteConfig.url}
              </a>
              . It is intended to meet common website and advertising
              platform requirements, including Meta (Facebook / Instagram) app
              and advertising reporting.
            </p>

            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-taupe">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mt-2">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <div>
              <h2 className="text-lg font-semibold text-taupe">Contact</h2>
              <p className="mt-2">
                Questions about this policy? Email{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-medium text-taupe underline-offset-2 hover:underline"
                >
                  {siteConfig.email}
                </a>{" "}
                or call{" "}
                <a
                  href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                  className="font-medium text-taupe underline-offset-2 hover:underline"
                >
                  {siteConfig.phone}
                </a>
                .
              </p>
            </div>

            <p className="text-xs text-grey-olive">
              Last updated: October 20, 2026
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
