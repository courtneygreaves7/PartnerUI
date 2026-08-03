/**
 * FC value loop — booking-type matrix, opportunities, and proof.
 * Built from the same dimensional bands as Insights heatmaps.
 * Illustrative mocks aligned to portfolio loop anchors (14% / ~10% / 60% / £100k).
 */

import {
  HEAT_BANDS,
  HEAT_BEDROOM_BANDS,
  HEAT_DEPARTURE_MONTHS,
  HEAT_DIMENSION_OPTIONS,
  HEAT_LEAD_TIME_BANDS,
  getFilterDimension,
  type HeatBand,
  type HeatDimension,
} from "@/lib/insights-heatmap-data"
import {
  LIVE_CANCELLATIONS,
  formatReletFillLabel,
  getRecoveredValue,
  isSplitRelet,
} from "@/lib/cancellations-releats-data"

export { HEAT_DIMENSION_OPTIONS, HEAT_BANDS, getFilterDimension }
export type { HeatDimension, HeatBand }

export type FcLoopCellMetrics = {
  leadTime: string
  bedroom: string
  departure: string
  /** FC attachment % */
  sales: number
  /** Cancel rate % of FC bookings */
  cancel: number
  /** Re-let rate % of cancellations */
  relet: number
  /** Recovered value as % of cancelled value */
  recoveredPct: number
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Dense cube so Bedroom × Departure (+ lead filter) has shape without a second truth source. */
function buildLoopCube(): FcLoopCellMetrics[] {
  const cells: FcLoopCellMetrics[] = []

  HEAT_LEAD_TIME_BANDS.forEach((lead, li) => {
    HEAT_BEDROOM_BANDS.forEach((bedroom, bi) => {
      HEAT_DEPARTURE_MONTHS.forEach((departure, di) => {
        const demand = di >= 1 && di <= 2 ? 1 : 0 // Jul–Aug peak
        const largeHome = bi >= 3 ? 1 : 0
        const shortLead = li === 0 ? 1 : 0

        const sales = round1(
          clamp(14 + li * 1.2 + bi * 0.4 + demand * 1.5 - shortLead * 2 + Math.sin(bi + di) * 0.4, 6, 28)
        )
        const cancel = round1(
          clamp(10 + shortLead * 3.5 - li * 0.8 + bi * 0.3 + Math.cos(di) * 0.5, 4, 22)
        )
        const relet = round1(
          clamp(58 + demand * 12 + largeHome * 6 - shortLead * 10 + li * 2 + Math.sin(bi * di) * 1.2, 28, 92)
        )
        const recoveredPct = round1(
          clamp(92 + demand * 8 + largeHome * 10 - shortLead * 12 + (relet - 60) * 0.35, 70, 130)
        )

        cells.push({
          leadTime: lead.id,
          bedroom: bedroom.id,
          departure: departure.id,
          sales,
          cancel,
          relet,
          recoveredPct,
        })
      })
    })
  })

  return cells
}

export const FC_LOOP_CELLS = buildLoopCube()

export type FcLoopDisplayMetric = "relet" | "recoveredPct" | "sales" | "cancel"

export const FC_LOOP_DISPLAY_METRICS: Array<{
  id: FcLoopDisplayMetric
  label: string
  help: string
  higherIsBetter: boolean
}> = [
  {
    id: "relet",
    label: "Relet rate",
    help: "Colour shows relet rate. Higher means more cancelled stays were relet.",
    higherIsBetter: true,
  },
  {
    id: "recoveredPct",
    label: "Recovered %",
    help: "Colour shows recovered value versus cancelled booking value. Over 100% means you earned more than you lost.",
    higherIsBetter: true,
  },
  {
    id: "sales",
    label: "Attachment",
    help: "Colour shows CAL attachment — how often guests bought Flexible Cancellation in that booking type.",
    higherIsBetter: true,
  },
  {
    id: "cancel",
    label: "Cancel rate",
    help: "Colour shows cancellation rate on attached bookings. Read it next to relet — some cancel is normal with cover.",
    higherIsBetter: false,
  },
]

export type FcLoopMatrix = {
  rowDim: HeatDimension
  colDim: HeatDimension
  filterDim: HeatDimension
  filterId: string | "all"
  rowBands: HeatBand[]
  colBands: HeatBand[]
  cells: Array<Array<FcLoopCellMetrics | null>>
  colourMin: number
  colourMax: number
}

function matchesFilter(cell: FcLoopCellMetrics, dim: HeatDimension, filterId: string | "all") {
  if (filterId === "all") return true
  return cell[dim] === filterId
}

function averageMetrics(rows: FcLoopCellMetrics[]): FcLoopCellMetrics | null {
  if (rows.length === 0) return null
  const n = rows.length
  return {
    leadTime: rows[0]!.leadTime,
    bedroom: rows[0]!.bedroom,
    departure: rows[0]!.departure,
    sales: round1(rows.reduce((s, r) => s + r.sales, 0) / n),
    cancel: round1(rows.reduce((s, r) => s + r.cancel, 0) / n),
    relet: round1(rows.reduce((s, r) => s + r.relet, 0) / n),
    recoveredPct: round1(rows.reduce((s, r) => s + r.recoveredPct, 0) / n),
  }
}

export function buildFcLoopMatrix(args: {
  rowDim: HeatDimension
  colDim: HeatDimension
  filterId: string | "all"
  colourMetric: FcLoopDisplayMetric
}): FcLoopMatrix {
  const { rowDim, colDim, filterId, colourMetric } = args
  const filterDim = getFilterDimension(rowDim, colDim)
  const rowBands = [...HEAT_BANDS[rowDim]]
  const colBands = [...HEAT_BANDS[colDim]]
  const filtered = FC_LOOP_CELLS.filter((cell) => matchesFilter(cell, filterDim, filterId))

  const buckets = new Map<string, FcLoopCellMetrics[]>()
  for (const cell of filtered) {
    const key = `${cell[rowDim]}|${cell[colDim]}`
    const list = buckets.get(key) ?? []
    list.push(cell)
    buckets.set(key, list)
  }

  const cells = rowBands.map((row) =>
    colBands.map((col) => averageMetrics(buckets.get(`${row.id}|${col.id}`) ?? []))
  )

  const flat = cells
    .flat()
    .filter((cell): cell is FcLoopCellMetrics => cell !== null)
    .map((cell) => cell[colourMetric])
  const colourMin = flat.length ? Math.min(...flat) : 0
  const colourMax = flat.length ? Math.max(...flat) : 1

  return {
    rowDim,
    colDim,
    filterDim,
    filterId,
    rowBands,
    colBands,
    cells,
    colourMin,
    colourMax,
  }
}

export function fcLoopColourIntensity(
  value: number,
  min: number,
  max: number,
  higherIsBetter: boolean
) {
  if (max <= min) return 0.5
  const t = (value - min) / (max - min)
  return higherIsBetter ? t : 1 - t
}

export type FcLoopActionTarget = "releats" | "ask-ai"

export type FcLoopOpportunity = {
  id: string
  title: string
  detail: string
  kind: "leak" | "undersold" | "split"
  /** Partner-facing signal for filters and card chrome. */
  signal: "risk" | "opportunity" | "success"
  metrics: string
  metricsList: Array<{ label: string; value: string }>
  actionLabel: string
  /** Where the action link should go when clicked. */
  actionTarget: FcLoopActionTarget
  bedroomLabel: string
  departureLabel: string
  /** Prompt the AI coworker can answer for a deeper cut of this slice. */
  askPrompt: string
}

function askPromptFor(
  kind: FcLoopOpportunity["kind"],
  bedroom: string,
  departure: string
) {
  const slice = `${bedroom} · ${departure}`
  if (kind === "leak") {
    return `Drill into ${slice} — cancel vs re-let by lead time`
  }
  if (kind === "undersold") {
    return `Drill into ${slice} — cover take-up vs re-let demand`
  }
  return `Drill into ${slice} — value kept and how to repeat it`
}

function signalFor(kind: FcLoopOpportunity["kind"]): FcLoopOpportunity["signal"] {
  if (kind === "leak") return "risk"
  if (kind === "undersold") return "opportunity"
  return "success"
}

function actionFor(kind: FcLoopOpportunity["kind"]): {
  label: string
  target: FcLoopActionTarget
} {
  if (kind === "leak") {
    return { label: "Open cancellations", target: "releats" }
  }
  if (kind === "undersold") {
    return { label: "Ask AI", target: "ask-ai" }
  }
  return { label: "See re-let bookings", target: "releats" }
}

/** Ranked prompts partners can act on — derived from cube extremes. */
export function getFcLoopOpportunities(): FcLoopOpportunity[] {
  const byBedroomDeparture = new Map<string, FcLoopCellMetrics[]>()
  for (const cell of FC_LOOP_CELLS) {
    const key = `${cell.bedroom}|${cell.departure}`
    const list = byBedroomDeparture.get(key) ?? []
    list.push(cell)
    byBedroomDeparture.set(key, list)
  }

  const aggregates = [...byBedroomDeparture.entries()].map(([key, rows]) => {
    const avg = averageMetrics(rows)!
    const bedroom = HEAT_BEDROOM_BANDS.find((b) => b.id === avg.bedroom)?.label ?? avg.bedroom
    const departure = HEAT_DEPARTURE_MONTHS.find((d) => d.id === avg.departure)?.label ?? avg.departure
    return { key, bedroom, departure, ...avg }
  })

  const leak = [...aggregates].sort((a, b) => b.cancel - b.relet - (a.cancel - a.relet))[0]
  const undersold = [...aggregates]
    .filter((row) => row.relet >= 70)
    .sort((a, b) => a.sales - b.sales)[0]
  const strong = [...aggregates].sort((a, b) => b.recoveredPct - a.recoveredPct)[0]
  const softRelet = [...aggregates].sort((a, b) => a.relet - b.relet)[0]
  const peakSales = [...aggregates].sort((a, b) => b.sales - a.sales)[0]

  const opportunities: FcLoopOpportunity[] = []

  if (leak) {
    const action = actionFor("leak")
    opportunities.push({
      id: "leak",
      title: `${leak.bedroom} · ${leak.departure}`,
      detail: "More guests cancelling, but fewer re-lets — revenue at risk here.",
      kind: "leak",
      signal: signalFor("leak"),
      metrics: `Cancelled ${leak.cancel}% · Re-let ${leak.relet}%`,
      metricsList: [
        { label: "Cancelled", value: `${leak.cancel}%` },
        { label: "Re-let", value: `${leak.relet}%` },
      ],
      actionLabel: action.label,
      actionTarget: action.target,
      bedroomLabel: leak.bedroom,
      departureLabel: leak.departure,
      askPrompt: askPromptFor("leak", leak.bedroom, leak.departure),
    })
  }
  if (undersold) {
    const action = actionFor("undersold")
    opportunities.push({
      id: "undersold",
      title: `${undersold.bedroom} · ${undersold.departure}`,
      detail: "Strong re-let demand, but fewer guests buy Flexible Cancellation — room to sell more cover.",
      kind: "undersold",
      signal: signalFor("undersold"),
      metrics: `Cover ${undersold.sales}% · Re-let ${undersold.relet}%`,
      metricsList: [
        { label: "Attachment", value: `${undersold.sales}%` },
        { label: "Re-let", value: `${undersold.relet}%` },
      ],
      actionLabel: action.label,
      actionTarget: action.target,
      bedroomLabel: undersold.bedroom,
      departureLabel: undersold.departure,
      askPrompt: askPromptFor("undersold", undersold.bedroom, undersold.departure),
    })
  }
  if (strong) {
    const action = actionFor("split")
    opportunities.push({
      id: "strong",
      title: `${strong.bedroom} · ${strong.departure}`,
      detail: "Re-lets are worth more than the cancelled stays — clear proof this is working.",
      kind: "split",
      signal: signalFor("split"),
      metrics: `Value kept ${strong.recoveredPct}%`,
      metricsList: [
        { label: "Recovered", value: `${strong.recoveredPct}%` },
        { label: "Re-let", value: `${strong.relet}%` },
      ],
      actionLabel: action.label,
      actionTarget: action.target,
      bedroomLabel: strong.bedroom,
      departureLabel: strong.departure,
      askPrompt: askPromptFor("split", strong.bedroom, strong.departure),
    })
  }
  if (softRelet) {
    const action = actionFor("leak")
    opportunities.push({
      id: "soft-relet",
      title: `${softRelet.bedroom} · ${softRelet.departure}`,
      detail: "Lowest re-let rate here — worth ops attention.",
      kind: "leak",
      signal: signalFor("leak"),
      metrics: `Re-let ${softRelet.relet}% · Cancelled ${softRelet.cancel}%`,
      metricsList: [
        { label: "Re-let", value: `${softRelet.relet}%` },
        { label: "Cancelled", value: `${softRelet.cancel}%` },
      ],
      actionLabel: action.label,
      actionTarget: action.target,
      bedroomLabel: softRelet.bedroom,
      departureLabel: softRelet.departure,
      askPrompt: askPromptFor("leak", softRelet.bedroom, softRelet.departure),
    })
  }
  if (peakSales) {
    const action = actionFor("undersold")
    opportunities.push({
      id: "peak-sales",
      title: `${peakSales.bedroom} · ${peakSales.departure}`,
      detail: "Highest Flexible Cancellation take-up — keep offer quality and stay ready to re-let.",
      kind: "undersold",
      signal: signalFor("undersold"),
      metrics: `Cover ${peakSales.sales}% · Re-let ${peakSales.relet}%`,
      metricsList: [
        { label: "Attachment", value: `${peakSales.sales}%` },
        { label: "Re-let", value: `${peakSales.relet}%` },
      ],
      actionLabel: action.label,
      actionTarget: action.target,
      bedroomLabel: peakSales.bedroom,
      departureLabel: peakSales.departure,
      askPrompt: askPromptFor("undersold", peakSales.bedroom, peakSales.departure),
    })
  }

  return opportunities.slice(0, 5)
}

export type FcLoopSliceDetail = {
  bedroomLabel: string
  departureLabel: string
  overall: FcLoopCellMetrics
  byLeadTime: Array<{ leadLabel: string; metrics: FcLoopCellMetrics }>
  portfolioGap: { cancel: number; relet: number; sales: number; recoveredPct: number }
}

/** Bedroom × departure cut with lead-time breakdown for AI drill-downs. */
export function getFcLoopSlice(
  bedroomLabel: string,
  departureLabel: string
): FcLoopSliceDetail | null {
  const bedroom = HEAT_BEDROOM_BANDS.find(
    (b) => b.label.toLowerCase() === bedroomLabel.toLowerCase()
  )
  const departure = HEAT_DEPARTURE_MONTHS.find(
    (d) => d.label.toLowerCase() === departureLabel.toLowerCase()
  )
  if (!bedroom || !departure) return null

  const rows = FC_LOOP_CELLS.filter(
    (cell) => cell.bedroom === bedroom.id && cell.departure === departure.id
  )
  const overall = averageMetrics(rows)
  if (!overall) return null

  const byLeadTime = HEAT_LEAD_TIME_BANDS.map((lead) => {
    const metrics = averageMetrics(rows.filter((cell) => cell.leadTime === lead.id))!
    return { leadLabel: lead.label, metrics }
  })

  const portfolio = averageMetrics(FC_LOOP_CELLS)!
  return {
    bedroomLabel: bedroom.label,
    departureLabel: departure.label,
    overall,
    byLeadTime,
    portfolioGap: {
      cancel: round1(overall.cancel - portfolio.cancel),
      relet: round1(overall.relet - portfolio.relet),
      sales: round1(overall.sales - portfolio.sales),
      recoveredPct: round1(overall.recoveredPct - portfolio.recoveredPct),
    },
  }
}

/** Match prompts like “Drill into 5+ bed · Aug …” to a booking-type slice. */
export function matchFcLoopSliceFromPrompt(prompt: string): {
  bedroomLabel: string
  departureLabel: string
} | null {
  const lower = prompt.toLowerCase()
  const bedroom = HEAT_BEDROOM_BANDS.find((band) => {
    const label = band.label.toLowerCase()
    return (
      lower.includes(label) ||
      lower.includes(`${band.id} bed`) ||
      (band.id === "5-plus" && (lower.includes("5+") || lower.includes("5 plus")))
    )
  })
  const departure = HEAT_DEPARTURE_MONTHS.find((band) => {
    const label = band.label.toLowerCase()
    return lower.includes(label) || lower.includes(band.id)
  })
  if (!bedroom || !departure) return null
  return { bedroomLabel: bedroom.label, departureLabel: departure.label }
}

export type FcLoopProofExample = {
  id: string
  property: string
  cancelledAt: string
  cancelledNights: number
  cancelledValue: number
  fillsLabel: string
  recoveredValue: number
  gain: number
  upliftPct: number
  isSplit: boolean
}

/** Latest completed re-lets from the live cancellations list (newest cancel first). */
export function getLatestReletProofExamples(limit = 3): FcLoopProofExample[] {
  return LIVE_CANCELLATIONS.filter((booking) => booking.reletStatus === "relet")
    .sort((a, b) => b.cancelledAt.localeCompare(a.cancelledAt))
    .slice(0, limit)
    .map((booking) => {
      const recoveredValue = getRecoveredValue(booking)
      const gain = recoveredValue - booking.value
      return {
        id: booking.id,
        property: booking.property,
        cancelledAt: booking.cancelledAt,
        cancelledNights: booking.nights,
        cancelledValue: booking.value,
        fillsLabel: formatReletFillLabel(booking) ?? `${booking.nights}n`,
        recoveredValue,
        gain,
        upliftPct: booking.value > 0 ? (gain / booking.value) * 100 : 0,
        isSplit: isSplitRelet(booking),
      }
    })
}

export const FC_LOOP_PROOF = {
  title: "Latest re-lets",
  summary: "Recent cancels that came back as bookings — and what they made.",
  help: "The most recent completed re-lets from live cancellations. Each row shows recovered revenue versus the cancelled booking. Open Cancellations & re-lets for full booking detail.",
  examples: getLatestReletProofExamples(3),
} as const

export const FC_LOOP_MATRIX_HELP =
  "Each card is a booking type. The top bar shows relet vs not relet. Below: ATT attachment, CXL cancel rate, REC recovered %. Use rows, columns, and filter to change the cut."

export const FC_LOOP_OPPORTUNITIES_HELP =
  "Where to run the business harder for max revenue: weak re-let recovery, under-sold cover where demand is strong, and proof points that show the loop already pays."

export function formatCurrency(n: number) {
  return `£${Math.round(n).toLocaleString("en-GB")}`
}