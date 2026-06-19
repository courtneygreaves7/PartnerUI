import { useState } from "react"
import { LayoutList } from "lucide-react"

import { ReportSection } from "@/components/report-section"
import { DualDataWidget } from "@/components/dual-data-widget"
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
import { type ActiveFilters, getBookingProfile } from "@/lib/chart-data"
import {
  INSIGHTS_WIDGET_HELP_TEXT,
  INSIGHTS_WIDGET_SUBHEADING,
} from "@/lib/insights-widget-labels"

const BASE_PARTNER_ROWS = [
  { brand: "Partner Alpha", ccy: "GBP", color: "bg-blue-500" },
  { brand: "Partner Beta", ccy: "GBP", color: "bg-cyan-500" },
  { brand: "Partner Gamma (DK)", ccy: "EUR", color: "bg-amber-500" },
  { brand: "Partner Gamma (EUR)", ccy: "EUR", color: "bg-violet-500" },
  { brand: "Partner Delta (EUR)", ccy: "EUR", color: "bg-rose-500" },
  { brand: "Partner Epsilon", ccy: "GBP", color: "bg-lime-500" },
  { brand: "Partner Zeta (DK)", ccy: "EUR", color: "bg-pink-500" },
  { brand: "Partner Zeta (EUR)", ccy: "EUR", color: "bg-orange-500" },
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

export function getPartnerRows(filters: ActiveFilters) {
  const key = `${filters.partner}:${filters.brand}`
  const rowData = ROW_DATA[key] ?? ROW_DATA["all-partners:all-brands"]
  return BASE_PARTNER_ROWS.map((base, i) => ({ ...base, ...rowData[i] }))
}

export function BookingsSnapshot({ filters }: { filters: ActiveFilters }) {
  const profile = getBookingProfile(filters)
  const partnerRows = getPartnerRows(filters)
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
            <TooltipContent>
              {showBreakdown
                ? "Hide partner breakdown"
                : "View bookings broken down by partner — includes CAL and DDL figures per brand"}
            </TooltipContent>
          </Tooltip>
        }
      >
      <div className="@container min-w-0">
        <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <HeadlineDataWidget
            title={INSIGHTS_WIDGET_SUBHEADING}
            value={profile.total}
            label="All selected partners and brands"
            helpText={INSIGHTS_WIDGET_HELP_TEXT}
          />
          <DualDataWidget
            primaryTitle={INSIGHTS_WIDGET_SUBHEADING}
            datasetA={{
              title: "CAL",
              value: profile.calSales,
              clarification: `${profile.calPct} take-up`,
            }}
            datasetB={{
              title: "DDL",
              value: profile.ddlSales,
              clarification: `${profile.ddlPct} take-up`,
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
                    <TableCell className="text-right tabular-nums text-primary">
                      {row.cal}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-amber-600 dark:text-muted-foreground">
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
