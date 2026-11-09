export const siteConfig = {
  name: "Plus One Caps",
  tagline: "Custom headwear, simplified.",
  description:
    "Custom hats from a local shop with 15+ years in custom goods. Embroidery, leather, PVC, or screen print — mockup first, blank + decoration pricing, free shipping on 24+.",
  email: "info@plusonecaps.com",
  phone: "(951) 696-0008",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://plusonecaps.com",
};

export const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Decorations", href: "/decorations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export type PrimaryNavChild = {
  title: string;
  href: string;
  blurb?: string;
};

export type PrimaryNavItem = {
  id: string;
  title: string;
  href?: string;
  mega?: "shop" | "list";
  blurb?: string;
  children?: PrimaryNavChild[];
};

/** Desktop bottom nav — Blanks-style triggers + megas, Caps IA. */
export const primaryNav: PrimaryNavItem[] = [
  {
    id: "shop",
    title: "Shop Hats",
    href: "/shop",
    mega: "shop",
    blurb: "Browse blank headwear or jump into the full catalog.",
  },
  {
    id: "decorations",
    title: "Decorations",
    href: "/decorations",
    mega: "list",
    blurb: "Finish options for every brand look.",
    children: [
      {
        title: "Embroidery",
        href: "/decorations/embroidery",
        blurb: "Stitched right into the hat",
      },
      {
        title: "Leather patch",
        href: "/decorations/leather-patch",
        blurb: "Laser engraved, +$2 · 12 min",
      },
      {
        title: "PVC patch",
        href: "/decorations/pvc-patch",
        blurb: "Die-cut soft PVC, +$5 · 48 min",
      },
      {
        title: "Screen print",
        href: "/decorations/screenprint",
        blurb: "Flat ink for graphic art",
      },
      {
        title: "Compare all finishes",
        href: "/decorations",
        blurb: "Side-by-side overview",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    href: "/pricing",
  },
  {
    id: "process",
    title: "Process",
    href: "/process",
  },
  {
    id: "support",
    title: "Support",
    mega: "list",
    blurb: "Talk to a hat expert anytime.",
    children: [
      {
        title: "Contact",
        href: "/contact",
        blurb: "Email the Plus One Caps team",
      },
      {
        title: "About",
        href: "/about",
        blurb: "Who we are and how we make hats",
      },
      {
        title: "Call a hat expert",
        href: "tel:+19516960008",
        blurb: "(951) 696-0008",
      },
    ],
  },
];

/** Homepage social proof — production scale & reviews. */
export const trustStats = [
  {
    value: "100K+",
    label: "Hats made & shipped",
  },
  {
    value: "500+",
    label: "Five-star reviews",
  },
  {
    value: "1+",
    label: "Hat minimum — start small",
  },
  {
    value: "Easy",
    label: "Clean reorders, same specs",
  },
];

export const trustItems = [
  {
    title: "Mockup first",
    text: "Nothing is produced until you approve the digital proof.",
  },
  {
    title: "Four finishes",
    text: "Embroidery, leather patch, PVC patch, or screen print.",
  },
  {
    title: "Blank + decoration pricing",
    text: "One clear number by quantity — not blank-only bait.",
  },
  {
    title: "Simple reorders",
    text: "Same specs next time, without starting from scratch.",
  },
];

/** Homepage process — three clear beats like Tapacho, with more operational clarity. */
export const howItWorksSteps = [
  {
    step: "01",
    title: "Design your order",
    description:
      "Pick a style, decoration, and quantity — one hat or a full run. Upload your art and you’re set.",
  },
  {
    step: "02",
    title: "Approve the mockup",
    description:
      "We send a digital preview before anything is made. Revise until it looks exactly right.",
  },
  {
    step: "03",
    title: "We produce & ship",
    description:
      "Production starts only after you approve. Hats are checked, packed, and shipped with tracking.",
  },
];

export const decorationShowcase = [
  {
    id: "embroidery",
    name: "Embroidery",
    line: "Raised thread stitched into the panel — the classic custom-hat finish.",
    bestFor: "Clean logos, text, and 1–6 color marks",
    image: "/images/home/deco-compare-embroidery.jpg?v=2",
    body: "Thread is punched into the crown so your mark sits in the fabric — not on top of it. It reads premium up close, washes clean, and holds up through real wear. Most brands start here.",
    details: [
      "No order minimum — start with one hat or a full run",
      "Front, side, and back placements available",
      "Best with vector art (AI, EPS, PDF, or SVG)",
      "Typical production after mockup approval: about 1–2 weeks",
    ],
    artwork:
      "Send vector files when you can. PNG/JPG works for a first pass — we’ll digitize for stitch and send a mockup before anything is made.",
  },
  {
    id: "leather-patch",
    name: "Leather patch",
    line: "Debossed or printed leather badge sewn on for a premium heritage look.",
    bestFor: "Breweries, outdoor, and elevated street brands",
    image: "/images/home/deco-compare-leather.jpg?v=2",
    body: "A leather (or synthetic leather) badge is laser-engraved or printed, then sewn onto the front panel. It gives depth, texture, and a heritage feel that embroidery alone can’t match.",
    details: [
      "12-hat minimum",
      "About +$2 per hat vs embroidery",
      "Great for fine linework and monograms",
      "Water-resistant synthetic leather options available",
    ],
    artwork:
      "High-contrast logos with clear edges digitize cleanest. We’ll show patch shape and placement on your mockup before production.",
  },
  {
    id: "pvc-patch",
    name: "PVC patch",
    line: "Soft rubber with crisp edges and bold color that holds up outdoors.",
    bestFor: "Detailed art and weather-ready merch",
    image: "/images/home/deco-compare-pvc.jpg?v=2",
    body: "Soft PVC is molded and die-cut to your logo shape — bold color, raised detail, and outdoor durability. Ideal when you want a patch that feels like a product, not just a print.",
    details: [
      "48-hat minimum",
      "About +$5 per hat vs embroidery",
      "Die-cut to your art for a custom silhouette",
      "Longer lead time — typically 3–4 weeks after approval",
    ],
    artwork:
      "Full-color art and multi-layer logos work well. We’ll confirm color matches and patch size on the mockup before the mold moves forward.",
  },
  {
    id: "screenprint",
    name: "Screen print",
    line: "Flat, vibrant ink on the front panel — great for big, graphic artwork.",
    bestFor: "Large graphics and simple color builds",
    image: "/images/home/deco-compare-screenprint.jpg?v=2",
    body: "Ink is pressed flat onto the panel for a graphic, poster-like look. It’s a strong choice for bold illustrations, wordmarks, and designs that want area coverage more than stitch texture.",
    details: [
      "Best for larger front-panel graphics",
      "Clean color fills and simple builds",
      "Pairs well with truckers and snapbacks",
      "Ask us if your art needs a hybrid with embroidery",
    ],
    artwork:
      "Vector or high-res art with solid color areas prints cleanest. Gradients and tiny type may need a different finish — we’ll recommend on review.",
  },
];

export const decorationLabels: Record<string, string> = Object.fromEntries(
  decorationShowcase.map((d) => [d.id, d.name]),
);

/** Homepage + Shop Hats mega — hrefs match admin collection slugs. */
export const silhouettes = [
  {
    id: "truckers",
    name: "Truckers",
    blurb: "Mesh back, structured front — the everyday blank.",
    href: "/collections/truckers",
    image: "/images/home/blank-trucker.jpg?v=4",
  },
  {
    id: "snapbacks",
    name: "Snapbacks",
    blurb: "Flat bill, rear snap adjuster — lifestyle ready.",
    href: "/collections/snapbacks",
    image: "/images/home/blank-snapback.jpg?v=4",
  },
  {
    id: "fitted",
    name: "Fitted",
    blurb: "Closed back, sized crown — clean athletic blank.",
    href: "/collections/fitted",
    image: "/images/home/blank-fitted.jpg?v=1",
  },
  {
    id: "beanies",
    name: "Beanies",
    blurb: "Cuffed knit blank for cold days and simple logos.",
    href: "/collections/beanies",
    image: "/images/home/blank-beanie.jpg?v=1",
  },
  {
    id: "dad-caps",
    name: "Dad caps",
    blurb: "Unstructured, low-profile — easy everyday wear.",
    href: "/collections/dad-caps",
    image: "/images/home/blank-trucker.jpg?v=4",
  },
];

/**
 * Pricing model aligned with HatLaunch Order flow:
 * all-in blank + decoration, qty breaks, decoration method deltas.
 * Exact dollars still vary by blank style in the order wizard.
 */
export type PricingMethodId =
  | "embroidery"
  | "leather-patch"
  | "pvc-patch"
  | "screenprint";

/** Qty labels shared across decoration methods */
export const pricingQtyLabels = [
  "1+",
  "12+",
  "24+",
  "48+",
  "96+",
  "144+",
  "288+",
  "432+",
] as const;

/** null = not available at that break (PVC under 48) */
export const pricingByMethod: Record<
  PricingMethodId,
  { qty: (typeof pricingQtyLabels)[number]; price: number | null }[]
> = {
  embroidery: [
    { qty: "1+", price: 26 },
    { qty: "12+", price: 22 },
    { qty: "24+", price: 20 },
    { qty: "48+", price: 19 },
    { qty: "96+", price: 18 },
    { qty: "144+", price: 17 },
    { qty: "288+", price: 15 },
    { qty: "432+", price: 13 },
  ],
  "leather-patch": [
    { qty: "1+", price: null },
    { qty: "12+", price: 24 },
    { qty: "24+", price: 22 },
    { qty: "48+", price: 21 },
    { qty: "96+", price: 20 },
    { qty: "144+", price: 19 },
    { qty: "288+", price: 17 },
    { qty: "432+", price: 15 },
  ],
  "pvc-patch": [
    { qty: "1+", price: null },
    { qty: "12+", price: null },
    { qty: "24+", price: null },
    { qty: "48+", price: 24 },
    { qty: "96+", price: 23 },
    { qty: "144+", price: 22 },
    { qty: "288+", price: 20 },
    { qty: "432+", price: 18 },
  ],
  screenprint: [
    { qty: "1+", price: 26 },
    { qty: "12+", price: 22 },
    { qty: "24+", price: 20 },
    { qty: "48+", price: 19 },
    { qty: "96+", price: 18 },
    { qty: "144+", price: 17 },
    { qty: "288+", price: 15 },
    { qty: "432+", price: 13 },
  ],
};

/** @deprecated use pricingByMethod.embroidery */
export const pricingQtyBreaks = pricingByMethod.embroidery;

export const pricingDecorationMethods: {
  id: PricingMethodId;
  name: string;
  badge: string;
  delta: string;
  summary: string;
  notes: string[];
  image: string;
  minQty?: number;
}[] = [
  {
    id: "embroidery",
    name: "Embroidery",
    badge: "Most popular",
    delta: "Baseline pricing",
    summary: "Logo stitched into the hat — classic finish that lasts.",
    notes: ["No minimum", "Front, sides & back", "Vibrant thread colors"],
    image: "/images/home/deco-compare-embroidery.jpg?v=2",
  },
  {
    id: "leather-patch",
    name: "Leather patch",
    badge: "+$2 · 12 min",
    delta: "+$2 vs embroidery · 12-hat minimum",
    summary: "Laser-engraved leather patch — clean detail, premium feel.",
    notes: ["12-hat minimum", "Great for fine logos", "Water-resistant synthetic leather"],
    image: "/images/home/deco-compare-leather.jpg?v=2",
    minQty: 12,
  },
  {
    id: "pvc-patch",
    name: "PVC patch",
    badge: "+$5 · 48 min",
    delta: "+$5 vs embroidery · 48-hat minimum",
    summary: "Soft rubber, die-cut to your logo shape — bold and durable.",
    notes: ["48-hat minimum", "3–4 week turnaround", "Die-cut to your art"],
    image: "/images/home/deco-compare-pvc.jpg?v=2",
    minQty: 48,
  },
  {
    id: "screenprint",
    name: "Screen print",
    badge: "Graphic",
    delta: "Similar to embroidery · no minimum",
    summary: "Flat, vibrant ink — best for bold graphics and large coverage.",
    notes: ["No minimum", "Front & back", "Great for big artwork"],
    image: "/images/home/deco-compare-screenprint.jpg?v=2",
  },
];

/** @deprecated kept for process page references — prefer pricingQtyBreaks */
export const pricingTiers = [
  {
    id: "starter",
    name: "1+",
    range: "1 – 11 hats",
    priceFrom: 26,
    note: "Price includes blank + embroidery.",
    perks: ["No minimum", "Digital mockup", "Tracked shipping"],
  },
  {
    id: "team",
    name: "12+",
    range: "12 – 47 hats",
    priceFrom: 22,
    note: "Volume pricing kicks in; free shipping at 24+.",
    perks: ["Mix styles & colors", "Mockup before production", "Leather +$2 / hat"],
    featured: true,
  },
  {
    id: "bulk",
    name: "48+",
    range: "48 – 143 hats",
    priceFrom: 19,
    note: "PVC patch available at this quantity.",
    perks: ["Lower unit cost", "PVC unlocked", "Multi-location options"],
  },
  {
    id: "production",
    name: "144+",
    range: "144+ hats",
    priceFrom: 17,
    note: "Best unit cost for crews and programs.",
    perks: ["Lowest embroidery rates", "Clean reorders", "Program-ready packing"],
  },
];

export const processDetails = [
  {
    step: "01",
    title: "Build your order",
    description:
      "Pick hats, decoration, and placement, then upload artwork. About five minutes — no payment required to start.",
  },
  {
    step: "02",
    title: "Mockup & quote",
    description:
      "We convert your logo for production and send a preview with clear pricing. Nothing moves until you approve.",
  },
  {
    step: "03",
    title: "Production",
    description:
      "Your hats are decorated in-house standards, checked by hand, and packed for the road.",
  },
  {
    step: "04",
    title: "Ship",
    description:
      "Finished hats ship with tracking to your door, office, or event — on the timeline we confirmed.",
  },
];

export const umbrellaBrands: { name: string; href?: string; note: string }[] = [
  {
    name: "Plus One Promo",
    href: "https://plus1promo.com",
    note: "Promotional products, print, and gifts",
  },
  {
    name: "Plus One Blanks",
    href: "https://plusoneblanks.com",
    note: "Wholesale blank & decorated apparel",
  },
];

/** Homepage logo bar — drop logo files in /public/images/brands and set `logo`. */
export const partnerBrands: {
  name: string;
  logo?: string;
  href?: string;
}[] = [
  { name: "Brand one" },
  { name: "Brand two" },
  { name: "Brand three" },
  { name: "Brand four" },
  { name: "Brand five" },
  { name: "Brand six" },
  { name: "Brand seven" },
  { name: "Brand eight" },
];
