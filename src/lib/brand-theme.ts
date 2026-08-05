/** Active visual brand skin for the partner portal (demo toggle). */

export type BrandThemeId = "sykes" | "pikl"

export const BRAND_THEME_LABELS: Record<BrandThemeId, string> = {
  sykes: "Sykes branding",
  pikl: "Pikl branding",
}

export const DEFAULT_BRAND_THEME: BrandThemeId = "sykes"

/** Display copy that switches with the brand skin. */
export const BRAND_THEME_COPY: Record<
  BrandThemeId,
  {
    name: string
    shortName: string
    poweredBy?: string
  }
> = {
  sykes: {
    name: "Sykes Holiday Cottages",
    shortName: "Sykes",
  },
  pikl: {
    name: "Pikl",
    shortName: "Pikl",
  },
}

/** Live CSS colour from the active brand skin (safe for charts / SVG). */
export function readBrandCssColor(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
  return value || fallback
}

export function brandPrimaryHex(fallback = "#006BFF") {
  return readBrandCssColor("--primary", fallback)
}

export function brandPrimaryDarkHex(fallback = "#0054CC") {
  return readBrandCssColor("--brand-primary-dark", fallback)
}

/** Channel / series palette that follows the active brand primary. */
export function brandChannelPalette(): [string, string, string, string] {
  const primary = brandPrimaryHex()
  return [
    primary,
    `color-mix(in oklab, ${primary} 78%, white)`,
    `color-mix(in oklab, ${primary} 55%, white)`,
    `color-mix(in oklab, ${primary} 35%, white)`,
  ]
}
