import { useState } from "react"
import { LayoutList } from "lucide-react"

import { DualDataWidget } from "@/components/dual-data-widget"
import { ReportSection } from "@/components/report-section"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
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
import { type ActiveFilters, getTimingProfile } from "@/lib/chart-data"
import {
  INSIGHTS_WIDGET_HELP_TEXT,
  INSIGHTS_WIDGET_SUBHEADING,
} from "@/lib/insights-widget-labels"

const BASE_TIMING_ROWS = [
  { brand: "Partner Alpha",       ccy: "GBP", color: "bg-blue-500"   },
  { brand: "Partner Beta",        ccy: "GBP", color: "bg-cyan-500"   },
  { brand: "Partner Gamma (DK)",  ccy: "EUR", color: "bg-amber-500"  },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-violet-500" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-rose-500"   },
  { brand: "Partner Epsilon",     ccy: "GBP", color: "bg-lime-500"   },
  { brand: "Partner Zeta (DK)",   ccy: "EUR", color: "bg-pink-500"   },
  { brand: "Partner Zeta (EUR)",  ccy: "EUR", color: "bg-orange-500" },
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
  const key = `${filters.partner}:${filters.brand}`
  const rowData = TIMING_ROW_DATA[key] ?? TIMING_ROW_DATA["all-partners:all-brands"]
  return BASE_TIMING_ROWS.map((base, i) => ({ ...base, ...rowData[i] }))
}

export function TimingSnapshot({ filters }: { filters: ActiveFilters }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const profile = getTimingProfile(filters)
  const timingRows = getTimingRows(filters)

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
            <TooltipContent>
              {showBreakdown
                ? "Hide partner breakdown"
                : "View avg booking lead time per partner — includes CAL avg lead days by brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
          <DualDataWidget
            primaryTitle={INSIGHTS_WIDGET_SUBHEADING}
            datasetA={{
              title: "GBP",
              value: profile.gbpDays,
              clarification: profile.gbpCal,
            }}
            datasetB={{
              title: "EUR",
              value: profile.eurDays,
              clarification: profile.eurCal,
            }}
            helpText={INSIGHTS_WIDGET_HELP_TEXT}
          />
          <HeadlineDataWidget
            title={INSIGHTS_WIDGET_SUBHEADING}
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
                    <TableCell className="text-right tabular-nums text-primary">
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
