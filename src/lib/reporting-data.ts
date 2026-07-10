import type { ReportingFilters } from "@/components/reporting-filter-sidebar"
import type { CompareMetric, CompareSection } from "@/lib/compare-data"
import {
  buildContributionToPerformanceGrid,
  DAMAGE_DEPOSIT_WAIVER_GRID,
  FLEXIBLE_CANCELLATION_GRID,
  TOTAL_PRODUCTS_SUMMARY,
  type ChannelGridCell,
  type ChannelGridRow,
} from "@/lib/sykes-dashboard-data"

import {
  BRAND_LABELS,
  getBrandRateOffset,
  getBrandVolumeMultiplier,
} from "@/lib/brand-metrics"

export const REPORTING_PERIOD_LABELS: Record<ReportingFilters["period"], string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  ytd: "Year to date",
  custom: "Custom range",
}

export const REPORTING_BRAND_LABELS: Record<string, string> = BRAND_LABELS

const PERIOD_VOLUME_FACTOR: Record<ReportingFilters["period"], number> = {
  day: 1 / 30,
  week: 7 / 30,
  month: 1,
  quarter: 3,
  ytd: 6,
  custom: 1,
}

function parseDisplayValue(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, "")) || 0
  if (/k/i.test(value)) return numeric * 1000
  return numeric
}

function formatCount(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`
  }
  return Math.round(value).toLocaleString("en-GB")
}

function formatMoney(value: number): string {
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000
    const rounded = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1)
    return `£${rounded}k`
  }
  return `£${Math.round(value).toLocaleString("en-GB")}`
}

function formatAverageMoney(value: number): string {
  return `£${Math.round(value).toLocaleString("en-GB")}`
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

function formatDays(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} days`
}

function formatIpb(value: number): string {
  return value.toFixed(2)
}

function isRateLike(value: string, variant: ChannelGridCell["variant"]): boolean {
  if (variant === "attachment" || variant === "rate") return true
  if (variant === "empty" || value === "N/A") return false
  return value.includes("%") && !value.includes("£")
}

function isDaysLike(value: string): boolean {
  return /days?/i.test(value)
}

function isMoneyLike(value: string): boolean {
  return value.includes("£")
}

/** Per-booking averages stay near baseline; only volumes scale with brand/period. */
function scaleCell(
  cell: ChannelGridCell,
  volumeFactor: number,
  rateOffset: number
): ChannelGridCell {
  if (!cell.value || cell.value === "N/A" || cell.variant === "empty") return cell

  const raw = parseDisplayValue(cell.value)
  if (!raw && !cell.value.includes("0")) return cell

  if (isRateLike(cell.value, cell.variant)) {
    const next = Math.max(0, raw + rateOffset)
    return { ...cell, value: formatPercent(next) }
  }

  if (isDaysLike(cell.value)) {
    const next = Math.max(0, raw + rateOffset * 2)
    return { ...cell, value: formatDays(next) }
  }

  if (isMoneyLike(cell.value)) {
    // Average holiday / relet values are typically under £5k without a "k" suffix
    if (!/k/i.test(cell.value) && raw < 5000) {
      const next = Math.max(0, raw * (1 + rateOffset / 40))
      return { ...cell, value: formatAverageMoney(next) }
    }
    return { ...cell, value: formatMoney(raw * volumeFactor) }
  }

  if (
    cell.variant === "volume" ||
    cell.variant === "direct" ||
    cell.variant === "total" ||
    cell.variant === "channel"
  ) {
    return { ...cell, value: formatCount(raw * volumeFactor) }
  }

  return cell
}

function brandVolumeFactor(brandId: string, period: ReportingFilters["period"]): number {
  const share = getBrandVolumeMultiplier(brandId)
  return share * PERIOD_VOLUME_FACTOR[period]
}

export function scaleChannelGrid(
  rows: ChannelGridRow[],
  brandId: string,
  period: ReportingFilters["period"]
): ChannelGridRow[] {
  const volumeFactor = brandVolumeFactor(brandId, period)
  const rateOffset = getBrandRateOffset(brandId)
  return scaleChannelGridWithFactors(rows, volumeFactor, rateOffset)
}

/** Scale channel grids for Insights filters (month-equivalent volumes). */
export function scaleInsightsChannelGrid(
  rows: ChannelGridRow[],
  brand: string
): ChannelGridRow[] {
  const volumeFactor = getBrandVolumeMultiplier(brand)
  const rateOffset = getBrandRateOffset(brand)
  return scaleChannelGridWithFactors(rows, volumeFactor, rateOffset)
}

function scaleChannelGridWithFactors(
  rows: ChannelGridRow[],
  volumeFactor: number,
  rateOffset: number
): ChannelGridRow[] {
  const channels = ["website", "app", "offline", "ota", "direct", "total"] as const

  return rows.map((row) => {
    const next = { ...row }
    for (const key of channels) {
      next[key] = scaleCell(row[key], volumeFactor, rateOffset)
    }
    return next
  })
}

function buildMetric(
  label: string,
  left: number,
  right: number,
  format: "number" | "currency" | "percent" | "ipb" | "days"
): CompareMetric {
  const delta = right - left
  const deltaTone =
    Math.abs(delta) < (format === "percent" || format === "ipb" || format === "days" ? 0.05 : 0.5)
      ? "neutral"
      : delta > 0
        ? "positive"
        : "negative"

  const formatValue = (value: number) => {
    if (format === "currency") return formatMoney(value)
    if (format === "percent") return formatPercent(value)
    if (format === "ipb") return formatIpb(value)
    if (format === "days") return formatDays(value)
    return formatCount(value)
  }

  const formatDelta = () => {
    if (deltaTone === "neutral" && format !== "number") {
      if (format === "percent") return "0.0pp"
      if (format === "ipb") return "0.00"
      if (format === "days") return "0.0d"
      return "—"
    }
    if (format === "currency") {
      const sign = delta > 0 ? "+" : delta < 0 ? "-" : ""
      return `${sign}${formatMoney(Math.abs(delta))}`
    }
    if (format === "percent") {
      const sign = delta > 0 ? "+" : ""
      return `${sign}${delta.toFixed(1)}pp`
    }
    if (format === "ipb") {
      const sign = delta > 0 ? "+" : ""
      return `${sign}${delta.toFixed(2)}`
    }
    if (format === "days") {
      const sign = delta > 0 ? "+" : ""
      return `${sign}${delta.toFixed(1)}d`
    }
    const sign = delta > 0 ? "+" : ""
    return `${sign}${formatCount(Math.abs(delta))}`
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

function rowTotal(rows: ChannelGridRow[], index: number): number {
  return parseDisplayValue(rows[index]?.total.value ?? "0")
}

function findRowTotal(rows: ChannelGridRow[], label: string): number {
  const row = rows.find((item) => item.label === label)
  return parseDisplayValue(row?.total.value ?? "0")
}

export type BrandInsightSnapshot = {
  brandId: string
  brandLabel: string
  summary: Array<{ label: string; value: string }>
  calGrid: ChannelGridRow[]
  ddlGrid: ChannelGridRow[]
  contributionGrid: ChannelGridRow[]
  calBookings: number
  calAttachment: number
  calMargin: number
  calBenefit: number
  ddlBookings: number
  ddlAttachment: number
  ddlMargin: number
  ddlBenefit: number
  cancellationVolume: number
  cancellationRate: number
  cancellationVolumeFc: number
  reletVolume: number
  reletRate: number
  avgLeadTravel: number
  avgHolidayValue: number
}

export function getBrandInsightSnapshot(
  brandId: string,
  period: ReportingFilters["period"]
): BrandInsightSnapshot {
  const calGrid = scaleChannelGrid(FLEXIBLE_CANCELLATION_GRID, brandId, period)
  const ddlGrid = scaleChannelGrid(DAMAGE_DEPOSIT_WAIVER_GRID, brandId, period)
  const contributionGrid = buildContributionToPerformanceGrid(calGrid, ddlGrid)
  const volumeFactor = brandVolumeFactor(brandId, period)
  const rateOffset = getBrandRateOffset(brandId)

  const summary = TOTAL_PRODUCTS_SUMMARY.map((item) => {
    const raw = parseDisplayValue(item.value)
    const labelLower = item.label.toLowerCase()
    if (item.value.includes("%") || item.label.includes("%")) {
      return { label: item.label, value: formatPercent(raw + rateOffset) }
    }
    if (labelLower.includes("income per booking")) {
      return { label: item.label, value: formatIpb(raw * (1 + rateOffset / 20)) }
    }
    if (item.value.includes("k") || labelLower.includes("margin") || labelLower.includes("bookings")) {
      return { label: item.label, value: formatCount(raw * volumeFactor) }
    }
    return { label: item.label, value: item.value }
  })

  return {
    brandId,
    brandLabel: REPORTING_BRAND_LABELS[brandId] ?? brandId,
    summary,
    calGrid,
    ddlGrid,
    contributionGrid,
    calBookings: rowTotal(calGrid, 0),
    calAttachment: rowTotal(calGrid, 1),
    calMargin: rowTotal(calGrid, 4),
    calBenefit: rowTotal(calGrid, 5),
    ddlBookings: rowTotal(ddlGrid, 0),
    ddlAttachment: rowTotal(ddlGrid, 1),
    ddlMargin: rowTotal(ddlGrid, 4),
    ddlBenefit: parseDisplayValue(ddlGrid[5]?.direct.value ?? "0"),
    cancellationVolume: findRowTotal(contributionGrid, "Cancellation Volume"),
    cancellationRate: findRowTotal(contributionGrid, "Cancellation Avg %"),
    cancellationVolumeFc: findRowTotal(contributionGrid, "Cancellation Volume FC"),
    reletVolume: findRowTotal(contributionGrid, "Relet Volume"),
    reletRate: findRowTotal(contributionGrid, "Re-let % Avg"),
    avgLeadTravel: findRowTotal(
      contributionGrid,
      "Average Lead time between Booking and Travel"
    ),
    avgHolidayValue: findRowTotal(
      contributionGrid,
      "Average Holiday Value Per Booking £"
    ),
  }
}

export function buildReportingCompareSections(
  filters: ReportingFilters
): CompareSection[] {
  const left = getBrandInsightSnapshot(filters.brandA, filters.period)
  const right = getBrandInsightSnapshot(filters.brandB, filters.period)

  return [
    {
      title: "Overview",
      metrics: [
        buildMetric(
          "Total bookings (offered products)",
          parseDisplayValue(left.summary[2]?.value ?? "0"),
          parseDisplayValue(right.summary[2]?.value ?? "0"),
          "number"
        ),
        buildMetric(
          "% of bookings offered a product",
          parseDisplayValue(left.summary[1]?.value ?? "0"),
          parseDisplayValue(right.summary[1]?.value ?? "0"),
          "percent"
        ),
        buildMetric(
          "Total margin earned",
          parseDisplayValue(left.summary[3]?.value ?? "0"),
          parseDisplayValue(right.summary[3]?.value ?? "0"),
          "currency"
        ),
        buildMetric(
          "Income per booking",
          parseDisplayValue(left.summary[4]?.value ?? "0"),
          parseDisplayValue(right.summary[4]?.value ?? "0"),
          "ipb"
        ),
      ],
    },
    {
      title: "Flexible Cancellation (CAL)",
      metrics: [
        buildMetric("FC bookings", left.calBookings, right.calBookings, "number"),
        buildMetric("FC attachment", left.calAttachment, right.calAttachment, "percent"),
        buildMetric("FC partner margin", left.calMargin, right.calMargin, "currency"),
        buildMetric(
          "Inc cancellations & relets",
          left.calBenefit,
          right.calBenefit,
          "currency"
        ),
      ],
    },
    {
      title: "Damage Deposit Waiver (DDL)",
      metrics: [
        buildMetric("DDL bookings", left.ddlBookings, right.ddlBookings, "number"),
        buildMetric("DDL attachment", left.ddlAttachment, right.ddlAttachment, "percent"),
        buildMetric("DDL partner margin", left.ddlMargin, right.ddlMargin, "currency"),
        buildMetric(
          "Out of test conversion benefit",
          left.ddlBenefit,
          right.ddlBenefit,
          "currency"
        ),
      ],
    },
    {
      title: "Contribution to performance",
      metrics: [
        buildMetric(
          "Cancellation volume",
          left.cancellationVolume,
          right.cancellationVolume,
          "number"
        ),
        buildMetric(
          "Cancellation avg %",
          left.cancellationRate,
          right.cancellationRate,
          "percent"
        ),
        buildMetric(
          "Cancellation volume FC",
          left.cancellationVolumeFc,
          right.cancellationVolumeFc,
          "number"
        ),
        buildMetric("Relet volume", left.reletVolume, right.reletVolume, "number"),
        buildMetric("Re-let % avg", left.reletRate, right.reletRate, "percent"),
        buildMetric(
          "Avg lead time booking → travel",
          left.avgLeadTravel,
          right.avgLeadTravel,
          "days"
        ),
        buildMetric(
          "Avg holiday value per booking",
          left.avgHolidayValue,
          right.avgHolidayValue,
          "currency"
        ),
      ],
    },
  ]
}

export function formatReportingContext(filters: ReportingFilters): string {
  const period = REPORTING_PERIOD_LABELS[filters.period]
  const brandA = REPORTING_BRAND_LABELS[filters.brandA] ?? filters.brandA
  if (!filters.compareEnabled) return `${brandA} · ${period}`
  const brandB = REPORTING_BRAND_LABELS[filters.brandB] ?? filters.brandB
  return `${brandA} vs ${brandB} · ${period}`
}
