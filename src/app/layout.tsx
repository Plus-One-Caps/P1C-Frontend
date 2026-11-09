import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import { NavigationChrome } from "@/components/navigation/NavigationChrome";
import { siteConfig } from "@/data/site";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Custom Headwear Simplified`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Plus One Caps",
    "custom hats",
    "custom embroidered hats",
    "custom trucker hats",
    "custom snapbacks",
    "leather patch hats",
    "PVC patch hats",
    "screen printed hats",
    "custom beanies",
    "bulk custom hats",
  ],
  icons: {
    icon: [
      { url: "/p1-favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/p1-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/p1-favicon.png",
    apple: [{ url: "/p1-apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: `${siteConfig.name} | Custom Headwear Simplified`,
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: "/images/home/hero-caps.jpg", width: 1280, height: 720 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full min-h-dvh flex-col bg-background text-taupe">
        <NavigationChrome />
        {/* SiteShell owns Header/Footer and hides them on /checkout.
            overflow-x: clip avoids creating a scroll container (unlike hidden),
            which would break position:sticky on order summary and similar. */}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
