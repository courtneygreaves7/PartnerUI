/**
 * Single source of truth for Partner UI mock figures.
 * All dashboards, heatmaps, ops KPIs, and AI replies should derive from these.
 */

export const PORTFOLIO_ANCHORS = {
  /** Annual gross bookings */
  bookings: 520_000,
  /** Share of bookings offered a Pikl product */
  offerRate: 0.68,
  /** FC attachment as share of all bookings */
  attachmentRate: 0.125,
  /** Cancel rate on FC bookings */
  fcCancelRate: 0.092,
  /** Re-let rate of FC cancellations (volume) */
  reletRate: 0.55,
  /** Partner FC margin (ex. VAT), £ */
  fcMargin: 780_000,
  /** Website / out-of-test conversion uplift, £ */
  conversionUplift: 520_000,
  /** Extra revenue from re-letting cancelled FC stays, £ */
  incrementalTotal: 115_000,
  /** Profile comparisons (not incremental proofs) */
  profile: {
    leadTimeDays: 118,
    leadTimeWithoutFc: 105,
    losDays: 5.8,
    losWithoutFc: 5.4,
    spendPerBooking: 875,
    spendWithoutFc: 868,
    ipb: 2.72,
    ipbWithoutFc: 1.9,
  },
  market: {
    cancelRate: 0.098,
    attachmentRate: 0.11,
    reletRate: 0.48,
    rebookabilityRate: 0.41,
    rebookabilityValue: 210,
    leadTimeDays: 112,
    losDays: 5.5,
  },
  /** Channel share of FC volume / margin (must sum to 1) */
  channelMix: {
    website: 0.45,
    app: 0.2,
    offline: 0.15,
    ota: 0.2,
  },
  /** Jul share of annual cancel/relet ops volumes */
  julMonthShare: 1 / 12,
  /** Avg £ recovered per re-let booking (illustrative live list) */
  avgReletValue: 980,
  avgCancelValue: 920,
} as const

export type ChannelKey = keyof typeof PORTFOLIO_ANCHORS.channelMix
