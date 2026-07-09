export const SYKES_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export const PHASING_BANNER_TITLE =
  "Phasing of Margin earned from Flexible Cancellation; When people are travelling; cancellation/relet rate"

export const PARTNER_REVENUE = {
  headline: "£1.8m",
  headlineNote: "(net of insurance premium rate + IPT)",
  drivers: [
    { label: "Attachment (Average)", value: "14%" },
    { label: "Margin (ex. VAT) £m", value: "£900k" },
    { label: "Incremental Cancellations & Relets", value: "£100k" },
    {
      label: "Website Conversion*",
      value: "£800k p/a",
    },
    { label: "Total", value: "£1,800k", highlight: true },
  ],
} as const

export const ADDITIONAL_PARTNER_REVENUE = {
  headline: "£1.2m",
  drivers: [
    {
      label: "Gross Bookings",
      value: "690k",
      trend: "+500",
      side: "65% % Product available",
    },
    {
      label: "Average Lead Time v Non-FC",
      value: "125 Days",
      trend: "+15",
      side: "£100k est. value",
    },
    {
      label: "Average Length of Stay v Non-FC",
      value: "6.1 Days",
      trend: "+0.5",
      side: "£100k est. value",
    },
    {
      label: "Average Customer Spend per Booking v Non-FC",
      value: "£899",
      trend: "+3",
      side: "£100k est. value",
    },
    {
      label: "Average Pikl'd Stay IPB",
      value: "£4.0",
      trend: "+1",
      side: "£100k est. value",
    },
  ],
} as const

export const GROSS_BOOKINGS_TREND = [
  { label: "Jan", value: 520 },
  { label: "Feb", value: 545 },
  { label: "Mar", value: 580 },
  { label: "Apr", value: 610 },
  { label: "May", value: 640 },
  { label: "Jun", value: 690 },
] as const

export const MARKET_COMPARISON_METRICS = [
  "Cancellation Rate",
  "Rebookability Rate",
  "Rebookability Average value",
  "Average Lead Time",
  "Average Length of Stay",
] as const

/** Partner vs market mock figures — same measures, filled values. */
export const MARKET_COMPARISON_VALUES = [
  { metric: "Cancellation Rate", value: "8.3%", trend: "-0.6pp", tone: "up" as const, side: "Market 8.9%" },
  { metric: "Rebookability Rate", value: "58%", trend: "+2.1pp", tone: "up" as const, side: "Market 55%" },
  { metric: "Rebookability Average value", value: "£830", trend: "+£40", tone: "up" as const, side: "Market £790" },
  { metric: "Average Lead Time", value: "125 days", trend: "+15", tone: "up" as const, side: "Market 110 days" },
  { metric: "Average Length of Stay", value: "6.1 days", trend: "+0.5", tone: "up" as const, side: "Market 5.6 days" },
] as const

export const TOTAL_PRODUCTS_SUMMARY = [
  { label: "Total Bookings", value: "690k", trend: "+500", tone: "up" as const },
  { label: "% of Bookings that are offered a product", value: "65%", trend: "+2.1pp", tone: "up" as const },
  { label: "Total Bookings offered a Product", value: "448,500", trend: "+12.4k", tone: "up" as const },
  { label: "Total Margin Earned", value: "800k", trend: "+£40k", tone: "up" as const },
  { label: "Income per Booking Achieved", value: "4.01", trend: "+0.18", tone: "up" as const },
] as const

export type ChannelCellVariant =
  | "channel"
  | "volume"
  | "attachment"
  | "rate"
  | "direct"
  | "total"
  | "empty"

export type ChannelGridCell = {
  value: string
  variant: ChannelCellVariant
}

export type ChannelGridRow = {
  label: string
  website: ChannelGridCell
  app: ChannelGridCell
  offline: ChannelGridCell
  ota: ChannelGridCell
  direct: ChannelGridCell
  total: ChannelGridCell
}

type ChannelValues = {
  website: number
  app: number
  offline: number
  ota: number
}

function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return value.toLocaleString("en-GB")
}

function formatMoney(value: number): string {
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000
    const rounded = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1)
    return `£${rounded}k`
  }
  return `£${value.toLocaleString("en-GB")}`
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

function formatDays(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} days`
}

function formatCurrency(value: number): string {
  return `£${value.toLocaleString("en-GB")}`
}

function sumChannels({ website, app, offline, ota }: ChannelValues) {
  const direct = website + app + offline
  const total = direct + ota
  return { website, app, offline, ota, direct, total }
}

function volumeRow(label: string, values: ChannelValues): ChannelGridRow {
  const summed = sumChannels(values)
  return {
    label,
    website: { value: formatCount(summed.website), variant: "volume" },
    app: { value: formatCount(summed.app), variant: "volume" },
    offline: { value: formatCount(summed.offline), variant: "volume" },
    ota: { value: formatCount(summed.ota), variant: "volume" },
    direct: { value: formatCount(summed.direct), variant: "direct" },
    total: { value: formatCount(summed.total), variant: "total" },
  }
}

function moneyRow(label: string, values: ChannelValues): ChannelGridRow {
  const summed = sumChannels(values)
  return {
    label,
    website: { value: formatMoney(summed.website), variant: "channel" },
    app: { value: formatMoney(summed.app), variant: "channel" },
    offline: { value: formatMoney(summed.offline), variant: "channel" },
    ota: { value: formatMoney(summed.ota), variant: "channel" },
    direct: { value: formatMoney(summed.direct), variant: "direct" },
    total: { value: formatMoney(summed.total), variant: "total" },
  }
}

function attachmentRow(
  label: string,
  channels: ChannelValues,
  direct: number,
  total: number
): ChannelGridRow {
  return {
    label,
    website: { value: formatPercent(channels.website), variant: "attachment" },
    app: { value: formatPercent(channels.app), variant: "attachment" },
    offline: { value: formatPercent(channels.offline), variant: "attachment" },
    ota: { value: formatPercent(channels.ota), variant: "attachment" },
    direct: { value: formatPercent(direct), variant: "direct" },
    total: { value: formatPercent(total), variant: "total" },
  }
}

function flatRateRow(label: string, value: string): ChannelGridRow {
  const channelCell = (): ChannelGridCell => ({ value, variant: "rate" })
  return {
    label,
    website: channelCell(),
    app: channelCell(),
    offline: channelCell(),
    ota: channelCell(),
    direct: { value, variant: "direct" },
    total: { value, variant: "total" },
  }
}

function metricRow(
  label: string,
  channels: ChannelValues,
  direct: number,
  total: number,
  format: (value: number) => string
): ChannelGridRow {
  return {
    label,
    website: { value: format(channels.website), variant: "channel" },
    app: { value: format(channels.app), variant: "channel" },
    offline: { value: format(channels.offline), variant: "channel" },
    ota: { value: format(channels.ota), variant: "channel" },
    direct: { value: format(direct), variant: "direct" },
    total: { value: format(total), variant: "total" },
  }
}
/**
 * Channel mock figures are derived so Direct = Website+App+Offline and Total = Direct+OTA.
 * Anchors from partner summaries: 690k bookings, 14% attachment, £900k FC margin, £100k incremental benefit.
 */
export const FLEXIBLE_CANCELLATION_GRID: ChannelGridRow[] = [
  // 14% of 690k ≈ 96.6k FC bookings
  volumeRow("FC Bookings", { website: 48300, app: 19320, offline: 9660, ota: 19320 }),
  attachmentRow("FC Attachment", { website: 16, app: 12, offline: 8, ota: 11 }, 14.5, 14),
  flatRateRow("FC Guest Price Avg %", "10%"),
  flatRateRow("FC Insurance Premium Rate Avg %", "6.35%"),
  // Aligns to PARTNER_REVENUE Margin (ex. VAT) £900k
  moneyRow("FC Partner Margin £", { website: 520000, app: 180000, offline: 80000, ota: 120000 }),
  // Aligns to PARTNER_REVENUE Incremental Cancellations & Relets £100k
  moneyRow("Commission and Booking Fee Benefit from Incremental Cancellations", {
    website: 55000,
    app: 20000,
    offline: 10000,
    ota: 15000,
  }),
  {
    label: "Out of Test Conversion Benefit (1% = £900,000)",
    website: { value: "1.0%", variant: "rate" },
    app: { value: "N/A", variant: "empty" },
    offline: { value: "N/A", variant: "empty" },
    ota: { value: "N/A", variant: "empty" },
    direct: { value: "£900k", variant: "direct" },
    total: { value: "£900k", variant: "total" },
  },
]

export const DAMAGE_DEPOSIT_WAIVER_GRID: ChannelGridRow[] = [
  volumeRow("DDL Bookings", { website: 22000, app: 8000, offline: 4000, ota: 6000 }),
  attachmentRow("DDL Attachment", { website: 8, app: 6, offline: 4, ota: 5 }, 7, 6.8),
  flatRateRow("DDL Guest Price Avg %", "£30"),
  flatRateRow("DDL Insurance Premium Rate Avg%", "2.12%"),
  moneyRow("DDL Partner Margin £", { website: 180000, app: 60000, offline: 30000, ota: 40000 }),
  {
    label: "Out of Test Conversion Benefit",
    website: { value: "0.4%", variant: "attachment" },
    app: { value: "N/A", variant: "empty" },
    offline: { value: "N/A", variant: "empty" },
    ota: { value: "N/A", variant: "empty" },
    direct: { value: "£180k", variant: "direct" },
    total: { value: "£180k", variant: "total" },
  },
]

function parseGridValue(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, "")) || 0
  if (/k/i.test(value)) return numeric * 1000
  if (/m/i.test(value)) return numeric * 1_000_000
  return numeric
}

function parseGridChannels(row: ChannelGridRow): ChannelValues {
  return {
    website: parseGridValue(row.website.value),
    app: parseGridValue(row.app.value),
    offline: parseGridValue(row.offline.value),
    ota: parseGridValue(row.ota.value),
  }
}

function weightedChannelAverage(values: ChannelValues, weights: ChannelValues): number {
  const totalWeight =
    weights.website + weights.app + weights.offline + weights.ota
  if (!totalWeight) return 0
  return (
    values.website * weights.website +
    values.app * weights.app +
    values.offline * weights.offline +
    values.ota * weights.ota
  ) / totalWeight
}

function weightedDirectAverage(values: ChannelValues, weights: ChannelValues): number {
  const directWeight = weights.website + weights.app + weights.offline
  if (!directWeight) return 0
  return (
    values.website * weights.website +
    values.app * weights.app +
    values.offline * weights.offline
  ) / directWeight
}

function channelFromBookings(
  bookings: ChannelValues,
  ratePct: ChannelValues
): ChannelValues {
  return {
    website: Math.round((bookings.website * ratePct.website) / 100),
    app: Math.round((bookings.app * ratePct.app) / 100),
    offline: Math.round((bookings.offline * ratePct.offline) / 100),
    ota: Math.round((bookings.ota * ratePct.ota) / 100),
  }
}

function channelFromRatio(
  source: ChannelValues,
  ratePct: ChannelValues
): ChannelValues {
  return {
    website: Math.round((source.website * ratePct.website) / 100),
    app: Math.round((source.app * ratePct.app) / 100),
    offline: Math.round((source.offline * ratePct.offline) / 100),
    ota: Math.round((source.ota * ratePct.ota) / 100),
  }
}

/**
 * Derive contribution metrics from FC (and DDL) proposition grids.
 * Direct = Website+App+Offline; Total = Direct+OTA.
 *
 * Formulas (per channel):
 * - Cancellation volume = FC bookings × cancellation avg %
 * - Cancellation volume FC = FC bookings × cancellation FC avg %
 * - Relet volume = cancellation volume FC × re-let %
 * - Relet volume FC = cancellation volume FC × re-let FC %
 * - Re-let value avg = incremental cancellation benefit ÷ relet volume
 * - Lead times / holiday values scale with FC attachment vs portfolio baseline (14%)
 */
export function buildContributionToPerformanceGrid(
  fcGrid: ChannelGridRow[] = FLEXIBLE_CANCELLATION_GRID,
  ddlGrid: ChannelGridRow[] = DAMAGE_DEPOSIT_WAIVER_GRID
): ChannelGridRow[] {
  const fcBookings = parseGridChannels(fcGrid[0])
  const fcAttachment = parseGridChannels(fcGrid[1])
  const fcBenefit = parseGridChannels(fcGrid[5])
  const ddlBookings = parseGridChannels(ddlGrid[0])

  const cancelAvgPct: ChannelValues = {
    website: Math.round((fcAttachment.website * 0.55 + 0.1) * 10) / 10,
    app: Math.round((fcAttachment.app * 0.55 + 0.1) * 10) / 10,
    offline: Math.round((fcAttachment.offline * 0.55 + 0.1) * 10) / 10,
    ota: Math.round((fcAttachment.ota * 0.55 + 0.1) * 10) / 10,
  }

  const cancelFcAvgPct: ChannelValues = {
    website: Math.round(cancelAvgPct.website * 0.69 * 10) / 10,
    app: Math.round(cancelAvgPct.app * 0.69 * 10) / 10,
    offline: Math.round(cancelAvgPct.offline * 0.69 * 10) / 10,
    ota: Math.round(cancelAvgPct.ota * 0.69 * 10) / 10,
  }

  const reletAvgPct: ChannelValues = {
    website: 60,
    app: 60,
    offline: 60,
    ota: 60,
  }

  const reletFcAvgPct: ChannelValues = {
    website: 50,
    app: 50,
    offline: 50,
    ota: 50,
  }

  const cancelVolume = channelFromBookings(fcBookings, cancelAvgPct)
  const cancelVolumeFc = channelFromBookings(fcBookings, cancelFcAvgPct)
  const reletVolume = channelFromRatio(cancelVolumeFc, reletAvgPct)
  const reletVolumeFc = channelFromRatio(cancelVolumeFc, reletFcAvgPct)

  const reletValueAvg: ChannelValues = {
    website:
      reletVolume.website > 0
        ? Math.round(fcBenefit.website / reletVolume.website)
        : 820,
    app: reletVolume.app > 0 ? Math.round(fcBenefit.app / reletVolume.app) : 790,
    offline:
      reletVolume.offline > 0
        ? Math.round(fcBenefit.offline / reletVolume.offline)
        : 760,
    ota: reletVolume.ota > 0 ? Math.round(fcBenefit.ota / reletVolume.ota) : 740,
  }

  const reletValueFcAvg: ChannelValues = {
    website:
      reletVolumeFc.website > 0
        ? Math.round((fcBenefit.website * 1.08) / reletVolumeFc.website)
        : 860,
    app:
      reletVolumeFc.app > 0
        ? Math.round((fcBenefit.app * 1.08) / reletVolumeFc.app)
        : 830,
    offline:
      reletVolumeFc.offline > 0
        ? Math.round((fcBenefit.offline * 1.08) / reletVolumeFc.offline)
        : 800,
    ota:
      reletVolumeFc.ota > 0
        ? Math.round((fcBenefit.ota * 1.08) / reletVolumeFc.ota)
        : 780,
  }

  const attachmentFactor = (channel: keyof ChannelValues) =>
    0.92 + fcAttachment[channel] / 100

  const avgLengthBooking: ChannelValues = {
    website: Math.round(5.6 * attachmentFactor("website") * 10) / 10,
    app: Math.round(5.4 * attachmentFactor("app") * 10) / 10,
    offline: Math.round(5.8 * attachmentFactor("offline") * 10) / 10,
    ota: Math.round(5.2 * attachmentFactor("ota") * 10) / 10,
  }

  const avgLengthBookingFc: ChannelValues = {
    website: Math.round(avgLengthBooking.website * 1.1 * 10) / 10,
    app: Math.round(avgLengthBooking.app * 1.1 * 10) / 10,
    offline: Math.round(avgLengthBooking.offline * 1.1 * 10) / 10,
    ota: Math.round(avgLengthBooking.ota * 1.1 * 10) / 10,
  }

  const avgLeadTravel: ChannelValues = {
    website: Math.round(110 * attachmentFactor("website")),
    app: Math.round(105 * attachmentFactor("app")),
    offline: Math.round(118 * attachmentFactor("offline")),
    ota: Math.round(98 * attachmentFactor("ota")),
  }

  const avgLeadTravelFc: ChannelValues = {
    website: Math.round(avgLeadTravel.website * 1.16),
    app: Math.round(avgLeadTravel.app * 1.16),
    offline: Math.round(avgLeadTravel.offline * 1.16),
    ota: Math.round(avgLeadTravel.ota * 1.16),
  }

  const avgHolidayValue: ChannelValues = {
    website: Math.round(920 * attachmentFactor("website")),
    app: Math.round(880 * attachmentFactor("app")),
    offline: Math.round(860 * attachmentFactor("offline")),
    ota: Math.round(840 * attachmentFactor("ota")),
  }

  const avgHolidayValueFc: ChannelValues = {
    website: Math.round(avgHolidayValue.website * 1.02),
    app: Math.round(avgHolidayValue.app * 1.02),
    offline: Math.round(avgHolidayValue.offline * 1.02),
    ota: Math.round(avgHolidayValue.ota * 1.02),
  }

  const avgLeadCancel: ChannelValues = {
    website: Math.round(42 * (14 / Math.max(fcAttachment.website, 1))),
    app: Math.round(38 * (14 / Math.max(fcAttachment.app, 1))),
    offline: Math.round(45 * (14 / Math.max(fcAttachment.offline, 1))),
    ota: Math.round(36 * (14 / Math.max(fcAttachment.ota, 1))),
  }

  const avgLeadCancelFc: ChannelValues = {
    website: Math.round(avgLeadCancel.website * 1.14),
    app: Math.round(avgLeadCancel.app * 1.14),
    offline: Math.round(avgLeadCancel.offline * 1.14),
    ota: Math.round(avgLeadCancel.ota * 1.14),
  }

  const avgLeadRelet: ChannelValues = {
    website: Math.max(8, Math.round(12 * (ddlBookings.website / Math.max(fcBookings.website, 1)))),
    app: Math.max(8, Math.round(11 * (ddlBookings.app / Math.max(fcBookings.app, 1)))),
    offline: Math.max(
      8,
      Math.round(14 * (ddlBookings.offline / Math.max(fcBookings.offline, 1)))
    ),
    ota: Math.max(8, Math.round(10 * (ddlBookings.ota / Math.max(fcBookings.ota, 1)))),
  }

  const avgLeadReletFc: ChannelValues = {
    website: Math.max(7, Math.round(avgLeadRelet.website * 0.85)),
    app: Math.max(7, Math.round(avgLeadRelet.app * 0.85)),
    offline: Math.max(7, Math.round(avgLeadRelet.offline * 0.85)),
    ota: Math.max(7, Math.round(avgLeadRelet.ota * 0.85)),
  }

  const cancelDirectPct = weightedDirectAverage(cancelAvgPct, fcBookings)
  const cancelTotalPct = weightedChannelAverage(cancelAvgPct, fcBookings)
  const cancelFcDirectPct = weightedDirectAverage(cancelFcAvgPct, fcBookings)
  const cancelFcTotalPct = weightedChannelAverage(cancelFcAvgPct, fcBookings)
  const reletDirectPct = weightedDirectAverage(reletAvgPct, cancelVolumeFc)
  const reletTotalPct = weightedChannelAverage(reletAvgPct, cancelVolumeFc)
  const reletFcDirectPct = weightedDirectAverage(reletFcAvgPct, cancelVolumeFc)
  const reletFcTotalPct = weightedChannelAverage(reletFcAvgPct, cancelVolumeFc)

  return [
    volumeRow("Cancellation Volume", cancelVolume),
    attachmentRow("Cancellation Avg %", cancelAvgPct, cancelDirectPct, cancelTotalPct),
    volumeRow("Cancellation Volume FC", cancelVolumeFc),
    attachmentRow("Cancellation % Avg FC", cancelFcAvgPct, cancelFcDirectPct, cancelFcTotalPct),
    volumeRow("Relet Volume", reletVolume),
    attachmentRow("Re-let % Avg", reletAvgPct, reletDirectPct, reletTotalPct),
    metricRow(
      "Re-Let Value Avg",
      reletValueAvg,
      weightedDirectAverage(reletValueAvg, reletVolume),
      weightedChannelAverage(reletValueAvg, reletVolume),
      formatCurrency
    ),
    volumeRow("Re-Let Volume FC", reletVolumeFc),
    attachmentRow("Re-let % FC Avg", reletFcAvgPct, reletFcDirectPct, reletFcTotalPct),
    metricRow(
      "Re-Let Value FC Avg",
      reletValueFcAvg,
      weightedDirectAverage(reletValueFcAvg, reletVolumeFc),
      weightedChannelAverage(reletValueFcAvg, reletVolumeFc),
      formatCurrency
    ),
    metricRow(
      "Average Length of Booking",
      avgLengthBooking,
      weightedDirectAverage(avgLengthBooking, fcBookings),
      weightedChannelAverage(avgLengthBooking, fcBookings),
      formatDays
    ),
    metricRow(
      "Average Length of Booking FC",
      avgLengthBookingFc,
      weightedDirectAverage(avgLengthBookingFc, fcBookings),
      weightedChannelAverage(avgLengthBookingFc, fcBookings),
      formatDays
    ),
    metricRow(
      "Average Lead time between Booking and Travel",
      avgLeadTravel,
      weightedDirectAverage(avgLeadTravel, fcBookings),
      weightedChannelAverage(avgLeadTravel, fcBookings),
      formatDays
    ),
    metricRow(
      "Average Lead time between Booking and Travel FC",
      avgLeadTravelFc,
      weightedDirectAverage(avgLeadTravelFc, fcBookings),
      weightedChannelAverage(avgLeadTravelFc, fcBookings),
      formatDays
    ),
    metricRow(
      "Average Holiday Value Per Booking £",
      avgHolidayValue,
      weightedDirectAverage(avgHolidayValue, fcBookings),
      weightedChannelAverage(avgHolidayValue, fcBookings),
      formatCurrency
    ),
    metricRow(
      "Average Holiday Value Per Booking with FC £",
      avgHolidayValueFc,
      weightedDirectAverage(avgHolidayValueFc, fcBookings),
      weightedChannelAverage(avgHolidayValueFc, fcBookings),
      formatCurrency
    ),
    metricRow(
      "Average Lead time between Booking and Cancellation",
      avgLeadCancel,
      weightedDirectAverage(avgLeadCancel, cancelVolume),
      weightedChannelAverage(avgLeadCancel, cancelVolume),
      formatDays
    ),
    metricRow(
      "Average Lead time between Booking and Cancellation FC",
      avgLeadCancelFc,
      weightedDirectAverage(avgLeadCancelFc, cancelVolumeFc),
      weightedChannelAverage(avgLeadCancelFc, cancelVolumeFc),
      formatDays
    ),
    metricRow(
      "Average Lead time between Cancellation and Relet",
      avgLeadRelet,
      weightedDirectAverage(avgLeadRelet, reletVolume),
      weightedChannelAverage(avgLeadRelet, reletVolume),
      formatDays
    ),
    metricRow(
      "Average Lead time between Cancellation and Relet FC",
      avgLeadReletFc,
      weightedDirectAverage(avgLeadReletFc, reletVolumeFc),
      weightedChannelAverage(avgLeadReletFc, reletVolumeFc),
      formatDays
    ),
  ]
}

/**
 * Contribution to performance — derived from FC/DDL proposition grids.
 * Direct = Website+App+Offline; Total = Direct+OTA.
 */
export const CONTRIBUTION_TO_PERFORMANCE_GRID: ChannelGridRow[] =
  buildContributionToPerformanceGrid()

/** Alias kept for the full Sykes dashboard — same rows as contribution (FC + behaviour). */
export const PERFORMANCE_METRICS_GRID: ChannelGridRow[] =
  CONTRIBUTION_TO_PERFORMANCE_GRID.slice(2)

export const FINANCIALS_GRID: ChannelGridRow[] = [
  moneyRow("Insurance Premium Paid £", { website: 310000, app: 110000, offline: 50000, ota: 80000 }),
  moneyRow("Claims Made £", { website: 62000, app: 22000, offline: 10000, ota: 16000 }),
  moneyRow("Re-Let Rental Charges Paid to Insurer £", {
    website: 48000,
    app: 17000,
    offline: 8000,
    ota: 12000,
  }),
  moneyRow("Re-Let Rental Charges Potential (Paid and Potential) £", {
    website: 72000,
    app: 25000,
    offline: 12000,
    ota: 18000,
  }),
  attachmentRow("Loss Ratio % on Paid Re-Let", { website: 15.5, app: 15.5, offline: 16, ota: 15 }, 15.6, 15.5),
  attachmentRow(
    "Loss Ratio % on Re-Let Potential (Paid and Potential)",
    { website: 23.2, app: 22.7, offline: 24, ota: 22.5 },
    23.2,
    23.0
  ),
]

export type MonthlyTripleSeries = {
  month: string
  bookings: number
  cancellations: number
  relets: number
}

export const MARGIN_EARNED_FC_DATA = SYKES_MONTHS.map((month, index) => {
  const values = [1000, 800, 700, 600, 600, 600, 600, 600, 600, 600, 600, 600]
  return { month, value: values[index] }
})

export const EVENTS_BY_DATE_SUMMER_DATA: MonthlyTripleSeries[] = [
  { month: "Jan", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Feb", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Mar", bookings: 400, cancellations: 40, relets: 24 },
  { month: "Apr", bookings: 600, cancellations: 60, relets: 36 },
  { month: "May", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jun", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Jul", bookings: 1500, cancellations: 150, relets: 90 },
  { month: "Aug", bookings: 2000, cancellations: 200, relets: 120 },
  { month: "Sep", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Oct", bookings: 400, cancellations: 40, relets: 24 },
  { month: "Nov", bookings: 200, cancellations: 20, relets: 12 },
  { month: "Dec", bookings: 250, cancellations: 25, relets: 15 },
]

export const EVENTS_BY_DATE_DECLINING_DATA: MonthlyTripleSeries[] = [
  { month: "Jan", bookings: 1000, cancellations: 100, relets: 60 },
  { month: "Feb", bookings: 800, cancellations: 80, relets: 48 },
  { month: "Mar", bookings: 700, cancellations: 70, relets: 42 },
  { month: "Apr", bookings: 600, cancellations: 60, relets: 36 },
  { month: "May", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jun", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Jul", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Aug", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Sep", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Oct", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Nov", bookings: 600, cancellations: 60, relets: 36 },
  { month: "Dec", bookings: 600, cancellations: 60, relets: 36 },
]

export const DEPARTURES_BY_DATE_DATA = EVENTS_BY_DATE_SUMMER_DATA

export const TRIPLE_SERIES_COLORS = {
  bookings: "#3f3f46",
  cancellations: "#71717a",
  relets: "#a1a1aa",
} as const

export const TRIPLE_SERIES_LABELS = {
  bookings: "FC Bookings Made",
  cancellations: "FC Cancellations",
  relets: "FC Relets",
} as const
