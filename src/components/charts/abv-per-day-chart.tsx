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
import { type ActiveFilters, buildAbvPerDayData } from "@/lib/chart-data"

const SERIES = [
  { key: "ABV (total)", color: "#3b82f6" },
  { key: "Partner Alpha", color: "#f97316" },
  { key: "Partner Beta", color: "#06b6d4" },
  { key: "Partner Gamma (DK)", color: "#eab308" },
  { key: "Partner Gamma (EUR)", color: "#f59e0b" },
  { key: "Partner Delta", color: "#10b981" },
  { key: "Partner Epsilon", color: "#ef4444" },
  { key: "Partner Zeta (DK)", color: "#8b5cf6" },
]

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

type AbvPerDayChartProps = {
  filters: ActiveFilters
  compact?: boolean
}

export function AbvPerDayChart({ filters, compact }: AbvPerDayChartProps) {
  const data = buildAbvPerDayData(filters)

  return (
    <section>
      {!compact && (
        <h2 className="mb-4 text-xs font-semibold tracking-wide uppercase">
          ABV (excl. fees) per day
        </h2>
      )}
      <div className={compact ? "p-0" : "rounded-xl border border-border bg-card p-4 shadow-xs"}>
        <ResponsiveContainer width="100%" height={compact ? 200 : 280}>
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
              width={52}
              tickFormatter={(v) => `£${(v as number).toLocaleString()}`}
            />
            <Tooltip
              content={
                <SortedChartTooltip
                  valueFormatter={(v) => `£${v.toLocaleString()}`}
                />
              }
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            />
            {SERIES.map(({ key, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
