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
import { type ActiveFilters, buildCalDdlTakeupData } from "@/lib/chart-data"

const SERIES = [
  { key: "CAL % (total)", color: "#10b981" },
  { key: "Partner Alpha CAL %", color: "#3b82f6" },
  { key: "Partner Beta CAL %", color: "#06b6d4" },
  { key: "DDL % (total)", color: "#ef4444" },
  { key: "Partner Alpha DDL %", color: "#f97316" },
]

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

type CalDdlTakeupChartProps = {
  filters: ActiveFilters
  compact?: boolean
}

export function CalDdlTakeupChart({ filters, compact }: CalDdlTakeupChartProps) {
  const data = buildCalDdlTakeupData(filters)

  return (
    <section>
      {!compact && (
        <h2 className="mb-4 text-xs font-semibold tracking-wide uppercase">
          CAL &amp; DDL take-up % per day
        </h2>
      )}
      <div className={compact ? "p-0" : "rounded-xl border border-border bg-card p-4 shadow-xs"}>
        <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
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
              tickFormatter={(v) => `${v as number}%`}
            />
            <Tooltip
              content={<SortedChartTooltip valueFormatter={(v) => `${v}%`} />}
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
