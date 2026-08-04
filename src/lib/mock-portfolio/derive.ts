import { PORTFOLIO_ANCHORS, type ChannelKey } from "@/lib/mock-portfolio/anchors"

const A = PORTFOLIO_ANCHORS

function round(n: number, decimals = 0) {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

export const PORTFOLIO = {
  bookings: A.bookings,
  offerRate: A.offerRate,
  offeredBookings: Math.round(A.bookings * A.offerRate),
  attachmentRate: A.attachmentRate,
  attachmentPct: round(A.attachmentRate * 100, 1),
  fcBookings: Math.round(A.bookings * A.attachmentRate),
  fcCancelRate: A.fcCancelRate,
  fcCancelPct: round(A.fcCancelRate * 100, 1),
  cancels: Math.round(A.bookings * A.attachmentRate * A.fcCancelRate),
  reletRate: A.reletRate,
  reletPct: round(A.reletRate * 100, 1),
  relets: Math.round(A.bookings * A.attachmentRate * A.fcCancelRate * A.reletRate),
  fcMargin: A.fcMargin,
  conversionUplift: A.conversionUplift,
  incrementalTotal: A.incrementalTotal,
  /** £ per +1pp attachment */
  valuePerAttachmentPp: Math.round(A.fcMargin / (A.attachmentRate * 100)),
  generated: A.fcMargin + A.conversionUplift + A.incrementalTotal,
  profile: A.profile,
  market: {
    cancelPct: round(A.market.cancelRate * 100, 1),
    attachmentPct: round(A.market.attachmentRate * 100, 1),
    reletPct: round(A.market.reletRate * 100, 1),
    rebookabilityPct: round(A.market.rebookabilityRate * 100, 1),
    rebookabilityValue: A.market.rebookabilityValue,
    leadTimeDays: A.market.leadTimeDays,
    losDays: A.market.losDays,
  },
  channelMix: A.channelMix,
  julMonthShare: A.julMonthShare,
  avgReletValue: A.avgReletValue,
  avgCancelValue: A.avgCancelValue,
  /** Income per booking across all bookings */
  incomePerBooking: round(A.fcMargin / A.bookings, 2),
} as const

export type ChannelSplit = Record<ChannelKey, number> & {
  direct: number
  total: number
}

/** Split a total across channels using portfolio mix; Direct = website+app+offline. */
export function splitByChannel(total: number, decimals = 0): ChannelSplit {
  const website = round(total * A.channelMix.website, decimals)
  const app = round(total * A.channelMix.app, decimals)
  const offline = round(total * A.channelMix.offline, decimals)
  const ota = round(total * A.channelMix.ota, decimals)
  const direct = round(website + app + offline, decimals)
  return { website, app, offline, ota, direct, total: round(total, decimals) }
}

/** Jul ops volumes at portfolio cancel/relet rates. */
export function julOpsVolumes() {
  const cancels = Math.round(PORTFOLIO.cancels * A.julMonthShare)
  const relets = Math.round(cancels * A.reletRate)
  const cancelsFc = Math.round(cancels * 0.72)
  const reletsFc = Math.round(cancelsFc * A.reletRate)
  return {
    cancels: splitByChannel(cancels),
    relets: splitByChannel(relets),
    cancelsFc: splitByChannel(cancelsFc),
    reletsFc: splitByChannel(reletsFc),
  }
}

export function channelRate(
  baseRate: number,
  channel: ChannelKey,
  wobble: Partial<Record<ChannelKey, number>> = {}
) {
  return round(baseRate * 100 + (wobble[channel] ?? 0), 1)
}

/** Home impact hero period lenses (weights on annual anchors). */
export type ImpactPeriodId = "mtd" | "qtd" | "ytd" | "all"

export const IMPACT_PERIODS = [
  { id: "mtd" as const, label: "MTD", weight: 1 / 12 },
  { id: "qtd" as const, label: "QTD", weight: 1 / 4 },
  { id: "ytd" as const, label: "YTD", weight: 7 / 12 },
  { id: "all" as const, label: "All time", weight: 1 },
]

export function impactForPeriod(period: ImpactPeriodId) {
  const weight = IMPACT_PERIODS.find((p) => p.id === period)?.weight ?? 1
  const margin = Math.round(PORTFOLIO.fcMargin * weight)
  const conversion = Math.round(PORTFOLIO.conversionUplift * weight)
  const incremental = Math.round(PORTFOLIO.incrementalTotal * weight)
  return {
    period,
    weight,
    margin,
    conversion,
    incremental,
    generated: margin + conversion + incremental,
    /** Opportunity £/pp attachment — rate-based, not period-scaled */
    available: PORTFOLIO.valuePerAttachmentPp,
  }
}
