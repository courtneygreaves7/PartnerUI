import { useState } from "react"
import { LayoutList } from "lucide-react"

import { ReportSection } from "@/components/report-section"
import { MetricTrendWidget } from "@/components/widgets/metric-trend-widget"
import { ProductSplitWidget } from "@/components/widgets/product-split-widget"
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
  scaleBookingCell,
} from "@/lib/brand-metrics"
import {
  buildBookingTrendChart,
  deriveBookingTrendMeta,
  type ActiveFilters,
  getBookingProfile,
} from "@/lib/chart-data"
import { INSIGHTS_WIDGET_HELP_TEXT } from "@/lib/insights-widget-labels"
import { cn } from "@/lib/utils"

const BASE_PARTNER_ROWS = [
  { brand: "Partner Alpha", ccy: "GBP", color: "bg-muted-foreground" },
  { brand: "Partner Beta", ccy: "GBP", color: "bg-muted-foreground/70" },
  { brand: "Partner Gamma (DK)", ccy: "EUR", color: "bg-muted-foreground/50" },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-muted-foreground/40" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-muted-foreground/30" },
  { brand: "Partner Epsilon", ccy: "GBP", color: "bg-muted-foreground/20" },
  { brand: "Partner Zeta (DK)", ccy: "EUR", color: "bg-muted-foreground/15" },
  { brand: "Partner Zeta (EUR)", ccy: "EUR", color: "bg-muted-foreground/10" },
]

const ROW_DATA: Record<string, Array<{ bookings: string; cal: string; ddl: string }>> = {
  "all-partners:all-brands": [
    { bookings: "42,310", cal: "1,104 2.6%", ddl: "12 0.0%" },
    { bookings: "38,750", cal: "892 2.3%", ddl: "8 0.0%" },
    { bookings: "9,420",  cal: "310 3.3%", ddl: "0 0.0%" },
    { bookings: "7,880",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "5,640",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "4,200",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "11,800", cal: "620 5.3%", ddl: "18 0.2%" },
    { bookings: "4,500",  cal: "284 6.3%", ddl: "10 0.2%" },
  ],
  "partner-a:all-brands": [
    { bookings: "18,100", cal: "480 2.7%", ddl: "5 0.0%" },
    { bookings: "11,200", cal: "220 1.8%", ddl: "3 0.0%" },
    { bookings: "4,100",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "2,900",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "2,010",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "1,400",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "1,900",  cal: "220 2.4%", ddl: "4 0.0%" },
    { bookings: "700",    cal: "184 4.2%", ddl: "0 0.0%" },
  ],
  "partner-b:all-brands": [
    { bookings: "14,200", cal: "390 2.7%", ddl: "3 0.0%" },
    { bookings: "10,800", cal: "240 1.7%", ddl: "2 0.0%" },
    { bookings: "3,600",  cal: "120 2.9%", ddl: "0 0.0%" },
    { bookings: "3,200",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "2,100",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "1,850",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "2,000",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "1,000",  cal: "142 3.8%", ddl: "3 0.0%" },
  ],
  "partner-c:all-brands": [
    { bookings: "10,010", cal: "234 2.3%", ddl: "4 0.0%" },
    { bookings: "16,750", cal: "432 2.6%", ddl: "5 0.0%" },
    { bookings: "1,720",  cal: "190 3.9%", ddl: "0 0.0%" },
    { bookings: "1,780",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "1,530",  cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "950",    cal: "0 0.0%",   ddl: "0 0.0%" },
    { bookings: "7,900",  cal: "400 5.1%", ddl: "14 0.2%" },
    { bookings: "2,800",  cal: "158 5.6%", ddl: "5 0.2%" },
  ],
}

function parseCount(value: string) {
  return Number.parseInt(value.replace(/,/g, ""), 10) || 0
}

function parsePercent(value: string) {
  const match = value.match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export function getProductSplit(profile: ReturnType<typeof getBookingProfile>) {
  const calCount = parseCount(profile.calSales)
  const ddlCount = parseCount(profile.ddlSales)
  const splitTotal = calCount + ddlCount

  return {
    totalLabel: `${splitTotal.toLocaleString("en-GB")} total`,
    calSharePercent: splitTotal > 0 ? Number(((calCount / splitTotal) * 100).toFixed(1)) : 0,
    ddlSharePercent: splitTotal > 0 ? Number(((ddlCount / splitTotal) * 100).toFixed(1)) : 0,
    calTrend: parsePercent(profile.calPct) >= parsePercent(profile.ddlPct) ? "up" as const : "down" as const,
    ddlTrend: parsePercent(profile.ddlPct) >= parsePercent(profile.calPct) ? "up" as const : "down" as const,
  }
}

export function getPartnerRows(filters: ActiveFilters) {
  const baselineKey = `${filters.partner}:all-brands`
  const rowData = ROW_DATA[baselineKey] ?? ROW_DATA["all-partners:all-brands"]
  return BASE_PARTNER_ROWS.map((base, i) => ({
    ...base,
    bookings: scaleBookingCell(rowData[i].bookings, filters.brand),
    cal: scaleBookingCell(rowData[i].cal, filters.brand),
    ddl: scaleBookingCell(rowData[i].ddl, filters.brand),
  }))
}

export function BookingsSnapshot({ filters }: { filters: ActiveFilters }) {
  const profile = getBookingProfile(filters)
  const partnerRows = getPartnerRows(filters)
  const productSplit = getProductSplit(profile)
  const trendMeta = deriveBookingTrendMeta(profile.total)
  const trendChart = buildBookingTrendChart(profile.total)
  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <TooltipProvider>
      <ReportSection
        title="Bookings"
        exportSlug="bookings"
        filters={filters}
        headerActions={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowBreakdown((prev) => !prev)}
                aria-label={showBreakdown ? "Hide partner breakdown" : "Show partner breakdown"}
                className={`rounded-md p-1.5 transition-colors hover:bg-accent ${showBreakdown ? "text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutList className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent variant="plain">
              {showBreakdown
                ? "Hide partner breakdown"
                : "View bookings broken down by partner — includes CAL and DDL figures per brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="@container flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2")}>
            <MetricTrendWidget
              title="Total bookings"
              value={profile.total}
              trendLabel={trendMeta.trendLabel}
              trend={trendMeta.trend}
              comparisonLabel={trendMeta.comparisonLabel}
              chartData={trendChart}
              scopeLabel="All selected partners and brands"
              rateLabel={trendMeta.dailyAverage}
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
            <ProductSplitWidget
              totalLabel={productSplit.totalLabel}
              segmentA={{
                label: "CAL",
                value: profile.calSales,
                sharePercent: productSplit.calSharePercent,
                takeUpLabel: `${profile.calPct} take-up`,
                trend: productSplit.calTrend,
              }}
              segmentB={{
                label: "DDL",
                value: profile.ddlSales,
                sharePercent: productSplit.ddlSharePercent,
                takeUpLabel: `${profile.ddlPct} take-up`,
                trend: productSplit.ddlTrend,
              }}
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
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">CAL</TableHead>
                  <TableHead className="text-right">DDL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerRows.map((row) => (
                  <TableRow key={row.brand}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${row.color}`} />
                        <span>{row.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.ccy}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.bookings}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.cal}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.ddl}
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
