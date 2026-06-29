import { useEffect, useState } from "react"
import { Ban, Play, RefreshCw, TrendingUp } from "lucide-react"

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

type DashboardFilterBarProps = {
  filters: ActiveFilters
  hasRun?: boolean
  onRun: (filters: ActiveFilters) => void
}

export function DashboardFilterBar({ filters, hasRun = false, onRun }: DashboardFilterBarProps) {
  const [partner, setPartner] = useState(filters.partner)
  const [brand, setBrand] = useState(filters.brand)
  const [dateRange, setDateRange] = useState(filters.dateRange)
  const [year, setYear] = useState(filters.year)
  const [month, setMonth] = useState(filters.month)
  const [metric, setMetric] = useState(filters.metric)

  const showBrand = partner !== "all-partners"

  useEffect(() => {
    setPartner(filters.partner)
    setBrand(filters.brand)
    setDateRange(filters.dateRange)
    setYear(filters.year)
    setMonth(filters.month)
    setMetric(filters.metric)
  }, [filters])

  function handlePartnerChange(value: string) {
    setPartner(value)
    if (value === "all-partners") {
      setBrand("all-brands")
    }
  }

  function handleRun() {
    onRun({
      partner,
      brand: partner === "all-partners" ? "all-brands" : brand,
      dateRange,
      year,
      month,
      metric,
      sortBy: filters.sortBy,
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="shrink-0 border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold">Filters</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Refine metrics by partner, brand, and period, then update the report.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Field>
          <Label htmlFor="dash-partner" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Partner
          </Label>
          <Select value={partner} onValueChange={handlePartnerChange}>
            <SelectTrigger id="dash-partner" className="h-9 w-full">
              <SelectValue placeholder="Partner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-partners">All partners</SelectItem>
              <SelectItem value="partner-a">Partner Alpha</SelectItem>
              <SelectItem value="partner-b">Partner Beta</SelectItem>
              <SelectItem value="partner-c">Partner Gamma</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {showBrand ? (
        <Field>
          <Label htmlFor="dash-brand" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Brand
          </Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger id="dash-brand" className="h-9 w-full">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-brands">All brands</SelectItem>
              <SelectItem value="brand-a">Brand Alpha</SelectItem>
              <SelectItem value="brand-b">Brand Beta</SelectItem>
              <SelectItem value="brand-c">Brand Gamma</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        ) : null}

        <Field>
          <Label htmlFor="dash-date-range" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Date range
          </Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="dash-date-range" className="h-9 w-full">
              <SelectValue placeholder="Date range" />
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
            <Label htmlFor="dash-year" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="dash-year" className="h-9 w-full">
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
            <Label htmlFor="dash-month" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Month
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="dash-month" className="h-9 w-full">
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

        <Field>
          <Label htmlFor="dash-metric" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Metric
          </Label>
          <Select value={metric} onValueChange={(value) => setMetric(value as ActiveFilters["metric"])}>
            <SelectTrigger id="dash-metric" className="h-9 w-full">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">
                <span className="flex items-center gap-2">
                  <TrendingUp className="size-3.5" />
                  Sales
                </span>
              </SelectItem>
              <SelectItem value="cancellations">
                <span className="flex items-center gap-2">
                  <Ban className="size-3.5" />
                  Cancellations
                </span>
              </SelectItem>
              <SelectItem value="re-lets">
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-3.5" />
                  Re-lets
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="shrink-0 border-t border-border px-4 py-4">
        <Button
          className="h-9 w-full"
          onClick={handleRun}
          aria-label={hasRun ? "Update report with selected filters" : "Generate report from selected filters"}
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
      </div>
    </div>
  )
}
