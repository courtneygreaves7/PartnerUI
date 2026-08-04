/**
 * Occupancy insights — partner vs market by departure week and bedrooms.
 *
 * Mocked with the same booking-feed method production will use:
 *   days booked ÷ total days available
 *
 * Owner stays are not in the feed: they do not count as booked and are not
 * removed from available days (so rates sit slightly below true calendar
 * occupancy when owners block nights).
 *
 * Peak summer 2026 — departure weeks W27–W36 (29 Jun → 31 Aug).
 */

export const OCCUPANCY_SERIES_COLORS = {
  partner: "var(--primary)",
  market: "#94A3B8",
} as const

export const OCCUPANCY_METHOD_NOTE =
  "Occupancy = days booked ÷ total days available from the booking feed. Owner stays are not in the feed, so they are not counted as booked and not removed from available days."

export const OCCUPANCY_METHOD_HELP =
  "Occupancy from the booking feed. How we calculate it: days booked ÷ total days available. Owner stays are not in the feed, so they are not counted as booked and are not removed from available days."

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function occupancyPct(booked: number, available: number) {
  if (available <= 0) return 0
  return round1((booked / available) * 100)
}

export function formatOccupancyPct(n: number) {
  return `${round1(n)}%`
}

export function formatDaysRatio(booked: number, available: number) {
  return `${booked.toLocaleString("en-GB")} / ${available.toLocaleString("en-GB")} days`
}

export function occupancyGapPp(partner: number, market: number) {
  return round1(partner - market)
}

/** Live cottage stock on the partner book (illustrative mid-size brand). */
const LIVE_PROPERTIES = 1_280

/** Share of property-nights open to book (maintenance / closed inventory). */
const OPEN_INVENTORY = 0.97

/**
 * Bedroom mix of the live book. Shares sum to 1.
 * `liftPp` = partner occupancy vs market (positive = ahead).
 */
const BEDROOM_MIX = [
  { bedrooms: "1 bed", bedroomKey: "1", share: 0.156, market: 78, liftPp: 3.1 },
  { bedrooms: "2 bed", bedroomKey: "2", share: 0.35, market: 79, liftPp: 5.0 },
  { bedrooms: "3 bed", bedroomKey: "3", share: 0.282, market: 76, liftPp: 3.0 },
  { bedrooms: "4 bed", bedroomKey: "4", share: 0.137, market: 68, liftPp: 6.0 },
  { bedrooms: "5+ bed", bedroomKey: "5-plus", share: 0.075, market: 59, liftPp: 9.0 },
] as const

/**
 * Seasonal occupancy index (0–1) for partner guest nights by departure week.
 * Peak school-holiday weeks sit highest; shoulder weeks softer.
 */
const DEPARTURE_WEEKS = [
  { week: "W27", weekLabel: "29 Jun", partnerRate: 0.71, marketRate: 0.68 },
  { week: "W28", weekLabel: "6 Jul", partnerRate: 0.74, marketRate: 0.7 },
  { week: "W29", weekLabel: "13 Jul", partnerRate: 0.78, marketRate: 0.73 },
  { week: "W30", weekLabel: "20 Jul", partnerRate: 0.82, marketRate: 0.76 },
  { week: "W31", weekLabel: "27 Jul", partnerRate: 0.85, marketRate: 0.79 },
  { week: "W32", weekLabel: "3 Aug", partnerRate: 0.88, marketRate: 0.81 },
  { week: "W33", weekLabel: "10 Aug", partnerRate: 0.91, marketRate: 0.84 },
  { week: "W34", weekLabel: "17 Aug", partnerRate: 0.87, marketRate: 0.82 },
  { week: "W35", weekLabel: "24 Aug", partnerRate: 0.79, marketRate: 0.77 },
  { week: "W36", weekLabel: "31 Aug", partnerRate: 0.72, marketRate: 0.71 },
] as const

const NIGHTS_PER_WEEK = 7
const WEEK_COUNT = DEPARTURE_WEEKS.length

function availableNights(properties: number, weeks = 1) {
  return Math.round(properties * NIGHTS_PER_WEEK * weeks * OPEN_INVENTORY)
}

function bookedNights(available: number, rate: number) {
  return Math.round(available * rate)
}

export type OccupancyWeekPoint = {
  week: string
  weekLabel: string
  /** Guest booking nights departing that week. */
  partnerBooked: number
  /** Total available property-nights in that departure week. */
  partnerAvailable: number
  /** Derived: partnerBooked ÷ partnerAvailable. */
  partner: number
  /** Market occupancy % for the same week (benchmark). */
  market: number
}

function weekPoint(
  week: string,
  weekLabel: string,
  partnerBooked: number,
  partnerAvailable: number,
  market: number
): OccupancyWeekPoint {
  return {
    week,
    weekLabel,
    partnerBooked,
    partnerAvailable,
    partner: occupancyPct(partnerBooked, partnerAvailable),
    market: round1(market),
  }
}

/** Partner vs market occupancy by departure week (booked ÷ available). */
export const OCCUPANCY_BY_DEPARTURE_WEEK: OccupancyWeekPoint[] =
  DEPARTURE_WEEKS.map((row) => {
    const available = availableNights(LIVE_PROPERTIES, 1)
    return weekPoint(
      row.week,
      row.weekLabel,
      bookedNights(available, row.partnerRate),
      available,
      row.marketRate * 100
    )
  })

export type OccupancyBedroomRow = {
  bedrooms: string
  bedroomKey: string
  partnerBooked: number
  partnerAvailable: number
  partner: number
  market: number
  /** Properties in this bedroom band. */
  properties: number
}

function bedroomRow(
  bedrooms: string,
  bedroomKey: string,
  partnerBooked: number,
  partnerAvailable: number,
  market: number,
  properties: number
): OccupancyBedroomRow {
  return {
    bedrooms,
    bedroomKey,
    partnerBooked,
    partnerAvailable,
    partner: occupancyPct(partnerBooked, partnerAvailable),
    market: round1(market),
    properties,
  }
}

/**
 * Occupancy by bedroom over the same W27–W36 window.
 * Available nights = band stock × 7 × 10 weeks × open inventory.
 * Partner rates are centered on the seasonal week average, with
 * relative lifts preserved so band gaps stay meaningful vs market.
 */
const SEASON_PARTNER_AVG =
  DEPARTURE_WEEKS.reduce((sum, row) => sum + row.partnerRate, 0) /
  WEEK_COUNT

const AVG_LIFT_PP =
  BEDROOM_MIX.reduce((sum, band) => sum + band.liftPp, 0) / BEDROOM_MIX.length

export const OCCUPANCY_BY_BEDROOM: OccupancyBedroomRow[] = BEDROOM_MIX.map(
  (band) => {
    const properties = Math.round(LIVE_PROPERTIES * band.share)
    const available = availableNights(properties, WEEK_COUNT)
    const partnerRate = Math.min(
      0.96,
      Math.max(
        0.45,
        SEASON_PARTNER_AVG + (band.liftPp - AVG_LIFT_PP) / 100
      )
    )
    return bedroomRow(
      band.bedrooms,
      band.bedroomKey,
      bookedNights(available, partnerRate),
      available,
      band.market,
      properties
    )
  }
)

export const OCCUPANCY_BY_WEEK_HELP =
  "Your occupancy compared with the market for each departure week. How we calculate it: days booked ÷ total days available for stays departing that week. Owner bookings are not in the feed."

export const OCCUPANCY_BY_BEDROOM_HELP =
  "Your occupancy compared with the market by bedroom count. How we calculate it: days booked ÷ total days available within each bedroom band. Owner bookings are not in the feed."

export function summariseOccupancy() {
  const weeks = OCCUPANCY_BY_DEPARTURE_WEEK
  const partnerBooked = weeks.reduce((sum, row) => sum + row.partnerBooked, 0)
  const partnerAvailable = weeks.reduce((sum, row) => sum + row.partnerAvailable, 0)
  const partnerAvg = occupancyPct(partnerBooked, partnerAvailable)
  const marketAvg =
    weeks.reduce((sum, row) => sum + row.market, 0) / Math.max(weeks.length, 1)
  const peakWeek = weeks.reduce((best, row) =>
    row.partner > best.partner ? row : best
  )
  const bedroomRows = [...OCCUPANCY_BY_BEDROOM].sort(
    (a, b) => occupancyGapPp(b.partner, b.market) - occupancyGapPp(a.partner, a.market)
  )
  const bestBedroom = bedroomRows[0]
  const weakestBedroom = bedroomRows[bedroomRows.length - 1]

  return {
    partnerBooked,
    partnerAvailable,
    partnerAvg,
    marketAvg: round1(marketAvg),
    gapPp: occupancyGapPp(partnerAvg, round1(marketAvg)),
    peakWeek,
    bestBedroom,
    weakestBedroom,
  }
}

export const OCCUPANCY_SUMMARY = summariseOccupancy()

function performanceVerdict(gapPp: number) {
  if (gapPp >= 3) return "Well ahead of market"
  if (gapPp > 0.5) return "Ahead of market"
  if (gapPp >= -0.5) return "In line with market"
  if (gapPp > -3) return "Slightly behind market"
  return "Behind market"
}

export const OCCUPANCY_KPI_CARDS = [
  {
    id: "partner-occ",
    label: "Partner occupancy",
    value: formatOccupancyPct(OCCUPANCY_SUMMARY.partnerAvg),
    help: OCCUPANCY_METHOD_HELP,
    verdict: performanceVerdict(OCCUPANCY_SUMMARY.gapPp),
    gapLabel: `${OCCUPANCY_SUMMARY.gapPp > 0 ? "+" : ""}${OCCUPANCY_SUMMARY.gapPp}pp vs market`,
    gapPositive: OCCUPANCY_SUMMARY.gapPp >= 0,
    against: {
      label: "Market benchmark",
      value: formatOccupancyPct(OCCUPANCY_SUMMARY.marketAvg),
    },
    context: [
      formatDaysRatio(OCCUPANCY_SUMMARY.partnerBooked, OCCUPANCY_SUMMARY.partnerAvailable),
      `Peak ${OCCUPANCY_SUMMARY.peakWeek.weekLabel} · ${formatOccupancyPct(OCCUPANCY_SUMMARY.peakWeek.partner)} (market ${formatOccupancyPct(OCCUPANCY_SUMMARY.peakWeek.market)})`,
    ],
  },
  {
    id: "market-occ",
    label: "Market occupancy",
    value: formatOccupancyPct(OCCUPANCY_SUMMARY.marketAvg),
    help: "Market average occupancy for the same departure weeks, on the same days booked ÷ days available basis. This is the benchmark you are measured against.",
    verdict: "What you are up against",
    gapLabel: `Partner ${formatOccupancyPct(OCCUPANCY_SUMMARY.partnerAvg)} · ${OCCUPANCY_SUMMARY.gapPp > 0 ? "+" : ""}${OCCUPANCY_SUMMARY.gapPp}pp`,
    gapPositive: OCCUPANCY_SUMMARY.gapPp >= 0,
    against: {
      label: "Your occupancy",
      value: formatOccupancyPct(OCCUPANCY_SUMMARY.partnerAvg),
    },
    context: [
      "Same departure weeks · same regions",
      "Beat this bar and you are outperforming the market book",
    ],
  },
  {
    id: "best-bedroom",
    label: "Best bedroom gap",
    value: `${OCCUPANCY_SUMMARY.bestBedroom.bedrooms}`,
    help: "Bedroom band where your occupancy beats the market by the largest margin. Useful for mix and pricing focus — contrast with the weakest band.",
    verdict: "Strongest vs market",
    gapLabel: `+${occupancyGapPp(OCCUPANCY_SUMMARY.bestBedroom.partner, OCCUPANCY_SUMMARY.bestBedroom.market)}pp vs market`,
    gapPositive: true,
    against: {
      label: "Market in this band",
      value: formatOccupancyPct(OCCUPANCY_SUMMARY.bestBedroom.market),
    },
    context: [
      `Partner ${formatOccupancyPct(OCCUPANCY_SUMMARY.bestBedroom.partner)} · ${formatDaysRatio(
        OCCUPANCY_SUMMARY.bestBedroom.partnerBooked,
        OCCUPANCY_SUMMARY.bestBedroom.partnerAvailable
      )}`,
      `Weakest: ${OCCUPANCY_SUMMARY.weakestBedroom.bedrooms} · ${occupancyGapPp(OCCUPANCY_SUMMARY.weakestBedroom.partner, OCCUPANCY_SUMMARY.weakestBedroom.market) > 0 ? "+" : ""}${occupancyGapPp(OCCUPANCY_SUMMARY.weakestBedroom.partner, OCCUPANCY_SUMMARY.weakestBedroom.market)}pp vs market (${formatOccupancyPct(OCCUPANCY_SUMMARY.weakestBedroom.partner)} / ${formatOccupancyPct(OCCUPANCY_SUMMARY.weakestBedroom.market)})`,
    ],
  },
] as const
