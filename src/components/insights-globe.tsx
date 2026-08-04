import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Globe, { type GlobeMethods } from "react-globe.gl"
import { feature } from "topojson-client"
import type { Feature, FeatureCollection, Geometry, Position } from "geojson"
import type { Topology } from "topojson-specification"

import {
  buildGlobeCountryStats,
  GLOBE_COUNTRY_FOCUS,
  GLOBE_FOCUS,
  GLOBE_REGION_COUNTRIES,
  summariseGlobeHubs,
  type GlobeCountryStats,
  type GlobeFocusId,
} from "@/lib/insights-globe-data"
import { cn } from "@/lib/utils"

type InsightsGlobeProps = {
  className?: string
  onOpenUkDetail?: () => void
  /** Open a country's detail map (e.g. UK counties). Replaces the old blue replica popup. */
  onOpenCountry?: (code: string) => void
}

type CountryFeature = Feature<Geometry, { stats: GlobeCountryStats }>

type GlobeStyleId = "classic" | "particles" | "relief" | "holo"

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
}[] = [
  { id: "classic", label: "Classic", hint: "Marble + UK / France / Spain glowing outlines" },
  { id: "particles", label: "Particles", hint: "Point-cloud of all landmasses" },
  { id: "relief", label: "Relief", hint: "Soft off-white globe · low extruded land" },
  { id: "holo", label: "Holo", hint: "Wireframe + glow borders" },
]

const PARTICLE_COLORS = ["#5ef0ff", "#b8ff4a", "#ffe566"] as const

const CDN = "//cdn.jsdelivr.net/npm/three-globe/example/img"

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

function walkCoords(geometry: Geometry, visit: (coord: Position) => void) {
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) for (const c of ring) visit(c)
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates)
      for (const ring of poly) for (const c of ring) visit(c)
  }
}

/** Deterministic-ish jitter from a number seed. */
function hashUnit(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function sampleLandParticles(geometries: Geometry[]) {
  const groups: { particles: { lat: number; lng: number; alt: number }[]; color: string; size: number }[] =
    PARTICLE_COLORS.map((color, index) => ({
      particles: [],
      color,
      size: index === 0 ? 0.7 : index === 1 ? 0.9 : 0.55,
    }))

  const vertSets = geometries.map((geometry) => {
    const verts: Position[] = []
    walkCoords(geometry, (c) => verts.push(c))
    return verts
  })
  const totalVerts = vertSets.reduce((sum, verts) => sum + verts.length, 0)
  if (!totalVerts) return []

  // Enough points to read continents without melting the GPU
  const TARGET = 7800

  vertSets.forEach((verts, featureIndex) => {
    if (verts.length < 3) return
    const share = verts.length / totalVerts
    const density = Math.max(4, Math.round(share * TARGET))

    for (let i = 0; i < density; i++) {
      const base = verts[Math.floor(hashUnit(featureIndex * 997 + i) * verts.length)]
      // Tight jitter so particles stay on land rather than drifting into ocean
      const jitter = 0.06 + hashUnit(featureIndex + i * 17) * 0.28
      const lat = base[1] + (hashUnit(i * 3.1 + featureIndex) - 0.5) * jitter
      const lng = base[0] + (hashUnit(i * 7.7 + featureIndex) - 0.5) * jitter
      const colorIndex = Math.floor(hashUnit(featureIndex * 13 + i) * 3)
      groups[colorIndex].particles.push({
        lat,
        lng,
        alt: 0.003 + hashUnit(i + featureIndex * 2) * 0.012,
      })
    }
  })

  return groups.filter((g) => g.particles.length > 0)
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
  color?: { set: (hex: string) => void }
  emissive?: { set: (hex: string) => void }
  emissiveIntensity?: number
  transparent?: boolean
  opacity?: number
  shininess?: number
}

function applyGlobeMaterialStyle(globe: GlobeMethods, style: GlobeStyleId) {
  try {
    // react-globe.gl exposes globeMaterial(); typings omit it
    const mat = (globe as GlobeMethods & { globeMaterial: () => GlobeMaterialLike }).globeMaterial()
    if (!mat) return
    if (style === "relief") {
      mat.color?.set("#efece6")
      mat.emissive?.set("#e8e4dc")
      mat.emissiveIntensity = 0.22
      mat.transparent = false
      mat.opacity = 1
      mat.shininess = 4
    } else if (style === "holo") {
      mat.color?.set("#0a0e16")
      mat.emissive?.set("#121826")
      mat.emissiveIntensity = 0.35
      mat.transparent = true
      mat.opacity = 0.55
      mat.shininess = 40
    } else if (style === "particles") {
      mat.color?.set("#05070c")
      mat.emissive?.set("#0a1018")
      mat.emissiveIntensity = 0.2
      mat.transparent = true
      mat.opacity = 0.92
      mat.shininess = 6
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
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(null)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [landGeometries, setLandGeometries] = useState<Geometry[]>([])
  const [outlineFeatures, setOutlineFeatures] = useState<OutlineFeature[]>([])
  const [ready, setReady] = useState(false)
  const [globeStyle, setGlobeStyle] = useState<GlobeStyleId>("classic")
  const [globeError, setGlobeError] = useState<string | null>(null)
  const [globeMountId, setGlobeMountId] = useState(0)

  const summary = useMemo(() => summariseGlobeHubs(), [])
  const primary = readCssColor("--primary", "#006BFF")
  const sage = readCssColor("--brand-accent", "#6F8F7A")

  const isDarkStage = globeStyle === "particles" || globeStyle === "holo"
  const isRelief = globeStyle === "relief"
  const isParticles = globeStyle === "particles"
  const isHolo = globeStyle === "holo"
  const isClassic = globeStyle === "classic"

  const visibleCountries = useMemo(() => {
    const region = GLOBE_REGION_COUNTRIES[focus]
    if (region === "all") return countries
    return countries.filter((item) => region.includes(item.properties.stats.code))
  }, [countries, focus])

  const countryOptions = useMemo(
    () => buildGlobeCountryStats().sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const particleSets = useMemo(
    () => (isParticles ? sampleLandParticles(landGeometries) : []),
    [isParticles, landGeometries]
  )

  const graticule = useMemo(() => (isHolo ? buildGraticule() : []), [isHolo])

  const glowOutlines = useMemo(
    () => buildUkFranceGlowOutlines(outlineFeatures),
    [outlineFeatures]
  )

  const pathsData = useMemo(() => {
    // Glowing coast outlines are for Classic (and Holo grid); Relief stays clean monochrome
    if (isRelief) return []
    if (isHolo) return [...graticule, ...glowOutlines]
    if (isParticles) return []
    return glowOutlines
  }, [glowOutlines, graticule, isHolo, isParticles, isRelief])

  const starSets = useMemo(() => (isHolo ? buildInteriorStars() : []), [isHolo])

  // Invisible hit polygons in classic — outlines carry the look
  const outlineOnlyVisual = isClassic
  // Keep near-invisible polygons in particles mode so hover/click still work
  const particlesOnlyVisual = isParticles

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
        const next = collection.features
          .filter((item) => byIso.has(String(item.id)))
          .map((item) => ({
            ...item,
            properties: {
              stats: byIso.get(String(item.id))!,
            },
          })) as CountryFeature[]
        const allLand = collection.features
          .map((item) => item.geometry)
          .filter((geom): geom is Geometry => Boolean(geom))
        if (!cancelled) {
          setCountries(next)
          setLandGeometries(allLand)
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
      controls.autoRotate = !hoveredCountry
      controls.autoRotateSpeed = 0.45
      controls.enableDamping = true
      controls.enableRotate = true
      controls.enableZoom = true
      controls.minDistance = 120
      controls.maxDistance = 500
    } catch {
      // Ignore during Strict Mode remount / WebGL teardown
    }
  }, [focus, ready, hoveredCountry])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !ready) return
    applyGlobeMaterialStyle(globe, globeStyle)
  }, [globeStyle, ready])

  // Reset readiness whenever the WebGL instance is torn down (Strict Mode / unmount)
  useEffect(() => {
    return () => {
      setReady(false)
    }
  }, [])

  const layerParticles = useMemo(
    () => [...particleSets, ...starSets],
    [particleSets, starSets]
  )

  function selectFocus(next: GlobeFocusId) {
    setFocus(next)
  }

  /** Open country detail map when available; otherwise fly the globe to that country. */
  function openCountry(code: string) {
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

  const activeHover = hoveredCountry
    ? {
        title: hoveredCountry.properties.stats.name,
        meta: `${hoveredCountry.properties.stats.hubs} hubs · ${hoveredCountry.properties.stats.market === "us" ? "United States" : "Europe"}`,
        detail: `${hoveredCountry.properties.stats.properties} properties · ${hoveredCountry.properties.stats.bookings.toLocaleString("en-GB")} bookings`,
        code: hoveredCountry.properties.stats.code,
      }
    : null

  const focusLabel = GLOBE_FOCUS[focus].label
  const styleHint = GLOBE_STYLES.find((s) => s.id === globeStyle)?.hint

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[360px] w-full overflow-hidden transition-colors duration-500",
        className,
        isDarkStage && "bg-[#05070c]",
        isRelief && "bg-[#f3f1ec]",
        isClassic && "bg-transparent"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
        <div
          className={cn(
            "rounded-xl border px-4 py-3 shadow-sm backdrop-blur-sm",
            isDarkStage
              ? "border-white/10 bg-black/55 text-white"
              : "border-border/50 bg-background/90"
          )}
        >
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.16em]",
              isDarkStage ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Global portfolio
          </p>
          <p className={cn("mt-1 text-sm", isDarkStage ? "text-white" : "text-foreground")}>
            {summary.properties.toLocaleString("en-GB")} properties · {focusLabel}
          </p>
          <p className={cn("mt-0.5 text-xs", isDarkStage ? "text-white/50" : "text-muted-foreground")}>
            {styleHint}
            {" · hover to lift · click a country for detail"}
          </p>
        </div>

        <div
          className={cn(
            "pointer-events-auto rounded-xl border p-1.5 shadow-sm backdrop-blur-sm",
            isDarkStage ? "border-white/10 bg-black/55" : "border-border/50 bg-background/90"
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
            {GLOBE_STYLES.map((style) => (
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
              isParticles ? "#5ef0ff" : isRelief ? "#d9d4cb" : isHolo ? "#e8eef8" : primary
            }
            atmosphereAltitude={isHolo ? 0.22 : isRelief ? 0.1 : 0.14}
            globeImageUrl={
              isClassic
                ? `${CDN}/earth-blue-marble.jpg`
                : isHolo
                  ? `${CDN}/earth-night.jpg`
                  : undefined
            }
            bumpImageUrl={
              isParticles || isRelief
                ? undefined
                : isClassic
                  ? `${CDN}/earth-topology.png`
                  : undefined
            }
            polygonsData={visibleCountries}
            polygonAltitude={(featureObj) => {
              const poly = featureObj as CountryFeature
              const props = poly.properties.stats.properties
              const raised =
                hoveredCountry?.properties.stats.code === poly.properties.stats.code

              if (outlineOnlyVisual) {
                return raised ? 0.012 : 0.002
              }
              if (particlesOnlyVisual) {
                return raised ? 0.02 : 0.004
              }
              if (isRelief) {
                // Sit close to the globe — soft relief, not floating shells
                const base = 0.008 + Math.min(0.016, props / 5200)
                return raised ? base + 0.014 : base
              }
              if (isHolo) {
                const base = 0.012
                return raised ? base + 0.04 : base
              }
              const base = 0.03 + Math.min(0.07, props / 4500)
              return raised ? base + 0.1 : base
            }}
            polygonCapColor={(featureObj) => {
              const poly = featureObj as CountryFeature
              const raised =
                hoveredCountry?.properties.stats.code === poly.properties.stats.code

              if (outlineOnlyVisual) {
                return raised ? withAlpha(primary, 0.18) : "rgba(0,0,0,0)"
              }
              if (particlesOnlyVisual) {
                return raised ? "rgba(94,240,255,0.12)" : "rgba(94,240,255,0.03)"
              }
              if (isRelief) {
                return raised ? "rgba(255,255,255,1)" : "rgba(252,250,246,0.98)"
              }
              if (isHolo) {
                return raised ? "rgba(220,230,245,0.55)" : "rgba(170,185,210,0.28)"
              }
              const color = poly.properties.stats.market === "us" ? sage : primary
              return withAlpha(color, raised ? 0.88 : 0.45)
            }}
            polygonSideColor={() => {
              if (outlineOnlyVisual) return "rgba(0,0,0,0)"
              if (particlesOnlyVisual) return "rgba(94,240,255,0.05)"
              if (isRelief) return "rgba(214,208,198,0.95)"
              if (isHolo) return "rgba(210,220,240,0.35)"
              return "rgba(0,0,0,0)"
            }}
            polygonStrokeColor={() => {
              if (outlineOnlyVisual) return "rgba(0,0,0,0)"
              if (particlesOnlyVisual) return "rgba(94,240,255,0.15)"
              if (isRelief) return "rgba(198,192,182,0.45)"
              if (isHolo) return "rgba(255,255,255,0.95)"
              return "rgba(0,0,0,0)"
            }}
            polygonsTransitionDuration={320}
            onPolygonHover={(featureObj) => {
              setHoveredCountry((featureObj as CountryFeature | null) ?? null)
            }}
            onPolygonClick={(featureObj) => {
              const poly = featureObj as CountryFeature | null
              if (!poly) return
              openCountry(poly.properties.stats.code)
            }}
            pathsData={pathsData}
            pathPoints="coords"
            pathPointLat={(p) => (p as [number, number])[0]}
            pathPointLng={(p) => (p as [number, number])[1]}
            pathPointAlt={0.012}
            pathColor={(d) => (d as GlowPath).color}
            pathStroke={(d) => (d as GlowPath).stroke}
            pathResolution={1.2}
            pathTransitionDuration={600}
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
              if (globe) applyGlobeMaterialStyle(globe, globeStyle)
            }}
            animateIn={false}
          />
        </GlobeErrorBoundary>
      ) : null}

      {activeHover ? (
        <div
          className={cn(
            "pointer-events-none absolute bottom-28 left-4 z-10 max-w-xs rounded-xl border px-4 py-3 shadow-md backdrop-blur-sm",
            isDarkStage
              ? "border-white/15 bg-black/70 text-white"
              : "border-border/60 bg-background/95"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.14em]",
              isDarkStage ? "text-white/50" : "text-muted-foreground"
            )}
          >
            {activeHover.meta}
          </p>
          <p className={cn("mt-1 text-sm font-semibold", isDarkStage ? "text-white" : "text-foreground")}>
            {activeHover.title}
          </p>
          <p className={cn("mt-1 text-xs", isDarkStage ? "text-white/55" : "text-muted-foreground")}>
            {activeHover.detail}
          </p>
          <p className={cn("mt-1.5 text-[10px]", isDarkStage ? "text-white/40" : "text-muted-foreground")}>
            {activeHover.code === "UK" || activeHover.code === "FR" || activeHover.code === "ES"
              ? "Click to open country map"
              : "Click to fly to country"}
          </p>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={cn(
              "flex flex-wrap gap-1.5 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm",
              isDarkStage ? "border-white/10 bg-black/55" : "border-border/50 bg-background/90"
            )}
          >
            {(Object.keys(GLOBE_FOCUS) as GlobeFocusId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => selectFocus(id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  focus === id
                    ? isDarkStage
                      ? "bg-white text-black shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : isDarkStage
                      ? "text-white/60 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {GLOBE_FOCUS[id].label}
              </button>
            ))}
          </div>

          {onOpenUkDetail ? (
            <button
              type="button"
              onClick={onOpenUkDetail}
              className={cn(
                "rounded-xl border px-3.5 py-2 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors",
                isDarkStage
                  ? "border-white/10 bg-black/55 text-white hover:border-white/30"
                  : "border-border/50 bg-background/90 text-foreground hover:border-primary/30 hover:text-primary"
              )}
            >
              UK county map →
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-wrap gap-1.5 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm",
            isDarkStage ? "border-white/10 bg-black/55" : "border-border/50 bg-background/90"
          )}
        >
          <span
            className={cn(
              "px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]",
              isDarkStage ? "text-white/45" : "text-muted-foreground"
            )}
          >
            Countries
          </span>
          {countryOptions.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => openCountry(country.code)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isDarkStage
                  ? "text-white/60 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
