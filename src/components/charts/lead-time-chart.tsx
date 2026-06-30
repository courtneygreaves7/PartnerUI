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
import { type ActiveFilters, buildLeadTimeData } from "@/lib/chart-data"
import { chartSeriesColor } from "@/lib/chart-colors"
import { CHART_HEIGHT } from "@/lib/chart-styles"

const SERIES = [
  { key: "Total", color: chartSeriesColor(3) },
  { key: "Partner Alpha", color: chartSeriesColor(0) },
  { key: "Partner Beta", color: chartSeriesColor(1) },
  { key: "Partner Gamma", color: chartSeriesColor(2) },
]

const SERIES_KEYS = SERIES.map(({ key }) => key)

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

type LeadTimeChartProps = {
  filters: ActiveFilters
  compact?: boolean
}

export function LeadTimeChart({ filters, compact }: LeadTimeChartProps) {
  const data = buildLeadTimeData(filters)
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
            interval={13}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => `${v as number}d`}
          />
          <Tooltip content={<SortedChartTooltip valueFormatter={(v) => `${v} days`} />} />
          <Legend
            content={(props) => (
              <InteractiveChartLegend
                payload={props.payload}
                hiddenKeys={hiddenKeys}
                onToggleSeries={toggleSeries}
              />
            )}
          />
          {SERIES.map(({ key, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              hide={isHidden(key)}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
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
      title="Avg booking to stay lead time per day"
      exportSlug="lead-time"
      filters={filters}
      headingClassName="mb-4"
    >
      {chart}
    </ReportSection>
  )
}
