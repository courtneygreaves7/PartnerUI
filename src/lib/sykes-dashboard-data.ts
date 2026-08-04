import {
  PORTFOLIO,
  splitByChannel,
  formatGbp,
  formatPct,
  formatVolume,
  formatPp,
} from "@/lib/mock-portfolio"

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

const FC_BOOKINGS_SPLIT = splitByChannel(PORTFOLIO.fcBookings)
const FC_MARGIN_SPLIT = splitByChannel(PORTFOLIO.fcMargin)
const FC_INCREMENTAL_SPLIT = splitByChannel(PORTFOLIO.incrementalTotal)

export const PARTNER_REVENUE = {
  headline: formatGbp(PORTFOLIO.generated, "compact"),
  headlineExact: formatGbp(PORTFOLIO.generated, "exact"),
  headlineNote: "(net of insurance premium rate + IPT)",
  drivers: [
    { label: "Attachment (average)", value: formatPct(PORTFOLIO.attachmentPct, 1) },
    { label: "Margin (ex. VAT) £m", value: formatGbp(PORTFOLIO.fcMargin, "thousands") },
    {
      label: "Incremental cancellations & relets",
      value: formatGbp(PORTFOLIO.incrementalTotal, "thousands"),
    },
    {
      label: "Website conversion*",
      value: `${formatGbp(PORTFOLIO.conversionUplift, "thousands")} p/a`,
    },
    {
      label: "Total",
      value: formatGbp(PORTFOLIO.generated, "thousands"),
      highlight: true,
    },
  ],
} as const

/** Home hero: generated impact vs upside still available. */
export const PARTNER_IMPACT_HERO = {
  generated: formatGbp(PORTFOLIO.generated, "exact"),
  generatedLabel: "Generated with Pikl'd Stays",
  generatedHint: "Margin, conversion uplift, and re-let benefit — net of premium + IPT",
  available: formatGbp(PORTFOLIO.valuePerAttachmentPp, "exact"),
  availableLabel: "Still on the table",
  availableHint: "Estimated value of +1pp more Flexible Cancellation attachment",
} as const

export const ADDITIONAL_PARTNER_REVENUE = {
  headline: formatGbp(PORTFOLIO.fcMargin + PORTFOLIO.incrementalTotal, "compact"),
  drivers: [
    {
      label: "Gross bookings",
      value: formatVolume(PORTFOLIO.bookings),
      trend: "+420",
      versus: null,
      role: "volume" as const,
      side: `Volume base · ${Math.round(PORTFOLIO.offerRate * 100)}% product available`,
    },
    {
      label: "Average lead time",
      value: `${PORTFOLIO.profile.leadTimeDays} days`,
      trend: `+${PORTFOLIO.profile.leadTimeDays - PORTFOLIO.profile.leadTimeWithoutFc}`,
      versus: `${PORTFOLIO.profile.leadTimeWithoutFc} days without Flexible Cancellation`,
      role: "profile" as const,
      side: null,
    },
    {
      label: "Average length of stay",
      value: `${PORTFOLIO.profile.losDays} days`,
      trend: `+${(PORTFOLIO.profile.losDays - PORTFOLIO.profile.losWithoutFc).toFixed(1)}`,
      versus: `${PORTFOLIO.profile.losWithoutFc} days without Flexible Cancellation`,
      role: "profile" as const,
      side: null,
    },
    {
      label: "Avg spend per booking",
      value: `£${PORTFOLIO.profile.spendPerBooking}`,
      trend: `+£${PORTFOLIO.profile.spendPerBooking - PORTFOLIO.profile.spendWithoutFc}`,
      versus: `£${PORTFOLIO.profile.spendWithoutFc} without Flexible Cancellation`,
      role: "profile" as const,
      side: null,
    },
    {
      label: "Average Pikl'd Stay IPB",
      value: `£${PORTFOLIO.profile.ipb.toFixed(1)}`,
      trend: `+£${(PORTFOLIO.profile.ipb - PORTFOLIO.profile.ipbWithoutFc).toFixed(1)}`,
      versus: `£${PORTFOLIO.profile.ipbWithoutFc.toFixed(1)} without Flexible Cancellation`,
      role: "profile" as const,
      side: null,
    },
  ],
} as const

/** Monthly bookings (000s) — scales to annual portfolio bookings. */
export const GROSS_BOOKINGS_TREND = [
  { label: "Jan", value: 38 },
  { label: "Feb", value: 40 },
  { label: "Mar", value: 42 },
  { label: "Apr", value: 44 },
  { label: "May", value: 46 },
  { label: "Jun", value: 50 },
] as const

export const MARKET_COMPARISON_METRICS = [
  "Cancellation rate",
  "Attachment rate",
  "Relet rate",
  "Rebookability rate",
  "Rebookability average value",
  "Average lead time",
  "Average length of stay",
] as const

/** Partner vs market mock figures — same measures, filled values. */
export const MARKET_COMPARISON_VALUES = [
  {
    metric: "Cancellation rate",
    chartLabel: "Cancel rate",
    value: formatPct(PORTFOLIO.fcCancelPct, 1),
    partner: PORTFOLIO.fcCancelPct,
    market: PORTFOLIO.market.cancelPct,
    marketLabel: formatPct(PORTFOLIO.market.cancelPct, 1),
    trend: formatPp(PORTFOLIO.fcCancelPct - PORTFOLIO.market.cancelPct),
    tone: "up" as const,
    side: `Market ${formatPct(PORTFOLIO.market.cancelPct, 1)}`,
  },
  {
    metric: "Attachment rate",
    chartLabel: "Attachment",
    value: formatPct(PORTFOLIO.attachmentPct, 1),
    partner: PORTFOLIO.attachmentPct,
    market: PORTFOLIO.market.attachmentPct,
    marketLabel: formatPct(PORTFOLIO.market.attachmentPct, 1),
    trend: formatPp(PORTFOLIO.attachmentPct - PORTFOLIO.market.attachmentPct),
    tone: "up" as const,
    side: `Market ${formatPct(PORTFOLIO.market.attachmentPct, 1)}`,
  },
  {
    metric: "Relet rate",
    chartLabel: "Relet rate",
    value: formatPct(PORTFOLIO.reletPct, 1),
    partner: PORTFOLIO.reletPct,
    market: PORTFOLIO.market.reletPct,
    marketLabel: formatPct(PORTFOLIO.market.reletPct, 1),
    trend: formatPp(PORTFOLIO.reletPct - PORTFOLIO.market.reletPct),
    tone: "up" as const,
    side: `Market ${formatPct(PORTFOLIO.market.reletPct, 1)}`,
  },
  {
    metric: "Rebookability rate",
    chartLabel: "Rebook rate",
    value: formatPct(PORTFOLIO.market.rebookabilityPct + 3, 0),
    partner: PORTFOLIO.market.rebookabilityPct + 3,
    market: PORTFOLIO.market.rebookabilityPct,
    marketLabel: formatPct(PORTFOLIO.market.rebookabilityPct, 0),
    trend: "+3.0pp",
    tone: "up" as const,
    side: `Market ${formatPct(PORTFOLIO.market.rebookabilityPct, 0)}`,
  },
  {
    metric: "Rebookability average value",
    chartLabel: "Rebook value",
    value: `£${PORTFOLIO.market.rebookabilityValue + 25}`,
    partner: PORTFOLIO.market.rebookabilityValue + 25,
    market: PORTFOLIO.market.rebookabilityValue,
    marketLabel: `£${PORTFOLIO.market.rebookabilityValue}`,
    trend: "+£25",
    tone: "up" as const,
    side: `Market £${PORTFOLIO.market.rebookabilityValue}`,
  },
  {
    metric: "Average lead time",
    chartLabel: "Lead time",
    value: `${PORTFOLIO.profile.leadTimeDays} days`,
    partner: PORTFOLIO.profile.leadTimeDays,
    market: PORTFOLIO.market.leadTimeDays,
    marketLabel: `${PORTFOLIO.market.leadTimeDays} days`,
    trend: `+${PORTFOLIO.profile.leadTimeDays - PORTFOLIO.market.leadTimeDays}`,
    tone: "up" as const,
    side: `Market ${PORTFOLIO.market.leadTimeDays} days`,
  },
  {
    metric: "Average length of stay",
    chartLabel: "Length of stay",
    value: `${PORTFOLIO.profile.losDays} days`,
    partner: PORTFOLIO.profile.losDays,
    market: PORTFOLIO.market.losDays,
    marketLabel: `${PORTFOLIO.market.losDays} days`,
    trend: `+${(PORTFOLIO.profile.losDays - PORTFOLIO.market.losDays).toFixed(1)}`,
    tone: "up" as const,
    side: `Market ${PORTFOLIO.market.losDays} days`,
  },
] as const

export const TOTAL_PRODUCTS_SUMMARY = [
  {
    label: "Total bookings",
    value: formatVolume(PORTFOLIO.bookings),
    detail: "All brands · current period",
    trend: "+420",
    tone: "up" as const,
  },
  {
    label: "Bookings offered a product",
    value: formatPct(PORTFOLIO.offerRate * 100, 0),
    detail: "Share of bookings shown a product",
    trend: "+1.8pp",
    tone: "up" as const,
  },
  {
    label: "Bookings offered product",
    value: PORTFOLIO.offeredBookings.toLocaleString("en-GB"),
    detail: "Volume offered a Pikl product",
    trend: "+9.8k",
    tone: "up" as const,
  },
  {
    label: "Total margin earned",
    value: formatVolume(PORTFOLIO.fcMargin),
    detail: "Partner margin across products",
    trend: `+${formatGbp(38_000, "thousands")}`,
    tone: "up" as const,
  },
  {
    label: "Income per booking",
    value: PORTFOLIO.incomePerBooking.toFixed(2),
    detail: "Average income per booking",
    trend: "+0.14",
    tone: "up" as const,
  },
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
 * Channel mock figures from mock-portfolio anchors.
 * Direct = Website+App+Offline; Total = Direct+OTA.
 */
export const FLEXIBLE_CANCELLATION_GRID: ChannelGridRow[] = [
  volumeRow("FC Bookings", {
    website: FC_BOOKINGS_SPLIT.website,
    app: FC_BOOKINGS_SPLIT.app,
    offline: FC_BOOKINGS_SPLIT.offline,
    ota: FC_BOOKINGS_SPLIT.ota,
  }),
  attachmentRow(
    "FC Attachment",
    { website: 14.5, app: 12, offline: 9, ota: 11 },
    13.2,
    PORTFOLIO.attachmentPct
  ),
  flatRateRow("FC Guest Price Avg %", "9.5%"),
  flatRateRow("FC Insurance Premium Rate Avg %", "6.1%"),
  moneyRow("FC Partner Margin £", {
    website: FC_MARGIN_SPLIT.website,
    app: FC_MARGIN_SPLIT.app,
    offline: FC_MARGIN_SPLIT.offline,
    ota: FC_MARGIN_SPLIT.ota,
  }),
  moneyRow("Incremental Cancellations & Relets", {
    website: FC_INCREMENTAL_SPLIT.website,
    app: FC_INCREMENTAL_SPLIT.app,
    offline: FC_INCREMENTAL_SPLIT.offline,
    ota: FC_INCREMENTAL_SPLIT.ota,
  }),
  {
    label: `Out of Test Conversion Benefit (1% ≈ ${formatGbp(PORTFOLIO.conversionUplift, "thousands")})`,
    website: { value: "0.8%", variant: "rate" },
    app: { value: "N/A", variant: "empty" },
    offline: { value: "N/A", variant: "empty" },
    ota: { value: "N/A", variant: "empty" },
    direct: {
      value: formatGbp(PORTFOLIO.conversionUplift, "thousands"),
      variant: "direct",
    },
    total: {
      value: formatGbp(PORTFOLIO.conversionUplift, "thousands"),
      variant: "total",
    },
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

export type AttachmentValueChannel = {
  key: "website" | "app" | "offline" | "ota" | "direct" | "total"
  label: string
  attachmentPct: number
  margin: number
  /** Estimated partner margin from +1 percentage point of attachment. */
  valuePerPp: number
}

function formatCompactMoney(value: number): string {
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000
    const rounded =
      Math.abs(thousands - Math.round(thousands)) < 0.05
        ? String(Math.round(thousands))
        : thousands.toFixed(1)
    return `£${rounded}k`
  }
  return `£${Math.round(value).toLocaleString("en-GB")}`
}

/**
 * Value of +1pp attachment ≈ current margin ÷ current attachment rate.
 * Uses only the attachment and margin rows already on the channel grid.
 */
export function getAttachmentValuePerPp(
  attachmentRow: ChannelGridRow,
  marginRow: ChannelGridRow
): AttachmentValueChannel[] {
  const keys = [
    { key: "website" as const, label: "Website" },
    { key: "app" as const, label: "App" },
    { key: "offline" as const, label: "Offline" },
    { key: "ota" as const, label: "OTA" },
    { key: "direct" as const, label: "Direct" },
    { key: "total" as const, label: "Total" },
  ]

  return keys.map(({ key, label }) => {
    const attachmentPct = parseGridValue(attachmentRow[key].value)
    const margin = parseGridValue(marginRow[key].value)
    const valuePerPp =
      attachmentPct > 0 ? Math.round(margin / attachmentPct) : 0
    return { key, label, attachmentPct, margin, valuePerPp }
  })
}

export function formatAttachmentValuePerPp(value: number): string {
  return formatCompactMoney(value)
}

export const FC_ATTACHMENT_VALUE_PER_PP = getAttachmentValuePerPp(
  FLEXIBLE_CANCELLATION_GRID[1],
  FLEXIBLE_CANCELLATION_GRID[4]
)

export const DDL_ATTACHMENT_VALUE_PER_PP = getAttachmentValuePerPp(
  DAMAGE_DEPOSIT_WAIVER_GRID[1],
  DAMAGE_DEPOSIT_WAIVER_GRID[4]
)

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
 * - Lead times / holiday values scale with FC attachment vs portfolio baseline
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

function tripleFromBookings(month: string, bookings: number): MonthlyTripleSeries {
  const cancellations = Math.round(bookings * PORTFOLIO.fcCancelRate)
  const relets = Math.round(cancellations * PORTFOLIO.reletRate)
  return { month, bookings, cancellations, relets }
}

export const MARGIN_EARNED_FC_DATA = SYKES_MONTHS.map((month, index) => {
  const shares = [0.09, 0.08, 0.075, 0.07, 0.07, 0.075, 0.09, 0.11, 0.08, 0.07, 0.06, 0.07]
  return {
    month,
    value: Math.round((PORTFOLIO.fcMargin * (shares[index] ?? 0.08)) / 1000),
  }
})

export const EVENTS_BY_DATE_SUMMER_DATA: MonthlyTripleSeries[] = [
  tripleFromBookings("Jan", 2200),
  tripleFromBookings("Feb", 2400),
  tripleFromBookings("Mar", 3800),
  tripleFromBookings("Apr", 4800),
  tripleFromBookings("May", 5200),
  tripleFromBookings("Jun", 6200),
  tripleFromBookings("Jul", 7800),
  tripleFromBookings("Aug", 9200),
  tripleFromBookings("Sep", 5800),
  tripleFromBookings("Oct", 3600),
  tripleFromBookings("Nov", 2400),
  tripleFromBookings("Dec", 2600),
]

export const EVENTS_BY_DATE_DECLINING_DATA: MonthlyTripleSeries[] = [
  tripleFromBookings("Jan", 7200),
  tripleFromBookings("Feb", 6400),
  tripleFromBookings("Mar", 5800),
  tripleFromBookings("Apr", 5200),
  tripleFromBookings("May", 5000),
  tripleFromBookings("Jun", 4800),
  tripleFromBookings("Jul", 4600),
  tripleFromBookings("Aug", 4500),
  tripleFromBookings("Sep", 4400),
  tripleFromBookings("Oct", 4300),
  tripleFromBookings("Nov", 4200),
  tripleFromBookings("Dec", 4100),
]

export const DEPARTURES_BY_DATE_DATA = EVENTS_BY_DATE_SUMMER_DATA

/**
 * Rolling departure-window series for AI period reports (Jun 2025 – Jun 2026).
 * Volumes follow the same seasonal shape as DEPARTURES_BY_DATE_DATA; cancel rate
 * eases slightly so trend questions have a grounded answer.
 */
export type PeriodSalesCancelPoint = {
  label: string
  month: string
  year: number
  bookings: number
  cancellations: number
  relets: number
  cancelRate: number
  reletRate: number
}

const DEPARTURE_VOLUME_BY_MONTH = Object.fromEntries(
  DEPARTURES_BY_DATE_DATA.map((row) => [row.month, row.bookings])
) as Record<string, number>

const PERIOD_MONTH_KEYS = [
  { month: "Jun", year: 2025 },
  { month: "Jul", year: 2025 },
  { month: "Aug", year: 2025 },
  { month: "Sep", year: 2025 },
  { month: "Oct", year: 2025 },
  { month: "Nov", year: 2025 },
  { month: "Dec", year: 2025 },
  { month: "Jan", year: 2026 },
  { month: "Feb", year: 2026 },
  { month: "Mar", year: 2026 },
  { month: "Apr", year: 2026 },
  { month: "May", year: 2026 },
  { month: "Jun", year: 2026 },
] as const

export const SALES_VS_CANCEL_PERIOD: PeriodSalesCancelPoint[] = PERIOD_MONTH_KEYS.map(
  ({ month, year }, index) => {
    const baseBookings = DEPARTURE_VOLUME_BY_MONTH[month] ?? 600
    // Mild year-on-year growth into 2026 peak season
    const growth = year === 2026 ? 1.04 : 1
    const bookings = Math.round(baseBookings * growth)
    // Cancel rate improves ~0.8pp across the window (10.2% → 9.4%)
    const cancelRate = Math.round((10.2 - (index / (PERIOD_MONTH_KEYS.length - 1)) * 0.8) * 10) / 10
    const cancellations = Math.round((bookings * cancelRate) / 100)
    // Re-let rate edges up with demand recovery into summer
    const reletRate = Math.round((58 + (index / (PERIOD_MONTH_KEYS.length - 1)) * 4) * 10) / 10
    const relets = Math.round((cancellations * reletRate) / 100)
    return {
      label: `${month} ${year}`,
      month,
      year,
      bookings,
      cancellations,
      relets,
      cancelRate,
      reletRate,
    }
  }
)

export function summariseSalesCancelPeriod(rows: PeriodSalesCancelPoint[] = SALES_VS_CANCEL_PERIOD) {
  const sum = (key: "bookings" | "cancellations" | "relets") =>
    rows.reduce((total, row) => total + row[key], 0)
  const bookings = sum("bookings")
  const cancellations = sum("cancellations")
  const relets = sum("relets")
  const cancelRate =
    bookings > 0 ? Math.round((cancellations / bookings) * 1000) / 10 : 0
  const reletRate =
    cancellations > 0 ? Math.round((relets / cancellations) * 1000) / 10 : 0

  const midpoint = Math.ceil(rows.length / 2)
  const firstHalf = rows.slice(0, midpoint)
  const secondHalf = rows.slice(midpoint)
  const halfRate = (half: PeriodSalesCancelPoint[]) => {
    const b = half.reduce((t, r) => t + r.bookings, 0)
    const c = half.reduce((t, r) => t + r.cancellations, 0)
    return b > 0 ? Math.round((c / b) * 1000) / 10 : 0
  }
  const earlyCancelRate = halfRate(firstHalf)
  const lateCancelRate = halfRate(secondHalf)
  const cancelRateDelta = Math.round((lateCancelRate - earlyCancelRate) * 10) / 10

  const first = rows[0]!
  const last = rows[rows.length - 1]!
  const peak = [...rows].sort((a, b) => b.bookings - a.bookings)[0]!
  const softestCancel = [...rows].sort((a, b) => a.cancelRate - b.cancelRate)[0]!
  const highestCancel = [...rows].sort((a, b) => b.cancelRate - a.cancelRate)[0]!

  return {
    fromLabel: first.label,
    toLabel: last.label,
    bookings,
    cancellations,
    relets,
    cancelRate,
    reletRate,
    earlyCancelRate,
    lateCancelRate,
    cancelRateDelta,
    cancelTrend:
      cancelRateDelta <= -0.3
        ? ("improving" as const)
        : cancelRateDelta >= 0.3
          ? ("worsening" as const)
          : ("stable" as const),
    first,
    last,
    peak,
    softestCancel,
    highestCancel,
    rows,
  }
}

/** FC bookings by month of departure (same series as phasing “based on date of departure”). */
export const FC_BOOKINGS_BY_DEPARTURE = DEPARTURES_BY_DATE_DATA.map((row) => ({
  month: row.month,
  value: row.bookings,
}))

/** DDL bookings by departure — same seasonality shape, scaled to DDL volume. */
export const DDL_BOOKINGS_BY_DEPARTURE = FC_BOOKINGS_BY_DEPARTURE.map((row) => ({
  month: row.month,
  value: Math.round(row.value * 0.4),
}))

/** Cancel rate (%) by departure month — cancellations ÷ FC bookings on departure date. */
export const FC_CANCEL_RATE_BY_DEPARTURE = DEPARTURES_BY_DATE_DATA.map((row) => ({
  month: row.month,
  value:
    row.bookings > 0
      ? Math.round((row.cancellations / row.bookings) * 1000) / 10
      : 0,
}))

/**
 * FC value loop — sales → cancel → re-let → incremental £.
 * Figures come from mock-portfolio anchors (same truth as Home / grids).
 */
export const FC_VALUE_LOOP = {
  title: "How Flexible Cancellation drives max revenue",
  story:
    "This is how you run the book for more revenue: convert more guests onto cover, earn product margin, manage the cancels that follow, and re-let so cancelled holidays still pay. Not an add-on — the loop that keeps top-line moving.",
  steps: [
    {
      id: "sales",
      label: "Cover take-up",
      value: formatPct(PORTFOLIO.attachmentPct, 1),
      hint: "Conversion onto Flexible Cancellation",
      goodWhen: "higher" as const,
      help: "Share of bookings where the guest bought Flexible Cancellation. This is booking conversion onto cover — the start of the revenue loop. Calculation: Flexible Cancellation bookings ÷ all bookings.",
    },
    {
      id: "cancel",
      label: "Cancel",
      value: formatPct(PORTFOLIO.fcCancelPct, 1),
      hint: "Expected when guests have cover",
      goodWhen: "context" as const,
      help: "Share of Flexible Cancellation bookings that were cancelled. Some cancellation is normal when guests have cover — the point is what you recover next. Calculation: cancellations ÷ Flexible Cancellation bookings.",
    },
    {
      id: "relet",
      label: "Re-let",
      value: formatPct(PORTFOLIO.reletPct, 1),
      hint: "Cancelled stays filled again",
      goodWhen: "higher" as const,
      help: "Share of cancelled stays that were re-let to another guest. This is how cancelled holidays turn back into revenue — and why the product is operational, not optional. Calculation: re-lets ÷ cancellations.",
    },
    {
      id: "incremental",
      label: "Extra revenue",
      value: formatGbp(PORTFOLIO.incrementalTotal, "thousands"),
      hint: "Proof the loop is working",
      goodWhen: "higher" as const,
      help: "Extra revenue from re-letting cancelled Flexible Cancellation stays. The commercial proof that cover + ops is a necessity for max revenue, not an ancillary add-on.",
    },
  ],
} as const

/** DDL value loop — offer → attach → margin → conversion benefit. */
export const DDL_VALUE_LOOP = {
  title: "How Damage Waiver drives incremental margin",
  story:
    "Damage Waiver replaces a cash deposit with a paid product: guests take it up, you earn partner margin, and stronger conversion on direct channels lifts the book. Follow the loop to see where attachment is soft and where margin already pays.",
  steps: [
    {
      id: "offered",
      label: "Product available",
      value: formatPct(PORTFOLIO.offerRate * 100, 0),
      hint: "Share of bookings shown the waiver",
      goodWhen: "higher" as const,
      help: "Share of bookings where Damage Waiver was available to the guest. Calculation: bookings offered Damage Waiver ÷ total bookings.",
    },
    {
      id: "attach",
      label: "Waiver take-up",
      value: DAMAGE_DEPOSIT_WAIVER_GRID[1].total.value,
      hint: "Conversion onto Damage Waiver",
      goodWhen: "higher" as const,
      help: "Share of eligible bookings that attached Damage Waiver. Calculation: DDL bookings ÷ bookings offered Damage Waiver.",
    },
    {
      id: "margin",
      label: "Partner margin",
      value: DAMAGE_DEPOSIT_WAIVER_GRID[4].total.value,
      hint: "Earnings from waiver attachments",
      goodWhen: "higher" as const,
      help: "Partner margin earned from Damage Waiver by channel, net of premium.",
    },
    {
      id: "conversion",
      label: "Conversion benefit",
      value: DAMAGE_DEPOSIT_WAIVER_GRID[5].total.value,
      hint: "Proof the product lifts the book",
      goodWhen: "higher" as const,
      help: "Estimated partner margin from conversion lift linked to Damage Waiver on direct channels.",
    },
  ],
} as const

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
