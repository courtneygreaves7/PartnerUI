import { ReportSection } from "@/components/report-section"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { MetricFinancialTrendWidget } from "@/components/widgets/metric-financial-trend-widget"
import { TooltipProvider } from "@/components/ui/tooltip"
import { metricCardGridClass } from "@/lib/card-layout"
import {
  buildCalFinBreakdown,
  buildFinancialTrendChart,
  deriveFinancialTrendMeta,
  type ActiveFilters,
  getCalFinProfile,
} from "@/lib/chart-data"
import { INSIGHTS_WIDGET_HELP_TEXT } from "@/lib/insights-widget-labels"
import { cn } from "@/lib/utils"

export function CalFinancials({ filters }: { filters: ActiveFilters }) {
  const profile = getCalFinProfile(filters)
  const trendMeta = deriveFinancialTrendMeta(profile.totalPayable)
  const trendChart = buildFinancialTrendChart(profile.totalPayable)
  const breakdownHighlight = buildCalFinBreakdown(profile)

  const breakdownRows = [
    { label: "IPT (GBP)", value: profile.ipt },
    { label: "PISL comm (GBP)", value: profile.pislComm },
    { label: "Capacity net (GBP)", value: profile.capacityNet },
    { label: "PISL amount payable (GBP)", value: profile.pislPayable },
    { label: "Premium inc. IPT (GBP)", value: profile.premiumInc },
    { label: "GWP (GBP)", value: profile.gwp },
  ]

  return (
    <TooltipProvider>
      <ReportSection
        title="CAL financials (GBP)"
        exportSlug="cal-financials"
        filters={filters}
      >
        <div className="@container min-w-0">
          <div
            className={cn(
              metricCardGridClass,
              "grid-cols-1 @4xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]"
            )}
          >
            <MetricFinancialTrendWidget
              title="Total payable"
              value={profile.totalPayable}
              trendLabel={trendMeta.trendLabel}
              trend={trendMeta.trend}
              comparisonLabel={trendMeta.comparisonLabel}
              chartData={trendChart}
              breakdownRows={breakdownHighlight}
              footerLabel="GBP · primary liability"
              helpText={INSIGHTS_WIDGET_HELP_TEXT}
            />
            <DataSnapshotWidget
              title="Financial breakdown"
              rows={breakdownRows}
            />
          </div>
        </div>
      </ReportSection>
    </TooltipProvider>
  )
}
