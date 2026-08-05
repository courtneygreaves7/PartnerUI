import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Globe, { type GlobeMethods } from "react-globe.gl"
import { Globe2 } from "lucide-react"
import { Color } from "three"
import { feature } from "topojson-client"
import type { Feature, FeatureCollection, Geometry, Position } from "geojson"
import type { Topology } from "topojson-specification"

import { CountryFlag } from "@/components/country-flag"
import {
  buildGlobeCountryStats,
  GLOBE_COUNTRY_FOCUS,
  GLOBE_FOCUS,
  GLOBE_REGION_COUNTRIES,
  summariseGlobeHubs,
  type GlobeCountryStats,
  type GlobeFocusId,
} from "@/lib/insights-globe-data"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

type InsightsGlobeProps = {
  className?: string
  onOpenUkDetail?: () => void
  /** Open a country's detail map (e.g. UK counties). Replaces the old blue replica popup. */
  onOpenCountry?: (code: string) => void
}

type CountryFeature = Feature<
  Geometry,
  {
    /** True when this country has mock portfolio properties. */
    isPortfolio: boolean
    stats: GlobeCountryStats | null
  }
>

type GlobeStyleId = "classic" | "relief" | "holo"

class GlobeErrorBoundary extends Component<
  { children: ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message || "WebGL globe failed to render")
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

const GLOBE_STYLES: {
  id: GlobeStyleId
  label: string
  hint: string
  /** Hidden styles stay implemented but off the picker for now. */
  hidden?: boolean
}[] = [
  { id: "classic", label: "Realistic", hint: "Blue marble Earth · natural oceans and land" },
  { id: "relief", label: "Relief", hint: "White stage · plaster globe · soft land relief", hidden: true },
  { id: "holo", label: "Holo", hint: "Wireframe + glow borders", hidden: true },
]

const GLOBE_STYLE_OPTIONS = GLOBE_STYLES.filter((style) => !style.hidden)

const CDN = "//cdn.jsdelivr.net/npm/three-globe/example/img"

/** Soft plaster ocean — cream (not pure white) so any cap gaps stay subtle. */
const RELIEF_GLOBE_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="8"><rect width="16" height="8" fill="#dedcd7"/></svg>`
  )

/** Dark forest green for portfolio hover — reads clearly on plaster white. */
const HOVER_GREEN = "#1F5C3D"

/** Natural Earth numeric ids that break conic polygon caps (polar / antimeridian). */
const RELIEF_SKIP_ISO = new Set([
  "010", // Antarctica
])

function readCssColor(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return value || fallback
}

function withAlpha(hex: string, alpha: number) {
  const raw = hex.replace("#", "").trim()
  if (raw.length !== 6) return hex
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Deterministic-ish jitter from a number seed. */
function hashUnit(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildGraticule() {
  const paths: { coords: [number, number][]; color: string; stroke: number | null }[] = []
  for (let lat = -75; lat <= 75; lat += 15) {
    const coords: [number, number][] = []
    for (let lng = -180; lng <= 180; lng += 4) coords.push([lat, lng])
    paths.push({ coords, color: "rgba(255,255,255,0.18)", stroke: null })
  }
  for (let lng = -180; lng < 180; lng += 20) {
    const coords: [number, number][] = []
    for (let lat = -80; lat <= 80; lat += 4) coords.push([lat, lng])
    paths.push({ coords, color: "rgba(255,255,255,0.18)", stroke: null })
  }
  return paths
}

type GlowPath = {
  coords: [number, number][]
  color: string
  stroke: number | null
}

type OutlineFeature = Feature<Geometry, { code: string }>

function outerRings(geometry: Geometry): Position[][] {
  if (geometry.type === "Polygon") return [geometry.coordinates[0]]
  if (geometry.type === "MultiPolygon") return geometry.coordinates.map((poly) => poly[0])
  return []
}

function ringSpanDegrees(ring: Position[]) {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  return Math.hypot(maxLng - minLng, maxLat - minLat)
}

/** Soft glow + bright core — UK, France & Spain with matching finish. */
function buildUkFranceGlowOutlines(features: OutlineFeature[]): GlowPath[] {
  const paths: GlowPath[] = []
  const OUTLINE_CODES = new Set(["UK", "FR", "ES"])

  for (const feat of features) {
    if (!OUTLINE_CODES.has(feat.properties.code)) continue

    for (const ring of outerRings(feat.geometry)) {
      // Drop micro-islets that read as noise at globe distance
      if (ring.length < 10 || ringSpanDegrees(ring) < 0.12) continue

      // Preserve coastline detail; only thin extremely dense rings
      const step = ring.length > 520 ? 2 : 1
      const coords: [number, number][] = []
      for (let i = 0; i < ring.length; i += step) {
        const [lng, lat] = ring[i]
        coords.push([lat, lng])
      }
      if (coords.length < 4) continue
      const first = coords[0]
      const last = coords[coords.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1]])
      }

      // Matching halo + core for UK / France / Spain
      paths.push({
        coords,
        stroke: 1.05,
        color: "rgba(130, 215, 255, 0.28)",
      })
      paths.push({
        coords,
        stroke: 0.38,
        color: "rgba(220, 245, 255, 0.98)",
      })
    }
  }

  return paths
}

function buildInteriorStars(count = 520) {
  const particles: { lat: number; lng: number; alt: number }[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      lat: (hashUnit(i * 1.7) - 0.5) * 160,
      lng: (hashUnit(i * 3.3) - 0.5) * 360,
      alt: 0.04 + hashUnit(i * 5.1) * 0.42,
    })
  }
  return [{ particles, color: "rgba(255,255,255,0.75)", size: 0.35 }]
}

type GlobeMaterialLike = {
  color?: Color | null
  emissive?: { set: (hex: string) => void }
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  shininess?: number
  map?: unknown | null
  bumpMap?: unknown | null
  needsUpdate?: boolean
}

function applyGlobeMaterialStyle(globe: GlobeMethods, style: GlobeStyleId) {
  try {
    // react-globe.gl exposes globeMaterial(); typings omit it
    const mat = (globe as GlobeMethods & { globeMaterial: () => GlobeMaterialLike }).globeMaterial()
    if (!mat) return
    if (style === "relief") {
      mat.bumpMap = null
      // Solid plaster texture is set via RELIEF_GLOBE_IMAGE; keep colour white so it isn't tinted
      if (!mat.color) mat.color = new Color("#ffffff")
      else mat.color.set("#ffffff")
      mat.emissive?.set("#f2f0eb")
      mat.emissiveIntensity = 0.2
      mat.transparent = false
      mat.opacity = 1
      mat.shininess = 2
      mat.needsUpdate = true
    } else if (style === "holo") {
      if (!mat.color) mat.color = new Color("#0a0e16")
      else mat.color.set("#0a0e16")
      mat.emissive?.set("#121826")
      mat.emissiveIntensity = 0.35
      mat.transparent = true
      mat.opacity = 0.55
      mat.shininess = 40
    }
  } catch {
    // Globe may be mid-remount (React Strict Mode) — skip until ready again
  }
}

export function InsightsGlobe({ className, onOpenUkDetail, onOpenCountry }: InsightsGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 560 })
  const [focus, setFocus] = useState<GlobeFocusId>("world")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(null)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [otherCountries, setOtherCountries] = useState<CountryFeature[]>([])
  const [outlineFeatures, setOutlineFeatures] = useState<OutlineFeature[]>([])
  const [ready, setReady] = useState(false)
  const [globeStyle, setGlobeStyle] = useState<GlobeStyleId>("classic")
  const [globeError, setGlobeError] = useState<string | null>(null)
  const [globeMountId, setGlobeMountId] = useState(0)

  const summary = useMemo(() => summariseGlobeHubs(), [])
  const primary = readCssColor("--primary", "#006BFF")
  const sage = readCssColor("--brand-accent", "#6F8F7A")

  const isDarkStage = globeStyle === "holo"
  const isRelief = globeStyle === "relief"
  const isHolo = globeStyle === "holo"
  const isClassic = globeStyle === "classic"

  const visibleCountries = useMemo(() => {
    const region = GLOBE_REGION_COUNTRIES[focus]
    if (region === "all") return countries
    return countries.filter((item) => {
      const code = item.properties.stats?.code
      return code ? region.includes(code) : false
    })
  }, [countries, focus])

  /** Relief shows full world landmasses; portfolio countries stay white on top. */
  const polygonsData = useMemo(() => {
    if (isRelief) return [...otherCountries, ...countries]
    return visibleCountries
  }, [isRelief, otherCountries, countries, visibleCountries])

  const countryOptions = useMemo(
    () =>
      buildGlobeCountryStats()
        .filter((row) => row.properties > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const graticule = useMemo(() => (isHolo ? buildGraticule() : []), [isHolo])

  const glowOutlines = useMemo(
    () => buildUkFranceGlowOutlines(outlineFeatures),
    [outlineFeatures]
  )

  const pathsData = useMemo(() => {
    // Realistic marble stays clean — no glow outlines over the texture
    if (isClassic || isRelief) return []
    if (isHolo) return [...graticule, ...glowOutlines]
    return glowOutlines
  }, [glowOutlines, graticule, isHolo, isRelief, isClassic])

  const starSets = useMemo(() => (isHolo ? buildInteriorStars() : []), [isHolo])

  // Invisible hit polygons in classic — outlines carry the look
  const outlineOnlyVisual = isClassic

  useEffect(() => {
    let cancelled = false

    async function loadCountries() {
      try {
        const topo = (await fetch("/countries-110m.json").then((res) =>
          res.json()
        )) as Topology
        const collection = feature(
          topo,
          // world-atlas countries object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (topo.objects as any).countries
        ) as unknown as FeatureCollection
        const stats = buildGlobeCountryStats()
        const byIso = new Map(stats.map((row) => [row.isoId, row]))
        const portfolio: CountryFeature[] = []
        const others: CountryFeature[] = []

        for (const item of collection.features) {
          if (!item.geometry) continue
          const isoId = String(item.id)
          const row = byIso.get(isoId)
          if (row) {
            portfolio.push({
              ...item,
              properties: {
                isPortfolio: true,
                stats: row,
              },
            } as CountryFeature)
          } else {
            // Skip polar shells that tear white shards through the relief mesh
            if (RELIEF_SKIP_ISO.has(isoId)) continue
            others.push({
              ...item,
              properties: {
                isPortfolio: false,
                stats: null,
              },
            } as CountryFeature)
          }
        }

        if (!cancelled) {
          setCountries(portfolio)
          setOtherCountries(others)
        }
      } catch (error) {
        console.error("Failed to load country polygons:", error)
      }
    }

    async function loadOutlines() {
      try {
        const collection = (await fetch("/globe-glow-outlines.json").then((res) =>
          res.json()
        )) as FeatureCollection<Geometry, { code: string }>
        if (!cancelled) {
          setOutlineFeatures(collection.features as OutlineFeature[])
        }
      } catch (error) {
        console.error("Failed to load glow outlines:", error)
      }
    }

    void loadCountries()
    void loadOutlines()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      setSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(360, Math.floor(rect.height)),
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !ready) return

    try {
      const view = GLOBE_FOCUS[focus]
      globe.pointOfView(
        {
          lat: view.lat,
          lng: view.lng,
          altitude: view.altitude,
        },
        1100
      )

      const controls = globe.controls()
      controls.enableDamping = true
      controls.enableRotate = true
      controls.enableZoom = true
      controls.minDistance = 120
      controls.maxDistance = 500
      // Allow looking at both poles (default orbit clamps can hide them)
      controls.minPolarAngle = 0.05
      controls.maxPolarAngle = Math.PI - 0.05
      controls.autoRotateSpeed = 0.45
    } catch {
      // Ignore during Strict Mode remount / WebGL teardown
    }
  }, [focus, ready])

  // Pause spin on hover without resetting the camera
  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !ready) return
    try {
      globe.controls().autoRotate = !hoveredCountry
    } catch {
      // ignore mid-teardown
    }
  }, [hoveredCountry, ready])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !ready) return
    // Run after react-globe applies globeImageUrl (empty url otherwise forces black)
    const frame = requestAnimationFrame(() => {
      applyGlobeMaterialStyle(globe, globeStyle)
    })
    return () => cancelAnimationFrame(frame)
  }, [globeStyle, ready])

  // Reset readiness whenever the WebGL instance is torn down (Strict Mode / unmount)
  useEffect(() => {
    return () => {
      setReady(false)
    }
  }, [])

  const layerParticles = starSets

  function selectFocus(next: GlobeFocusId) {
    setFocus(next)
    setSelectedCountryCode(null)
  }

  /** Open country detail map when available; otherwise fly the globe to that country. */
  function openCountry(code: string) {
    setSelectedCountryCode(code)
    if (code === "UK" || code === "FR" || code === "ES") {
      if (onOpenCountry) {
        onOpenCountry(code)
        return
      }
      if (code === "UK" && onOpenUkDetail) {
        onOpenUkDetail()
        return
      }
    }

    const view = GLOBE_COUNTRY_FOCUS[code]
    const globe = globeRef.current
    if (view && globe) {
      try {
        globe.pointOfView(view, 1100)
      } catch {
        // ignore mid-teardown
      }
    }
    if (code === "US") setFocus("us")
    else if (code === "UK") setFocus("uk")
    else setFocus("europe")
  }

  const hoverStats = hoveredCountry?.properties.stats ?? null
  const focusLabel = GLOBE_FOCUS[focus].label
  const cardTitle = hoverStats?.name ?? "Global portfolio"
  const cardProperties = hoverStats?.properties ?? summary.properties
  const cardHubs = hoverStats?.hubs ?? summary.hubs
  const cardBookings = hoverStats?.bookings ?? summary.bookings
  const cardBadge = hoverStats
    ? hoverStats.market === "us"
      ? "United States"
      : "Europe"
    : focusLabel
  const cardHint = hoverStats
    ? hoverStats.code === "UK" || hoverStats.code === "FR" || hoverStats.code === "ES"
      ? "Click to open country map"
      : "Click to fly to country"
    : "Hover · click for detail"
  const cardSubline = hoverStats ? "properties in this market" : "properties across the book"

  const activeStyle = GLOBE_STYLES.find((s) => s.id === globeStyle)

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[360px] w-full overflow-hidden transition-colors duration-500",
        className,
        isDarkStage && "bg-[#05070c]",
        isRelief && "bg-[#f5f5f3]",
        isClassic && "bg-[#020812]"
      )}
    >
      {isClassic ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0b1a33_0%,_#020812_70%)]"
        />
      ) : null}
      {isRelief ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#ffffff_0%,_#f3f4f6_55%,_#eceef2_100%)]"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
        <div
          className={cn(
            "w-[min(100%,17.5rem)] overflow-hidden rounded-xl border shadow-xs backdrop-blur-sm transition-[box-shadow,border-color] duration-200",
            isDarkStage
              ? "border-white/12 bg-black/70 text-white"
              : "border-border bg-card/95 text-card-foreground",
            hoverStats &&
              (isDarkStage
                ? "border-white/25 shadow-md"
                : "border-primary/25 shadow-md")
          )}
        >
          <div className="flex items-center gap-2.5 px-4 pb-2 pt-4">
            {hoverStats ? (
              <CountryFlag
                code={hoverStats.code}
                className="size-9 shadow-xs"
              />
            ) : (
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl",
                  isDarkStage ? "bg-white/10 text-white" : "bg-muted text-foreground"
                )}
              >
                <Globe2 className="size-4" strokeWidth={2} />
              </span>
            )}
            <h3
              className={cn(
                "min-w-0 text-sm font-semibold",
                isDarkStage ? "text-white" : "text-foreground"
              )}
            >
              {cardTitle}
            </h3>
          </div>

          <div className="flex flex-col gap-2 px-4 pb-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p
                className={cn(
                  "font-bold tracking-tight tabular-nums",
                  FIGURE_24PX_CLASS,
                  isDarkStage ? "text-white" : "text-foreground"
                )}
              >
                {cardProperties.toLocaleString("en-GB")}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium",
                  isDarkStage ? "bg-white/10 text-white/70" : "text-muted-foreground"
                )}
              >
                {cardBadge}
              </span>
            </div>
            <p
              className={cn(
                "text-xs italic",
                isDarkStage ? "text-white/55" : "text-muted-foreground"
              )}
            >
              {cardSubline}
            </p>

            <div className="mt-1 grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "rounded-lg border px-2.5 py-2",
                  isDarkStage ? "border-white/10 bg-white/[0.04]" : "border-border/60 bg-muted/40"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wide",
                    isDarkStage ? "text-white/45" : "text-muted-foreground"
                  )}
                >
                  Hubs
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold tabular-nums",
                    isDarkStage ? "text-white" : "text-foreground"
                  )}
                >
                  {cardHubs}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-lg border px-2.5 py-2",
                  isDarkStage ? "border-white/10 bg-white/[0.04]" : "border-border/60 bg-muted/40"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wide",
                    isDarkStage ? "text-white/45" : "text-muted-foreground"
                  )}
                >
                  Bookings
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-semibold tabular-nums",
                    isDarkStage ? "text-white" : "text-foreground"
                  )}
                >
                  {cardBookings.toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-1 flex items-center justify-between gap-2 border-t pt-3 text-[10px]",
                isDarkStage
                  ? "border-white/10 text-white/45"
                  : "border-border/60 text-muted-foreground"
              )}
            >
              <span className="truncate font-medium">{activeStyle?.label ?? "Globe"}</span>
              <span className="shrink-0">{cardHint}</span>
            </div>
          </div>
        </div>

        {GLOBE_STYLE_OPTIONS.length > 1 ? (
          <div
            className={cn(
              "pointer-events-auto rounded-xl border p-1.5 shadow-xs backdrop-blur-sm",
              isDarkStage ? "border-white/10 bg-black/55" : "border-border bg-card/95"
            )}
          >
            <p
              className={cn(
                "px-2 pb-1 pt-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
                isDarkStage ? "text-white/45" : "text-muted-foreground"
              )}
            >
              Globe style
            </p>
            <div className="flex flex-wrap gap-1">
              {GLOBE_STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setGlobeStyle(style.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    globeStyle === style.id
                      ? isDarkStage
                        ? "bg-white text-black shadow-sm"
                        : "bg-primary text-primary-foreground shadow-sm"
                      : isDarkStage
                        ? "text-white/60 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {globeError ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0b1220] p-6 text-center">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-medium text-white">Globe could not start</p>
            <p className="text-xs text-white/60">{globeError}</p>
            <button
              type="button"
              onClick={() => {
                setGlobeError(null)
                setReady(false)
                setGlobeMountId((id) => id + 1)
              }}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black"
            >
              Try again
            </button>
            {onOpenUkDetail ? (
              <button
                type="button"
                onClick={onOpenUkDetail}
                className="ml-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80"
              >
                Open UK map instead
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!globeError ? (
        <GlobeErrorBoundary
          key={globeMountId}
          onError={(message) => setGlobeError(message)}
        >
          <Globe
            ref={globeRef}
            width={Math.max(1, size.width)}
            height={Math.max(1, size.height)}
            backgroundColor="rgba(0,0,0,0)"
            showGlobe
            showAtmosphere
            atmosphereColor={
              isClassic ? "#6ea8d8" : isRelief ? "#c9d0da" : isHolo ? "#e8eef8" : primary
            }
            atmosphereAltitude={isHolo ? 0.22 : isClassic ? 0.16 : isRelief ? 0.12 : 0.14}
            globeImageUrl={
              isClassic
                ? `${CDN}/earth-blue-marble.jpg`
                : isHolo
                  ? `${CDN}/earth-night.jpg`
                  : isRelief
                    ? RELIEF_GLOBE_IMAGE
                    : undefined
            }
            bumpImageUrl={
              isRelief
                ? undefined
                : isClassic
                  ? `${CDN}/earth-topology.png`
                  : undefined
            }
            polygonsData={polygonsData}
            polygonCapCurvatureResolution={isRelief ? 2 : 5}
            polygonAltitude={(featureObj) => {
              const poly = featureObj as CountryFeature
              const isPortfolio = poly.properties.isPortfolio
              const props = poly.properties.stats?.properties ?? 0
              const raised =
                isPortfolio &&
                hoveredCountry?.properties.stats?.code === poly.properties.stats?.code

              // Classic: flat invisible hit targets — no altitude pop (avoids hover flicker)
              if (outlineOnlyVisual) {
                return 0.0015
              }
              if (isRelief) {
                if (!isPortfolio) {
                  // Slightly higher than sphere so grey caps seal over curvature gaps
                  return 0.007
                }
                // Sit close to the globe — soft relief, not floating shells
                const base = 0.01 + Math.min(0.014, props / 5200)
                return raised ? base + 0.008 : base
              }
              if (isHolo) {
                const base = 0.012
                return raised ? base + 0.025 : base
              }
              const base = 0.03 + Math.min(0.07, props / 4500)
              return raised ? base + 0.06 : base
            }}
            polygonCapColor={(featureObj) => {
              const poly = featureObj as CountryFeature
              const isPortfolio = poly.properties.isPortfolio
              const raised =
                isPortfolio &&
                hoveredCountry?.properties.stats?.code === poly.properties.stats?.code

              if (outlineOnlyVisual) {
                // Soft green wash on marble — hover only, so the texture stays readable
                return raised ? withAlpha(HOVER_GREEN, 0.38) : "rgba(0,0,0,0)"
              }
              if (isRelief) {
                if (!isPortfolio) {
                  return "rgba(198,198,194,1)"
                }
                // Portfolio hover — dark green so the country reads clearly on plaster
                return raised ? withAlpha(HOVER_GREEN, 0.94) : "rgba(252,250,246,0.98)"
              }
              if (isHolo) {
                return raised ? "rgba(220,230,245,0.55)" : "rgba(170,185,210,0.28)"
              }
              const color = poly.properties.stats?.market === "us" ? sage : primary
              return withAlpha(color, raised ? 0.88 : 0.45)
            }}
            polygonSideColor={(featureObj) => {
              const poly = featureObj as CountryFeature
              const raised =
                poly.properties.isPortfolio &&
                hoveredCountry?.properties.stats?.code === poly.properties.stats?.code
              if (outlineOnlyVisual) return "rgba(0,0,0,0)"
              if (isRelief) {
                // Hide context sides — conic walls cause bright spike artifacts on large lands
                if (!poly.properties.isPortfolio) return "rgba(0,0,0,0)"
                return raised ? withAlpha(HOVER_GREEN, 0.82) : "rgba(214,208,198,0.95)"
              }
              if (isHolo) return "rgba(210,220,240,0.35)"
              return "rgba(0,0,0,0)"
            }}
            polygonStrokeColor={(featureObj) => {
              const poly = featureObj as CountryFeature
              const raised =
                poly.properties.isPortfolio &&
                hoveredCountry?.properties.stats?.code === poly.properties.stats?.code
              if (outlineOnlyVisual) return "rgba(0,0,0,0)"
              if (isRelief) {
                if (!poly.properties.isPortfolio) return "rgba(160,160,156,0.25)"
                return raised ? withAlpha(HOVER_GREEN, 0.65) : "rgba(198,192,182,0.45)"
              }
              if (isHolo) return "rgba(255,255,255,0.95)"
              return "rgba(0,0,0,0)"
            }}
            polygonsTransitionDuration={outlineOnlyVisual ? 0 : 180}
            onPolygonHover={(featureObj) => {
              const next = (featureObj as CountryFeature | null) ?? null
              const usable = next?.properties.isPortfolio ? next : null
              setHoveredCountry((prev) => {
                const prevCode = prev?.properties.stats?.code
                const nextCode = usable?.properties.stats?.code
                if (prevCode === nextCode) return prev
                return usable
              })
            }}
            onPolygonClick={(featureObj) => {
              const poly = featureObj as CountryFeature | null
              const code = poly?.properties.stats?.code
              if (!code) return
              openCountry(code)
            }}
            pathsData={pathsData}
            pathPoints="coords"
            pathPointLat={(p) => (p as [number, number])[0]}
            pathPointLng={(p) => (p as [number, number])[1]}
            pathPointAlt={0.008}
            pathColor={(d) => (d as GlowPath).color}
            pathStroke={(d) => (d as GlowPath).stroke}
            pathResolution={1.2}
            pathTransitionDuration={0}
            particlesData={layerParticles}
            particlesList="particles"
            particlesColor={(d) => (d as { color?: string }).color ?? "#ffffff"}
            particlesSize={(d) => (d as { size?: number }).size ?? 0.5}
            particlesSizeAttenuation
            particleLat="lat"
            particleLng="lng"
            particleAltitude="alt"
            onGlobeReady={() => {
              setReady(true)
              setGlobeError(null)
              const globe = globeRef.current
              if (!globe) return
              applyGlobeMaterialStyle(globe, globeStyle)
              try {
                const controls = globe.controls()
                controls.autoRotate = true
                controls.autoRotateSpeed = 0.45
                controls.minPolarAngle = 0.05
                controls.maxPolarAngle = Math.PI - 0.05
              } catch {
                // ignore
              }
            }}
            animateIn={false}
          />
        </GlobeErrorBoundary>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-end gap-2 p-4">
        <div className="flex max-w-[min(100%,36rem)] flex-col items-end gap-1.5">
          <span
            className={cn(
              "px-1 text-[10px] font-medium uppercase tracking-[0.14em]",
              isDarkStage ? "text-white/45" : "text-muted-foreground"
            )}
          >
            Countries
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            <button
              type="button"
              onClick={() => selectFocus("world")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors",
                focus === "world"
                  ? isDarkStage
                    ? "border-white bg-white text-black"
                    : "border-primary bg-primary text-primary-foreground"
                  : isDarkStage
                    ? "border-white/12 bg-black/55 text-white/80 hover:border-white/30 hover:bg-black/70 hover:text-white"
                    : "border-border/60 bg-background/95 text-foreground hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary"
              )}
            >
              <Globe2 className="size-3.5 shrink-0" strokeWidth={2} />
              <span>World</span>
            </button>
            {countryOptions.map((country) => {
              const isActive = selectedCountryCode === country.code
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => openCountry(country.code)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors",
                    isActive
                      ? isDarkStage
                        ? "border-white bg-white text-black"
                        : "border-primary bg-primary text-primary-foreground"
                      : isDarkStage
                        ? "border-white/12 bg-black/55 text-white/80 hover:border-white/30 hover:bg-black/70 hover:text-white"
                        : "border-border/60 bg-background/95 text-foreground hover:border-primary/35 hover:bg-primary/[0.06] hover:text-primary"
                  )}
                >
                  <CountryFlag code={country.code} />
                  <span>{country.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
