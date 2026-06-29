import { PropertyAvgBookingValueWidget } from "@/components/booking-engine/property-avg-booking-value-widget"
import { PropertyBookingsWidget } from "@/components/booking-engine/property-bookings-widget"
import { PropertyCancelBenchmarkWidget } from "@/components/booking-engine/property-cancel-benchmark-widget"
import { PropertyOccupancyWidget } from "@/components/booking-engine/property-occupancy-widget"
import { PropertyStayProfileWidget } from "@/components/booking-engine/property-stay-profile-widget"
import { GraphWidget } from "@/components/widgets/graph-widget"
import { MetricFinancialTrendWidget } from "@/components/widgets/metric-financial-trend-widget"
import { MetricGaugeWidget } from "@/components/widgets/metric-gauge-widget"
import { MetricTrendWidget } from "@/components/widgets/metric-trend-widget"
import { ProductSplitWidget } from "@/components/widgets/product-split-widget"
import { TooltipProvider } from "@/components/ui/tooltip"
import { metricCardGridClass, metricCardStackClass } from "@/lib/card-layout"
import { INSIGHTS_WIDGET_HELP_TEXT } from "@/lib/insights-widget-labels"
import {
  getBookingSourceBreakdown,
  getBookingSourceTotal,
  getDirectSharePercent,
  getInsightBenchmarkPercent,
  PROPERTY_AVG_GUESTS,
  PROPERTY_AVG_NIGHTS,
  PROPERTY_BOOKINGS_COUNT_TREND,
  PROPERTY_CANCEL_FROM_BOOKING,
  PROPERTY_CANCEL_TO_STAY,
  PROPERTY_INSIGHT_METRICS,
  PROPERTY_LEAD_DAYS_TREND,
  PROPERTY_MONTHLY_TRENDS,
  PROPERTY_PORTFOLIO_BENCHMARKS,
  PROPERTY_RANKED_BOOKING_SOURCES,
  PROPERTY_REPEAT_GUESTS_TREND,
} from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

function metric(id: string) {
  return PROPERTY_INSIGHT_METRICS.find((item) => item.id === id)!
}

function InsightsSectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export function PropertyPerformanceCards() {
  return (
    <div className="@container min-w-0">
      <div
        className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3")}
      >
        <PropertyAvgBookingValueWidget helpText={INSIGHTS_WIDGET_HELP_TEXT} />
        <PropertyBookingsWidget helpText={INSIGHTS_WIDGET_HELP_TEXT} />
        <PropertyOccupancyWidget helpText={INSIGHTS_WIDGET_HELP_TEXT} />
      </div>
    </div>
  )
}

export function PropertyInsights() {
  const leadDays = metric("avg-lead-days")
  const calCoverage = metric("cal-coverage")
  const ddlCoverage = metric("ddl-coverage")
  const cancellationRate = metric("cancellation-rate")
  const repeatGuests = metric("repeat-guests")

  const bookingSourceTotal = getBookingSourceTotal()
  const webTraffic = PROPERTY_RANKED_BOOKING_SOURCES.find((source) => source.isWebTraffic)

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <section className="space-y-4">
          <InsightsSectionHeader
            title="Booking activity"
            description="Volume, value, and occupancy over the last 12 months"
          />
          <GraphWidget
            title="Monthly booking trends"
            explanation="Bookings made each month vs. stay start month"
            xAxisKey="month"
            data={PROPERTY_MONTHLY_TRENDS}
            layers={[
              {
                id: "bookings-made",
                label: "Bookings made",
                color: "var(--foreground)",
                dataKey: "bookingsMade",
              },
              {
                id: "stay-start",
                label: "Stay start month",
                color: "var(--muted-foreground)",
                dataKey: "stayStartMonth",
              },
            ]}
          />

          <PropertyPerformanceCards />
        </section>

        <section className="space-y-4">
          <InsightsSectionHeader
            title="Timing"
            description="Lead time and cancellation windows vs. portfolio benchmarks"
          />
          <div className="@container min-w-0">
            <div
              className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3")}
            >
              <MetricTrendWidget
                title="Avg lead days"
                value={leadDays.value}
                trendLabel="-8.2 days"
                trend="down"
                comparisonLabel={`Portfolio avg ${PROPERTY_PORTFOLIO_BENCHMARKS.avgLeadDays}`}
                chartData={PROPERTY_LEAD_DAYS_TREND}
                scopeLabel="Booking date to stay"
                rateLabel={`${getInsightBenchmarkPercent(leadDays.value, PROPERTY_PORTFOLIO_BENCHMARKS.avgLeadDays)}% of benchmark`}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
                insightLayout
              />
              <PropertyCancelBenchmarkWidget
                data={PROPERTY_CANCEL_TO_STAY}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
              <PropertyCancelBenchmarkWidget
                data={PROPERTY_CANCEL_FROM_BOOKING}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <InsightsSectionHeader
            title="Coverage & stay profile"
            description="Payment product uptake and typical guest stay patterns"
          />
          <div className="@container min-w-0">
            <div
              className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3")}
            >
              <ProductSplitWidget
                title="Payment coverage"
                totalLabel={`${bookingSourceTotal} bookings`}
                segmentA={{
                  label: "CAL",
                  value: calCoverage.subtext?.split(" ")[0] ?? "0",
                  sharePercent: 0,
                  takeUpLabel: calCoverage.subtext ?? "0 of 12",
                  trend: "neutral",
                }}
                segmentB={{
                  label: "DDL",
                  value: ddlCoverage.subtext?.split(" ")[0] ?? "0",
                  sharePercent: 0,
                  takeUpLabel: ddlCoverage.subtext ?? "0 of 12",
                  trend: "neutral",
                }}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
              <PropertyStayProfileWidget
                data={PROPERTY_AVG_NIGHTS}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
              <PropertyStayProfileWidget
                data={PROPERTY_AVG_GUESTS}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <InsightsSectionHeader
            title="Channels & engagement"
            description="Where bookings come from and how guests behave"
          />
          <div className="@container min-w-0">
            <div className={cn(metricCardGridClass, "grid-cols-1 @md:grid-cols-2")}>
              <MetricFinancialTrendWidget
                title="Booking sources"
                value={`${bookingSourceTotal} bookings`}
                trendLabel={`${getDirectSharePercent()}% direct`}
                trend="up"
                comparisonLabel={
                  webTraffic
                    ? `${webTraffic.value} website visits · tracked separately`
                    : "Channel mix for this property"
                }
                chartData={PROPERTY_BOOKINGS_COUNT_TREND}
                breakdownRows={getBookingSourceBreakdown()}
                footerLabel="Direct leads channel mix for this property"
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
                insightLayout
              />
              <div className={cn(metricCardStackClass, "min-w-0")}>
                <MetricGaugeWidget
                  title="Cancellation rate"
                  value={cancellationRate.value}
                  gaugePercent={8.3}
                  label={`${cancellationRate.subtext ?? ""} · portfolio ${PROPERTY_PORTFOLIO_BENCHMARKS.cancellationRate}`}
                  helpText={INSIGHTS_WIDGET_HELP_TEXT}
                />
                <MetricTrendWidget
                  title="Repeat guests"
                  value={repeatGuests.value}
                  trendLabel="+1 YTD"
                  trend="up"
                  comparisonLabel={repeatGuests.subtext ?? "guests with 2+ bookings"}
                  chartData={PROPERTY_REPEAT_GUESTS_TREND}
                  scopeLabel="Willowcroft House"
                  rateLabel="8.3% of guest base"
                  helpText={INSIGHTS_WIDGET_HELP_TEXT}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  )
}
