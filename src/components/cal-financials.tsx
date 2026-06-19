import { ReportSection } from "@/components/report-section"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { TooltipProvider } from "@/components/ui/tooltip"
import { type ActiveFilters, getCalFinProfile } from "@/lib/chart-data"
import {
  INSIGHTS_WIDGET_HELP_TEXT,
  INSIGHTS_WIDGET_SUBHEADING,
} from "@/lib/insights-widget-labels"

export function CalFinancials({ filters }: { filters: ActiveFilters }) {
  const profile = getCalFinProfile(filters)

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
          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <HeadlineDataWidget
            title={INSIGHTS_WIDGET_SUBHEADING}
            value={profile.totalPayable}
            label="GBP · primary liability"
            helpText={INSIGHTS_WIDGET_HELP_TEXT}
          />
          <DataSnapshotWidget
            title={INSIGHTS_WIDGET_SUBHEADING}
            rows={breakdownRows}
          />
        </div>
        </div>
      </ReportSection>
    </TooltipProvider>
  )
}
