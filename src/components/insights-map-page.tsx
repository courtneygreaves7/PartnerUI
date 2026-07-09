import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  CalendarDays,
  FileText,
  Hash,
  Home,
  MapPin,
  PoundSterling,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActiveFilters } from "@/lib/chart-data"
import {
  darkenMetricFill,
  formatCompactCurrency,
  formatMapMetric,
  getAggregateDetailStats,
  getMetricValue,
  getRegionDetailStats,
  getTownsForCounty,
  loadMapRegions,
  MAP_METRICS,
  MAP_VIEWBOX,
  metricFill,
  metricRange,
  scaleRegionByTownShare,
  scaleRegionForFilters,
  type MapMetricId,
  type MapRegion,
  type RegionDetailStats,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"

const ALL_COUNTIES = "all-counties"
const ALL_TOWNS = "all-towns"

function BritishFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid meet"
      className={cn("aspect-[2/1] h-4 w-auto shrink-0", className)}
      aria-hidden
      focusable="false"
    >
      <clipPath id="uk-flag-clip">
        <rect width="60" height="30" rx="1.5" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0 L60 30" stroke="#C8102E" strokeWidth="2" transform="translate(0 1.2)" />
        <path d="M60 0 L0 30" stroke="#C8102E" strokeWidth="2" transform="translate(0 -1.2)" />
        <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

const MAP_MID_X = 400
const CALLOUT_BOX_W = 220
const CALLOUT_BOX_H = 148

/** Stepped callout into the white space left/right of the UK island. */
function MapRegionCallout({
  region,
  metric,
  metricLabel,
  brand,
}: {
  region: MapRegion
  metric: MapMetricId
  metricLabel: string
  brand: string
}) {
  const stats = getRegionDetailStats(region, brand)
  const value = formatMapMetric(getMetricValue(region, metric), metric)
  const cx = region.labelX
  const cy = region.labelY
  const side: "left" | "right" = cx < MAP_MID_X ? "left" : "right"

  const boxX = side === "left" ? 18 : 800 - 18 - CALLOUT_BOX_W
  const boxY = Math.min(Math.max(cy - CALLOUT_BOX_H / 2, 88), 1000 - CALLOUT_BOX_H - 28)
  const boxMidY = boxY + CALLOUT_BOX_H / 2
  const elbowX = side === "left" ? Math.max(cx - 48, boxX + CALLOUT_BOX_W + 18) : Math.min(cx + 48, boxX - 18)
  const joinX = side === "left" ? boxX + CALLOUT_BOX_W : boxX

  const linePath = [
    `M ${cx} ${cy}`,
    `L ${elbowX} ${cy}`,
    `L ${elbowX} ${boxMidY}`,
    `L ${joinX} ${boxMidY}`,
  ].join(" ")

  const detailRows = [
    { label: "Bookings", value: stats.bookings.toLocaleString("en-GB") },
    { label: "Revenue", value: formatCompactCurrency(stats.revenue) },
    { label: "CAL take-up", value: formatMapMetric(stats.calTakeUp, "calTakeUp") },
    { label: "Cancel rate", value: formatMapMetric(stats.cancellationRate, "cancellationRate") },
  ]

  return (
    <g className="pointer-events-none" aria-hidden>
      {/* Soft connector shadow */}
      <path
        d={linePath}
        fill="none"
        stroke="rgb(0 0 0 / 0.08)"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={linePath}
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Anchor on county */}
      <circle cx={cx} cy={cy} r="8" fill="rgb(0 107 255 / 0.16)" />
      <circle cx={cx} cy={cy} r="5.25" fill="#ffffff" stroke="#006BFF" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="2.4" fill="#006BFF" />

      {/* Join node at card edge */}
      <circle cx={joinX} cy={boxMidY} r="3.5" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />

      <g transform={`translate(${boxX} ${boxY})`}>
        <rect
          width={CALLOUT_BOX_W}
          height={CALLOUT_BOX_H}
          rx="14"
          fill="#ffffff"
          stroke="#d7e4f7"
          strokeWidth="1.25"
        />
        <rect x="0" y="0" width="4" height={CALLOUT_BOX_H} rx="2" fill="#006BFF" />

        <text x="16" y="22" fill="#5b6b85" fontSize="9" fontWeight="650" letterSpacing="0.14em">
          COUNTY
        </text>
        <text x="16" y="42" fill="#0f172a" fontSize="15" fontWeight="700">
          {region.name.length > 20 ? `${region.name.slice(0, 19)}…` : region.name}
        </text>
        <text x="16" y="58" fill="#64748b" fontSize="10.5">
          {region.code} · United Kingdom
        </text>

        <rect x="16" y="68" width={CALLOUT_BOX_W - 32} height="24" rx="7" fill="#eef5ff" />
        <text x="26" y="84" fill="#5b6b85" fontSize="10">
          {metricLabel}
        </text>
        <text
          x={CALLOUT_BOX_W - 26}
          y="84"
          fill="#006BFF"
          fontSize="12"
          fontWeight="700"
          textAnchor="end"
        >
          {value}
        </text>

        {detailRows.map((row, index) => {
          const col = index % 2
          const x = col === 0 ? 16 : 118
          const rowY = 108 + Math.floor(index / 2) * 18
          return (
            <g key={row.label}>
              <text x={x} y={rowY} fill="#94a3b8" fontSize="9">
                {row.label}
              </text>
              <text x={x} y={rowY + 12} fill="#0f172a" fontSize="11" fontWeight="650">
                {row.value}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}

type InsightsMapPageProps = {
  filters: ActiveFilters
  onBack: () => void
  onFilterRegion?: (regionId: string) => void
}

type StatRow = {
  label: string
  value: string
  sub?: string
  icon: typeof MapPin
}

function buildStatRows(
  stats: RegionDetailStats,
  placeLabel: string,
  options?: { includeCode?: boolean }
): StatRow[] {
  const rows: StatRow[] = [
    {
      label: placeLabel,
      value: stats.county,
      icon: MapPin,
    },
  ]

  if (options?.includeCode && stats.code) {
    rows.push({
      label: "County code",
      value: stats.code,
      icon: Hash,
    })
  }

  rows.push(
    {
      label: "Brands",
      value: stats.brands.toLocaleString("en-GB"),
      icon: Building2,
    },
    {
      label: "Properties",
      value: stats.properties.toLocaleString("en-GB"),
      icon: Home,
    },
    {
      label: "Bookings",
      value: stats.bookings.toLocaleString("en-GB"),
      icon: CalendarDays,
    },
    {
      label: "With CAL",
      value: stats.withCal.toLocaleString("en-GB"),
      sub: `${stats.withCalPct.toFixed(1)}%`,
      icon: ShieldCheck,
    },
    {
      label: "With DDL",
      value: stats.withDdl.toLocaleString("en-GB"),
      sub: `${stats.withDdlPct.toFixed(1)}%`,
      icon: FileText,
    },
    {
      label: "Revenue",
      value: formatCompactCurrency(stats.revenue),
      icon: PoundSterling,
    },
    {
      label: "ABV",
      value: formatMapMetric(stats.abv, "abv"),
      icon: TrendingUp,
    },
    {
      label: "CAL take-up",
      value: formatMapMetric(stats.calTakeUp, "calTakeUp"),
      icon: ShieldCheck,
    },
    {
      label: "Cancellation rate",
      value: formatMapMetric(stats.cancellationRate, "cancellationRate"),
      icon: Ban,
    }
  )

  return rows
}

function RegionStatsPanel({
  stats,
  isPlaceholder,
  placeLabel,
  includeCode,
  counties,
  towns,
  selectedCountyId,
  selectedTownId,
  onCountyChange,
  onTownChange,
  onOpenInsights,
}: {
  stats: RegionDetailStats
  isPlaceholder?: boolean
  placeLabel: string
  includeCode?: boolean
  counties: MapRegion[]
  towns: Array<{ id: string; name: string }>
  selectedCountyId: string
  selectedTownId: string
  onCountyChange: (countyId: string) => void
  onTownChange: (townId: string) => void
  onOpenInsights?: () => void
}) {
  const rows = buildStatRows(stats, placeLabel, { includeCode })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div>
          <h2 className="text-sm font-semibold">Area</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a county on the map, or choose one below.
          </p>
        </div>

        <Field>
          <Label htmlFor="map-county-filter">County</Label>
          <Select value={selectedCountyId} onValueChange={onCountyChange}>
            <SelectTrigger id="map-county-filter">
              <SelectValue placeholder="All counties" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value={ALL_COUNTIES}>All counties</SelectItem>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label htmlFor="map-town-filter">City / town</Label>
          <Select
            value={selectedTownId}
            onValueChange={onTownChange}
            disabled={selectedCountyId === ALL_COUNTIES}
          >
            <SelectTrigger id="map-town-filter">
              <SelectValue
                placeholder={
                  selectedCountyId === ALL_COUNTIES
                    ? "Select a county first"
                    : "All cities & towns"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value={ALL_TOWNS}>All cities & towns</SelectItem>
              {towns.map((town) => (
                <SelectItem key={town.id} value={town.id}>
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Metrics</h3>
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div
                key={row.label}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                  isPlaceholder
                    ? "border-dashed border-border bg-muted/50 text-muted-foreground"
                    : "border-border bg-muted text-foreground"
                )}
              >
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 text-left text-muted-foreground">{row.label}</span>
                <span className="shrink-0 text-right font-semibold tabular-nums text-foreground">
                  {row.value}
                  {row.sub ? (
                    <span className="ml-1.5 font-medium text-muted-foreground">{row.sub}</span>
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {!isPlaceholder && onOpenInsights ? (
        <div className="shrink-0 border-t border-border px-6 pb-6 pt-4">
          <Button className="w-full justify-between gap-2" onClick={onOpenInsights}>
            Open in insights
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function InsightsMapPage({ filters, onBack, onFilterRegion }: InsightsMapPageProps) {
  const [metric, setMetric] = useState<MapMetricId>("bookings")
  const [regions, setRegions] = useState<MapRegion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null)
  const [selectedCountyId, setSelectedCountyId] = useState(
    filters.county !== ALL_COUNTIES ? filters.county : ALL_COUNTIES
  )
  const [selectedTownId, setSelectedTownId] = useState(ALL_TOWNS)

  useEffect(() => {
    let cancelled = false
    loadMapRegions()
      .then((data) => {
        if (!cancelled) setRegions(data)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (filters.county !== ALL_COUNTIES) {
      setSelectedCountyId(filters.county)
      setSelectedTownId(ALL_TOWNS)
    }
  }, [filters.county])

  const scaledRegions = useMemo(
    () => regions.map((r) => scaleRegionForFilters(r, filters)),
    [regions, filters]
  )

  const sortedCounties = useMemo(
    () => [...scaledRegions].sort((a, b) => a.name.localeCompare(b.name)),
    [scaledRegions]
  )

  const selectedCounty =
    selectedCountyId === ALL_COUNTIES
      ? null
      : (scaledRegions.find((r) => r.id === selectedCountyId) ?? null)

  const hoveredCounty = hoveredCountyId
    ? (scaledRegions.find((r) => r.id === hoveredCountyId) ?? null)
    : null

  const towns = useMemo(
    () => (selectedCounty ? getTownsForCounty(selectedCounty) : []),
    [selectedCounty]
  )

  const selectedTown =
    selectedTownId === ALL_TOWNS
      ? null
      : (towns.find((town) => town.id === selectedTownId) ?? null)

  const activeRegion = useMemo(() => {
    if (!selectedCounty) return null
    if (selectedTown) {
      return scaleRegionByTownShare(selectedCounty, selectedTown.share)
    }
    return selectedCounty
  }, [selectedCounty, selectedTown])

  const range = useMemo(() => metricRange(scaledRegions, metric), [scaledRegions, metric])
  const metricLabel = MAP_METRICS.find((item) => item.id === metric)?.label.toLowerCase()

  const activeStats = useMemo(() => {
    if (!activeRegion) return null
    const stats = getRegionDetailStats(activeRegion, filters.brand)
    if (selectedTown) {
      return { ...stats, county: selectedTown.name, code: selectedCounty?.code ?? stats.code }
    }
    return stats
  }, [activeRegion, filters.brand, selectedTown, selectedCounty?.code])

  const overviewStats = useMemo(
    () => getAggregateDetailStats(scaledRegions, filters.brand),
    [scaledRegions, filters.brand]
  )

  function handleCountyChange(countyId: string) {
    setSelectedCountyId(countyId)
    setSelectedTownId(ALL_TOWNS)
    setHoveredCountyId(null)
  }

  function handleTownChange(townId: string) {
    setSelectedTownId(townId)
  }

  function handleRegionClick(regionId: string) {
    setSelectedCountyId((prev) => {
      if (prev === regionId) {
        setSelectedTownId(ALL_TOWNS)
        return ALL_COUNTIES
      }
      setSelectedTownId(ALL_TOWNS)
      return regionId
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2 h-8 gap-1.5 px-2" onClick={onBack}>
            <ArrowLeft className="size-3.5" />
            Back to insights
          </Button>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold tracking-tight">Map view</h1>
            <p className="text-xs text-muted-foreground">UK counties · shaded by performance</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted p-1.5">
          {MAP_METRICS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMetric(item.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                metric === item.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative min-h-0 bg-[#f4f7fb] dark:bg-muted/15">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/90 px-4 py-3 shadow-sm backdrop-blur-sm">
              <BritishFlag className="rounded-[2px] shadow-xs ring-1 ring-black/10" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  United Kingdom
                </p>
                <p className="text-sm text-muted-foreground">Shaded by {metricLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <div className="h-2 w-20 rounded-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary" />
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">
              Loading UK map…
            </div>
          ) : (
            <svg
              viewBox={MAP_VIEWBOX}
              className="relative z-0 h-full min-h-[320px] w-full touch-manipulation px-4 py-10"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="United Kingdom county performance map"
              onPointerLeave={() => setHoveredCountyId(null)}
            >
              {scaledRegions.map((region) => {
                const value = getMetricValue(region, metric)
                const isSelected = selectedCountyId === region.id
                const isHovered = hoveredCountyId === region.id
                const isDimmed = selectedCountyId !== ALL_COUNTIES && !isSelected
                const fill = isSelected
                  ? darkenMetricFill(value, range.min, range.max, "selected")
                  : isHovered
                    ? darkenMetricFill(value, range.min, range.max, "hover")
                    : metricFill(value, range.min, range.max)

                return (
                  <path
                    key={region.id}
                    d={region.path}
                    fill={fill}
                    stroke={isSelected ? "#0047b3" : isHovered ? "#0060e6" : "#ffffff"}
                    strokeWidth={isSelected ? 2.75 : isHovered ? 1.75 : 0.85}
                    strokeLinejoin="round"
                    opacity={isDimmed ? 0.28 : 1}
                    style={{ pointerEvents: "visiblePainted", cursor: "pointer" }}
                    onPointerEnter={() => setHoveredCountyId(region.id)}
                    onPointerMove={() => {
                      if (hoveredCountyId !== region.id) setHoveredCountyId(region.id)
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRegionClick(region.id)
                    }}
                  />
                )
              })}

              {hoveredCounty && metricLabel ? (
                <MapRegionCallout
                  region={hoveredCounty}
                  metric={metric}
                  metricLabel={metricLabel}
                  brand={filters.brand}
                />
              ) : null}
            </svg>
          )}
        </div>

        <aside className="relative flex min-h-0 flex-col">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />
          <RegionStatsPanel
            stats={activeStats ?? overviewStats}
            isPlaceholder={!activeStats}
            placeLabel={selectedTown ? "City / town" : "County"}
            includeCode={Boolean(activeStats?.code)}
            counties={sortedCounties}
            towns={towns}
            selectedCountyId={selectedCountyId}
            selectedTownId={selectedTownId}
            onCountyChange={handleCountyChange}
            onTownChange={handleTownChange}
            onOpenInsights={
              selectedCounty ? () => onFilterRegion?.(selectedCounty.id) : undefined
            }
          />
        </aside>
      </div>
    </div>
  )
}
