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
import { type ActiveFilters, buildDailyBookingsData } from "@/lib/chart-data"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }
const EVERY_NTH = 13

type BookingsVsStaysChartProps = {
  filters: ActiveFilters
  compact?: boolean
}

export function BookingsVsStaysChart({ filters, compact }: BookingsVsStaysChartProps) {
  const data = buildDailyBookingsData(filters)

  return (
    <section>
      {!compact && (
        <h2 className="mb-4 text-xs font-semibold tracking-wide uppercase">
          Bookings made vs stays starting per day
        </h2>
      )}
      <div className={compact ? "p-0" : "rounded-xl border border-border bg-card p-4 shadow-xs"}>
        <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
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
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Line
              type="monotone"
              dataKey="made"
              name="Made"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="starting"
              name="Starting"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
