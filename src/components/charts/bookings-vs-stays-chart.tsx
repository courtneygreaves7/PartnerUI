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

import { InteractiveChartLegend } from "@/components/charts/interactive-chart-legend"
import { SortedChartTooltip } from "@/components/charts/sorted-chart-tooltip"
import { useHiddenChartSeries } from "@/components/charts/use-hidden-chart-series"
import { ReportSection } from "@/components/report-section"
import { type ActiveFilters, buildDailyBookingsData } from "@/lib/chart-data"
import { chartSeriesColor } from "@/lib/chart-colors"
import { CHART_HEIGHT } from "@/lib/chart-styles"

const SERIES = [
  { key: "made", label: "Made", color: chartSeriesColor(0) },
  { key: "starting", label: "Starting", color: chartSeriesColor(2) },
]

const SERIES_KEYS = SERIES.map(({ key }) => key)

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }
const EVERY_NTH = 13

type BookingsVsStaysChartProps = {
  filters: ActiveFilters
  compact?: boolean
}

export function BookingsVsStaysChart({ filters, compact }: BookingsVsStaysChartProps) {
  const data = buildDailyBookingsData(filters)
  const { hiddenKeys, toggleSeries, isHidden } = useHiddenChartSeries(SERIES_KEYS)

  const chart = (
    <div
      className={
        compact
          ? "min-w-0 p-0"
          : "flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card p-4 shadow-xs"
      }
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={TICK_STYLE}
            interval={EVERY_NTH}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} width={48} />
          <Tooltip content={<SortedChartTooltip />} />
          <Legend
            content={(props) => (
              <InteractiveChartLegend
                payload={props.payload}
                hiddenKeys={hiddenKeys}
                onToggleSeries={toggleSeries}
              />
            )}
          />
          {SERIES.map(({ key, label, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              hide={isHidden(key)}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  if (compact) {
    return <section className="flex h-full min-w-0 flex-col">{chart}</section>
  }

  return (
    <ReportSection
      title="Bookings made vs stays starting per day"
      exportSlug="bookings-vs-stays"
      filters={filters}
      headingClassName="mb-4"
    >
      {chart}
    </ReportSection>
  )
}
