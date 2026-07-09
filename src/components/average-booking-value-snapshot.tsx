import { useState } from "react"
import { LayoutList } from "lucide-react"

import { ReportSection } from "@/components/report-section"
import { MetricBenchmarkWidget, getBenchmarkPercent } from "@/components/widgets/metric-benchmark-widget"
import { MetricGaugeWidget } from "@/components/widgets/metric-gauge-widget"
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
import {
  scaleCurrencyString,
  scalePercentString,
} from "@/lib/brand-metrics"
import { type ActiveFilters, getAbvProfile } from "@/lib/chart-data"
import {
  INSIGHTS_WIDGET_HELP_TEXT,
} from "@/lib/insights-widget-labels"
import { cn } from "@/lib/utils"

const BASE_ABV_ROWS = [
  { brand: "Partner Alpha",       ccy: "GBP", color: "bg-muted-foreground"   },
  { brand: "Partner Beta",        ccy: "GBP", color: "bg-muted-foreground/70"   },
  { brand: "Partner Gamma (DK)",  ccy: "EUR", color: "bg-muted-foreground/50"  },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-muted-foreground/40" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-muted-foreground/30"   },
  { brand: "Partner Epsilon",     ccy: "GBP", color: "bg-muted-foreground/20"   },
  { brand: "Partner Zeta (DK)",   ccy: "EUR", color: "bg-muted-foreground/15"   },
  { brand: "Partner Zeta (EUR)",  ccy: "EUR", color: "bg-muted-foreground/10" },
]

const ABV_ROW_DATA: Record<string, Array<{ abv: string; calAbv: string; abvIncFee: string; calPricePct: string }>> = {
  "all-partners:all-brands": [
    { abv: "£742",   calAbv: "£890",   abvIncFee: "£768",   calPricePct: "7.2%" },
    { abv: "£615",   calAbv: "—",      abvIncFee: "£638",   calPricePct: "—"    },
    { abv: "€1,180", calAbv: "€1,340", abvIncFee: "€1,210", calPricePct: "9.4%" },
    { abv: "€1,320", calAbv: "—",      abvIncFee: "€1,365", calPricePct: "—"    },
    { abv: "€2,850", calAbv: "—",      abvIncFee: "€2,920", calPricePct: "—"    },
    { abv: "£3,100", calAbv: "—",      abvIncFee: "£3,180", calPricePct: "—"    },
    { abv: "€1,050", calAbv: "€1,210", abvIncFee: "€1,085", calPricePct: "9.8%" },
    { abv: "€1,140", calAbv: "€1,255", abvIncFee: "€1,175", calPricePct: "9.9%" },
  ],
  "partner-a:all-brands": [
    { abv: "£680",   calAbv: "£810",   abvIncFee: "£704",   calPricePct: "6.6%" },
    { abv: "£572",   calAbv: "—",      abvIncFee: "£594",   calPricePct: "—"    },
    { abv: "€1,020", calAbv: "€1,160", abvIncFee: "€1,048", calPricePct: "8.7%" },
    { abv: "€1,200", calAbv: "—",      abvIncFee: "€1,240", calPricePct: "—"    },
    { abv: "€2,620", calAbv: "—",      abvIncFee: "€2,685", calPricePct: "—"    },
    { abv: "£2,900", calAbv: "—",      abvIncFee: "£2,975", calPricePct: "—"    },
    { abv: "€960",   calAbv: "€1,095", abvIncFee: "€990",   calPricePct: "9.0%" },
    { abv: "€1,060", calAbv: "€1,160", abvIncFee: "€1,090", calPricePct: "9.2%" },
  ],
  "partner-b:all-brands": [
    { abv: "£820",   calAbv: "£980",   abvIncFee: "£850",   calPricePct: "8.0%" },
    { abv: "£680",   calAbv: "—",      abvIncFee: "£705",   calPricePct: "—"    },
    { abv: "€1,310", calAbv: "€1,490", abvIncFee: "€1,345", calPricePct: "10.1%"},
    { abv: "€1,460", calAbv: "—",      abvIncFee: "€1,510", calPricePct: "—"    },
    { abv: "€3,100", calAbv: "—",      abvIncFee: "€3,175", calPricePct: "—"    },
    { abv: "£3,380", calAbv: "—",      abvIncFee: "£3,465", calPricePct: "—"    },
    { abv: "€1,155", calAbv: "€1,330", abvIncFee: "€1,190", calPricePct: "10.5%"},
    { abv: "€1,250", calAbv: "€1,380", abvIncFee: "€1,290", calPricePct: "10.7%"},
  ],
  "partner-c:all-brands": [
    { abv: "£725",   calAbv: "£870",   abvIncFee: "£750",   calPricePct: "7.0%" },
    { abv: "£600",   calAbv: "—",      abvIncFee: "£622",   calPricePct: "—"    },
    { abv: "€1,140", calAbv: "€1,295", abvIncFee: "€1,170", calPricePct: "9.0%" },
    { abv: "€1,270", calAbv: "—",      abvIncFee: "€1,310", calPricePct: "—"    },
    { abv: "€2,750", calAbv: "—",      abvIncFee: "€2,820", calPricePct: "—"    },
    { abv: "£3,020", calAbv: "—",      abvIncFee: "£3,100", calPricePct: "—"    },
    { abv: "€1,020", calAbv: "€1,175", abvIncFee: "€1,055", calPricePct: "9.6%" },
    { abv: "€1,100", calAbv: "€1,210", abvIncFee: "€1,135", calPricePct: "9.7%" },
  ],
}

function getAbvRows(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const rowData = ABV_ROW_DATA[baselineKey] ?? ABV_ROW_DATA["all-partners:all-brands"]
  return BASE_ABV_ROWS.map((base, i) => ({
    ...base,
    abv: scaleCurrencyString(rowData[i].abv, filters.brand),
    calAbv: rowData[i].calAbv === "—" ? "—" : scaleCurrencyString(rowData[i].calAbv, filters.brand),
    abvIncFee: scaleCurrencyString(rowData[i].abvIncFee, filters.brand),
    calPricePct:
      rowData[i].calPricePct === "—"
        ? "—"
        : scalePercentString(rowData[i].calPricePct, filters.brand),
  }))
}

function getGaugePercent(value: string) {
  const match = value.replace(/,/g, "").match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export function AverageBookingValueSnapshot({ filters }: { filters: ActiveFilters }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const profile = getAbvProfile(filters)
  const abvRows = getAbvRows(filters)
  const abvExBenchmark = getBenchmarkPercent(profile.gbpAbv, profile.gbpCal)
  const abvIncBenchmark = getBenchmarkPercent(profile.gbpAbvFee, profile.gbpCalFee)

  return (
    <TooltipProvider>
      <ReportSection
        title="Average booking value"
        exportSlug="abv"
        filters={filters}
        headerActions={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowBreakdown((prev) => !prev)}
                aria-label={showBreakdown ? "Hide ABV breakdown" : "Show ABV breakdown"}
                className={`rounded-md p-1.5 transition-colors hover:bg-accent ${showBreakdown ? "text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutList className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent variant="plain">
              {showBreakdown
                ? "Hide partner breakdown"
                : "View ABV per partner — shows ABV, CAL ABV, ABV inc. fee and CAL price % by brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="@container flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className={cn(
              metricCardGridClass,
              "grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3"
            )}
          >
            <MetricGaugeWidget
              title="CAL customer price"
              value={profile.calPct}
              gaugePercent={getGaugePercent(profile.calPct)}
              label="% of ABV inc. booking fee"
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
            <MetricBenchmarkWidget
              title="ABV excl. booking fee"
              value={profile.gbpAbv}
              comparisonLabel={profile.gbpCal}
              benchmarkPercent={abvExBenchmark}
              benchmarkLabel={`${abvExBenchmark}% of CAL benchmark`}
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
            <MetricBenchmarkWidget
              title="ABV inc. booking fee"
              value={profile.gbpAbvFee}
              comparisonLabel={profile.gbpCalFee}
              benchmarkPercent={abvIncBenchmark}
              benchmarkLabel={`${abvIncBenchmark}% of CAL benchmark`}
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
                  <TableHead className="text-right">ABV</TableHead>
                  <TableHead className="text-right">CAL ABV</TableHead>
                  <TableHead className="text-right">ABV inc. fee</TableHead>
                  <TableHead className="text-right">CAL price %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abvRows.map((row) => (
                  <TableRow key={row.brand}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${row.color}`} />
                        <span>{row.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.ccy}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.abv}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{row.calAbv}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.abvIncFee}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{row.calPricePct}</TableCell>
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
