import { useState } from "react"
import { ArrowLeftRight, Play } from "lucide-react"

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
import { cn } from "@/lib/utils"

export type ReportingPeriod = "day" | "week" | "month" | "quarter" | "ytd" | "custom"

export type ReportingFilters = {
  period: ReportingPeriod
  brandA: string
  brandB: string
  compareEnabled: boolean
}

export const DEFAULT_REPORTING_FILTERS: ReportingFilters = {
  period: "month",
  brandA: "brand-a",
  brandB: "brand-b",
  compareEnabled: true,
}

const periodOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
  { label: "YTD", value: "ytd" },
  { label: "Custom", value: "custom" },
] as const

const brandOptions = [
  { label: "Manor Cottages", value: "brand-a" },
  { label: "Lake Lovers", value: "brand-b" },
  { label: "Dream Cottages", value: "brand-c" },
] as const

type ReportingFilterSidebarProps = {
  filters: ReportingFilters
  hasRun?: boolean
  onRun: (filters: ReportingFilters) => void
}

export function ReportingFilterSidebar({
  filters,
  hasRun = false,
  onRun,
}: ReportingFilterSidebarProps) {
  const [period, setPeriod] = useState<ReportingPeriod>(filters.period)
  const [brandA, setBrandA] = useState(filters.brandA)
  const [brandB, setBrandB] = useState(filters.brandB)
  const [compareEnabled, setCompareEnabled] = useState(filters.compareEnabled)

  function handleRun() {
    onRun({ period, brandA, brandB, compareEnabled })
  }

  function swapBrands() {
    setBrandA(brandB)
    setBrandB(brandA)
  }

  return (
    <aside className="relative flex min-h-0 flex-col bg-[#e8f0fc] dark:bg-[#141b28]">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border" />

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <div>
          <h2 className="text-sm font-semibold">Report filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a period and brands, then run the report.
          </p>
        </div>

        <Field>
          <Label htmlFor="report-period">Period</Label>
          <Select value={period} onValueChange={(value) => setPeriod(value as ReportingPeriod)}>
            <SelectTrigger id="report-period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Compare brands</h2>
            <button
              type="button"
              onClick={() => setCompareEnabled((current) => !current)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                compareEnabled
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {compareEnabled ? "On" : "Off"}
            </button>
          </div>

          <Select value={brandA} onValueChange={setBrandA}>
            <SelectTrigger id="report-brand-a" aria-label="First brand">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map((brand) => (
                <SelectItem
                  key={brand.value}
                  value={brand.value}
                  disabled={compareEnabled && brand.value === brandB}
                >
                  {brand.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {compareEnabled ? (
            <>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={swapBrands}
                  aria-label="Swap brands"
                >
                  <ArrowLeftRight className="size-3.5" />
                </Button>
              </div>

              <Select value={brandB} onValueChange={setBrandB}>
                <SelectTrigger id="report-brand-b" aria-label="Second brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map((brand) => (
                    <SelectItem
                      key={brand.value}
                      value={brand.value}
                      disabled={brand.value === brandA}
                    >
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 space-y-4 border-t border-border px-6 pb-6 pt-4">
        <ReportFormWireframe />
        <Button className="w-full" onClick={handleRun} aria-label="Run report">
          <Play className="size-3.5" />
          {hasRun ? "Run report again" : "Run report"}
        </Button>
      </div>
    </aside>
  )
}

/** Decorative wireframe form preview for the filter bar footer. */
function ReportFormWireframe() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-xl border border-dashed border-border/80 bg-muted/20 p-3"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="h-1.5 w-16 rounded-full bg-primary/25" />
        <div className="h-4 w-8 rounded bg-primary/15" />
      </div>

      <div className="space-y-2 rounded-lg border border-border/70 bg-background/80 p-2.5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <div className="size-4 rounded-full border-2 border-primary/40" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="h-1.5 w-14 rounded-full bg-foreground/20" />
            <div className="h-1 w-20 rounded-full bg-foreground/10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-6 rounded-md border border-border/70 bg-muted/40" />
          <div className="h-6 rounded-md border border-border/70 bg-muted/40" />
        </div>

        <div className="space-y-1.5 pt-0.5">
          {[72, 56, 64, 48].map((width, index) => (
            <div key={index} className="space-y-1">
              <div
                className="h-1 rounded-full bg-foreground/15"
                style={{ width: `${width}%` }}
              />
              <div className="flex gap-1.5">
                <div className="h-4 flex-1 rounded border border-dashed border-border/80 bg-muted/30" />
                <div className="h-4 flex-1 rounded border border-dashed border-border/80 bg-muted/20" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-1 rounded-md border border-dashed border-primary/25 bg-primary/5 px-2 py-2">
          <div className="h-1 w-12 rounded-full bg-primary/30" />
          <div className="mt-1.5 h-1 w-full rounded-full bg-primary/15" />
          <div className="mt-1 h-1 w-2/3 rounded-full bg-primary/10" />
        </div>
      </div>
    </div>
  )
}
