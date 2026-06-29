import { Calendar, Home, TrendingUp } from "lucide-react"

import {
  InsightBadge,
  InsightCardBody,
  InsightFooter,
  InsightMetricGroup,
  InsightMiniSparkline,
  InsightRankedBarList,
  InsightStatRow,
  InsightVisualGroup,
  InsightWidgetHeader,
  insightCardHeaderClass,
} from "@/components/booking-engine/property-insight-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PROPERTY_BOOKINGS_INSIGHT } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

type PropertyBookingsWidgetProps = {
  helpText?: string
  className?: string
}

export function PropertyBookingsWidget({ helpText, className }: PropertyBookingsWidgetProps) {
  const peakIndex = PROPERTY_BOOKINGS_INSIGHT.monthlyTrend.findIndex(
    (point) => point.value === Math.max(...PROPERTY_BOOKINGS_INSIGHT.monthlyTrend.map((p) => p.value))
  )

  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      <CardHeader className={insightCardHeaderClass}>
        <InsightWidgetHeader
          title="Bookings"
          subtitle="12-month rolling"
          helpText={helpText}
          badges={
            <>
              <InsightBadge variant="positive">
                <TrendingUp className="size-3 shrink-0" strokeWidth={2.25} />
                {PROPERTY_BOOKINGS_INSIGHT.trendLabel}
              </InsightBadge>
              <InsightBadge variant="negative">
                {PROPERTY_BOOKINGS_INSIGHT.cancellations} cancellation
              </InsightBadge>
            </>
          }
        />
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <InsightCardBody>
          <InsightMetricGroup className="shrink-0">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {PROPERTY_BOOKINGS_INSIGHT.total}
            </p>
          </InsightMetricGroup>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
            <InsightVisualGroup className="gap-4">
              <InsightMiniSparkline
                data={PROPERTY_BOOKINGS_INSIGHT.monthlyTrend}
                height={72}
                highlightIndex={peakIndex >= 0 ? peakIndex : undefined}
              />
              <InsightStatRow
                columns={[
                  { label: "Month avg", value: String(PROPERTY_BOOKINGS_INSIGHT.monthAvg) },
                  { label: "CAL", value: String(PROPERTY_BOOKINGS_INSIGHT.calBookings) },
                  { label: "Cancelled", value: String(PROPERTY_BOOKINGS_INSIGHT.cancelledCount) },
                ]}
              />
            </InsightVisualGroup>

            <InsightRankedBarList
              title="Booking sources"
              items={PROPERTY_BOOKINGS_INSIGHT.bookingSources.map((source) => ({
                label: source.label,
                barValue: source.count,
              }))}
            />
          </div>

          <InsightFooter
            className="mt-0 shrink-0"
            left={
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Home className="size-3.5 shrink-0" strokeWidth={2} />
                <span className="truncate">{PROPERTY_BOOKINGS_INSIGHT.propertyName}</span>
              </div>
            }
            right={
              <div className="flex items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" strokeWidth={2} />
                {PROPERTY_BOOKINGS_INSIGHT.monthAvg} / month avg
              </div>
            }
          />
        </InsightCardBody>
      </CardContent>
    </Card>
  )
}
