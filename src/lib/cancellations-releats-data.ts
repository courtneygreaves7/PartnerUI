/** Channel roll-up: Direct = A+B+C, Total = A+B+C+D (content schema). */

export type ChannelKey = "website" | "app" | "offline" | "ota"

export type ChannelBreakdown = Record<ChannelKey, number> & {
  direct: number
  total: number
}

export const CHANNEL_META: Array<{
  key: ChannelKey
  label: string
  letter: "A" | "B" | "C" | "D"
  color: string
}> = [
  { key: "website", label: "Website", letter: "A", color: "#006BFF" },
  { key: "app", label: "App", letter: "B", color: "#3389FF" },
  { key: "offline", label: "Offline", letter: "C", color: "#66A6FF" },
  { key: "ota", label: "OTA", letter: "D", color: "#99C4FF" },
]

export const SERIES_COLORS = {
  cancellations: "#006BFF",
  relets: "#66A6FF",
  forecast: "#99C4FF",
} as const

function withRollups(channels: Record<ChannelKey, number>): ChannelBreakdown {
  const direct = channels.website + channels.app + channels.offline
  return { ...channels, direct, total: direct + channels.ota }
}

function weightedAvg(
  rates: Record<ChannelKey, number>,
  weights: Record<ChannelKey, number>
): { direct: number; total: number } {
  const directWeight = weights.website + weights.app + weights.offline
  const totalWeight = directWeight + weights.ota
  const direct =
    directWeight > 0
      ? (rates.website * weights.website +
          rates.app * weights.app +
          rates.offline * weights.offline) /
        directWeight
      : 0
  const total =
    totalWeight > 0
      ? (rates.website * weights.website +
          rates.app * weights.app +
          rates.offline * weights.offline +
          rates.ota * weights.ota) /
        totalWeight
      : 0
  return { direct, total }
}

/** Content-image metrics — Jul 2026 actuals & forecasts from design refs. */
export const CANCEL_VOLUME = withRollups({
  website: 342,
  app: 198,
  offline: 87,
  ota: 423,
})

export const CANCEL_VOLUME_FC = withRollups({
  website: 310,
  app: 185,
  offline: 92,
  ota: 380,
})

export const CANCEL_RATE: ChannelBreakdown = {
  website: 8.4,
  app: 6.2,
  offline: 12.1,
  ota: 15.3,
  direct: 8.9,
  total: 11.2,
}

export const CANCEL_RATE_FC: ChannelBreakdown = {
  website: 7.8,
  app: 5.9,
  offline: 11.5,
  ota: 14.1,
  direct: 8.3,
  total: 10.6,
}

export const RELET_VOLUME = withRollups({
  website: 289,
  app: 171,
  offline: 63,
  ota: 358,
})

export const RELET_VOLUME_FC = withRollups({
  website: 320,
  app: 180,
  offline: 70,
  ota: 370,
})

export const RELET_RATE: ChannelBreakdown = (() => {
  const rates = { website: 84.5, app: 86.4, offline: 72.4, ota: 84.6 }
  const { direct, total } = weightedAvg(rates, RELET_VOLUME)
  return { ...rates, direct: round1(direct), total: round1(total) }
})()

export const RELET_VALUE_AVG: ChannelBreakdown = (() => {
  const values = { website: 1240, app: 985, offline: 1560, ota: 890 }
  const { direct, total } = weightedAvg(values, RELET_VOLUME)
  return {
    ...values,
    direct: Math.round(direct),
    total: Math.round(total),
  }
})()

export type ContentMetricId =
  | "cancellationVolume"
  | "cancellationAvgPct"
  | "cancellationVolumeFc"
  | "cancellationAvgPctFc"
  | "reletVolume"
  | "reletAvgPct"
  | "reletValueAvg"
  | "reletVolumeFc"

export type ContentMetricRow = {
  id: ContentMetricId
  label: string
  format: "volume" | "percent" | "currency"
  values: ChannelBreakdown
  muted?: boolean
}

/** Eight content-schema rows used across the dashboard widgets. */
export const CONTENT_METRIC_ROWS: ContentMetricRow[] = [
  {
    id: "cancellationVolume",
    label: "Cancellation Volume",
    format: "volume",
    values: CANCEL_VOLUME,
  },
  {
    id: "cancellationAvgPct",
    label: "Cancellation Avg %",
    format: "percent",
    values: CANCEL_RATE,
  },
  {
    id: "cancellationVolumeFc",
    label: "Cancellation Volume FC",
    format: "volume",
    values: CANCEL_VOLUME_FC,
    muted: true,
  },
  {
    id: "cancellationAvgPctFc",
    label: "Cancellation % Avg FC",
    format: "percent",
    values: CANCEL_RATE_FC,
    muted: true,
  },
  {
    id: "reletVolume",
    label: "Relet Volume",
    format: "volume",
    values: RELET_VOLUME,
  },
  {
    id: "reletAvgPct",
    label: "Re-let % Avg",
    format: "percent",
    values: RELET_RATE,
  },
  {
    id: "reletValueAvg",
    label: "Re-Let Value Avg",
    format: "currency",
    values: RELET_VALUE_AVG,
  },
  {
    id: "reletVolumeFc",
    label: "Re-Let Volume FC",
    format: "volume",
    values: RELET_VOLUME_FC,
    muted: true,
  },
]

export const KPI_CARDS = [
  {
    id: "total-cancellations",
    label: "Total cancellations",
    value: formatVolume(CANCEL_VOLUME.total),
    detail: "All channels · Jul 2026",
    delta: "+8.6% vs forecast",
    tone: "primary" as const,
    icon: "alert" as const,
  },
  {
    id: "avg-cancel-rate",
    label: "Avg cancel rate",
    value: formatPercent(CANCEL_RATE.total),
    detail: "Blended across channels",
    delta: "+0.6pp vs forecast",
    tone: "accent" as const,
    icon: "down" as const,
  },
  {
    id: "total-relets",
    label: "Total re-lets",
    value: formatVolume(RELET_VOLUME.total),
    detail: "Successfully re-booked",
    delta: "-8.2% vs forecast",
    tone: "soft" as const,
    icon: "refresh" as const,
    deltaPositive: false,
  },
  {
    id: "recovery-rate",
    label: "Recovery rate",
    value: formatPercent((RELET_VOLUME.total / CANCEL_VOLUME.total) * 100),
    detail: "Re-lets ÷ cancellations",
    delta: "+0.4pp vs last month",
    tone: "light" as const,
    icon: "up" as const,
  },
] as const

export const TARGET_CARDS = [
  {
    id: "cancel-volume-target",
    label: "Cancellation volume",
    value: formatVolume(2699),
    targetLabel: "vs 2,780 target",
    actual: 2699,
    target: 2780,
    status: "On track" as const,
    lowerIsBetter: true,
  },
  {
    id: "relet-efficiency-target",
    label: "Re-let efficiency",
    value: "93.2%",
    targetLabel: "vs 90.0% target",
    actual: 93.2,
    target: 90,
    status: "On track" as const,
    lowerIsBetter: false,
  },
  {
    id: "direct-rollup-target",
    label: "Direct rollup value",
    value: "£141.20",
    targetLabel: "vs £135.00 target",
    actual: 141.2,
    target: 135,
    status: "On track" as const,
    lowerIsBetter: false,
  },
] as const

export const VOLUME_TREND = [
  { month: "Feb", cancellations: 980, relets: 900 },
  { month: "Mar", cancellations: 1050, relets: 1035 },
  { month: "Apr", cancellations: 1010, relets: 990 },
  { month: "May", cancellations: 1180, relets: 1170 },
  { month: "Jun", cancellations: 1120, relets: 1110 },
  { month: "Jul", cancellations: CANCEL_VOLUME.total, relets: RELET_VOLUME.total },
]

export const CHANNEL_MIX = [
  { key: "website" as const, label: "Website", share: 45 },
  { key: "app" as const, label: "Direct App", share: 28 },
  { key: "ota" as const, label: "OTA", share: 18 },
  { key: "offline" as const, label: "Offline", share: 9 },
]

export const CHANNEL_MIX_DIRECT_SHARE = 82

export const WEEKLY_CANCEL_RELET = [
  { day: "Mon", cancel: 42, relet: 58 },
  { day: "Tue", cancel: 38, relet: 72 },
  { day: "Wed", cancel: 55, relet: 64 },
  { day: "Thu", cancel: 48, relet: 88 },
  { day: "Fri", cancel: 62, relet: 70 },
  { day: "Sat", cancel: 78, relet: 52 },
  { day: "Sun", cancel: 44, relet: 60 },
]

export const RELET_RATE_STAT = {
  label: "Re-let % avg",
  value: "63.5%",
  unit: "Rate",
  delta: "+2.3%",
  deltaLabel: "vs prev. month",
  bars: [38, 44, 52, 61, 68, 74],
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function formatVolume(n: number) {
  return n.toLocaleString("en-GB")
}

export function formatPercent(n: number) {
  return `${round1(n)}%`
}

export function formatCurrency(n: number) {
  return `£${Math.round(n).toLocaleString("en-GB")}`
}

export function formatMetricValue(
  value: number,
  format: ContentMetricRow["format"]
) {
  if (format === "percent") return formatPercent(value)
  if (format === "currency") return formatCurrency(value)
  return formatVolume(value)
}

export function deltaVsForecast(actual: number, forecast: number) {
  return actual - forecast
}
