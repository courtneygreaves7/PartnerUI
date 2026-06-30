import { useEffect, useState } from "react"
import { Ban, Play, RefreshCw, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  onRun: (filters: ActiveFilters) => void
}

export function FilterSidebar({ filters, hasRun = true, onRun }: FilterSidebarProps) {
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
    <aside className="relative flex min-h-0 flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Refine metrics by partner, brand, and period, then update the report.
          </p>
        </div>

        <Field>
          <Label htmlFor="partner-filter">Partner</Label>
          <Select value={partner} onValueChange={handlePartnerChange}>
            <SelectTrigger id="partner-filter">
              <SelectValue placeholder="Select partner" />
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
            <Label htmlFor="brand-filter">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger id="brand-filter">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-brands">All brands</SelectItem>
                <SelectItem value="brand-a">Alpha</SelectItem>
                <SelectItem value="brand-b">Beta</SelectItem>
                <SelectItem value="brand-c">Gamma</SelectItem>
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
            {metricOptions.map(({ label, value, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={metric === value ? "default" : "outline"}
                className="w-full justify-start gap-2"
                onClick={() => setMetric(value)}
              >
                <Icon className="size-3.5 shrink-0" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <div className="relative px-6 pb-6">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />
          <div className="pt-4">
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
          </div>
        </div>
      </div>
    </aside>
  )
}
