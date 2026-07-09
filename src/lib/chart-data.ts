import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { BRAND_LABELS } from "@/lib/brand-metrics"
import {
  getBrandRateOffset,
  getBrandVolumeMultiplier,
  scaleAbvProfile,
  scaleBookingProfile,
  scaleCalFinProfile,
  scaleTimingProfile,
  type AbvProfile,
  type BookingProfile,
  type CalFinProfile,
  type TimingProfile,
} from "@/lib/brand-metrics"

export type ActiveFilters = {
  partner: string
  brand: string
  county: string
  dateRange: string
  year: string
  month: string
  metric: string
  sortBy: string
}

export const DEFAULT_FILTERS: ActiveFilters = {
  partner: "partner-a",
  brand: "all-brands",
  county: "all-counties",
  dateRange: "year-to-month-end",
  year: "2026",
  month: "June",
  metric: "sales",
  sortBy: "revenue-desc",
}

export function formatFilterContext(filters: ActiveFilters) {
  const partner =
    filters.partner === PARTNER_BRANDING.partnerId
      ? PARTNER_BRANDING.shortName
      : filters.partner === "all-partners"
        ? "All partners"
        : filters.partner.replace("partner-", "Partner ").replace(/\b\w/g, (c) => c.toUpperCase())
  const brandLabels: Record<string, string> = BRAND_LABELS
  const brand =
    filters.brand === "all-brands"
      ? "all brands"
      : (brandLabels[filters.brand] ??
        filters.brand.replace("brand-", "").replace(/\b\w/g, (c) => c.toUpperCase()))
  const range =
    filters.dateRange === "year-to-month-end"
      ? `YTD to ${filters.month} ${filters.year}`
      : `${filters.month} ${filters.year}`

  const county =
    filters.county && filters.county !== "all-counties"
      ? filters.county.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : null

  return county
    ? `${partner} · ${brand} · ${county} · ${range}`
    : `${partner} · ${brand} · ${range}`
}

// Deterministic noise seeded by a string key
function seededNoise(seed: string, index: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  const x = Math.sin(h + index * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function wave(offset: number, amp: number, period: number, phase = 0) {
  return amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * (offset + phase)) / period))
}

function dateLabel(offset: number) {
  const d = new Date("2026-01-01")
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// Profile multipliers — each partner/brand skews the data differently
const PROFILE: Record<string, { base: number; amp: number; trend: number; period: number }> = {
  "all-partners": { base: 1.0, amp: 1.0, trend: 1.0, period: 14 },
  "partner-a":    { base: 1.3, amp: 0.7, trend: 0.8, period: 10 },
  "partner-b":    { base: 0.7, amp: 1.4, trend: 1.2, period: 18 },
  "partner-c":    { base: 0.9, amp: 1.1, trend: 0.6, period: 7  },
  "all-brands":   { base: 1.0, amp: 1.0, trend: 1.0, period: 14 },
}

function profileSeed(filters: ActiveFilters) {
  return `${filters.partner}:${filters.brand}:${filters.metric}`
}

function getProfile(filters: ActiveFilters) {
  const p = PROFILE[filters.partner] ?? PROFILE["all-partners"]
  const volume = getBrandVolumeMultiplier(filters.brand)
  return {
    base: p.base * volume,
    amp: p.amp * Math.sqrt(volume + 0.35),
    trend: p.trend,
    period: p.period,
    rateOffset: getBrandRateOffset(filters.brand),
  }
}

export function buildDailyBookingsData(filters: ActiveFilters, days = 174) {
  const seed = profileSeed(filters)
  const { base, amp, trend, period } = getProfile(filters)
  return Array.from({ length: days }, (_, i) => ({
    date: dateLabel(i),
    made: Math.round((5000 * base) + wave(i, 2500 * amp, period) - i * 10 * trend + seededNoise(seed, i) * 1200),
    starting: Math.round((3500 * base) + wave(i, 4000 * amp, period / 2, 2) + seededNoise(seed + "s", i) * 800),
  }))
}

export const CHART_PARTNER_SERIES = [
  "Total",
  "Partner Alpha",
  "Partner Beta",
  "Partner Gamma",
] as const

export function buildAbvPerDayData(filters: ActiveFilters, days = 174) {
  const seed = profileSeed(filters)
  const { base, amp, period } = getProfile(filters)
  const partners = [...CHART_PARTNER_SERIES]
  return Array.from({ length: days }, (_, i) => {
    const row: Record<string, string | number> = { date: dateLabel(i) }
    partners.forEach((p, pi) => {
      row[p] = Math.round((1200 * base) + wave(i, 1800 * amp, period, pi * 3) + seededNoise(seed + p, i + pi * 7) * 900)
    })
    return row
  })
}

export function buildLeadTimeData(filters: ActiveFilters, days = 174) {
  const seed = profileSeed(filters)
  const { base, amp, period } = getProfile(filters)
  const series = [...CHART_PARTNER_SERIES]
  return Array.from({ length: days }, (_, i) => {
    const row: Record<string, string | number> = { date: dateLabel(i) }
    series.forEach((s, si) => {
      row[s] = Math.round((90 * base) + wave(i, 80 * amp, period * 1.5, si * 4) + seededNoise(seed + s, i + si * 11) * 40)
    })
    return row
  })
}

export function buildBookingsMadePerDayData(filters: ActiveFilters, days = 174) {
  const seed = profileSeed(filters)
  const { base, amp, trend, period } = getProfile(filters)
  return Array.from({ length: days }, (_, i) => ({
    date: dateLabel(i),
    bookings: Math.round((4500 * base) + wave(i, 3000 * amp, period) - i * 8 * trend + seededNoise(seed + "b", i) * 1500),
  }))
}

export function buildCalDdlTakeupData(filters: ActiveFilters, days = 174) {
  const seed = profileSeed(filters)
  const { base, amp, period, rateOffset } = getProfile(filters)
  const series = [
    "CAL % (total)",
    "Partner Alpha CAL %",
    "Partner Beta CAL %",
    "Partner Gamma CAL %",
    "DDL % (total)",
  ]
  return Array.from({ length: days }, (_, i) => {
    const row: Record<string, string | number> = { date: dateLabel(i) }
    series.forEach((s, si) => {
      row[s] = parseFloat(
        (
          (2 * base) +
          rateOffset +
          wave(i, 6 * amp, period * 2, si * 5) * 0.6 +
          seededNoise(seed + s, i + si * 13) * 2
        ).toFixed(1)
      )
    })
    return row
  })
}

// Snapshot metric profiles keyed by partner:brand
export type BookingTrendPoint = {
  label: string
  value: number
}

const BOOKING_TREND_MONTHS = ["Jul", "Sep", "Nov", "Jan", "Mar", "May"] as const
const BOOKING_TREND_SHAPE = [0.76, 0.8, 0.84, 0.88, 0.94, 1.0]

export function buildBookingTrendChart(total: string): BookingTrendPoint[] {
  const totalValue = Number.parseInt(total.replace(/,/g, ""), 10) || 0
  const monthlyBase = totalValue / BOOKING_TREND_MONTHS.length

  return BOOKING_TREND_MONTHS.map((label, index) => ({
    label,
    value: Math.round(monthlyBase * BOOKING_TREND_SHAPE[index]),
  }))
}

export function deriveBookingTrendMeta(total: string) {
  const totalValue = Number.parseInt(total.replace(/,/g, ""), 10) || 0
  const priorValue = Math.round(totalValue / 1.14)
  const changePct = priorValue > 0 ? ((totalValue - priorValue) / priorValue) * 100 : 0
  const priorTotal = priorValue.toLocaleString("en-GB")
  const sign = changePct >= 0 ? "+" : ""
  const dailyAverage = Math.round(totalValue / 30)

  return {
    priorTotal,
    trendLabel: `${sign}${changePct.toFixed(1)}%`,
    trend: changePct >= 0 ? ("up" as const) : ("down" as const),
    comparisonLabel: `vs ${priorTotal} prior period`,
    dailyAverage: `~${dailyAverage.toLocaleString("en-GB")} /day`,
  }
}

const BOOKING_PROFILES: Record<string, BookingProfile> = {
  "all-partners:all-brands": { total: "124,500", calSales: "3,210", calPct: "3.8%", ddlSales: "48", ddlPct: "1.5%" },
  "partner-a:all-brands":    { total: "42,310",  calSales: "1,104", calPct: "2.6%", ddlSales: "12", ddlPct: "0.9%" },
  "partner-b:all-brands":    { total: "38,750",  calSales: "892",   calPct: "2.3%", ddlSales: "8",  ddlPct: "0.6%" },
  "partner-c:all-brands":    { total: "43,440",  calSales: "1,214", calPct: "4.7%", ddlSales: "28", ddlPct: "2.0%" },
}

export function getBookingProfile(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const baseline =
    BOOKING_PROFILES[baselineKey] ?? BOOKING_PROFILES["all-partners:all-brands"]
  return scaleBookingProfile(baseline, filters.brand)
}

const ABV_PROFILES: Record<string, AbvProfile> = {
  "all-partners:all-brands": { gbpAbv: "£742", gbpCal: "CAL £890", eurAbv: "€1,340", eurCal: "CAL €1,210", gbpAbvFee: "£768", gbpCalFee: "CAL £920", eurAbvFee: "€1,385", eurCalFee: "CAL €1,255", calPct: "8.4%" },
  "partner-a:all-brands":    { gbpAbv: "£680", gbpCal: "CAL £810", eurAbv: "€1,180", eurCal: "CAL €1,050", gbpAbvFee: "£704", gbpCalFee: "CAL £840", eurAbvFee: "€1,220", eurCalFee: "CAL €1,090", calPct: "7.6%" },
  "partner-b:all-brands":    { gbpAbv: "£820", gbpCal: "CAL £980", eurAbv: "€1,520", eurCal: "CAL €1,380", gbpAbvFee: "£850", gbpCalFee: "CAL £1,020", eurAbvFee: "€1,575", eurCalFee: "CAL €1,430", calPct: "9.8%" },
  "partner-c:all-brands":    { gbpAbv: "£725", gbpCal: "CAL £870", eurAbv: "€1,290", eurCal: "CAL €1,150", gbpAbvFee: "£750", gbpCalFee: "CAL £900", eurAbvFee: "€1,335", eurCalFee: "CAL €1,200", calPct: "8.1%" },
}

export function getAbvProfile(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const baseline = ABV_PROFILES[baselineKey] ?? ABV_PROFILES["all-partners:all-brands"]
  return scaleAbvProfile(baseline, filters.brand)
}

const CAL_FIN_PROFILES: Record<string, CalFinProfile> = {
  "all-partners:all-brands": { totalPayable: "£214,500", ipt: "£22,400", pislComm: "£61,800", capacityNet: "£130,200", pislPayable: "£154,600", premiumInc: "£328,400", gwp: "£306,000" },
  "partner-a:all-brands":    { totalPayable: "£74,200",  ipt: "£7,800",  pislComm: "£21,400", capacityNet: "£45,000",  pislPayable: "£53,500",  premiumInc: "£113,600", gwp: "£105,800" },
  "partner-b:all-brands":    { totalPayable: "£88,600",  ipt: "£9,200",  pislComm: "£25,500", capacityNet: "£53,900",  pislPayable: "£64,100",  premiumInc: "£136,200", gwp: "£127,000" },
  "partner-c:all-brands":    { totalPayable: "£51,700",  ipt: "£5,400",  pislComm: "£14,900", capacityNet: "£31,400",  pislPayable: "£37,000",  premiumInc: "£78,600",  gwp: "£73,200"  },
}

export function getCalFinProfile(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const baseline =
    CAL_FIN_PROFILES[baselineKey] ?? CAL_FIN_PROFILES["all-partners:all-brands"]
  return scaleCalFinProfile(baseline, filters.brand)
}

const FINANCIAL_TREND_MONTHS = ["Jul", "Sep", "Nov", "Jan", "Mar", "May"] as const
const FINANCIAL_TREND_SHAPE = [0.76, 0.8, 0.84, 0.88, 0.94, 1.0]
const FINANCIAL_PRIOR_PERIOD_FACTOR = 1.075

function parseCurrencyValue(value: string) {
  const match = value.replace(/,/g, "").match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export function deriveFinancialTrendMeta(totalPayable: string) {
  const totalValue = parseCurrencyValue(totalPayable)
  const priorValue = Math.round(totalValue / FINANCIAL_PRIOR_PERIOD_FACTOR)
  const changePct = priorValue > 0 ? ((totalValue - priorValue) / priorValue) * 100 : 0
  const priorTotal = `£${priorValue.toLocaleString("en-GB")}`
  const sign = changePct >= 0 ? "+" : ""

  return {
    priorTotal,
    trendLabel: `${sign}${changePct.toFixed(1)}%`,
    trend: changePct >= 0 ? ("up" as const) : ("down" as const),
    comparisonLabel: `vs ${priorTotal} prior period`,
  }
}

export function buildFinancialTrendChart(totalPayable: string): BookingTrendPoint[] {
  const totalValue = parseCurrencyValue(totalPayable)
  const monthlyBase = totalValue / FINANCIAL_TREND_MONTHS.length

  return FINANCIAL_TREND_MONTHS.map((label, index) => ({
    label,
    value: Math.round(monthlyBase * FINANCIAL_TREND_SHAPE[index]),
  }))
}

export function buildCalFinBreakdown(
  rows: Array<{ label: string; value: string }>,
  count = 3
): Array<{ label: string; value: string; sharePercent: number }> {
  const topRows = rows
    .map((row) => ({
      ...row,
      amount: parseCurrencyValue(row.value),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count)

  const total = topRows.reduce((sum, row) => sum + row.amount, 0)

  return topRows.map((row) => ({
    label: row.label.replace(/ \(GBP\)$/, ""),
    value: row.value,
    sharePercent: total > 0 ? Math.round((row.amount / total) * 100) : 0,
  }))
}

const TIMING_PROFILES: Record<string, TimingProfile> = {
  "all-partners:all-brands": { gbpDays: "94.2 days", gbpCal: "CAL 118.7 days", eurDays: "108.5 days", eurCal: "CAL 134.1 days" },
  "partner-a:all-brands":    { gbpDays: "88.4 days", gbpCal: "CAL 110.2 days", eurDays: "101.3 days", eurCal: "CAL 124.6 days" },
  "partner-b:all-brands":    { gbpDays: "102.1 days",gbpCal: "CAL 128.4 days", eurDays: "116.7 days", eurCal: "CAL 144.3 days" },
  "partner-c:all-brands":    { gbpDays: "91.6 days", gbpCal: "CAL 114.0 days", eurDays: "104.8 days", eurCal: "CAL 129.5 days" },
}

export function getTimingProfile(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const baseline =
    TIMING_PROFILES[baselineKey] ?? TIMING_PROFILES["all-partners:all-brands"]
  return scaleTimingProfile(baseline, filters.brand)
}
