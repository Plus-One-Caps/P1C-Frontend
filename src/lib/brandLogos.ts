/** S&S Activewear brand mark URLs for product cards. */
const BRAND_LOGOS: Record<string, string> = {
  richardson: "https://www.ssactivewear.com/Images/Brand/138_fm.png",
  flexfit: "https://www.ssactivewear.com/Images/Brand/58_fm.png",
  "yp classics": "https://www.ssactivewear.com/Images/Brand/71_fm.png",
  yupoong: "https://www.ssactivewear.com/Images/Brand/71_fm.png",
  sportsman: "https://www.ssactivewear.com/Images/Brand/47_fm.png",
  core365: "https://www.ssactivewear.com/Images/Brand/239_fm.png",
  "core 365": "https://www.ssactivewear.com/Images/Brand/239_fm.png",
};

export function brandLogoUrl(brand?: string | null): string | null {
  if (!brand) return null;
  const key = brand.trim().toLowerCase();
  if (BRAND_LOGOS[key]) return BRAND_LOGOS[key];
  // Soft match for "Richardson Caps" etc.
  for (const [name, url] of Object.entries(BRAND_LOGOS)) {
    if (key.includes(name) || name.includes(key)) return url;
  }
  return null;
}
