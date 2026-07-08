import { PARTNER_BRANDING } from "@/lib/partner-branding"

export type ActiveFilters = {
  partner: string
  brand: string
  dateRange: string
  year: string
  month: string
  metric: string
  sortBy: string
}

export const DEFAULT_FILTERS: ActiveFilters = {
  partner: "partner-a",
  brand: "all-brands",
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
  const brandLabels: Record<string, string> = {
    "brand-a": "Alpha",
    "brand-b": "Beta",
    "brand-c": "Gamma",
  }
  const brand =
    filters.brand === "all-brands"
      ? "all brands"
      : (brandLabels[filters.brand] ??
        filters.brand.replace("brand-", "").replace(/\b\w/g, (c) => c.toUpperCase()))
  const range =
    filters.dateRange === "year-to-month-end"
      ? `YTD to ${filters.month} ${filters.year}`
      : `${filters.month} ${filters.year}`

  return `${partner} · ${brand} · ${range}`
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
  "brand-a":      { base: 1.2, amp: 0.9, trend: 1.1, period: 12 },
  "brand-b":      { base: 0.6, amp: 1.6, trend: 0.9, period: 21 },
  "brand-c":      { base: 1.1, amp: 0.8, trend: 1.4, period: 9  },
}

function profileSeed(filters: ActiveFilters) {
  return `${filters.partner}:${filters.brand}:${filters.metric}`
}

function getProfile(filters: ActiveFilters) {
  const p = PROFILE[filters.partner] ?? PROFILE["all-partners"]
  const b = PROFILE[filters.brand] ?? PROFILE["all-brands"]
  return {
    base: (p.base + b.base) / 2,
    amp: (p.amp + b.amp) / 2,
    trend: (p.trend + b.trend) / 2,
    period: (p.period + b.period) / 2,
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
  const { base, amp, period } = getProfile(filters)
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
      row[s] = parseFloat(((2 * base) + wave(i, 6 * amp, period * 2, si * 5) * 0.6 + seededNoise(seed + s, i + si * 13) * 2).toFixed(1))
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

const BOOKING_PROFILES: Record<string, {
  total: string; calSales: string; calPct: string; ddlSales: string; ddlPct: string
}> = {
  "all-partners:all-brands": { total: "124,500", calSales: "3,210", calPct: "3.8%", ddlSales: "48", ddlPct: "1.5%" },
  "partner-a:all-brands":    { total: "42,310",  calSales: "1,104", calPct: "2.6%", ddlSales: "12", ddlPct: "0.9%" },
  "partner-b:all-brands":    { total: "38,750",  calSales: "892",   calPct: "2.3%", ddlSales: "8",  ddlPct: "0.6%" },
  "partner-c:all-brands":    { total: "43,440",  calSales: "1,214", calPct: "4.7%", ddlSales: "28", ddlPct: "2.0%" },
  "all-partners:brand-a":    { total: "51,200",  calSales: "1,380", calPct: "3.2%", ddlSales: "18", ddlPct: "1.1%" },
  "all-partners:brand-b":    { total: "28,600",  calSales: "620",   calPct: "1.9%", ddlSales: "6",  ddlPct: "0.4%" },
  "all-partners:brand-c":    { total: "44,700",  calSales: "1,210", calPct: "5.1%", ddlSales: "24", ddlPct: "2.2%" },
  "partner-a:brand-a":       { total: "18,100",  calSales: "480",   calPct: "2.7%", ddlSales: "5",  ddlPct: "0.8%" },
  "partner-a:brand-b":       { total: "11,200",  calSales: "220",   calPct: "1.8%", ddlSales: "3",  ddlPct: "0.5%" },
  "partner-a:brand-c":       { total: "13,010",  calSales: "404",   calPct: "4.2%", ddlSales: "4",  ddlPct: "1.0%" },
  "partner-b:brand-a":       { total: "15,600",  calSales: "390",   calPct: "3.5%", ddlSales: "4",  ddlPct: "0.7%" },
  "partner-b:brand-b":       { total: "9,400",   calSales: "168",   calPct: "1.4%", ddlSales: "2",  ddlPct: "0.3%" },
  "partner-b:brand-c":       { total: "13,750",  calSales: "334",   calPct: "4.8%", ddlSales: "2",  ddlPct: "0.6%" },
  "partner-c:brand-a":       { total: "17,500",  calSales: "510",   calPct: "4.1%", ddlSales: "9",  ddlPct: "1.6%" },
  "partner-c:brand-b":       { total: "8,000",   calSales: "232",   calPct: "2.2%", ddlSales: "1",  ddlPct: "0.3%" },
  "partner-c:brand-c":       { total: "17,940",  calSales: "472",   calPct: "6.4%", ddlSales: "18", ddlPct: "3.1%" },
}

export function getBookingProfile(filters: ActiveFilters) {
  const key = `${filters.partner}:${filters.brand}`
  return BOOKING_PROFILES[key] ?? BOOKING_PROFILES["all-partners:all-brands"]
}

const ABV_PROFILES: Record<string, {
  gbpAbv: string; gbpCal: string; eurAbv: string; eurCal: string
  gbpAbvFee: string; gbpCalFee: string; eurAbvFee: string; eurCalFee: string
  calPct: string
}> = {
  "all-partners:all-brands": { gbpAbv: "£742", gbpCal: "CAL £890", eurAbv: "€1,340", eurCal: "CAL €1,210", gbpAbvFee: "£768", gbpCalFee: "CAL £920", eurAbvFee: "€1,385", eurCalFee: "CAL €1,255", calPct: "8.4%" },
  "partner-a:all-brands":    { gbpAbv: "£680", gbpCal: "CAL £810", eurAbv: "€1,180", eurCal: "CAL €1,050", gbpAbvFee: "£704", gbpCalFee: "CAL £840", eurAbvFee: "€1,220", eurCalFee: "CAL €1,090", calPct: "7.6%" },
  "partner-b:all-brands":    { gbpAbv: "£820", gbpCal: "CAL £980", eurAbv: "€1,520", eurCal: "CAL €1,380", gbpAbvFee: "£850", gbpCalFee: "CAL £1,020", eurAbvFee: "€1,575", eurCalFee: "CAL €1,430", calPct: "9.8%" },
  "partner-c:all-brands":    { gbpAbv: "£725", gbpCal: "CAL £870", eurAbv: "€1,290", eurCal: "CAL €1,150", gbpAbvFee: "£750", gbpCalFee: "CAL £900", eurAbvFee: "€1,335", eurCalFee: "CAL €1,200", calPct: "8.1%" },
  "all-partners:brand-a":    { gbpAbv: "£760", gbpCal: "CAL £910", eurAbv: "€1,360", eurCal: "CAL €1,230", gbpAbvFee: "£786", gbpCalFee: "CAL £942", eurAbvFee: "€1,408", eurCalFee: "CAL €1,278", calPct: "8.8%" },
  "all-partners:brand-b":    { gbpAbv: "£640", gbpCal: "CAL £760", eurAbv: "€1,140", eurCal: "CAL €1,020", gbpAbvFee: "£662", gbpCalFee: "CAL £788", eurAbvFee: "€1,180", eurCalFee: "CAL €1,060", calPct: "6.9%" },
  "all-partners:brand-c":    { gbpAbv: "£810", gbpCal: "CAL £970", eurAbv: "€1,450", eurCal: "CAL €1,310", gbpAbvFee: "£838", gbpCalFee: "CAL £1,004", eurAbvFee: "€1,500", eurCalFee: "CAL €1,360", calPct: "10.2%" },
}

export function getAbvProfile(filters: ActiveFilters) {
  const key = `${filters.partner}:${filters.brand}`
  return ABV_PROFILES[key] ?? ABV_PROFILES["all-partners:all-brands"]
}

const CAL_FIN_PROFILES: Record<string, {
  totalPayable: string; ipt: string; pislComm: string; capacityNet: string
  pislPayable: string; premiumInc: string; gwp: string
}> = {
  "all-partners:all-brands": { totalPayable: "£214,500", ipt: "£22,400", pislComm: "£61,800", capacityNet: "£130,200", pislPayable: "£154,600", premiumInc: "£328,400", gwp: "£306,000" },
  "partner-a:all-brands":    { totalPayable: "£74,200",  ipt: "£7,800",  pislComm: "£21,400", capacityNet: "£45,000",  pislPayable: "£53,500",  premiumInc: "£113,600", gwp: "£105,800" },
  "partner-b:all-brands":    { totalPayable: "£88,600",  ipt: "£9,200",  pislComm: "£25,500", capacityNet: "£53,900",  pislPayable: "£64,100",  premiumInc: "£136,200", gwp: "£127,000" },
  "partner-c:all-brands":    { totalPayable: "£51,700",  ipt: "£5,400",  pislComm: "£14,900", capacityNet: "£31,400",  pislPayable: "£37,000",  premiumInc: "£78,600",  gwp: "£73,200"  },
  "all-partners:brand-a":    { totalPayable: "£92,300",  ipt: "£9,600",  pislComm: "£26,600", capacityNet: "£56,100",  pislPayable: "£66,500",  premiumInc: "£141,200", gwp: "£131,600" },
  "all-partners:brand-b":    { totalPayable: "£58,400",  ipt: "£6,100",  pislComm: "£16,800", capacityNet: "£35,500",  pislPayable: "£42,100",  premiumInc: "£89,400",  gwp: "£83,300"  },
  "all-partners:brand-c":    { totalPayable: "£63,800",  ipt: "£6,700",  pislComm: "£18,400", capacityNet: "£38,700",  pislPayable: "£46,000",  premiumInc: "£97,800",  gwp: "£91,100"  },
}

export function getCalFinProfile(filters: ActiveFilters) {
  const key = `${filters.partner}:${filters.brand}`
  return CAL_FIN_PROFILES[key] ?? CAL_FIN_PROFILES["all-partners:all-brands"]
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

const TIMING_PROFILES: Record<string, {
  gbpDays: string; gbpCal: string; eurDays: string; eurCal: string
}> = {
  "all-partners:all-brands": { gbpDays: "94.2 days", gbpCal: "CAL 118.7 days", eurDays: "108.5 days", eurCal: "CAL 134.1 days" },
  "partner-a:all-brands":    { gbpDays: "88.4 days", gbpCal: "CAL 110.2 days", eurDays: "101.3 days", eurCal: "CAL 124.6 days" },
  "partner-b:all-brands":    { gbpDays: "102.1 days",gbpCal: "CAL 128.4 days", eurDays: "116.7 days", eurCal: "CAL 144.3 days" },
  "partner-c:all-brands":    { gbpDays: "91.6 days", gbpCal: "CAL 114.0 days", eurDays: "104.8 days", eurCal: "CAL 129.5 days" },
  "all-partners:brand-a":    { gbpDays: "96.8 days", gbpCal: "CAL 121.4 days", eurDays: "111.2 days", eurCal: "CAL 137.8 days" },
  "all-partners:brand-b":    { gbpDays: "86.3 days", gbpCal: "CAL 108.0 days", eurDays: "99.4 days",  eurCal: "CAL 122.5 days" },
  "all-partners:brand-c":    { gbpDays: "99.5 days", gbpCal: "CAL 124.8 days", eurDays: "114.6 days", eurCal: "CAL 141.2 days" },
}

export function getTimingProfile(filters: ActiveFilters) {
  const key = `${filters.partner}:${filters.brand}`
  return TIMING_PROFILES[key] ?? TIMING_PROFILES["all-partners:all-brands"]
}
