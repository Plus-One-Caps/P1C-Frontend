export type DecorationServiceId =
  | "embroidery"
  | "leather-patch"
  | "pvc-patch"
  | "screenprint";

export type DecorationService = {
  id: DecorationServiceId;
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  headline: string;
  lede: string;
  image: string;
  orderMethod: string;
  highlights: { label: string; value: string }[];
  optionsTitle: string;
  optionsLede: string;
  options: { title: string; text: string }[];
  whyTitle: string;
  whyLede: string;
  why: { title: string; text: string }[];
  processTitle: string;
  process: { step: string; title: string; text: string }[];
  artworkTitle: string;
  artworkLede: string;
  artworkPoints: string[];
  specs: { label: string; value: string }[];
  bestForTitle: string;
  bestFor: string[];
  industries: string[];
  faqs: { q: string; a: string }[];
  compareBlurb: string;
  metaDescription: string;
};

export const decorationServices: DecorationService[] = [
  {
    id: "embroidery",
    slug: "embroidery",
    name: "Embroidery",
    shortName: "Embroidery",
    eyebrow: "Our most popular finish",
    headline: "Custom embroidery, stitched to last.",
    lede: "Your logo stitched into the hat — not printed on top of it. We digitize your art for clean stitch paths, send a mockup before anything is made, and run production so the mark looks sharp on day one and still looks right after real wear. Flat or dimensional looks, front / side / back placements, and no order minimum.",
    image: "/images/home/deco-compare-embroidery.jpg?v=2",
    orderMethod: "embroidery",
    highlights: [
      { label: "Minimum", value: "None — order 1 or 1,000" },
      { label: "Look", value: "Flat or raised stitch detail" },
      { label: "Mockup", value: "Approve before we stitch" },
      { label: "Pricing", value: "Baseline chart rate" },
    ],
    optionsTitle: "Flat stitch, raised detail, front, sides, and back",
    optionsLede:
      "Embroidery isn’t one look. Tell us how you want the brand to sit on the crown — we’ll recommend the stitch approach on your mockup.",
    options: [
      {
        title: "Flat embroidery",
        text: "Smooth, precise stitching for logos and type that need clarity. Ideal for detailed marks, fine lettering, and a clean professional finish that sits flush with the panel.",
      },
      {
        title: "Raised / dimensional stitch",
        text: "More height and presence for bold wordmarks and simple icons. The raised texture catches light and reads strong from a few feet away — without looking cartoonish when digitized well.",
      },
      {
        title: "Front, side, and back",
        text: "Lead with the front panel, then add supporting marks on the sides or back. Extra locations add to the per-hat rate — we’ll show that clearly on your quote with the mockup.",
      },
      {
        title: "Thread color matching",
        text: "We match to standard embroidery thread charts as closely as possible. Bring Pantone references when brand color is critical — we’ll note closest thread matches on the proof.",
      },
    ],
    whyTitle: "Why embroidery still wins for most brands",
    whyLede:
      "It’s the finish people expect on a quality custom hat: textured, durable, and clearly “made,” not stuck on.",
    why: [
      {
        title: "It lives in the fabric",
        text: "Stitches lock into the crown, so the logo moves with the hat instead of peeling or cracking like some surface decorations can over time.",
      },
      {
        title: "Mockup before production",
        text: "You see placement, scale, and stitch intent digitally first. Nothing goes to the machines until you approve.",
      },
      {
        title: "Works from one hat up",
        text: "No minimum means you can sample a style, kit a small team, or scale a program without changing finishes mid-stream.",
      },
      {
        title: "Pairs with almost any blank",
        text: "Trucker, snapback, fitted, beanie — embroidery is the most flexible finish across the catalog.",
      },
    ],
    processTitle: "From logo to stitched hats",
    process: [
      {
        step: "01",
        title: "Place your order",
        text: "Pick blanks, colors, and quantity. Upload your logo and choose embroidery as the finish.",
      },
      {
        step: "02",
        title: "We digitize & mock up",
        text: "Art is prepared for stitch. You get a digital mockup with placement and pricing before anything is made.",
      },
      {
        step: "03",
        title: "You approve",
        text: "Request tweaks until the proof looks right. Production starts only after you say go.",
      },
      {
        step: "04",
        title: "We stitch, check, and ship",
        text: "Hats are decorated, hand-checked, packed, and shipped with tracking — free shipping on 24+.",
      },
    ],
    artworkTitle: "Artwork that stitches clean",
    artworkLede:
      "Good embroidery starts with art that’s ready to become stitch — not a stretched screenshot.",
    artworkPoints: [
      "Vector files (AI, EPS, PDF, SVG) digitize cleanest and keep edges sharp.",
      "PNG/JPG works for a first pass if resolution is high — we’ll rebuild for stitch when needed.",
      "Avoid tiny type under ~5mm and hairline details that won’t hold as thread.",
      "Limit ultra-complex gradients; solid shapes and clear contrast usually look better embroidered.",
      "Tell us if you need flat vs raised stitch — we’ll recommend based on the mark.",
    ],
    specs: [
      { label: "Minimum", value: "No minimum" },
      { label: "Typical lead time", value: "About 1–2 weeks after mockup approval" },
      { label: "Placements", value: "Front, sides, back" },
      { label: "Best file types", value: "AI, EPS, PDF, SVG (PNG/JPG OK to start)" },
      { label: "Pricing note", value: "Baseline blank + decoration rate on /pricing" },
      { label: "Shipping", value: "Free on 24+ hats" },
    ],
    bestForTitle: "Best for",
    bestFor: [
      "Brand logos and wordmarks",
      "Team and company hats",
      "Merch drops that need a classic premium feel",
      "Orders of any size, including single samples",
      "Multi-placement programs (front + side / back)",
    ],
    industries: [
      "Corporate & teams",
      "Breweries & hospitality",
      "Outdoor & lifestyle",
      "Events & venues",
      "Trades & workforce",
      "Athletics & clubs",
    ],
    faqs: [
      {
        q: "Do you offer 3D puff embroidery?",
        a: "We can discuss raised / dimensional stitch for bold marks. Not every logo is a good puff candidate — we’ll recommend flat vs raised on your mockup so the result looks intentional.",
      },
      {
        q: "How many thread colors can I use?",
        a: "Most logos land cleanly in a handful of colors. Complex multi-color art still works; dense photo-like designs may look better as a patch. We’ll flag that on review.",
      },
      {
        q: "Can I embroider the back and sides?",
        a: "Yes. Extra locations are available and priced on your quote. Keep secondary marks simpler so the hat doesn’t feel crowded.",
      },
      {
        q: "What if my art isn’t a vector?",
        a: "Send the best file you have. We’ll digitize for production and show the stitch-ready mockup before anything is made.",
      },
    ],
    compareBlurb: "The default custom-hat finish — flexible, durable, no minimum.",
    metaDescription:
      "Custom embroidered hats with no minimum. Flat or raised stitch, front/side/back placement, digital mockup before production. Clear blank + decoration pricing.",
  },
  {
    id: "leather-patch",
    slug: "leather-patch",
    name: "Leather patch",
    shortName: "Leather patch",
    eyebrow: "Premium heritage finish",
    headline: "Leather patches with depth you can feel.",
    lede: "A leather or synthetic-leather badge — laser-engraved or printed, then sewn onto the crown — gives your hat a craft-led, elevated look embroidery alone can’t match. Fine linework stays crisp, edges feel intentional, and the patch reads premium in the hand and in photos. Built for brands that want texture, not just thread.",
    image: "/images/home/deco-compare-leather.jpg?v=2",
    orderMethod: "leather-patch",
    highlights: [
      { label: "Minimum", value: "12 hats" },
      { label: "Vs embroidery", value: "About +$2 per hat" },
      { label: "Look", value: "Engraved or printed badge" },
      { label: "Mockup", value: "Approve patch + placement first" },
    ],
    optionsTitle: "Patch style, shape, and placement",
    optionsLede:
      "Leather patches are a product on the hat — shape, contrast, and sew-down all matter. We’ll lock those on the mockup.",
    options: [
      {
        title: "Laser-engraved detail",
        text: "High-contrast engraving carves your mark into the patch surface. Excellent for monograms, crests, and line logos that need fine clarity.",
      },
      {
        title: "Printed leather looks",
        text: "When your brand needs color on the badge, printed approaches keep the leather feel while carrying more of the original art.",
      },
      {
        title: "Custom patch silhouette",
        text: "Rectangles, rounds, shields, and custom outlines are common. The silhouette should support the logo — not fight it.",
      },
      {
        title: "Sewn, not stuck",
        text: "Patches are sewn to the panel for a secure finish that belongs on a hat you’ll actually wear and wash through a season.",
      },
    ],
    whyTitle: "Why brands choose leather",
    whyLede:
      "Leather sits in a different category than stitch — it’s tactile merch that photographs rich and feels considered.",
    why: [
      {
        title: "Heritage texture",
        text: "The material itself signals craft — breweries, outdoor labels, and lifestyle brands use it to look established on day one.",
      },
      {
        title: "Fine detail holds",
        text: "Engraving keeps thin lines and small type clearer than dense embroidery fills in many cases.",
      },
      {
        title: "Mockup shows the real layout",
        text: "You approve patch size, shape, and placement digitally before we cut and sew.",
      },
      {
        title: "Weather-minded options",
        text: "Synthetic leather options help with moisture and everyday wear while keeping the premium badge look.",
      },
    ],
    processTitle: "From art to sewn patch",
    process: [
      {
        step: "01",
        title: "Build the order",
        text: "Choose blanks and set quantity to at least 12. Select leather patch and upload artwork.",
      },
      {
        step: "02",
        title: "Patch proof",
        text: "We prepare a mockup showing patch shape, engraving/print treatment, and placement on your hat.",
      },
      {
        step: "03",
        title: "Approve & produce",
        text: "After approval, patches are produced and sewn. We check sew quality before packing.",
      },
      {
        step: "04",
        title: "Ship with tracking",
        text: "Finished hats ship out on the timeline confirmed with your quote — free shipping on 24+.",
      },
    ],
    artworkTitle: "Artwork that engraves clean",
    artworkLede:
      "Leather loves contrast and decisive edges. Soft gray-on-gray logos lose detail.",
    artworkPoints: [
      "High-contrast black/white or single-color marks engrave cleanest.",
      "Vector art keeps curves and type sharp when we size the patch.",
      "Avoid ultra-thin strokes and tiny enclosed counters that can fill when engraved.",
      "If you need full-color brand art on the badge, tell us — we may recommend print-on-leather or another finish.",
      "Include preferred patch shape if you have one; otherwise we’ll propose a silhouette that fits the logo.",
    ],
    specs: [
      { label: "Minimum", value: "12 hats" },
      { label: "Price delta", value: "About +$2 vs embroidery" },
      { label: "Typical lead time", value: "About 1–2 weeks after approval (confirm on quote)" },
      { label: "Placement", value: "Primarily front panel" },
      { label: "Best file types", value: "AI, EPS, PDF, SVG, high-contrast PNG" },
      { label: "Shipping", value: "Free on 24+ hats" },
    ],
    bestForTitle: "Best for",
    bestFor: [
      "Breweries, coffee, and craft brands",
      "Outdoor and heritage lifestyle labels",
      "Monograms and crest-style marks",
      "Gifts and elevated merch kits",
      "Programs that want a tactile premium cue",
    ],
    industries: [
      "Breweries & beverage",
      "Outdoor & camping",
      "Hospitality",
      "Real estate & builders",
      "Retail & gift",
      "Clubs & memberships",
    ],
    faqs: [
      {
        q: "Is it real leather?",
        a: "We offer leather and durable synthetic-leather options depending on the program. We’ll note the material on your mockup/quote so you know exactly what you’re getting.",
      },
      {
        q: "Why is there a 12-hat minimum?",
        a: "Patch production and sew setup make sense starting at a dozen. Under 12, embroidery is usually the better path.",
      },
      {
        q: "Can leather go on the side or back?",
        a: "Front panel is the standard and strongest look. Ask us if you have a special placement — we’ll tell you what’s realistic for the blank.",
      },
      {
        q: "How does leather pricing compare?",
        a: "Plan on about $2 more per hat than embroidery at the same quantity break, with the 12-hat minimum. See the live chart on Pricing.",
      },
    ],
    compareBlurb: "Tactile, heritage-minded badges — +$2, 12-hat minimum.",
    metaDescription:
      "Custom leather patch hats with laser-engraved or printed badges. 12-hat minimum, about +$2 vs embroidery, mockup before production.",
  },
  {
    id: "pvc-patch",
    slug: "pvc-patch",
    name: "PVC patch",
    shortName: "PVC patch",
    eyebrow: "Bold outdoor-ready finish",
    headline: "PVC patches die-cut to your logo.",
    lede: "Soft PVC is molded with color and detail, then die-cut to your logo’s silhouette — a raised, durable badge that stands up to weather and wear. It’s the move when you want shape, color, and a product-like finish that reads loud on truckers and snapbacks. Built for programs that need presence, not a quiet stitch.",
    image: "/images/home/deco-compare-pvc.jpg?v=2",
    orderMethod: "pvc-patch",
    highlights: [
      { label: "Minimum", value: "48 hats" },
      { label: "Vs embroidery", value: "About +$5 per hat" },
      { label: "Look", value: "Die-cut soft rubber badge" },
      { label: "Lead time", value: "Typically 3–4 weeks after approval" },
    ],
    optionsTitle: "Color, cut, and dimension",
    optionsLede:
      "PVC is closer to manufacturing a small rubber product than printing a logo. That unlocks shape and durability — and needs a clear art plan.",
    options: [
      {
        title: "Die-cut to your art",
        text: "The patch outline follows your logo. Custom silhouettes make the badge feel proprietary — not a generic rectangle.",
      },
      {
        title: "Multi-color builds",
        text: "Layered color and raised edges give depth. Great for bold brand systems and illustrated marks.",
      },
      {
        title: "Outdoor durability",
        text: "Soft PVC handles sun, sweat, and weather better than many surface prints — a favorite for field teams and outdoor merch.",
      },
      {
        title: "Sewn attachment",
        text: "Patches are secured to the hat so they stay put through real use, not just the unboxing photo.",
      },
    ],
    whyTitle: "Why PVC earns the premium",
    whyLede:
      "You’re paying for a custom-shaped, molded badge — that’s different work than stitching thread.",
    why: [
      {
        title: "Shape is part of the brand",
        text: "Die-cutting lets the logo’s outline become the patch. That alone can make merch feel more “designed.”",
      },
      {
        title: "Color that holds up",
        text: "Molded color and raised detail stay vivid on hats that live in trucks, jobsites, and weekend bags.",
      },
      {
        title: "Mockup before mold",
        text: "You approve size, colors, and placement before we commit to production tooling for the run.",
      },
      {
        title: "Built for bigger runs",
        text: "The 48-hat minimum matches how PVC is made efficiently — and unlocks stronger unit economics at volume.",
      },
    ],
    processTitle: "From art to molded patch",
    process: [
      {
        step: "01",
        title: "Plan the run",
        text: "Set quantity to 48+. Choose blanks and PVC patch, then upload final-ish artwork.",
      },
      {
        step: "02",
        title: "Detailed mockup",
        text: "We confirm patch size, die-cut shape, colors, and hat placement with pricing and timeline.",
      },
      {
        step: "03",
        title: "Produce the patches",
        text: "After approval, PVC is produced and applied. This step takes longer than embroidery — we set expectations up front.",
      },
      {
        step: "04",
        title: "QC and ship",
        text: "Hats are checked, packed, and shipped with tracking. Free shipping still applies at 24+ (and you’re already above that).",
      },
    ],
    artworkTitle: "Artwork that molds well",
    artworkLede:
      "PVC rewards decisive shapes and intentional color breaks. Muddy low-contrast art gets muddy patches.",
    artworkPoints: [
      "Vector art with clear closed shapes is ideal for die-cutting.",
      "Separate color areas cleanly — think layers, not soft airbrushed blends.",
      "Extremely fine text may need to grow or simplify for a clean mold.",
      "Spot Pantone or brand hex references help us align color expectations.",
      "If your art is photographic or ultra-detailed, ask us early — we may suggest embroidery or a simplified PVC version.",
    ],
    specs: [
      { label: "Minimum", value: "48 hats" },
      { label: "Price delta", value: "About +$5 vs embroidery" },
      { label: "Typical lead time", value: "About 3–4 weeks after approval" },
      { label: "Placement", value: "Primarily front panel" },
      { label: "Best file types", value: "AI, EPS, PDF, SVG with clear color breaks" },
      { label: "Shipping", value: "Free on 24+ (standard at this minimum)" },
    ],
    bestForTitle: "Best for",
    bestFor: [
      "Outdoor, workwear, and field brands",
      "Bold multi-color logos",
      "Programs that want a custom-cut silhouette",
      "Larger merch runs (48+)",
      "Hats that need to handle weather and wear",
    ],
    industries: [
      "Construction & trades",
      "Outdoor & hunting",
      "Motorsports",
      "Municipal & workforce",
      "Festivals & venues",
      "Action sports",
    ],
    faqs: [
      {
        q: "Why 48 hats minimum?",
        a: "PVC involves molding and die-cutting that aren’t efficient at tiny quantities. Under 48, embroidery or leather is usually the better fit.",
      },
      {
        q: "Why does PVC take longer?",
        a: "You’re waiting on custom patch production, not just stitch time. We quote a realistic window on your mockup so planning stays honest.",
      },
      {
        q: "Can PVC match my brand colors exactly?",
        a: "We get very close and confirm on the proof. Absolute laboratory matches can vary by material — we’ll call out anything material-sensitive.",
      },
      {
        q: "How much more is PVC than embroidery?",
        a: "About $5 more per hat at the same quantity break, starting at 48. Check the live Pricing chart for the full ladder.",
      },
    ],
    compareBlurb: "Die-cut soft PVC — bold, durable, +$5, 48-hat minimum.",
    metaDescription:
      "Custom PVC patch hats die-cut to your logo. 48-hat minimum, about +$5 vs embroidery, mockup before production, outdoor-ready finish.",
  },
  {
    id: "screenprint",
    slug: "screenprint",
    name: "Screen print",
    shortName: "Screen print",
    eyebrow: "Graphic-forward finish",
    headline: "Screen print for bold, flat artwork.",
    lede: "Ink laid flat on the panel gives you poster-like color and coverage — ideal when the art is the hero. Big wordmarks, illustrations, and simple multi-color graphics often look cleaner as screen print than as a heavy stitch fill. It’s a sharp option for drops that want graphic impact on truckers and snapbacks.",
    image: "/images/home/deco-compare-screenprint.jpg?v=2",
    orderMethod: "screenprint",
    highlights: [
      { label: "Look", value: "Flat, vibrant ink" },
      { label: "Best art", value: "Bold graphics & solid fills" },
      { label: "Pairs with", value: "Truckers & snapbacks" },
      { label: "Mockup", value: "Approve before we print" },
    ],
    optionsTitle: "Coverage, color, and placement",
    optionsLede:
      "Screen print shines when the design wants area and clarity — not thread texture.",
    options: [
      {
        title: "Solid color builds",
        text: "Clean fills and decisive shapes print crisply. Perfect for bold logos and illustration with clear color breaks.",
      },
      {
        title: "Large front-panel graphics",
        text: "When the art needs width and presence across the crown, ink often reads cleaner than dense embroidery.",
      },
      {
        title: "Simple multi-color art",
        text: "Spot-color style designs work well. Soft gradients and tiny type may need simplification — we’ll advise on review.",
      },
      {
        title: "Hybrid programs",
        text: "Some brands print the main graphic and embroider a small secondary mark. Ask us if you want a mixed approach.",
      },
    ],
    whyTitle: "When ink beats stitch",
    whyLede:
      "Not every logo wants texture. Sometimes the brand is flat, loud, and graphic — that’s screen print territory.",
    why: [
      {
        title: "True graphic coverage",
        text: "Ink can fill shapes evenly without the “stitched polygon” look that heavy embroidery can create on large fills.",
      },
      {
        title: "Illustration-friendly",
        text: "Character art, posters, and campaign graphics often translate better to print than to thread.",
      },
      {
        title: "Clean mockup path",
        text: "Same Plus One Caps promise: see placement and sizing before production starts.",
      },
      {
        title: "Merch-drop energy",
        text: "Flat ink reads modern on lifestyle blanks — especially for music, street, and event merch.",
      },
    ],
    processTitle: "From art to printed hats",
    process: [
      {
        step: "01",
        title: "Choose blanks & upload art",
        text: "Pick styles and colors, select screen print, and send the cleanest art file you have.",
      },
      {
        step: "02",
        title: "Mockup & color plan",
        text: "We proof placement and discuss color expectations for the print method.",
      },
      {
        step: "03",
        title: "Approve, then print",
        text: "Production starts after approval. We keep an eye on registration and coverage quality.",
      },
      {
        step: "04",
        title: "Check and ship",
        text: "Hats are inspected, packed, and shipped with tracking — free shipping on 24+.",
      },
    ],
    artworkTitle: "Artwork that prints clean",
    artworkLede:
      "Screen print loves hard edges and intentional color. Soft effects need a conversation.",
    artworkPoints: [
      "Vector files with solid color areas are ideal.",
      "High-res PNG can work for review; we’ll rebuild separations when needed.",
      "Hairline strokes and micro type may need to thicken for a clean print.",
      "Gradients and photoreal art may require a different finish or a simplified version.",
      "Tell us brand colors early — we’ll align expectations on the mockup.",
    ],
    specs: [
      { label: "Best for", value: "Large graphics & solid color art" },
      { label: "Typical blanks", value: "Trucker, snapback, structured fronts" },
      { label: "Mockup", value: "Required before production" },
      { label: "Best file types", value: "AI, EPS, PDF, SVG, high-res PNG" },
      { label: "Ask us about", value: "Hybrids with embroidery" },
      { label: "Shipping", value: "Free on 24+ hats" },
    ],
    bestForTitle: "Best for",
    bestFor: [
      "Campaign and tour merch",
      "Illustrative logos",
      "Wide front-panel designs",
      "Streetwear and lifestyle drops",
      "Simple bold colorways",
    ],
    industries: [
      "Music & entertainment",
      "Streetwear",
      "Events & festivals",
      "Agencies & creative studios",
      "Hospitality promotions",
      "Campus & clubs",
    ],
    faqs: [
      {
        q: "Is screen print better than embroidery for my logo?",
        a: "If the art is large, flat, and graphic — often yes. If you want texture and a classic premium stitch, embroidery wins. Send the art and we’ll recommend honestly.",
      },
      {
        q: "Can you print photoreal images?",
        a: "Photoreal and soft gradients are harder on hats. We may suggest simplification, another finish, or a redesigned mark that prints clean.",
      },
      {
        q: "Will the print crack?",
        a: "Properly cured prints on the right blank hold up to normal wear. Like any print, harsh abuse and improper washing can age it — we’ll share care notes with your order.",
      },
      {
        q: "Can I combine print and embroidery?",
        a: "Often yes. Many brands print the main graphic and embroider a small secondary mark. Ask on the order notes.",
      },
    ],
    compareBlurb: "Flat ink for graphic art — bold coverage on the panel.",
    metaDescription:
      "Custom screen printed hats for bold graphic artwork. Mockup before production, ideal for large logos and illustrations on truckers and snapbacks.",
  },
];

export function getDecorationService(slug: string) {
  return decorationServices.find((s) => s.slug === slug);
}

export function getDecorationServiceById(id: string) {
  return decorationServices.find((s) => s.id === id);
}
