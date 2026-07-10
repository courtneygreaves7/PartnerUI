import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { InteractiveChartLegend } from "@/components/charts/interactive-chart-legend"
import { useHiddenChartSeries } from "@/components/charts/use-hidden-chart-series"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

export type GraphLayer = {
  id: string
  label: string
  color: string
  dataKey: string
}

export type GraphWidgetProps = {
  title: string
  explanation: string
  layers: GraphLayer[]
  data: Record<string, string | number>[]
  xAxisKey: string
  variant?: "line" | "bar"
  className?: string
}

export function GraphWidget({
  title,
  explanation,
  layers,
  data,
  xAxisKey,
  variant = "line",
  className,
}: GraphWidgetProps) {
  const layerKeys = useMemo(() => layers.map((layer) => layer.dataKey), [layers])
  const { hiddenKeys, toggleSeries, isHidden } = useHiddenChartSeries(layerKeys)

  const legendPayload = useMemo(
    () =>
      layers.map((layer) => ({
        dataKey: layer.dataKey,
        value: layer.label,
        color: layer.color,
        type: (variant === "bar" ? "rect" : "line") as "rect" | "line",
      })),
    [layers, variant]
  )

  const Chart = variant === "bar" ? BarChart : LineChart

  return (
    <Card className={cn("bg-card shadow-xs", className)}>
      <CardHeader className="flex-col items-start gap-1 pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{explanation}</p>
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey={xAxisKey}
                tick={TICK_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
              />
              {layers.map((layer) =>
                variant === "bar" ? (
                  <Bar
                    key={layer.id}
                    dataKey={layer.dataKey}
                    name={layer.label}
                    hide={isHidden(layer.dataKey)}
                    fill={layer.color}
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <Line
                    key={layer.id}
                    type="monotone"
                    dataKey={layer.dataKey}
                    name={layer.label}
                    hide={isHidden(layer.dataKey)}
                    stroke={layer.color}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )
              )}
            </Chart>
          </ResponsiveContainer>
        </div>

        <InteractiveChartLegend
          payload={legendPayload}
          hiddenKeys={hiddenKeys}
          onToggleSeries={toggleSeries}
        />
      </CardContent>
    </Card>
  )
}
