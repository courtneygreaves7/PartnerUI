import {
  type ActiveFilters,
  getAbvProfile,
  getBookingProfile,
  getCalFinProfile,
  getTimingProfile,
} from "@/lib/chart-data"

export const COMPARE_PARTNERS = [
  { id: "partner-a", label: "Partner Alpha" },
  { id: "partner-b", label: "Partner Beta" },
  { id: "partner-c", label: "Partner Gamma" },
] as const

export const COMPARE_BRANDS = [
  { id: "all-brands", label: "All brands" },
  { id: "brand-a", label: "Alpha" },
  { id: "brand-b", label: "Beta" },
  { id: "brand-c", label: "Gamma" },
] as const

export type ComparePartnerId = (typeof COMPARE_PARTNERS)[number]["id"]
export type CompareBrandId = (typeof COMPARE_BRANDS)[number]["id"]

export type CompareSideFilters = {
  partner: ComparePartnerId
  brand: CompareBrandId
  year: string
  month: string
  dateRange: "calendar-month" | "year-to-month-end" | "custom-range"
}

export const DEFAULT_COMPARE_SIDE: CompareSideFilters = {
  partner: "partner-a",
  brand: "all-brands",
  year: "2026",
  month: "June",
  dateRange: "year-to-month-end",
}

export type CompareMetric = {
  label: string
  left: number
  right: number
  leftDisplay: string
  rightDisplay: string
  deltaDisplay: string
  deltaTone: "positive" | "negative" | "neutral"
}

export type CompareSection = {
  title: string
  metrics: CompareMetric[]
}

function parseMetric(value: string) {
  const cleaned = value
    .replace(/CAL\s*/gi, "")
    .replace(/[£€%,\s]/gi, "")
    .replace(/days?/gi, "")
  const numeric = Number.parseFloat(cleaned)
  return Number.isFinite(numeric) ? numeric : 0
}

const MOCK_CANCELLATION_RATES: Record<ComparePartnerId, number> = {
  "partner-a": 8.4,
  "partner-b": 6.2,
  "partner-c": 7.1,
}

export function toActiveFilters(side: CompareSideFilters): ActiveFilters {
  return {
    partner: side.partner,
    brand: side.brand,
    year: side.year,
    month: side.month,
    dateRange: side.dateRange,
    metric: "sales",
    sortBy: "revenue-desc",
  }
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

function formatCurrency(value: number) {
  const prefix = value < 0 ? "-£" : "£"
  return `${prefix}${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatDays(value: number) {
  return `${value.toFixed(1)}d`
}

function buildMetric(
  label: string,
  left: number,
  right: number,
  format: "number" | "currency" | "percent" | "days"
): CompareMetric {
  const delta = right - left
  const deltaTone =
    Math.abs(delta) < 0.05 ? "neutral" : delta > 0 ? "positive" : "negative"

  const formatValue = (value: number) => {
    if (format === "currency") return formatCurrency(value)
    if (format === "percent") return formatPercent(value)
    if (format === "days") return formatDays(value)
    return formatNumber(value)
  }

  const formatDelta = () => {
    if (Math.abs(delta) < 0.05 && format !== "number") return format === "days" ? "—" : "-0.0%"
    if (format === "currency") {
      const sign = delta > 0 ? "+" : delta < 0 ? "-" : ""
      return `${sign}£${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    if (format === "percent") {
      const sign = delta > 0 ? "+" : ""
      return `${sign}${delta.toFixed(1)}%`
    }
    if (format === "days") {
      const sign = delta > 0 ? "+" : ""
      return `${sign}${delta.toFixed(1)}d`
    }
    const sign = delta > 0 ? "+" : ""
    return `${sign}${delta.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return {
    label,
    left,
    right,
    leftDisplay: formatValue(left),
    rightDisplay: formatValue(right),
    deltaDisplay: formatDelta(),
    deltaTone,
  }
}

export function getPartnerLabel(partnerId: ComparePartnerId) {
  return COMPARE_PARTNERS.find((partner) => partner.id === partnerId)?.label ?? partnerId
}

export function getBrandLabel(brandId: CompareBrandId) {
  return COMPARE_BRANDS.find((brand) => brand.id === brandId)?.label ?? brandId
}

export function formatCompareDateRange(filters: CompareSideFilters) {
  const monthIndex = new Date(`${filters.month} 1, ${filters.year}`).getMonth()
  const monthEnd = new Date(Number(filters.year), monthIndex + 1, 0)
  const end = monthEnd.toISOString().slice(0, 10)

  if (filters.dateRange === "calendar-month") {
    const start = new Date(Number(filters.year), monthIndex, 1).toISOString().slice(0, 10)
    return `${start} → ${end}`
  }

  if (filters.dateRange === "year-to-month-end") {
    return `${filters.year}-01-01 → ${end}`
  }

  return "Custom range"
}

export function buildCompareSections(
  primary: CompareSideFilters,
  comparison: CompareSideFilters
): CompareSection[] {
  const leftFilters = toActiveFilters(primary)
  const rightFilters = toActiveFilters(comparison)

  const leftBookings = getBookingProfile(leftFilters)
  const rightBookings = getBookingProfile(rightFilters)
  const leftAbv = getAbvProfile(leftFilters)
  const rightAbv = getAbvProfile(rightFilters)
  const leftCal = getCalFinProfile(leftFilters)
  const rightCal = getCalFinProfile(rightFilters)
  const leftTiming = getTimingProfile(leftFilters)
  const rightTiming = getTimingProfile(rightFilters)

  const leftTotal = parseMetric(leftBookings.total)
  const rightTotal = parseMetric(rightBookings.total)
  const leftCalBookings = parseMetric(leftBookings.calSales)
  const rightCalBookings = parseMetric(rightBookings.calSales)
  const leftDdlBookings = parseMetric(leftBookings.ddlSales)
  const rightDdlBookings = parseMetric(rightBookings.ddlSales)

  const leftCalPct = parseMetric(leftBookings.calPct)
  const rightCalPct = parseMetric(rightBookings.calPct)
  const leftDdlPct = parseMetric(rightBookings.ddlPct)
  const rightDdlPct = parseMetric(rightBookings.ddlPct)
  const leftCalCustomer = parseMetric(leftAbv.calPct)
  const rightCalCustomer = parseMetric(rightAbv.calPct)

  const leftAbvEx = parseMetric(leftAbv.gbpAbv)
  const rightAbvEx = parseMetric(rightAbv.gbpAbv)
  const leftAbvInc = parseMetric(leftAbv.gbpAbvFee)
  const rightAbvInc = parseMetric(rightAbv.gbpAbvFee)
  const leftCalAbv = parseMetric(leftAbv.gbpCal)
  const rightCalAbv = parseMetric(rightAbv.gbpCal)

  const leftBookingDays = parseMetric(leftTiming.gbpDays)
  const rightBookingDays = parseMetric(rightTiming.gbpDays)
  const leftCancelDays = parseMetric(leftTiming.gbpCal)
  const rightCancelDays = parseMetric(rightTiming.gbpCal)

  return [
    {
      title: "Sales",
      metrics: [
        buildMetric("Total bookings", leftTotal, rightTotal, "number"),
        buildMetric("CAL bookings", leftCalBookings, rightCalBookings, "number"),
        buildMetric("DDL bookings", leftDdlBookings, rightDdlBookings, "number"),
      ],
    },
    {
      title: "Take-up",
      metrics: [
        buildMetric("CAL take-up", leftCalPct, rightCalPct, "percent"),
        buildMetric("DDL take-up", leftDdlPct, rightDdlPct, "percent"),
        buildMetric("CAL customer price (% of ABV)", leftCalCustomer, rightCalCustomer, "percent"),
      ],
    },
    {
      title: "Booking value",
      metrics: [
        buildMetric("Average booking value (excl. fee)", leftAbvEx, rightAbvEx, "currency"),
        buildMetric("Average booking value (inc. fee)", leftAbvInc, rightAbvInc, "currency"),
        buildMetric("CAL ABV", leftCalAbv, rightCalAbv, "currency"),
      ],
    },
    {
      title: "Financials (GBP)",
      metrics: [
        buildMetric("CAL total payable", parseMetric(leftCal.totalPayable), parseMetric(rightCal.totalPayable), "currency"),
        buildMetric("IPT", parseMetric(leftCal.ipt), parseMetric(rightCal.ipt), "currency"),
        buildMetric("PISL commission", parseMetric(leftCal.pislComm), parseMetric(rightCal.pislComm), "currency"),
        buildMetric("Capacity net", parseMetric(leftCal.capacityNet), parseMetric(rightCal.capacityNet), "currency"),
        buildMetric("Premium inc. IPT", parseMetric(leftCal.premiumInc), parseMetric(rightCal.premiumInc), "currency"),
        buildMetric("GWP", parseMetric(leftCal.gwp), parseMetric(rightCal.gwp), "currency"),
      ],
    },
    {
      title: "Timing",
      metrics: [
        buildMetric("Avg booking → stay (days)", leftBookingDays, rightBookingDays, "days"),
        buildMetric("Avg cancellation → stay (days)", leftCancelDays, rightCancelDays, "days"),
        buildMetric(
          "Cancellation rate",
          MOCK_CANCELLATION_RATES[primary.partner],
          MOCK_CANCELLATION_RATES[comparison.partner],
          "percent"
        ),
      ],
    },
  ]
}
