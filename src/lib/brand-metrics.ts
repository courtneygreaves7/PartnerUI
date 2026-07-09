/** Shared brand portfolio weights — individual brands sum to the all-brands total. */

export const BRAND_IDS = ["brand-a", "brand-b", "brand-c"] as const
export type BrandId = (typeof BRAND_IDS)[number]

export const BRAND_LABELS: Record<BrandId, string> = {
  "brand-a": "Manor Cottages",
  "brand-b": "Lake Lovers",
  "brand-c": "Dream Cottages",
}

/** Share of portfolio volume (sums to 1). */
export const BRAND_VOLUME_SHARE: Record<BrandId, number> = {
  "brand-a": 0.42,
  "brand-b": 0.26,
  "brand-c": 0.32,
}

/** Percentage-point offsets for rates vs all-brands baseline. */
export const BRAND_RATE_OFFSET_PP: Record<BrandId, number> = {
  "brand-a": 0.4,
  "brand-b": -0.8,
  "brand-c": 0.2,
}

export function isAllBrands(brand: string): boolean {
  return !brand || brand === "all-brands"
}

export function getBrandVolumeMultiplier(brand: string): number {
  if (isAllBrands(brand)) return 1
  return BRAND_VOLUME_SHARE[brand as BrandId] ?? 1 / BRAND_IDS.length
}

export function getBrandRateOffset(brand: string): number {
  if (isAllBrands(brand)) return 0
  return BRAND_RATE_OFFSET_PP[brand as BrandId] ?? 0
}

export function parseCount(value: string): number {
  return Number.parseInt(value.replace(/,/g, ""), 10) || 0
}

export function parseCurrency(value: string): number {
  const match = value.replace(/,/g, "").match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export function parsePercent(value: string): number {
  const match = value.match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString("en-GB")
}

export function formatCurrency(value: number, symbol: "£" | "€" = "£"): string {
  return `${symbol}${Math.round(value).toLocaleString("en-GB")}`
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`
}

export function formatDays(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} days`
}

export function scaleCountValue(value: number, brand: string): number {
  return Math.round(value * getBrandVolumeMultiplier(brand))
}

export function scaleCurrencyValue(value: number, brand: string): number {
  return Math.round(value * getBrandVolumeMultiplier(brand))
}

/** Per-booking averages move slightly with brand mix, not by volume share. */
export function adjustAverageCurrency(value: number, brand: string): number {
  const offset = getBrandRateOffset(brand)
  return Math.round(value * (1 + offset / 40))
}

export function adjustPercent(value: number, brand: string): number {
  return Math.round((value + getBrandRateOffset(brand)) * 10) / 10
}

export function adjustDays(value: number, brand: string): number {
  return Math.round((value + getBrandRateOffset(brand) * 2) * 10) / 10
}

export function scaleCountString(value: string, brand: string): string {
  if (isAllBrands(brand)) return value
  return formatCount(scaleCountValue(parseCount(value), brand))
}

export function scaleCurrencyString(value: string, brand: string): string {
  if (!value || value === "—") return value
  const symbol = value.includes("€") ? "€" : "£"
  const numeric = parseCurrency(value)
  if (isAllBrands(brand)) return value
  if (numeric < 5000 && !/k/i.test(value)) {
    return formatCurrency(adjustAverageCurrency(numeric, brand), symbol)
  }
  return formatCurrency(scaleCurrencyValue(numeric, brand), symbol)
}

export function scalePercentString(value: string, brand: string): string {
  if (!value || value === "—") return value
  if (isAllBrands(brand)) return value
  return formatPercent(adjustPercent(parsePercent(value), brand))
}

export function scaleDaysString(value: string, brand: string): string {
  if (!value || value === "—") return value
  if (isAllBrands(brand)) return value
  return formatDays(adjustDays(parsePercent(value), brand))
}

/** e.g. "1,104 2.6%" → scaled count + percent for brand filter */
export function scaleBookingCell(cell: string, brand: string): string {
  if (isAllBrands(brand)) return cell
  const parts = cell.trim().split(/\s+/)
  if (parts.length >= 2) {
    const count = scaleCountValue(parseCount(parts[0]), brand)
    const pct = adjustPercent(parsePercent(parts[1]), brand)
    return `${formatCount(count)} ${formatPercent(pct)}`
  }
  return scaleCountString(cell, brand)
}

export type BookingProfile = {
  total: string
  calSales: string
  calPct: string
  ddlSales: string
  ddlPct: string
}

export function scaleBookingProfile(baseline: BookingProfile, brand: string): BookingProfile {
  if (isAllBrands(brand)) return baseline
  return {
    total: scaleCountString(baseline.total, brand),
    calSales: scaleCountString(baseline.calSales, brand),
    calPct: scalePercentString(baseline.calPct, brand),
    ddlSales: scaleCountString(baseline.ddlSales, brand),
    ddlPct: scalePercentString(baseline.ddlPct, brand),
  }
}

export type AbvProfile = {
  gbpAbv: string
  gbpCal: string
  eurAbv: string
  eurCal: string
  gbpAbvFee: string
  gbpCalFee: string
  eurAbvFee: string
  eurCalFee: string
  calPct: string
}

function scaleCalCurrency(value: string, brand: string): string {
  if (!value.startsWith("CAL ")) return scaleCurrencyString(value, brand)
  const inner = value.slice(4)
  return `CAL ${scaleCurrencyString(inner, brand).replace(/^CAL /, "")}`
}

export function scaleAbvProfile(baseline: AbvProfile, brand: string): AbvProfile {
  if (isAllBrands(brand)) return baseline
  return {
    gbpAbv: scaleCurrencyString(baseline.gbpAbv, brand),
    gbpCal: scaleCalCurrency(baseline.gbpCal, brand),
    eurAbv: scaleCurrencyString(baseline.eurAbv, brand),
    eurCal: scaleCalCurrency(baseline.eurCal, brand),
    gbpAbvFee: scaleCurrencyString(baseline.gbpAbvFee, brand),
    gbpCalFee: scaleCalCurrency(baseline.gbpCalFee, brand),
    eurAbvFee: scaleCurrencyString(baseline.eurAbvFee, brand),
    eurCalFee: scaleCalCurrency(baseline.eurCalFee, brand),
    calPct: scalePercentString(baseline.calPct, brand),
  }
}

export type CalFinProfile = {
  totalPayable: string
  ipt: string
  pislComm: string
  capacityNet: string
  pislPayable: string
  premiumInc: string
  gwp: string
}

export function scaleCalFinProfile(baseline: CalFinProfile, brand: string): CalFinProfile {
  if (isAllBrands(brand)) return baseline
  return {
    totalPayable: scaleCurrencyString(baseline.totalPayable, brand),
    ipt: scaleCurrencyString(baseline.ipt, brand),
    pislComm: scaleCurrencyString(baseline.pislComm, brand),
    capacityNet: scaleCurrencyString(baseline.capacityNet, brand),
    pislPayable: scaleCurrencyString(baseline.pislPayable, brand),
    premiumInc: scaleCurrencyString(baseline.premiumInc, brand),
    gwp: scaleCurrencyString(baseline.gwp, brand),
  }
}

export type TimingProfile = {
  gbpDays: string
  gbpCal: string
  eurDays: string
  eurCal: string
}

function scaleCalDays(value: string, brand: string): string {
  if (!value.startsWith("CAL ")) return scaleDaysString(value, brand)
  const inner = value.slice(4)
  return `CAL ${scaleDaysString(inner, brand).replace(/^CAL /, "")}`
}

export function scaleTimingProfile(baseline: TimingProfile, brand: string): TimingProfile {
  if (isAllBrands(brand)) return baseline
  return {
    gbpDays: scaleDaysString(baseline.gbpDays, brand),
    gbpCal: scaleCalDays(baseline.gbpCal, brand),
    eurDays: scaleDaysString(baseline.eurDays, brand),
    eurCal: scaleCalDays(baseline.eurCal, brand),
  }
}
