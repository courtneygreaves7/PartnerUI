/**
 * Occupancy insights — partner vs market by departure week and bedrooms.
 *
 * Built from booking data once the full booking feed is available.
 * Owner bookings are not in that feed, so occupancy is:
 *   days booked ÷ total days available
 * (not a calendar occupancy that carves out owner-use nights).
 *
 * Mock figures for Jul–Aug 2026 departure weeks.
 */

export const OCCUPANCY_SERIES_COLORS = {
  partner: "#006BFF",
  market: "#94A3B8",
} as const

export const OCCUPANCY_METHOD_NOTE =
  "Requires full booking data. Owner bookings are not available, so occupancy is days booked ÷ total days available."

export const OCCUPANCY_METHOD_HELP =
  "Occupancy from the booking feed. Calculation: days booked ÷ total days available. Owner stays are not in the feed, so they are not counted as booked and are not removed from available days."

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
    market,
  }
}

/** Partner vs market occupancy by departure week (booked ÷ available). */
export const OCCUPANCY_BY_DEPARTURE_WEEK: OccupancyWeekPoint[] = [
  weekPoint("W27", "29 Jun", 6960, 9800, 68),
  weekPoint("W28", "6 Jul", 7400, 10000, 70),
  weekPoint("W29", "13 Jul", 8112, 10400, 73),
  weekPoint("W30", "20 Jul", 8774, 10700, 76),
  weekPoint("W31", "27 Jul", 9350, 11000, 79),
  weekPoint("W32", "3 Aug", 9856, 11200, 81),
  weekPoint("W33", "10 Aug", 10374, 11400, 84),
  weekPoint("W34", "17 Aug", 9744, 11200, 82),
  weekPoint("W35", "24 Aug", 8532, 10800, 77),
  weekPoint("W36", "31 Aug", 7488, 10400, 71),
]

export type OccupancyBedroomRow = {
  bedrooms: string
  bedroomKey: string
  partnerBooked: number
  partnerAvailable: number
  partner: number
  market: number
  /** Properties in this bedroom band (illustrative). */
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
    market,
    properties,
  }
}

/**
 * Occupancy by bedroom count — the high-value cut for pricing and mix.
 * Larger homes often show bigger partner vs market gaps.
 */
export const OCCUPANCY_BY_BEDROOM: OccupancyBedroomRow[] = [
  bedroomRow("1 bed", "1", 18240, 22500, 78, 142),
  bedroomRow("2 bed", "2", 42840, 51000, 79, 318),
  bedroomRow("3 bed", "3", 32390, 41000, 76, 256),
  bedroomRow("4 bed", "4", 14800, 20000, 68, 124),
  bedroomRow("5+ bed", "5-plus", 7480, 11000, 59, 67),
]

export const OCCUPANCY_BY_WEEK_HELP =
  "Partner occupancy compared with the market for each departure week. Calculation: days booked ÷ total days available for stays departing that week. Owner bookings are not in the feed."

export const OCCUPANCY_BY_BEDROOM_HELP =
  "Partner occupancy compared with the market by bedroom count. Calculation: days booked ÷ total days available within each bedroom band. Owner bookings are not in the feed."

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

export const OCCUPANCY_KPI_CARDS = [
  {
    id: "partner-occ",
    label: "Partner occupancy",
    value: formatOccupancyPct(OCCUPANCY_SUMMARY.partnerAvg),
    help: OCCUPANCY_METHOD_HELP,
    delta: `${OCCUPANCY_SUMMARY.gapPp > 0 ? "+" : ""}${OCCUPANCY_SUMMARY.gapPp}pp vs market`,
    higherIsBetter: true,
    context: [
      formatDaysRatio(OCCUPANCY_SUMMARY.partnerBooked, OCCUPANCY_SUMMARY.partnerAvailable),
      `Peak ${OCCUPANCY_SUMMARY.peakWeek.weekLabel} · ${formatOccupancyPct(OCCUPANCY_SUMMARY.peakWeek.partner)}`,
    ],
  },
  {
    id: "market-occ",
    label: "Market occupancy",
    value: formatOccupancyPct(OCCUPANCY_SUMMARY.marketAvg),
    help: "Market average occupancy for the same departure weeks, on the same days booked ÷ days available basis. Used as the partner benchmark.",
    delta: "Benchmark",
    higherIsBetter: true,
    context: ["Same weeks · same regions"],
  },
  {
    id: "best-bedroom",
    label: "Best bedroom gap",
    value: `${OCCUPANCY_SUMMARY.bestBedroom.bedrooms}`,
    help: "Bedroom band where partner occupancy beats the market by the largest margin. Useful for mix and pricing focus.",
    delta: `+${occupancyGapPp(OCCUPANCY_SUMMARY.bestBedroom.partner, OCCUPANCY_SUMMARY.bestBedroom.market)}pp vs market`,
    higherIsBetter: true,
    context: [
      formatDaysRatio(
        OCCUPANCY_SUMMARY.bestBedroom.partnerBooked,
        OCCUPANCY_SUMMARY.bestBedroom.partnerAvailable
      ),
      `Partner ${formatOccupancyPct(OCCUPANCY_SUMMARY.bestBedroom.partner)} · Market ${formatOccupancyPct(OCCUPANCY_SUMMARY.bestBedroom.market)}`,
    ],
  },
] as const
