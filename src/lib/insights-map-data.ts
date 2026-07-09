export type MapMetricId = "bookings" | "abv" | "calTakeUp" | "gwp" | "cancellationRate"

import {
  adjustAverageCurrency,
  adjustPercent,
  isAllBrands,
  scaleCountValue,
  scaleCurrencyValue,
} from "@/lib/brand-metrics"

export type MapRegion = {
  id: string
  name: string
  code: string
  country: string
  path: string
  labelX: number
  labelY: number
  bookings: number
  abv: number
  calTakeUp: number
  gwp: number
  cancellationRate: number
}

export const MAP_METRICS: Array<{ id: MapMetricId; label: string }> = [
  { id: "bookings", label: "Bookings" },
  { id: "abv", label: "ABV" },
  { id: "calTakeUp", label: "CAL take-up" },
  { id: "gwp", label: "GWP" },
  { id: "cancellationRate", label: "Cancellation rate" },
]

/** SVG viewBox for the projected UK counties map (see public/uk-counties-map.json). */
export const MAP_VIEWBOX = "0 0 800 1000"

let cachedRegions: MapRegion[] | null = null

export async function loadMapRegions(): Promise<MapRegion[]> {
  if (cachedRegions) return cachedRegions
  const response = await fetch("/uk-counties-map.json")
  if (!response.ok) throw new Error("Failed to load UK counties map data")
  cachedRegions = (await response.json()) as MapRegion[]
  return cachedRegions
}

/** Recognisable UK counties for pitch-deck regional slide (mock booking volumes). */
export const UK_PITCH_DECK_HIGHLIGHTS = [
  { name: "Cornwall", bookings: 48200 },
  { name: "North Yorkshire", bookings: 44100 },
  { name: "Cumbria", bookings: 39800 },
  { name: "Devon", bookings: 37600 },
  { name: "Dorset", bookings: 35200 },
] as const

export function getCachedMapRegions(): MapRegion[] {
  return cachedRegions ?? []
}

export function getMetricValue(region: MapRegion, metric: MapMetricId): number {
  return region[metric]
}

export function formatMapMetric(value: number, metric: MapMetricId): string {
  if (metric === "bookings") return value.toLocaleString("en-GB")
  if (metric === "abv") return `£${value.toLocaleString("en-GB")}`
  if (metric === "gwp") return `£${value.toLocaleString("en-GB")}`
  return `${value.toFixed(1)}%`
}

export function metricFill(value: number, min: number, max: number): string {
  if (max <= min) return "rgb(0 107 255 / 0.55)"
  const t = (value - min) / (max - min)
  const opacity = 0.22 + t * 0.68
  return `rgb(0 107 255 / ${opacity.toFixed(2)})`
}

/** Darken a metric fill for hover / selected states. */
export function darkenMetricFill(
  value: number,
  min: number,
  max: number,
  amount: "hover" | "selected"
): string {
  if (max <= min) {
    return amount === "selected" ? "rgb(0 86 204 / 0.88)" : "rgb(0 96 230 / 0.72)"
  }
  const t = (value - min) / (max - min)
  const base = 0.22 + t * 0.68
  const opacity = amount === "selected" ? Math.min(0.95, base + 0.28) : Math.min(0.88, base + 0.14)
  const blue = amount === "selected" ? 86 : 96
  return `rgb(0 ${blue} 204 / ${opacity.toFixed(2)})`
}

export function metricRange(regions: MapRegion[], metric: MapMetricId): { min: number; max: number } {
  const values = regions.map((region) => getMetricValue(region, metric))
  return { min: Math.min(...values), max: Math.max(...values) }
}

/** Apply brand filter — volumes are a share of the all-brands county total. */
export function scaleRegionForFilters(
  region: MapRegion,
  filters: { brand: string }
): MapRegion {
  return {
    ...region,
    bookings: scaleCountValue(region.bookings, filters.brand),
    abv: adjustAverageCurrency(region.abv, filters.brand),
    gwp: scaleCurrencyValue(region.gwp, filters.brand),
    calTakeUp: adjustPercent(region.calTakeUp, filters.brand),
    cancellationRate: adjustPercent(region.cancellationRate, filters.brand),
  }
}

export type RegionDetailStats = {
  county: string
  code: string
  brands: number
  properties: number
  bookings: number
  withCal: number
  withCalPct: number
  withDdl: number
  withDdlPct: number
  revenue: number
  abv: number
  gwp: number
  calTakeUp: number
  cancellationRate: number
}

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash
}

export function getRegionDetailStats(region: MapRegion, brand = "all-brands"): RegionDetailStats {
  const seed = hashId(region.id)
  const brands = isAllBrands(brand) ? 2 + (seed % 3) : 1
  const properties = Math.max(
    120,
    Math.round(region.bookings / (10 + (seed % 6)) / (isAllBrands(brand) ? 1 : brands))
  )
  const withCal = Math.round(region.bookings * (region.calTakeUp / 100))
  const withDdl = Math.round(region.bookings * (0.14 + (seed % 9) / 100))
  const withCalPct = region.bookings > 0 ? (withCal / region.bookings) * 100 : 0
  const withDdlPct = region.bookings > 0 ? (withDdl / region.bookings) * 100 : 0

  return {
    county: region.name,
    code: region.code,
    brands,
    properties,
    bookings: region.bookings,
    withCal,
    withCalPct,
    withDdl,
    withDdlPct,
    revenue: region.gwp,
    abv: region.abv,
    gwp: region.gwp,
    calTakeUp: region.calTakeUp,
    cancellationRate: region.cancellationRate,
  }
}

export function getAggregateDetailStats(
  regions: MapRegion[],
  brand = "all-brands"
): RegionDetailStats {
  const totals = regions.reduce(
    (acc, region) => {
      const stats = getRegionDetailStats(region, brand)
      acc.bookings += stats.bookings
      acc.withCal += stats.withCal
      acc.withDdl += stats.withDdl
      acc.revenue += stats.revenue
      acc.gwp += stats.gwp
      acc.properties += stats.properties
      acc.brands = Math.max(acc.brands, stats.brands)
      return acc
    },
    {
      bookings: 0,
      withCal: 0,
      withDdl: 0,
      revenue: 0,
      gwp: 0,
      properties: 0,
      brands: 0,
      abv: 0,
      calTakeUp: 0,
      cancellationRate: 0,
    }
  )

  const avgAbv =
    regions.length > 0
      ? Math.round(regions.reduce((sum, r) => sum + r.abv, 0) / regions.length)
      : 0
  const avgCal =
    regions.length > 0
      ? Math.round((regions.reduce((sum, r) => sum + r.calTakeUp, 0) / regions.length) * 10) / 10
      : 0
  const avgCancel =
    regions.length > 0
      ? Math.round((regions.reduce((sum, r) => sum + r.cancellationRate, 0) / regions.length) * 10) /
        10
      : 0

  return {
    county: "United Kingdom",
    code: "UK",
    brands: isAllBrands(brand) ? Math.min(4, totals.brands) : 1,
    properties: totals.properties,
    bookings: totals.bookings,
    withCal: totals.withCal,
    withCalPct: totals.bookings > 0 ? (totals.withCal / totals.bookings) * 100 : 0,
    withDdl: totals.withDdl,
    withDdlPct: totals.bookings > 0 ? (totals.withDdl / totals.bookings) * 100 : 0,
    revenue: totals.revenue,
    abv: avgAbv,
    gwp: totals.gwp,
    calTakeUp: avgCal,
    cancellationRate: avgCancel,
  }
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`
  return `£${value.toLocaleString("en-GB")}`
}

export type MapTown = {
  id: string
  name: string
  countyId: string
  share: number
}

const TOWN_NAME_POOL = [
  "Harbour",
  "Market",
  "Castle",
  "Bridge",
  "Park",
  "Hill",
  "Bay",
  "Green",
  "Cross",
  "Mill",
  "Wood",
  "Vale",
] as const

/** Deterministic mock towns/cities within a county for map drill-down. */
export function getTownsForCounty(region: MapRegion): MapTown[] {
  const seed = hashId(region.id)
  const count = 4 + (seed % 4)
  const towns: MapTown[] = []
  let remaining = 1

  for (let i = 0; i < count; i++) {
    const share =
      i === count - 1
        ? Math.round(remaining * 100) / 100
        : Math.round((0.12 + ((seed >> (i * 3)) % 18) / 100) * 100) / 100
    remaining = Math.max(0.05, remaining - share)
    const suffix = TOWN_NAME_POOL[(seed + i * 5) % TOWN_NAME_POOL.length]
    const name =
      i === 0
        ? region.name.includes(" ")
          ? `${region.name.split(" ")[0]} Town`
          : `${region.name} Town`
        : `${region.name.split(" ")[0] ?? region.name} ${suffix}`
    towns.push({
      id: `${region.id}--${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      countyId: region.id,
      share: Math.max(0.05, share),
    })
  }

  const totalShare = towns.reduce((sum, town) => sum + town.share, 0)
  return towns.map((town) => ({
    ...town,
    share: town.share / totalShare,
  }))
}

export function scaleRegionByTownShare(region: MapRegion, share: number): MapRegion {
  return {
    ...region,
    bookings: Math.max(1, Math.round(region.bookings * share)),
    gwp: Math.max(1, Math.round(region.gwp * share)),
    abv: region.abv,
    calTakeUp: region.calTakeUp,
    cancellationRate: region.cancellationRate,
  }
}
