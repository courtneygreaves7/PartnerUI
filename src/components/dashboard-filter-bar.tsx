import { useEffect, useState } from "react"
import { Ban, RefreshCw, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  onRun: (filters: ActiveFilters) => void
}

export function DashboardFilterBar({ filters, onRun }: DashboardFilterBarProps) {
  const [partner, setPartner] = useState(filters.partner)
  const [brand, setBrand] = useState(filters.brand)
  const [dateRange, setDateRange] = useState(filters.dateRange)
  const [year, setYear] = useState(filters.year)
  const [month, setMonth] = useState(filters.month)
  const [metric, setMetric] = useState(filters.metric)
  const [sortBy, setSortBy] = useState(filters.sortBy)

  useEffect(() => {
    setPartner(filters.partner)
    setBrand(filters.brand)
    setDateRange(filters.dateRange)
    setYear(filters.year)
    setMonth(filters.month)
    setMetric(filters.metric)
    setSortBy(filters.sortBy)
  }, [filters])

  function handleRun() {
    onRun({ partner, brand, dateRange, year, month, metric, sortBy })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dash-partner" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Partner
          </Label>
          <Select value={partner} onValueChange={setPartner}>
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
        </div>

        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dash-sort" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sort by
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="dash-sort" className="h-9 w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue-desc">Revenue (high to low)</SelectItem>
              <SelectItem value="revenue-asc">Revenue (low to high)</SelectItem>
              <SelectItem value="partner-name">Partner name</SelectItem>
              <SelectItem value="date-desc">Date (newest first)</SelectItem>
              <SelectItem value="date-asc">Date (oldest first)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <Button className="h-9 w-full" onClick={handleRun}>
            Run
          </Button>
        </div>
      </div>
    </div>
  )
}
