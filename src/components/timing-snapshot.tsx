import { useState } from "react"
import { LayoutList } from "lucide-react"

import { ReportSection } from "@/components/report-section"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { MetricBenchmarkWidget, getBenchmarkPercent } from "@/components/widgets/metric-benchmark-widget"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { metricCardGridClass } from "@/lib/card-layout"
import { scaleDaysString } from "@/lib/brand-metrics"
import { type ActiveFilters, getTimingProfile } from "@/lib/chart-data"
import {
  INSIGHTS_WIDGET_HELP_TEXT,
} from "@/lib/insights-widget-labels"
import { cn } from "@/lib/utils"

const BASE_TIMING_ROWS = [
  { brand: "Partner Alpha",       ccy: "GBP", color: "bg-muted-foreground"   },
  { brand: "Partner Beta",        ccy: "GBP", color: "bg-muted-foreground/70"   },
  { brand: "Partner Gamma (DK)",  ccy: "EUR", color: "bg-muted-foreground/50"  },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-muted-foreground/40" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-muted-foreground/30"   },
  { brand: "Partner Epsilon",     ccy: "GBP", color: "bg-muted-foreground/20"   },
  { brand: "Partner Zeta (DK)",   ccy: "EUR", color: "bg-muted-foreground/15"   },
  { brand: "Partner Zeta (EUR)",  ccy: "EUR", color: "bg-muted-foreground/10" },
]

const TIMING_ROW_DATA: Record<string, Array<{ avgLead: string; calAvgLead: string }>> = {
  "all-partners:all-brands": [
    { avgLead: "92.4 days",  calAvgLead: "118.7 days" },
    { avgLead: "86.1 days",  calAvgLead: "—"          },
    { avgLead: "101.3 days", calAvgLead: "142.0 days" },
    { avgLead: "115.6 days", calAvgLead: "—"          },
    { avgLead: "128.4 days", calAvgLead: "—"          },
    { avgLead: "134.2 days", calAvgLead: "—"          },
    { avgLead: "109.8 days", calAvgLead: "138.5 days" },
    { avgLead: "97.3 days",  calAvgLead: "124.9 days" },
  ],
  "partner-a:all-brands": [
    { avgLead: "85.2 days",  calAvgLead: "108.4 days" },
    { avgLead: "79.8 days",  calAvgLead: "—"          },
    { avgLead: "94.6 days",  calAvgLead: "132.1 days" },
    { avgLead: "108.3 days", calAvgLead: "—"          },
    { avgLead: "121.0 days", calAvgLead: "—"          },
    { avgLead: "127.5 days", calAvgLead: "—"          },
    { avgLead: "102.4 days", calAvgLead: "129.3 days" },
    { avgLead: "90.1 days",  calAvgLead: "116.7 days" },
  ],
  "partner-b:all-brands": [
    { avgLead: "98.7 days",  calAvgLead: "126.2 days" },
    { avgLead: "92.4 days",  calAvgLead: "—"          },
    { avgLead: "108.5 days", calAvgLead: "151.4 days" },
    { avgLead: "122.9 days", calAvgLead: "—"          },
    { avgLead: "136.1 days", calAvgLead: "—"          },
    { avgLead: "142.0 days", calAvgLead: "—"          },
    { avgLead: "117.3 days", calAvgLead: "147.8 days" },
    { avgLead: "103.8 days", calAvgLead: "133.1 days" },
  ],
  "partner-c:all-brands": [
    { avgLead: "89.0 days",  calAvgLead: "113.5 days" },
    { avgLead: "83.6 days",  calAvgLead: "—"          },
    { avgLead: "97.8 days",  calAvgLead: "137.2 days" },
    { avgLead: "111.4 days", calAvgLead: "—"          },
    { avgLead: "124.6 days", calAvgLead: "—"          },
    { avgLead: "130.9 days", calAvgLead: "—"          },
    { avgLead: "106.1 days", calAvgLead: "133.8 days" },
    { avgLead: "93.7 days",  calAvgLead: "120.4 days" },
  ],
}

function getTimingRows(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const rowData = TIMING_ROW_DATA[baselineKey] ?? TIMING_ROW_DATA["all-partners:all-brands"]
  return BASE_TIMING_ROWS.map((base, i) => ({
    ...base,
    avgLead: scaleDaysString(rowData[i].avgLead, filters.brand),
    calAvgLead:
      rowData[i].calAvgLead === "—" ? "—" : scaleDaysString(rowData[i].calAvgLead, filters.brand),
  }))
}

export function TimingSnapshot({ filters }: { filters: ActiveFilters }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const profile = getTimingProfile(filters)
  const timingRows = getTimingRows(filters)
  const bookingLeadBenchmark = getBenchmarkPercent(profile.gbpDays, profile.gbpCal)

  return (
    <TooltipProvider>
      <ReportSection
        title="Timing"
        exportSlug="timing"
        filters={filters}
        headerActions={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowBreakdown((prev) => !prev)}
                aria-label={showBreakdown ? "Hide timing breakdown" : "Show timing breakdown"}
                className={`rounded-md p-1.5 transition-colors hover:bg-accent ${showBreakdown ? "text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutList className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent variant="plain">
              {showBreakdown
                ? "Hide partner breakdown"
                : "View avg booking lead time per partner — includes CAL avg lead days by brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="@container min-w-0">
          <div className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2")}>
            <MetricBenchmarkWidget
              title="Avg booking to stay"
              value={profile.gbpDays}
              comparisonLabel={profile.gbpCal}
              benchmarkPercent={bookingLeadBenchmark}
              benchmarkLabel={`${bookingLeadBenchmark}% of CAL benchmark`}
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
            <HeadlineDataWidget
              title="Avg cancellation to stay"
              value="—"
              label="Days from cancellation to stay start"
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
          </div>
        </div>

        {showBreakdown && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>CCY</TableHead>
                  <TableHead className="text-right">Avg lead</TableHead>
                  <TableHead className="text-right">CAL avg lead</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timingRows.map((row) => (
                  <TableRow key={row.brand}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${row.color}`} />
                        <span>{row.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.ccy}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.avgLead}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.calAvgLead}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ReportSection>
    </TooltipProvider>
  )
}
