/** Embroidery stitch styles + thread palette for the order decoration step. */

export type EmbroideryStyleId = "flat" | "3d-puff";

export const embroideryStyles: Array<{
  id: EmbroideryStyleId;
  name: string;
  blurb: string;
  priceLabel: string;
  /** Estimated add-on per hat when qty is known; null = included. */
  addOnPerHat: number | null;
  image: string;
}> = [
  {
    id: "flat",
    name: "Standard flat",
    blurb: "Classic stitch that sits clean in the fabric — our default finish.",
    priceLabel: "Included",
    addOnPerHat: null,
    image: "/images/home/embroidery-detail.png",
  },
  {
    id: "3d-puff",
    name: "3D puff",
    blurb: "Raised foam under the stitch for bold, dimensional logos.",
    priceLabel: "+$8 / hat est.",
    addOnPerHat: 8,
    image: "/images/home/embroidery-caps.jpg",
  },
];

/** Front-panel embroidery position (wearer’s perspective). */
export type FrontPlacementId = "center" | "left-eye" | "right-eye";

export const frontPlacements: Array<{
  id: FrontPlacementId;
  name: string;
  blurb: string;
}> = [
  {
    id: "center",
    name: "Center",
    blurb: "Front and center on the panel — our most common look.",
  },
  {
    id: "left-eye",
    name: "Left eye",
    blurb: "Sits over the wearer’s left eye.",
  },
  {
    id: "right-eye",
    name: "Right eye",
    blurb: "Sits over the wearer’s right eye.",
  },
];

/** Optional side/back placements — estimates; final quote after mockup. */
export const placementAddOns: Record<
  string,
  { perHat: number; setup: number; image: string }
> = {
  Back: {
    perHat: 10,
    setup: 70,
    image: "/images/home/blank-snapback.jpg",
  },
  "Left side": {
    perHat: 10,
    setup: 70,
    image: "/images/home/blank-trucker.jpg",
  },
  "Right side": {
    perHat: 10,
    setup: 70,
    image: "/images/home/blank-fitted.jpg",
  },
};

/** Artwork + notes attached to an optional side/back location. */
export type ExtraLocationDetail = {
  artworkUrl?: string;
  fileName?: string;
  preview?: string;
  notes?: string;
};

/** Pin placed on artwork to mark where a thread color should stitch. */
export type ThreadArtPin = {
  id: string;
  threadName: string;
  hex: string;
  /** Position as % of the artwork box (0–100). */
  x: number;
  y: number;
};

export const threadColors: Array<{ name: string; hex: string }> = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Silver", hex: "#c0c4c8" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Light Blue", hex: "#7eb6d9" },
  { name: "Neon Blue", hex: "#2f6bff" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Purple", hex: "#6d28d9" },
  { name: "Neon Green", hex: "#39ff14" },
  { name: "Green", hex: "#15803d" },
  { name: "Olive", hex: "#6b7c3c" },
  { name: "Neon Yellow", hex: "#e8ff3d" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Neon Orange", hex: "#ff6b00" },
  { name: "Gold", hex: "#c9a227" },
  { name: "Tan", hex: "#c4a574" },
  { name: "Brown", hex: "#8b5e3c" },
  { name: "Dark Brown", hex: "#4a2f1c" },
  { name: "Neon Pink", hex: "#ff4da6" },
  { name: "Red", hex: "#dc2626" },
  { name: "Dark Red", hex: "#7f1d1d" },
];
