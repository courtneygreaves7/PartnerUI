export type MapMetricId =
  | "bookings"
  | "abv"
  | "calTakeUp"
  | "gwp"
  | "cancellationRate"
  | "reletRate"
  | "recoveryRate"

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
  /** Share of cancelled stays re-let (derived mock when absent from geo JSON). */
  reletRate: number
  /** Recovered value as % of cancelled booking value (derived mock when absent). */
  recoveryRate: number
}

export const MAP_METRICS: Array<{ id: MapMetricId; label: string }> = [
  { id: "bookings", label: "Bookings" },
  { id: "abv", label: "ABV" },
  { id: "calTakeUp", label: "CAL take-up" },
  { id: "gwp", label: "GWP" },
  { id: "cancellationRate", label: "Cancellation rate" },
  { id: "reletRate", label: "Re-let rate" },
  { id: "recoveryRate", label: "Recovery rate" },
]

/** SVG viewBox for the projected UK counties map (see public/uk-counties-map.json). */
export const MAP_VIEWBOX = "0 0 800 1000"

export type MapCountryCode = "UK" | "FR" | "ES"

export const MAP_COUNTRY_META: Record<
  MapCountryCode,
  { label: string; regionNoun: string; asset: string; shortLabel: string }
> = {
  UK: {
    label: "United Kingdom",
    shortLabel: "UK",
    regionNoun: "counties",
    asset: "/uk-counties-map.json",
  },
  FR: {
    label: "France",
    shortLabel: "France",
    regionNoun: "regions",
    asset: "/france-regions-map.json",
  },
  ES: {
    label: "Spain",
    shortLabel: "Spain",
    regionNoun: "communities",
    asset: "/spain-regions-map.json",
  },
}

/**
 * 3D country framing — atlas-style north-up so shapes match what people know
 * from wall maps (not globe yaw, which can feel "wrong" at a glance).
 */
export const COUNTRY_3D_VIEW: Record<
  MapCountryCode,
  {
    /** Tip of the map table toward the camera (radians). Near -π/2 keeps extrusion upright. */
    pitch: number
    /** Keep near 0 for recognisable atlas orientation. */
    yaw: number
  }
> = {
  UK: {
    pitch: -Math.PI / 2 + 0.28,
    yaw: 0,
  },
  FR: {
    pitch: -Math.PI / 2 + 0.28,
    yaw: 0,
  },
  ES: {
    pitch: -Math.PI / 2 + 0.28,
    yaw: 0,
  },
}

const regionCache = new Map<MapCountryCode, MapRegion[]>()

type RawMapRegion = Omit<MapRegion, "reletRate" | "recoveryRate"> & {
  reletRate?: number
  recoveryRate?: number
}

function enrichRegionRecovery(region: RawMapRegion): MapRegion {
  const seed = hashId(region.id)
  const reletRate =
    region.reletRate ??
    Math.round(
      Math.min(
        92,
        Math.max(26, 55 + (seed % 27) - region.cancellationRate * 0.85 + (seed % 7) * 0.3)
      ) * 10
    ) / 10
  const recoveryRate =
    region.recoveryRate ??
    Math.round(Math.min(128, Math.max(62, reletRate * 1.2 + (seed % 18) - 4)) * 10) / 10

  return { ...region, reletRate, recoveryRate }
}

export async function loadMapRegions(country: MapCountryCode = "UK"): Promise<MapRegion[]> {
  const cached = regionCache.get(country)
  if (cached) return cached
  const meta = MAP_COUNTRY_META[country]
  const response = await fetch(meta.asset)
  if (!response.ok) throw new Error(`Failed to load ${meta.label} map data`)
  const raw = (await response.json()) as RawMapRegion[]
  const next = raw.map(enrichRegionRecovery)
  regionCache.set(country, next)
  return next
}

/** @deprecated Prefer loadMapRegions("UK") */
export async function loadUkMapRegions(): Promise<MapRegion[]> {
  return loadMapRegions("UK")
}

/** Recognisable UK counties for pitch-deck regional slide (mock booking volumes). */
export const UK_PITCH_DECK_HIGHLIGHTS = [
  { name: "Cornwall", bookings: 48200 },
  { name: "North Yorkshire", bookings: 44100 },
  { name: "Cumbria", bookings: 39800 },
  { name: "Devon", bookings: 37600 },
  { name: "Dorset", bookings: 35200 },
] as const

export function getCachedMapRegions(country: MapCountryCode = "UK"): MapRegion[] {
  return regionCache.get(country) ?? []
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
  if (max <= min) return "rgb(var(--primary-rgb) / 0.55)"
  const t = (value - min) / (max - min)
  const opacity = 0.22 + t * 0.68
  return `rgb(var(--primary-rgb) / ${opacity.toFixed(2)})`
}

/** Darken a metric fill for hover / selected states. */
export function darkenMetricFill(
  value: number,
  min: number,
  max: number,
  amount: "hover" | "selected"
): string {
  if (max <= min) {
    return amount === "selected"
      ? "rgb(var(--primary-dark-rgb) / 0.88)"
      : "rgb(var(--primary-rgb) / 0.72)"
  }
  const t = (value - min) / (max - min)
  const base = 0.22 + t * 0.68
  const opacity = amount === "selected" ? Math.min(0.95, base + 0.28) : Math.min(0.88, base + 0.14)
  const rgb = amount === "selected" ? "var(--primary-dark-rgb)" : "var(--primary-rgb)"
  return `rgb(${rgb} / ${opacity.toFixed(2)})`
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
    reletRate: adjustPercent(region.reletRate, filters.brand),
    recoveryRate: adjustPercent(region.recoveryRate, filters.brand),
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
  reletRate: number
  recoveryRate: number
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
    reletRate: region.reletRate,
    recoveryRate: region.recoveryRate,
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
      reletRate: 0,
      recoveryRate: 0,
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
  const avgRelet =
    regions.length > 0
      ? Math.round((regions.reduce((sum, r) => sum + r.reletRate, 0) / regions.length) * 10) / 10
      : 0
  const avgRecovery =
    regions.length > 0
      ? Math.round((regions.reduce((sum, r) => sum + r.recoveryRate, 0) / regions.length) * 10) / 10
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
    reletRate: avgRelet,
    recoveryRate: avgRecovery,
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
    reletRate: region.reletRate,
    recoveryRate: region.recoveryRate,
  }
}
