import { useEffect, useState } from "react"
import { Ban, Check, Download, Play, RefreshCw, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActiveFilters } from "@/lib/chart-data"
import { downloadInsightsPitchDeck } from "@/lib/insights-pitch-deck"
import { loadMapRegions, type MapRegion } from "@/lib/insights-map-data"
import { PARTNER_BRANDING } from "@/lib/partner-branding"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const metricOptions = [
  { label: "Sales", value: "sales", icon: TrendingUp },
  { label: "Cancellations", value: "cancellations", icon: Ban },
  { label: "Re-lets", value: "re-lets", icon: RefreshCw },
] as const

type FilterSidebarProps = {
  filters: ActiveFilters
  hasRun?: boolean
  showCounty?: boolean
  onRun: (filters: ActiveFilters) => void
}

export function FilterSidebar({ filters, hasRun = true, showCounty = false, onRun }: FilterSidebarProps) {
  const [brand, setBrand] = useState(filters.brand)
  const [county, setCounty] = useState(filters.county)
  const [dateRange, setDateRange] = useState(filters.dateRange)
  const [year, setYear] = useState(filters.year)
  const [month, setMonth] = useState(filters.month)
  const [metric, setMetric] = useState(filters.metric)
  const [isDownloading, setIsDownloading] = useState(false)
  const [counties, setCounties] = useState<MapRegion[]>([])

  const showBrand = true

  useEffect(() => {
    setBrand(filters.brand)
    setCounty(filters.county)
    setDateRange(filters.dateRange)
    setYear(filters.year)
    setMonth(filters.month)
    setMetric(filters.metric)
  }, [filters])

  useEffect(() => {
    if (!showCounty) return
    loadMapRegions()
      .then((data) => setCounties([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setCounties([]))
  }, [showCounty])

  function currentFilters(): ActiveFilters {
    return {
      partner: PARTNER_BRANDING.partnerId,
      brand,
      county,
      dateRange,
      year,
      month,
      metric,
      sortBy: filters.sortBy,
    }
  }

  function handleRun() {
    onRun(currentFilters())
  }

  async function handleDownload() {
    setIsDownloading(true)
    try {
      await downloadInsightsPitchDeck(currentFilters())
    } catch (error) {
      console.error("Failed to download insights report:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <aside className="relative flex min-h-0 flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Refine metrics by brand and period, then update the report.
          </p>
        </div>

        {showBrand ? (
          <Field>
            <Label htmlFor="brand-filter">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger id="brand-filter">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-brands">All brands</SelectItem>
                <SelectItem value="brand-a">Manor Cottages</SelectItem>
                <SelectItem value="brand-b">Lake Lovers</SelectItem>
                <SelectItem value="brand-c">Dream Cottages</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {showCounty ? (
          <Field>
            <Label htmlFor="county-filter">County</Label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger id="county-filter">
                <SelectValue placeholder="All counties" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all-counties">All counties</SelectItem>
                {counties.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        <Field>
          <Label htmlFor="date-range-filter">Date range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="date-range-filter">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar-month">Calendar month</SelectItem>
              <SelectItem value="year-to-month-end">Year to month-end</SelectItem>
              <SelectItem value="custom-range">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="year-filter">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year-filter">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="month-filter">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month-filter">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName) => (
                  <SelectItem key={monthName} value={monthName}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Metrics</h2>
          <div className="flex flex-col gap-2">
            {metricOptions.map(({ label, value, icon: Icon }) => {
              const isActive = metric === value
              return (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive
                      ? "border-foreground/40 bg-background text-foreground hover:bg-background hover:text-foreground"
                      : "border-border bg-muted text-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setMetric(value)}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="flex-1 text-left">{label}</span>
                  {isActive ? <Check className="size-3.5 shrink-0" /> : null}
                </Button>
              )
            })}
          </div>
        </div>

      </div>

      <div className="shrink-0 space-y-2 border-t border-border px-6 pb-6 pt-4">
        <Button
          className="w-full"
          onClick={handleRun}
          aria-label={
            hasRun
              ? "Update report with selected filters"
              : "Generate report from selected filters"
          }
        >
          {hasRun ? (
            <>
              <RefreshCw className="size-3.5" />
              Update report
            </>
          ) : (
            <>
              <Play className="size-3.5" />
              Generate report
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download insights report as PowerPoint"
        >
          <Download className="size-3.5" />
          {isDownloading ? "Preparing download…" : "Download report"}
        </Button>
      </div>
    </aside>
  )
}
