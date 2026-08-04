/** Portfolio property hubs for the Insights 3D globe (Europe + US). */

export type GlobeMarket = "europe" | "us"

export type GlobeHub = {
  id: string
  name: string
  market: GlobeMarket
  country: string
  lat: number
  lng: number
  /** Live properties in this hub (illustrative). */
  properties: number
  /** Bookings in current period (illustrative). */
  bookings: number
}

export const GLOBE_HUBS: GlobeHub[] = [
  // United Kingdom / Ireland
  { id: "london", name: "London & South East", market: "europe", country: "UK", lat: 51.5, lng: -0.12, properties: 186, bookings: 12400 },
  { id: "cornwall", name: "Cornwall & Devon", market: "europe", country: "UK", lat: 50.3, lng: -4.8, properties: 142, bookings: 9800 },
  { id: "lake-district", name: "Lake District", market: "europe", country: "UK", lat: 54.5, lng: -3.1, properties: 98, bookings: 6400 },
  { id: "scotland", name: "Scottish Highlands", market: "europe", country: "UK", lat: 57.1, lng: -4.7, properties: 74, bookings: 4200 },
  { id: "norfolk", name: "Norfolk & Suffolk", market: "europe", country: "UK", lat: 52.6, lng: 1.3, properties: 88, bookings: 5100 },
  { id: "wales", name: "Wales Coast", market: "europe", country: "UK", lat: 52.4, lng: -4.0, properties: 61, bookings: 3600 },
  { id: "dublin", name: "Dublin & East", market: "europe", country: "IE", lat: 53.35, lng: -6.26, properties: 44, bookings: 2800 },
  // Continental Europe
  { id: "paris", name: "Paris region", market: "europe", country: "FR", lat: 48.86, lng: 2.35, properties: 52, bookings: 3100 },
  { id: "provence", name: "Provence", market: "europe", country: "FR", lat: 43.9, lng: 5.4, properties: 38, bookings: 2200 },
  { id: "barcelona", name: "Barcelona & Costa", market: "europe", country: "ES", lat: 41.39, lng: 2.17, properties: 47, bookings: 2900 },
  { id: "andalucia", name: "Andalucía", market: "europe", country: "ES", lat: 36.72, lng: -4.42, properties: 41, bookings: 2500 },
  { id: "amsterdam", name: "Amsterdam", market: "europe", country: "NL", lat: 52.37, lng: 4.9, properties: 29, bookings: 1800 },
  { id: "berlin", name: "Berlin", market: "europe", country: "DE", lat: 52.52, lng: 13.4, properties: 33, bookings: 1900 },
  { id: "rome", name: "Rome & Lazio", market: "europe", country: "IT", lat: 41.9, lng: 12.5, properties: 36, bookings: 2100 },
  { id: "lisbon", name: "Lisbon & Algarve", market: "europe", country: "PT", lat: 38.72, lng: -9.14, properties: 40, bookings: 2400 },
  // United States
  { id: "nyc", name: "New York Metro", market: "us", country: "US", lat: 40.71, lng: -74.01, properties: 68, bookings: 4200 },
  { id: "miami", name: "Miami & South Florida", market: "us", country: "US", lat: 25.76, lng: -80.19, properties: 55, bookings: 3800 },
  { id: "la", name: "Los Angeles", market: "us", country: "US", lat: 34.05, lng: -118.24, properties: 49, bookings: 3200 },
  { id: "austin", name: "Austin", market: "us", country: "US", lat: 30.27, lng: -97.74, properties: 31, bookings: 1900 },
  { id: "denver", name: "Denver & Rockies", market: "us", country: "US", lat: 39.74, lng: -104.99, properties: 27, bookings: 1600 },
  { id: "seattle", name: "Seattle", market: "us", country: "US", lat: 47.61, lng: -122.33, properties: 24, bookings: 1400 },
  { id: "chicago", name: "Chicago", market: "us", country: "US", lat: 41.88, lng: -87.63, properties: 22, bookings: 1300 },
  { id: "nashville", name: "Nashville", market: "us", country: "US", lat: 36.16, lng: -86.78, properties: 26, bookings: 1500 },
]

export type GlobeFocusId = "world" | "europe" | "us" | "uk"

export const GLOBE_FOCUS: Record<
  GlobeFocusId,
  { label: string; lat: number; lng: number; altitude: number }
> = {
  world: { label: "World", lat: 28, lng: -30, altitude: 2.35 },
  europe: { label: "Europe", lat: 48, lng: 8, altitude: 1.15 },
  us: { label: "United States", lat: 38, lng: -97, altitude: 1.25 },
  uk: { label: "United Kingdom", lat: 54.5, lng: -2.5, altitude: 0.55 },
}

export function summariseGlobeHubs(hubs: GlobeHub[] = GLOBE_HUBS) {
  const europe = hubs.filter((h) => h.market === "europe")
  const us = hubs.filter((h) => h.market === "us")
  const sum = (list: GlobeHub[], key: "properties" | "bookings") =>
    list.reduce((total, hub) => total + hub[key], 0)

  return {
    hubs: hubs.length,
    europeHubs: europe.length,
    usHubs: us.length,
    properties: sum(hubs, "properties"),
    europeProperties: sum(europe, "properties"),
    usProperties: sum(us, "properties"),
    bookings: sum(hubs, "bookings"),
  }
}

/** ISO 3166-1 numeric ids used by world-atlas countries-110m. */
export const GLOBE_COUNTRY_ISO: Record<string, string> = {
  UK: "826",
  IE: "372",
  FR: "250",
  ES: "724",
  NL: "528",
  DE: "276",
  IT: "380",
  PT: "620",
  US: "840",
}

export const GLOBE_COUNTRY_LABELS: Record<string, string> = {
  UK: "United Kingdom",
  IE: "Ireland",
  FR: "France",
  ES: "Spain",
  NL: "Netherlands",
  DE: "Germany",
  IT: "Italy",
  PT: "Portugal",
  US: "United States",
}

export type GlobeCountryStats = {
  code: string
  isoId: string
  name: string
  market: GlobeMarket
  properties: number
  bookings: number
  hubs: number
}

export function buildGlobeCountryStats(
  hubs: GlobeHub[] = GLOBE_HUBS
): GlobeCountryStats[] {
  const byCode = new Map<string, GlobeCountryStats>()

  for (const hub of hubs) {
    const existing = byCode.get(hub.country)
    if (existing) {
      existing.properties += hub.properties
      existing.bookings += hub.bookings
      existing.hubs += 1
      continue
    }
    byCode.set(hub.country, {
      code: hub.country,
      isoId: GLOBE_COUNTRY_ISO[hub.country] ?? "",
      name: GLOBE_COUNTRY_LABELS[hub.country] ?? hub.country,
      market: hub.market,
      properties: hub.properties,
      bookings: hub.bookings,
      hubs: 1,
    })
  }

  return [...byCode.values()].filter((row) => row.isoId)
}

/** Camera targets for spinning 3D country / region replicas. */
export const GLOBE_COUNTRY_FOCUS: Record<
  string,
  { lat: number; lng: number; altitude: number }
> = {
  UK: { lat: 54.5, lng: -2.8, altitude: 0.52 },
  IE: { lat: 53.4, lng: -7.8, altitude: 0.42 },
  FR: { lat: 46.6, lng: 2.5, altitude: 0.58 },
  ES: { lat: 40.2, lng: -3.7, altitude: 0.55 },
  NL: { lat: 52.2, lng: 5.3, altitude: 0.38 },
  DE: { lat: 51.2, lng: 10.4, altitude: 0.52 },
  IT: { lat: 42.8, lng: 12.6, altitude: 0.52 },
  PT: { lat: 39.4, lng: -8.2, altitude: 0.42 },
  US: { lat: 39.5, lng: -98.5, altitude: 1.05 },
}

export const GLOBE_REGION_COUNTRIES: Record<GlobeFocusId, string[] | "all"> = {
  world: "all",
  europe: ["UK", "IE", "FR", "ES", "NL", "DE", "IT", "PT"],
  us: ["US"],
  uk: ["UK"],
}

export function isGlobeReplicaFocus(focus: GlobeFocusId) {
  return focus !== "world"
}
