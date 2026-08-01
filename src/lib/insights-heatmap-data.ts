/**
 * Filterable metric heatmaps for attachment, cancellation rate, and re-let rate.
 * Dimensions: lead time, bedrooms, departure month.
 * Values are illustrative mocks until the full booking cube is wired.
 */

export type HeatDimension = "leadTime" | "bedroom" | "departure"

export type HeatMetricId = "attachment" | "cancellation" | "relet"

export const HEAT_DIMENSION_OPTIONS: Array<{ id: HeatDimension; label: string }> = [
  { id: "leadTime", label: "Lead time" },
  { id: "bedroom", label: "Bedroom" },
  { id: "departure", label: "Departure" },
]

export const HEAT_LEAD_TIME_BANDS = [
  { id: "0-30", label: "0–30 days" },
  { id: "31-90", label: "31–90 days" },
  { id: "91-180", label: "91–180 days" },
  { id: "180-plus", label: "180+ days" },
] as const

export const HEAT_BEDROOM_BANDS = [
  { id: "1", label: "1 bed" },
  { id: "2", label: "2 bed" },
  { id: "3", label: "3 bed" },
  { id: "4", label: "4 bed" },
  { id: "5-plus", label: "5+ bed" },
] as const

export const HEAT_DEPARTURE_MONTHS = [
  { id: "jun", label: "Jun" },
  { id: "jul", label: "Jul" },
  { id: "aug", label: "Aug" },
  { id: "sep", label: "Sep" },
] as const

export type HeatBand = { id: string; label: string }

export const HEAT_BANDS: Record<HeatDimension, readonly HeatBand[]> = {
  leadTime: HEAT_LEAD_TIME_BANDS,
  bedroom: HEAT_BEDROOM_BANDS,
  departure: HEAT_DEPARTURE_MONTHS,
}

/** One cell in the lead × bedroom × departure cube. */
export type HeatCubeCell = {
  leadTime: string
  bedroom: string
  departure: string
  value: number
}

export type HeatMetricConfig = {
  id: HeatMetricId
  label: string
  unit: "%"
  /** Higher values are typically better for this metric. */
  higherIsBetter: boolean
  help: string
  cells: HeatCubeCell[]
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/**
 * Build a dense cube with a base rate and small dimensional lifts
 * so the heatmap has readable shape without inventing a second truth source.
 */
function buildCube(args: {
  base: number
  leadLift: number[]
  bedroomLift: number[]
  departureLift: number[]
  jitter?: number
}): HeatCubeCell[] {
  const cells: HeatCubeCell[] = []
  const { base, leadLift, bedroomLift, departureLift, jitter = 0.35 } = args

  HEAT_LEAD_TIME_BANDS.forEach((lead, li) => {
    HEAT_BEDROOM_BANDS.forEach((bedroom, bi) => {
      HEAT_DEPARTURE_MONTHS.forEach((departure, di) => {
        const wave = Math.sin((li + 1) * (bi + 1) * 0.7 + di) * jitter
        const value = round1(
          clamp(base + leadLift[li]! + bedroomLift[bi]! + departureLift[di]! + wave, 1, 98)
        )
        cells.push({
          leadTime: lead.id,
          bedroom: bedroom.id,
          departure: departure.id,
          value,
        })
      })
    })
  })

  return cells
}

export const ATTACHMENT_HEAT_CELLS = buildCube({
  base: 14,
  leadLift: [-3.5, -0.5, 2.5, 4],
  bedroomLift: [1.5, 2, 0.5, -1, -2.5],
  departureLift: [-1, 1.5, 2.5, 0],
})

export const CANCELLATION_HEAT_CELLS = buildCube({
  base: 9.5,
  leadLift: [4, 1.5, -1, -2.5],
  bedroomLift: [-0.5, 0, 0.5, 1, 1.5],
  departureLift: [-1, 0.5, 2, 1],
  jitter: 0.25,
})

export const RELET_HEAT_CELLS = buildCube({
  base: 58,
  leadLift: [-6, -2, 3, 5],
  bedroomLift: [2, 3, 1, -2, -4],
  departureLift: [-2, 1, 3, 0],
  jitter: 0.8,
})

export const HEAT_METRICS: Record<HeatMetricId, HeatMetricConfig> = {
  attachment: {
    id: "attachment",
    label: "Attachment",
    unit: "%",
    higherIsBetter: true,
    help: "Attachment rate across lead time, bedrooms, and departure. Filter the third dimension or swap row and column axes. Calculation: attached bookings ÷ bookings in each cell.",
    cells: ATTACHMENT_HEAT_CELLS,
  },
  cancellation: {
    id: "cancellation",
    label: "Cancellation rate",
    unit: "%",
    higherIsBetter: false,
    help: "Cancellation rate across lead time, bedrooms, and departure. Filter the third dimension or swap row and column axes. Calculation: cancellations ÷ bookings in each cell.",
    cells: CANCELLATION_HEAT_CELLS,
  },
  relet: {
    id: "relet",
    label: "Re-let rate",
    unit: "%",
    higherIsBetter: true,
    help: "Re-let rate across lead time, bedrooms, and departure. Filter the third dimension or swap row and column axes. Calculation: re-lets ÷ cancellations in each cell.",
    cells: RELET_HEAT_CELLS,
  },
}

export const HEATMAP_INTRO =
  "Heatmap starter: swap axes across lead time, bedrooms, and departure, and filter the third dimension."

function matchesFilter(
  cell: HeatCubeCell,
  dim: HeatDimension,
  filterId: string | "all"
) {
  if (filterId === "all") return true
  return cell[dim] === filterId
}

export type HeatMatrix = {
  rowDim: HeatDimension
  colDim: HeatDimension
  filterDim: HeatDimension
  filterId: string | "all"
  rowBands: HeatBand[]
  colBands: HeatBand[]
  /** rows × cols values; null if no contributing cells */
  values: Array<Array<number | null>>
  min: number
  max: number
}

export function getFilterDimension(rowDim: HeatDimension, colDim: HeatDimension): HeatDimension {
  const dims: HeatDimension[] = ["leadTime", "bedroom", "departure"]
  return dims.find((dim) => dim !== rowDim && dim !== colDim) ?? "leadTime"
}

export function buildHeatMatrix(args: {
  cells: HeatCubeCell[]
  rowDim: HeatDimension
  colDim: HeatDimension
  filterId: string | "all"
}): HeatMatrix {
  const { cells, rowDim, colDim, filterId } = args
  const filterDim = getFilterDimension(rowDim, colDim)
  const rowBands = [...HEAT_BANDS[rowDim]]
  const colBands = [...HEAT_BANDS[colDim]]

  const filtered = cells.filter((cell) => matchesFilter(cell, filterDim, filterId))

  const sums = new Map<string, { sum: number; count: number }>()
  for (const cell of filtered) {
    const key = `${cell[rowDim]}|${cell[colDim]}`
    const entry = sums.get(key) ?? { sum: 0, count: 0 }
    entry.sum += cell.value
    entry.count += 1
    sums.set(key, entry)
  }

  const values = rowBands.map((row) =>
    colBands.map((col) => {
      const entry = sums.get(`${row.id}|${col.id}`)
      if (!entry || entry.count === 0) return null
      return round1(entry.sum / entry.count)
    })
  )

  const flat = values.flat().filter((v): v is number => v !== null)
  const min = flat.length ? Math.min(...flat) : 0
  const max = flat.length ? Math.max(...flat) : 1

  return {
    rowDim,
    colDim,
    filterDim,
    filterId,
    rowBands,
    colBands,
    values,
    min,
    max,
  }
}

export function formatHeatValue(value: number | null, unit = "%") {
  if (value === null) return "—"
  return `${round1(value)}${unit}`
}

/** Map a value into 0–1 within the matrix range (with a small pad). */
export function heatIntensity(value: number | null, min: number, max: number) {
  if (value === null) return 0
  if (max <= min) return 0.55
  return (value - min) / (max - min)
}
