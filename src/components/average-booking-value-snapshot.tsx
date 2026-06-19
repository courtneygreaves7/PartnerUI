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
import { type ActiveFilters, getAbvProfile } from "@/lib/chart-data"

const BASE_ABV_ROWS = [
  { brand: "Partner Alpha",       ccy: "GBP", color: "bg-blue-500"   },
  { brand: "Partner Beta",        ccy: "GBP", color: "bg-cyan-500"   },
  { brand: "Partner Gamma (DK)",  ccy: "EUR", color: "bg-amber-500"  },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-violet-500" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-rose-500"   },
  { brand: "Partner Epsilon",     ccy: "GBP", color: "bg-lime-500"   },
  { brand: "Partner Zeta (DK)",   ccy: "EUR", color: "bg-pink-500"   },
  { brand: "Partner Zeta (EUR)",  ccy: "EUR", color: "bg-orange-500" },
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
  const key = `${filters.partner}:${filters.brand}`
  const rowData = ABV_ROW_DATA[key] ?? ABV_ROW_DATA["all-partners:all-brands"]
  return BASE_ABV_ROWS.map((base, i) => ({ ...base, ...rowData[i] }))
}

export function AverageBookingValueSnapshot({ filters }: { filters: ActiveFilters }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const profile = getAbvProfile(filters)
  const abvRows = getAbvRows(filters)

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
            <TooltipContent>
              {showBreakdown
                ? "Hide partner breakdown"
                : "View ABV per partner — shows ABV, CAL ABV, ABV inc. fee and CAL price % by brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3">
          <DualDataWidget
            primaryTitle="ABV (excl. booking fee)"
            datasetA={{
              title: "GBP",
              value: profile.gbpAbv,
              clarification: profile.gbpCal,
            }}
            datasetB={{
              title: "EUR",
              value: profile.eurAbv,
              clarification: profile.eurCal,
            }}
            helpText="Average booking value excluding the booking fee, with CAL ABV shown below each currency."
          />
          <DualDataWidget
            primaryTitle="ABV inc. booking fee"
            datasetA={{
              title: "GBP",
              value: profile.gbpAbvFee,
              clarification: profile.gbpCalFee,
            }}
            datasetB={{
              title: "EUR",
              value: profile.eurAbvFee,
              clarification: profile.eurCalFee,
            }}
            helpText="Average booking value including the booking fee, with CAL ABV shown below each currency."
          />
          <div className="@md:col-span-2 @4xl:col-span-1">
          <HeadlineDataWidget
            title="CAL customer price"
            value={profile.calPct}
            label="% of ABV inc. booking fee"
            helpText="Share of customer price against ABV including booking fee."
          />
          </div>
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
                    <TableCell className="text-right tabular-nums text-primary">{row.calAbv}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.abvIncFee}</TableCell>
                    <TableCell className="text-right tabular-nums text-primary">{row.calPricePct}</TableCell>
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
