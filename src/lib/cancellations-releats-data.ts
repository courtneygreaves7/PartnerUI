/** Channel roll-up: Direct = A+B+C, Total = A+B+C+D (content schema). */

import { MARKET_COMPARISON_VALUES } from "@/lib/sykes-dashboard-data"
import { PORTFOLIO, julOpsVolumes } from "@/lib/mock-portfolio"

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
  { key: "website", label: "Website", letter: "A", color: "var(--primary)" },
  {
    key: "app",
    label: "App",
    letter: "B",
    color: "color-mix(in oklab, var(--primary) 78%, white)",
  },
  {
    key: "offline",
    label: "Offline",
    letter: "C",
    color: "color-mix(in oklab, var(--primary) 55%, white)",
  },
  {
    key: "ota",
    label: "OTA",
    letter: "D",
    color: "color-mix(in oklab, var(--primary) 35%, white)",
  },
]

export const SERIES_COLORS = {
  cancellations: "var(--primary)",
  relets: "color-mix(in oklab, var(--primary) 55%, white)",
  forecast: "color-mix(in oklab, var(--primary) 35%, white)",
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

const JUL = julOpsVolumes()

/** Jul ops actuals — ~1/12 of annual portfolio cancels/relets at shared rates. */
export const CANCEL_VOLUME = withRollups({
  website: JUL.cancels.website,
  app: JUL.cancels.app,
  offline: JUL.cancels.offline,
  ota: JUL.cancels.ota,
})

export const CANCEL_VOLUME_FC = withRollups({
  website: JUL.cancelsFc.website,
  app: JUL.cancelsFc.app,
  offline: JUL.cancelsFc.offline,
  ota: JUL.cancelsFc.ota,
})

export const CANCEL_RATE: ChannelBreakdown = (() => {
  const rates = { website: 8.4, app: 7.1, offline: 10.8, ota: 11.2 }
  const { direct } = weightedAvg(rates, CANCEL_VOLUME)
  return {
    ...rates,
    direct: round1(direct),
    total: round1(PORTFOLIO.fcCancelPct),
  }
})()

export const CANCEL_RATE_FC: ChannelBreakdown = (() => {
  const rates = { website: 8.0, app: 6.8, offline: 10.2, ota: 10.6 }
  const { direct, total } = weightedAvg(rates, CANCEL_VOLUME_FC)
  return {
    ...rates,
    direct: round1(direct),
    total: round1(total),
  }
})()

export const RELET_VOLUME = withRollups({
  website: JUL.relets.website,
  app: JUL.relets.app,
  offline: JUL.relets.offline,
  ota: JUL.relets.ota,
})

export const RELET_VOLUME_FC = withRollups({
  website: JUL.reletsFc.website,
  app: JUL.reletsFc.app,
  offline: JUL.reletsFc.offline,
  ota: JUL.reletsFc.ota,
})

export const RELET_RATE: ChannelBreakdown = (() => {
  const rates = { website: 57.2, app: 56.0, offline: 49.5, ota: 54.8 }
  const { direct } = weightedAvg(rates, RELET_VOLUME)
  return {
    ...rates,
    direct: round1(direct),
    total: round1(PORTFOLIO.reletPct),
  }
})()

export const RELET_VALUE_AVG: ChannelBreakdown = (() => {
  const values = {
    website: PORTFOLIO.avgReletValue + 80,
    app: PORTFOLIO.avgReletValue - 40,
    offline: PORTFOLIO.avgReletValue + 160,
    ota: PORTFOLIO.avgReletValue - 90,
  }
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
    label: "Cancellation Volume Forecast",
    format: "volume",
    values: CANCEL_VOLUME_FC,
    muted: true,
  },
  {
    id: "cancellationAvgPctFc",
    label: "Cancellation % Avg Forecast",
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
    label: "Re-Let Volume Forecast",
    format: "volume",
    values: RELET_VOLUME_FC,
    muted: true,
  },
]

/** Jun 2026 point from the volume trend series (month before current Jul actuals). */
const PRIOR_MONTH_VOLUME = { cancellations: 1120, relets: 1110 } as const

const RECOVERY_RATE =
  (RELET_VOLUME.total / CANCEL_VOLUME.total) * 100
const RECOVERY_RATE_FC =
  (RELET_VOLUME_FC.total / CANCEL_VOLUME_FC.total) * 100

/** Market cancel rate from Home benchmarks — rate only; no invented volume markets. */
const MARKET_CANCEL_RATE =
  MARKET_COMPARISON_VALUES.find((m) => m.metric === "Cancellation rate")?.market ??
  null

function formatSignedPct(n: number) {
  const rounded = round1(n)
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded}%`
}

function formatSignedPp(n: number) {
  const rounded = round1(n)
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded}pp`
}

export const KPI_CARDS = [
  {
    id: "total-cancellations",
    label: "Total cancellations",
    value: formatVolume(CANCEL_VOLUME.total),
    help: "Total cancellations across Website, App, Offline, and Online Travel Agency (OTA). Compared with the forecast (FC) volume. Direct means Website + App + Offline.",
    delta: `${formatSignedPct(
      ((CANCEL_VOLUME.total - CANCEL_VOLUME_FC.total) / CANCEL_VOLUME_FC.total) *
        100
    )} vs ${formatVolume(CANCEL_VOLUME_FC.total)} forecast`,
    higherIsBetter: false,
    tone: "primary" as const,
    icon: "alert" as const,
    context: [
      `Direct ${formatVolume(CANCEL_VOLUME.direct)} · OTA ${formatVolume(CANCEL_VOLUME.ota)}`,
    ],
  },
  {
    id: "avg-cancel-rate",
    label: "Avg cancel rate",
    value: formatPercent(CANCEL_RATE.total),
    help: "Average cancellation rate across all channels. Forecast (FC) is the planned rate. Direct excludes Online Travel Agency (OTA). Market is the Home cancel-rate benchmark.",
    delta: `${formatSignedPp(CANCEL_RATE.total - CANCEL_RATE_FC.total)} vs ${formatPercent(CANCEL_RATE_FC.total)} forecast`,
    higherIsBetter: false,
    tone: "accent" as const,
    icon: "down" as const,
    context: [
      MARKET_CANCEL_RATE != null
        ? `Direct ${formatPercent(CANCEL_RATE.direct)} · Market ${formatPercent(MARKET_CANCEL_RATE)}`
        : `Direct ${formatPercent(CANCEL_RATE.direct)}`,
    ],
  },
  {
    id: "total-relets",
    label: "Total re-lets",
    value: formatVolume(RELET_VOLUME.total),
    help: "Total cancelled stays that were filled again (re-let). Compared with the forecast (FC) volume. Direct means Website + App + Offline.",
    delta: `${formatSignedPct(
      ((RELET_VOLUME.total - RELET_VOLUME_FC.total) / RELET_VOLUME_FC.total) *
        100
    )} vs ${formatVolume(RELET_VOLUME_FC.total)} forecast`,
    higherIsBetter: true,
    tone: "soft" as const,
    icon: "refresh" as const,
    context: [
      `Direct ${formatVolume(RELET_VOLUME.direct)} · OTA ${formatVolume(RELET_VOLUME.ota)}`,
    ],
  },
  {
    id: "recovery-rate",
    label: "Recovery rate",
    value: formatPercent(RECOVERY_RATE),
    help: "Re-lets ÷ cancellations. Forecast (FC) uses the matching planned volume totals.",
    delta: `${formatSignedPp(RECOVERY_RATE - RECOVERY_RATE_FC)} vs ${formatPercent(RECOVERY_RATE_FC)} forecast`,
    higherIsBetter: true,
    tone: "light" as const,
    icon: "up" as const,
    context: ["Re-lets ÷ cancellations"],
  },
] as const

/** Unreleted cancel value in the ops month — already lost, not still open. */
const LOST_REVENUE_ACTUAL = Math.round(
  CANCEL_VOLUME.total * (1 - PORTFOLIO.reletRate) * PORTFOLIO.avgCancelValue
)
const LOST_REVENUE_TARGET = Math.round(LOST_REVENUE_ACTUAL * 0.88)
const LOST_REVENUE = {
  actual: LOST_REVENUE_ACTUAL,
  target: LOST_REVENUE_TARGET,
  status: (LOST_REVENUE_ACTUAL <= LOST_REVENUE_TARGET ? "On track" : "Above target") as
    | "On track"
    | "Above target",
}

export const TARGET_CARDS = [
  {
    id: "cancel-volume-target",
    label: "Cancellation volume",
    value: formatVolume(2699),
    targetLabel: "vs 2,780 target",
    help: "Cancellation volume against the 2,780 target. Status: On track.",
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
    help: "How often cancelled stays were filled again (re-let), against the 90.0% target. Status: On track.",
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
    help: "Direct channel value (Website + App + Offline) against the £135.00 target. Status: On track.",
    actual: 141.2,
    target: 135,
    status: "On track" as const,
    lowerIsBetter: false,
  },
  {
    id: "lost-revenue-target",
    label: "Lost revenue",
    value: formatCurrency(LOST_REVENUE.actual),
    targetLabel: `vs ${formatCurrency(LOST_REVENUE.target)} target`,
    help: "Cancelled booking value that was not re-let in the period: money already lost, not value still open on the live list. Lower is better.",
    actual: LOST_REVENUE.actual,
    target: LOST_REVENUE.target,
    status: LOST_REVENUE.status,
    lowerIsBetter: true,
  },
] as const

export const VOLUME_TREND = [
  { month: "Feb", cancellations: 980, relets: 900 },
  { month: "Mar", cancellations: 1050, relets: 1035 },
  { month: "Apr", cancellations: 1010, relets: 990 },
  { month: "May", cancellations: 1180, relets: 1170 },
  {
    month: "Jun",
    cancellations: PRIOR_MONTH_VOLUME.cancellations,
    relets: PRIOR_MONTH_VOLUME.relets,
  },
  { month: "Jul", cancellations: CANCEL_VOLUME.total, relets: RELET_VOLUME.total },
]

export const CHANNEL_MIX = [
  { key: "website" as const, label: "Website", share: 45 },
  { key: "app" as const, label: "Direct App", share: 20 },
  { key: "offline" as const, label: "Offline", share: 15 },
  { key: "ota" as const, label: "OTA", share: 20 },
]

export const CHANNEL_MIX_DIRECT_SHARE = 80

export const WEEKLY_CANCEL_RELET = [
  { day: "Mon", cancel: 48, relet: 52 },
  { day: "Tue", cancel: 44, relet: 56 },
  { day: "Wed", cancel: 50, relet: 54 },
  { day: "Thu", cancel: 46, relet: 58 },
  { day: "Fri", cancel: 52, relet: 51 },
  { day: "Sat", cancel: 58, relet: 48 },
  { day: "Sun", cancel: 45, relet: 55 },
]

export const VOLUME_TREND_HELP =
  "Cancellations vs re-lets over Feb–Jul 2026. July uses actual total volumes."

export const RELET_RATE_STAT = {
  label: "Re-let % avg",
  value: `${PORTFOLIO.reletPct}%`,
  unit: "Rate",
  delta: "+1.8pp",
  deltaLabel: "vs prev. month",
  help: "Average re-let rate across channels, with a channel breakdown versus the market peer average.",
  marketPct: PORTFOLIO.market.reletPct,
  channels: CHANNEL_META.map((channel) => ({
    key: channel.key,
    label: channel.label,
    rate: RELET_RATE[channel.key],
    color: channel.color,
  })),
} as const

export const CHANNEL_MIX_HELP =
  "Share of bookings by channel. Direct means Website + App + Offline."

export const CANCEL_VS_RELET_HELP =
  "Cancellations versus re-lets by day of week."

export const CANCEL_RATE_BY_CHANNEL_HELP =
  "Average cancellation rate by channel. Actual versus forecast (FC)."

export const RELET_VOLUME_VS_FORECAST_HELP =
  "Re-let volume versus forecast (FC) by channel. July 2026."

export const AVG_RELET_VALUE_HELP =
  "Average value recovered per re-let (£). Bar width uses that channel’s re-let rate. Counts are re-let volume."

export const METRICS_SUMMARY_HELP =
  "All channels · Actual and forecast (FC) · July 2026. Direct means Website + App + Offline. Total is Direct + Online Travel Agency (OTA)."

export type LiveCancelReletStatus = "awaiting" | "relet"

/** One booking that fills part or all of a cancelled stay. */
export type ReletFill = {
  ref: string
  nights: number
  value: number
  /**
   * First cancelled night this fill overlaps (0 = cancelled check-in night).
   * Used with overlapNights to measure coverage of the cancelled stay.
   */
  overlapStart: number
  /** How many nights of the cancelled stay this fill covers. */
  overlapNights: number
}

export type LiveCancellationBooking = {
  id: string
  property: string
  brand: string
  channel: ChannelKey
  cancelledAt: string
  checkIn: string
  nights: number
  value: number
  hasFlexibleCancellation: boolean
  reletStatus: LiveCancelReletStatus
  /** Days since cancellation while still awaiting a re-let; 0 once re-let. */
  daysOpen: number
  /** @deprecated Prefer reletFills for single or split fills. */
  reletRef?: string
  /** Bookings that replaced this cancellation. Length > 1 = partial / split re-let. */
  reletFills?: ReletFill[]
}

/**
 * Booking-level live cancellations for ops focus.
 * Values sit near portfolio avg cancel/relet £ from mock-portfolio.
 */
export const LIVE_CANCELLATIONS: LiveCancellationBooking[] = [
  {
    id: "BK-31820",
    property: "Willowcroft House",
    brand: "Sykes",
    channel: "website",
    cancelledAt: "29 Jul 2026",
    checkIn: "8 Aug 2026",
    nights: 7,
    value: 1120,
    hasFlexibleCancellation: true,
    reletStatus: "awaiting",
    daysOpen: 3,
  },
  {
    id: "BK-31814",
    property: "Harbour House",
    brand: "Hoseasons",
    channel: "ota",
    cancelledAt: "28 Jul 2026",
    checkIn: "2 Aug 2026",
    nights: 4,
    value: 780,
    hasFlexibleCancellation: false,
    reletStatus: "awaiting",
    daysOpen: 4,
  },
  {
    id: "BK-31808",
    property: "The Old Mill",
    brand: "Sykes",
    channel: "app",
    cancelledAt: "27 Jul 2026",
    checkIn: "14 Aug 2026",
    nights: 5,
    value: 940,
    hasFlexibleCancellation: true,
    reletStatus: "awaiting",
    daysOpen: 5,
  },
  {
    id: "BK-31801",
    property: "Stone Barn",
    brand: "Hoseasons",
    channel: "offline",
    cancelledAt: "26 Jul 2026",
    checkIn: "5 Aug 2026",
    nights: 3,
    value: 1280,
    hasFlexibleCancellation: true,
    reletStatus: "awaiting",
    daysOpen: 6,
  },
  {
    id: "BK-31794",
    property: "Lakeside Retreat",
    brand: "Sykes",
    channel: "website",
    cancelledAt: "25 Jul 2026",
    checkIn: "22 Aug 2026",
    nights: 7,
    value: 1190,
    hasFlexibleCancellation: true,
    reletStatus: "awaiting",
    daysOpen: 7,
  },
  {
    id: "BK-31788",
    property: "Meadow View",
    brand: "Sykes",
    channel: "ota",
    cancelledAt: "24 Jul 2026",
    checkIn: "1 Aug 2026",
    nights: 6,
    value: 710,
    hasFlexibleCancellation: false,
    reletStatus: "awaiting",
    daysOpen: 8,
  },
  {
    id: "BK-31781",
    property: "Hillcrest Lodge",
    brand: "Hoseasons",
    channel: "website",
    cancelledAt: "23 Jul 2026",
    checkIn: "12 Aug 2026",
    nights: 4,
    value: 980,
    hasFlexibleCancellation: true,
    reletStatus: "relet",
    daysOpen: 0,
    reletRef: "BK-31910",
    reletFills: [
      { ref: "BK-31910", nights: 4, value: 990, overlapStart: 0, overlapNights: 4 },
    ],
  },
  {
    id: "BK-31774",
    property: "Riverside Cottage",
    brand: "Sykes",
    channel: "app",
    cancelledAt: "22 Jul 2026",
    checkIn: "30 Jul 2026",
    nights: 3,
    value: 840,
    hasFlexibleCancellation: true,
    reletStatus: "relet",
    daysOpen: 0,
    reletRef: "BK-31902",
    reletFills: [
      { ref: "BK-31902", nights: 3, value: 860, overlapStart: 0, overlapNights: 3 },
    ],
  },
  {
    id: "BK-31766",
    property: "Oak Tree Farm",
    brand: "Hoseasons",
    channel: "offline",
    cancelledAt: "21 Jul 2026",
    checkIn: "9 Aug 2026",
    nights: 7,
    value: 1540,
    hasFlexibleCancellation: false,
    reletStatus: "relet",
    daysOpen: 0,
    reletRef: "BK-31890",
    reletFills: [
      { ref: "BK-31890", nights: 3, value: 860, overlapStart: 0, overlapNights: 3 },
      { ref: "BK-31895", nights: 4, value: 1030, overlapStart: 3, overlapNights: 4 },
    ],
  },
  {
    id: "BK-31758",
    property: "Garden Cottage",
    brand: "Sykes",
    channel: "ota",
    cancelledAt: "20 Jul 2026",
    checkIn: "16 Aug 2026",
    nights: 5,
    value: 790,
    hasFlexibleCancellation: true,
    reletStatus: "relet",
    daysOpen: 0,
    reletRef: "BK-31882",
    reletFills: [
      { ref: "BK-31882", nights: 2, value: 380, overlapStart: 0, overlapNights: 2 },
      { ref: "BK-31886", nights: 3, value: 510, overlapStart: 3, overlapNights: 2 },
    ],
  },
]

export type LiveCancellationFilter = "awaiting" | "relet" | "split" | "all"

export const LIVE_CANCELLATIONS_HELP =
  "Recent cancellations at booking level. Stays not yet re-let are still open for recovery. Value is the cancelled booking value. Split re-lets are filled by more than one booking. Overlap shows how many cancelled nights were covered by re-let bookings."

export const PARTIAL_RELETS_HELP =
  "A split (partial) re-let fills one cancelled stay with two or more shorter bookings, for example a 7-night cancel filled as 3 + 4 nights. Overlapping days show how much of the cancelled stay window was covered. Split fills can recover more revenue than rebooking the full stay to one guest."

export function getReletFills(booking: LiveCancellationBooking): ReletFill[] {
  if (booking.reletFills && booking.reletFills.length > 0) return booking.reletFills
  if (booking.reletRef) {
    return [
      {
        ref: booking.reletRef,
        nights: booking.nights,
        value: booking.value,
        overlapStart: 0,
        overlapNights: booking.nights,
      },
    ]
  }
  return []
}

export function isSplitRelet(booking: LiveCancellationBooking) {
  return getReletFills(booking).length > 1
}

export function getRecoveredValue(booking: LiveCancellationBooking) {
  return getReletFills(booking).reduce((sum, fill) => sum + fill.value, 0)
}

export function formatReletFillLabel(booking: LiveCancellationBooking) {
  const fills = getReletFills(booking)
  if (fills.length === 0) return null
  return fills.map((fill) => `${fill.nights}n`).join(" + ")
}

/** Unique cancelled nights covered by any re-let fill (no double-count if fills overlap). */
export function getOverlappingNights(booking: LiveCancellationBooking) {
  const covered = new Set<number>()
  for (const fill of getReletFills(booking)) {
    const start = Math.max(0, fill.overlapStart)
    const end = Math.min(booking.nights, start + Math.max(0, fill.overlapNights))
    for (let night = start; night < end; night += 1) {
      covered.add(night)
    }
  }
  return covered.size
}

export function getOverlapCoveragePct(booking: LiveCancellationBooking) {
  if (booking.nights <= 0) return 0
  return (getOverlappingNights(booking) / booking.nights) * 100
}

/** Per-night coverage mask for the cancelled stay (true = overlapped by a re-let). */
export function getOverlapNightMask(booking: LiveCancellationBooking): boolean[] {
  const mask = Array.from({ length: booking.nights }, () => false)
  for (const fill of getReletFills(booking)) {
    const start = Math.max(0, fill.overlapStart)
    const end = Math.min(booking.nights, start + Math.max(0, fill.overlapNights))
    for (let night = start; night < end; night += 1) {
      mask[night] = true
    }
  }
  return mask
}

export function filterLiveCancellations(
  bookings: LiveCancellationBooking[],
  filter: LiveCancellationFilter
) {
  const filtered =
    filter === "all"
      ? bookings
      : filter === "split"
        ? bookings.filter(isSplitRelet)
        : bookings.filter((booking) => booking.reletStatus === filter)

  return [...filtered].sort((a, b) => {
    if (a.reletStatus !== b.reletStatus) {
      return a.reletStatus === "awaiting" ? -1 : 1
    }
    if (a.reletStatus === "awaiting") return b.daysOpen - a.daysOpen
    return b.cancelledAt.localeCompare(a.cancelledAt)
  })
}

export function summariseLiveCancellations(bookings: LiveCancellationBooking[]) {
  const awaiting = bookings.filter((b) => b.reletStatus === "awaiting")
  const relet = bookings.filter((b) => b.reletStatus === "relet")
  const split = relet.filter(isSplitRelet)
  const valueAtRisk = awaiting.reduce((sum, b) => sum + b.value, 0)
  const avgDaysOpen =
    awaiting.length > 0
      ? awaiting.reduce((sum, b) => sum + b.daysOpen, 0) / awaiting.length
      : 0
  const avgOverlapPct =
    relet.length > 0
      ? relet.reduce((sum, b) => sum + getOverlapCoveragePct(b), 0) / relet.length
      : 0
  return {
    total: bookings.length,
    awaiting: awaiting.length,
    relet: relet.length,
    split: split.length,
    valueAtRisk,
    avgDaysOpen,
    avgOverlapPct,
  }
}

/** Illustrative portfolio snapshot for split vs single re-let recovery. */
export const PARTIAL_RELETS_INSIGHT = {
  splitSharePct: 26,
  splitRecoveredPct: 112,
  singleRecoveredPct: 94,
  avgOverlapPct: 92,
  example: {
    cancelledNights: 7,
    cancelledValue: 1540,
    fillsLabel: "3n + 4n",
    recoveredValue: 1890,
    overlappingNights: 7,
  },
} as const

const LIVE_CANCEL_SUMMARY = summariseLiveCancellations(LIVE_CANCELLATIONS)

/** Top-row KPI derived from live cancellations still awaiting re-let. */
export const VALUE_AT_RISK_CARD = {
  id: "value-at-risk",
  label: "Value at risk",
  value: formatCurrency(LIVE_CANCEL_SUMMARY.valueAtRisk),
  help: "Sum of cancelled booking values that are not yet re-let, from the live cancellations list. Recovering these stays improves re-let performance.",
  delta: `${LIVE_CANCEL_SUMMARY.awaiting} not re-let`,
  higherIsBetter: false,
  deltaKind: "attention" as const,
  tone: "primary" as const,
  icon: "risk" as const,
  context: [
    `Avg ${round1(LIVE_CANCEL_SUMMARY.avgDaysOpen)} days open`,
  ],
} as const

export const TOP_KPI_CARDS = [...KPI_CARDS, VALUE_AT_RISK_CARD] as const

/** Ops value loop — cancel → re-let → recovered £ → still open. */
export const OPS_VALUE_LOOP = {
  title: "How cancellations still pay when you re-let",
  story:
    "Some guests cancel: that is normal when they have Flexible Cancellation. The commercial question is recovery: re-let the stay, keep the revenue, and shrink the open book still waiting to fill.",
  steps: [
    {
      id: "cancels",
      label: "Cancellations",
      value: formatVolume(CANCEL_VOLUME.total),
      hint: "Jul ops volume across channels",
      badge: "Ops volume",
      badgeTone: "neutral" as const,
      help: "Cancelled stays in the current ops month (July). Includes Flexible Cancellation and other cancellations in the live ops view.",
    },
    {
      id: "relet-rate",
      label: "Re-let rate",
      value: `${PORTFOLIO.reletPct}%`,
      hint: "Share of cancels filled again",
      badge: "High = better",
      badgeTone: "positive" as const,
      help: "Share of cancelled stays that were filled again (re-let). How we calculate it: re-lets ÷ cancellations.",
    },
    {
      id: "relets",
      label: "Re-lets",
      value: formatVolume(RELET_VOLUME.total),
      hint: "Stays filled after a cancel",
      badge: "Recovered",
      badgeTone: "positive" as const,
      help: "Volume of cancelled stays successfully re-let in the period.",
    },
    {
      id: "at-risk",
      label: "Still open",
      value: formatCurrency(LIVE_CANCEL_SUMMARY.valueAtRisk),
      hint: "Cancelled value not yet re-let",
      badge: "At risk",
      badgeTone: "attention" as const,
      help: "Sum of cancelled booking values still awaiting a re-let on the live list.",
    },
  ],
} as const

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
