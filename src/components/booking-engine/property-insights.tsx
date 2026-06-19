import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { SortedChartTooltip } from "@/components/charts/sorted-chart-tooltip"
import { DualDataWidget } from "@/components/dual-data-widget"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import {
  PROPERTY_INSIGHT_METRICS,
  PROPERTY_MONTHLY_TRENDS,
  PROPERTY_RANKED_BOOKING_SOURCES,
} from "@/lib/property-insights-data"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function metric(id: string) {
  return PROPERTY_INSIGHT_METRICS.find((item) => item.id === id)!
}

export function PropertyInsights() {
  const leadDays = metric("avg-lead-days")
  const cancelFromBooking = metric("avg-cancel-from-booking")
  const cancelToStay = metric("avg-cancel-to-stay")
  const avgBookingValue = metric("avg-booking-value")
  const calCoverage = metric("cal-coverage")
  const ddlCoverage = metric("ddl-coverage")
  const avgNights = metric("avg-nights")
  const avgGuests = metric("avg-guests")
  const occupancy = metric("occupancy")
  const cancellationRate = metric("cancellation-rate")
  const repeatGuests = metric("repeat-guests")

  const bookingSourceRows = PROPERTY_RANKED_BOOKING_SOURCES.map((source) => ({
    label: source.label,
    value: source.isWebTraffic
      ? `${source.value} visits`
      : `${source.value} bookings`,
  }))

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3">
            <DualDataWidget
              primaryTitle="Timing"
              datasetA={{
                title: "Avg lead days",
                value: leadDays.value,
                clarification: leadDays.subtext ?? "",
              }}
              datasetB={{
                title: "Avg cancel — to stay",
                value: cancelToStay.value,
                clarification: cancelToStay.subtext ?? "",
              }}
            />
            <HeadlineDataWidget
              title="Avg cancel — from booking"
              value={cancelFromBooking.value}
              label={cancelFromBooking.subtext ?? ""}
            />
            <HeadlineDataWidget
              title="Avg booking value"
              value={avgBookingValue.value}
              label={avgBookingValue.subtext ?? ""}
            />
          </div>
        </div>

        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @4xl:grid-cols-3">
            <DualDataWidget
              primaryTitle="Payment coverage"
              datasetA={{
                title: "CAL coverage",
                value: calCoverage.value,
                clarification: calCoverage.subtext ?? "",
              }}
              datasetB={{
                title: "DDL coverage",
                value: ddlCoverage.value,
                clarification: ddlCoverage.subtext ?? "",
              }}
            />
            <DualDataWidget
              primaryTitle="Stay profile"
              datasetA={{
                title: "Avg nights",
                value: avgNights.value,
                clarification: avgNights.subtext ?? "",
              }}
              datasetB={{
                title: "Avg guests",
                value: avgGuests.value,
                clarification: avgGuests.subtext ?? "",
              }}
            />
            <HeadlineDataWidget
              title="Occupancy (12M)"
              value={occupancy.value}
              label={occupancy.subtext ?? ""}
            />
          </div>
        </div>

        <div className="@container min-w-0">
          <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
            <DataSnapshotWidget
              title="Engagement"
              rows={[
                { label: "Cancellation rate", value: cancellationRate.value },
                { label: "Repeat guests", value: repeatGuests.value },
              ]}
            />
            <DataSnapshotWidget title="Booking sources" rows={bookingSourceRows} />
          </div>
        </div>

        <section className="min-w-0 rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Monthly booking trends</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bookings made each month vs. stay start month
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PROPERTY_MONTHLY_TRENDS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="month"
                tick={TICK_STYLE}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <Tooltip content={<SortedChartTooltip />} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line
                type="monotone"
                dataKey="bookingsMade"
                name="Bookings made"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="stayStartMonth"
                name="Stay start month"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </TooltipProvider>
  )
}
