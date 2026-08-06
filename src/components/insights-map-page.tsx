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
import { InsightsGlobe } from "@/components/insights-globe"
import { InsightsCountyDotHeatmap } from "@/components/insights-county-dot-heatmap"
import { InsightsUkCounties3d } from "@/components/insights-uk-counties-3d"
import { CountryFlag } from "@/components/country-flag"
import type { ActiveFilters } from "@/lib/chart-data"
import { buildGlobeCountryStats } from "@/lib/insights-globe-data"
import {
  formatCompactCurrency,
  formatMapMetric,
  formatMetricRank,
  getAggregateDetailStats,
  getRegionDetailStats,
  getTownsForCounty,
  loadMapRegions,
  MAP_COUNTRY_META,
  MAP_HEATMAP_METRICS,
  MAP_METRICS,
  metricHigherIsBetter,
  metricRange,
  metricRankBand,
  rankRegionByMetric,
  scaleRegionByTownShare,
  scaleRegionForFilters,
  type MapCountryCode,
  type MapHeatmapMetricId,
  type MapMetricId,
  type MapRegion,
  type RegionDetailStats,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"
import { mapStageGlass } from "@/lib/map-stage-glass"

const ALL_COUNTIES = "all-counties"

/** Country detail tabs — only portfolio countries that have a 3D region map. */
const DETAIL_COUNTRY_CODES = (Object.keys(MAP_COUNTRY_META) as MapCountryCode[]).filter((code) =>
  buildGlobeCountryStats().some((row) => row.code === code && row.properties > 0)
)
const ALL_TOWNS = "all-towns"

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
  metricId?: MapMetricId
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
      metricId: "bookings",
    },
    {
      label: "With Flexible Cancellation",
      value: stats.withCal.toLocaleString("en-GB"),
      sub: `${stats.withCalPct.toFixed(1)}%`,
      icon: ShieldCheck,
    },
    {
      label: "With Damage Deposit Waiver",
      value: stats.withDdl.toLocaleString("en-GB"),
      sub: `${stats.withDdlPct.toFixed(1)}%`,
      icon: FileText,
    },
    {
      label: "Revenue",
      value: formatCompactCurrency(stats.revenue),
      icon: PoundSterling,
      metricId: "gwp",
    },
    {
      label: "Average booking value (ABV)",
      value: formatMapMetric(stats.abv, "abv"),
      icon: TrendingUp,
      metricId: "abv",
    },
    {
      label: "Flexible Cancellation take-up",
      value: formatMapMetric(stats.calTakeUp, "calTakeUp"),
      icon: ShieldCheck,
      metricId: "calTakeUp",
    },
    {
      label: "Cancellation rate",
      value: formatMapMetric(stats.cancellationRate, "cancellationRate"),
      icon: Ban,
      metricId: "cancellationRate",
    },
    {
      label: "Re-let rate",
      value: formatMapMetric(stats.reletRate, "reletRate"),
      icon: TrendingUp,
      metricId: "reletRate",
    },
    {
      label: "Recovery rate",
      value: formatMapMetric(stats.recoveryRate, "recoveryRate"),
      icon: PoundSterling,
      metricId: "recoveryRate",
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
  const showRanks = !isPlaceholder && selectedCountyId !== ALL_COUNTIES

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
            const rank =
              showRanks && row.metricId
                ? rankRegionByMetric(counties, selectedCountyId, row.metricId)
                : null
            const band = rank ? metricRankBand(rank.rank, rank.total) : null
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
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-right font-semibold tabular-nums text-foreground">
                    {row.value}
                    {row.sub ? (
                      <span className="ml-1.5 font-medium text-muted-foreground">{row.sub}</span>
                    ) : null}
                  </span>
                  {rank ? (
                    <span
                      className={cn(
                        "text-[9px] font-medium tabular-nums tracking-wide",
                        band === "top" && "text-emerald-700 dark:text-emerald-300",
                        band === "mid" && "text-muted-foreground",
                        band === "lower" && "text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {formatMetricRank(rank.rank, rank.total)}
                    </span>
                  ) : null}
                </div>
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
  const [viewMode, setViewMode] = useState<"globe" | MapCountryCode>("globe")
  const [metric, setMetric] = useState<MapMetricId>("bookings")
  const [heatmapOn, setHeatmapOn] = useState(false)
  const [heatmapMetric, setHeatmapMetric] = useState<MapHeatmapMetricId>("calTakeUp")
  const [regions, setRegions] = useState<MapRegion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredCountyId, setHoveredCountyId] = useState<string | null>(null)
  const [selectedCountyId, setSelectedCountyId] = useState(
    filters.county !== ALL_COUNTIES ? filters.county : ALL_COUNTIES
  )
  const [selectedTownId, setSelectedTownId] = useState(ALL_TOWNS)

  const countryView = viewMode === "globe" ? null : viewMode
  const countryMeta = countryView ? MAP_COUNTRY_META[countryView] : null

  useEffect(() => {
    if (!countryView) {
      setRegions([])
      return
    }
    let cancelled = false
    setIsLoading(true)
    loadMapRegions(countryView)
      .then((data) => {
        if (!cancelled) setRegions(data)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [countryView])

  useEffect(() => {
    if (countryView) {
      setSelectedCountyId(ALL_COUNTIES)
      setSelectedTownId(ALL_TOWNS)
      setHoveredCountyId(null)
    }
  }, [countryView])

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

  const activeMapMetric: MapMetricId = heatmapOn ? heatmapMetric : metric
  const range = useMemo(
    () => metricRange(scaledRegions, activeMapMetric),
    [scaledRegions, activeMapMetric]
  )
  const metricLabel = heatmapOn
    ? (MAP_HEATMAP_METRICS.find((item) => item.id === heatmapMetric)?.label ?? heatmapMetric)
    : (MAP_METRICS.find((item) => item.id === metric)?.label.toLowerCase() ?? metric)

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

  function openCountryView(code: MapCountryCode) {
    setViewMode(code)
  }

  const countryTabs: Array<{ id: "globe" | MapCountryCode; label: string }> = [
    { id: "globe", label: "Globe" },
    ...DETAIL_COUNTRY_CODES.map((code) => ({
      id: code,
      label: MAP_COUNTRY_META[code].shortLabel,
    })),
  ]

  const regionPlaceLabel =
    selectedTown
      ? "City / town"
      : countryView === "FR"
        ? "Region"
        : countryView === "ES"
          ? "Community"
          : "County"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2 h-8 gap-1.5 px-2" onClick={onBack}>
            <ArrowLeft className="size-3.5" />
            Back to insights
          </Button>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold tracking-tight">Map view</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted p-1.5">
            {countryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  viewMode === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {countryView && !heatmapOn ? (
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted p-1.5">
              {MAP_METRICS.filter((item) => item.id !== "ddlTakeUp").map((item) => (
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
          ) : null}
        </div>
      </div>

      {viewMode === "globe" ? (
        <div className="relative min-h-0 flex-1 bg-[#0b1220] dark:bg-[#070b12]">
          <InsightsGlobe
            className="absolute inset-0 h-full min-h-[360px] w-full"
            onOpenUkDetail={() => openCountryView("UK")}
            onOpenCountry={(code) => {
              if (DETAIL_COUNTRY_CODES.includes(code as MapCountryCode)) {
                openCountryView(code as MapCountryCode)
              }
            }}
          />
        </div>
      ) : (
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div
          className={cn(
            "relative min-h-0",
            heatmapOn ? "bg-[#e8e6e1]" : "bg-[#061428]"
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4">
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3",
                heatmapOn ? mapStageGlass.panelOnLight : mapStageGlass.panelOnDark
              )}
            >
              <CountryFlag
                code={countryView!}
                className="size-5 shadow-xs"
              />
              <div>
                <p
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.16em]",
                    heatmapOn ? "text-muted-foreground" : "text-white/55"
                  )}
                >
                  {countryMeta?.label}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    heatmapOn ? "text-foreground" : "text-white"
                  )}
                >
                  {heatmapOn
                    ? `Dot heatmap · ${metricLabel}`
                    : `Terrain ${countryMeta?.regionNoun} · shaded by ${metricLabel}`}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl px-3 py-2.5",
                heatmapOn ? mapStageGlass.panelOnLight : mapStageGlass.panelOnDark
              )}
            >
              <span
                className={cn(
                  "text-[10px]",
                  heatmapOn ? "text-muted-foreground" : "text-white/55"
                )}
              >
                Low
              </span>
              {heatmapOn ? (
                <div
                  className={cn(
                    "h-2 w-20 rounded-full bg-gradient-to-r",
                    metricHigherIsBetter(heatmapMetric)
                      ? "from-[#dc2626] via-[#f59e0b] to-[#16a34a]"
                      : "from-[#16a34a] via-[#f59e0b] to-[#dc2626]"
                  )}
                />
              ) : (
                <div className="h-2 w-20 rounded-full bg-gradient-to-r from-[#d1db94] via-[#3d8a5c] to-[#0f613d]" />
              )}
              <span
                className={cn(
                  "text-[10px]",
                  heatmapOn ? "text-muted-foreground" : "text-white/55"
                )}
              >
                High
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-start p-4">
            <div
              className={cn(
                "pointer-events-auto max-w-[min(100%,44rem)] rounded-2xl p-2.5",
                heatmapOn ? mapStageGlass.panelOnLight : mapStageGlass.panelOnDark
              )}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      heatmapOn ? "text-foreground" : "text-white"
                    )}
                  >
                    Heatmap
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={heatmapOn}
                    aria-label="Toggle heatmap"
                    onClick={() => setHeatmapOn((prev) => !prev)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      heatmapOn
                        ? "bg-primary shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.2)]"
                        : "bg-white/20 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.25)]"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200",
                        heatmapOn && "translate-x-5"
                      )}
                    />
                  </button>
                </label>
                {heatmapOn ? (
                  <div
                    className={cn(
                      "flex flex-wrap gap-1 p-1",
                      mapStageGlass.insetOnLight
                    )}
                  >
                    {MAP_HEATMAP_METRICS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHeatmapMetric(item.id)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                          heatmapMetric === item.id
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="max-w-[14rem] text-xs text-white/60 sm:max-w-[18rem]">
                    Flexible Cancellation, Damage Deposit Waiver, cancellations &amp; re-lets
                  </p>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-muted-foreground">
              Loading {countryMeta?.label}…
            </div>
          ) : heatmapOn ? (
            <InsightsCountyDotHeatmap
              className="absolute inset-0"
              regions={scaledRegions}
              metric={activeMapMetric}
              range={range}
              selectedCountyId={selectedCountyId}
              hoveredCountyId={hoveredCountyId}
              onHover={setHoveredCountyId}
              onSelect={handleRegionClick}
            />
          ) : (
            <InsightsUkCounties3d
              className="absolute inset-0"
              country={countryView!}
              regions={scaledRegions}
              metric={activeMapMetric}
              range={range}
              selectedCountyId={selectedCountyId}
              hoveredCountyId={hoveredCountyId}
              onHover={setHoveredCountyId}
              onSelect={handleRegionClick}
            />
          )}

        </div>

        <aside className="relative flex min-h-0 flex-col">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />
          <RegionStatsPanel
            stats={activeStats ?? overviewStats}
            isPlaceholder={!activeStats}
            placeLabel={regionPlaceLabel}
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
      )}
    </div>
  )
}
