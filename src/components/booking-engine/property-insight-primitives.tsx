import type { ReactNode } from "react"
import { useId } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"

import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import type { InsightTrendPoint } from "@/lib/property-insights-data"
import { cn } from "@/lib/utils"

const TICK_STYLE = { fontSize: 10, fill: "var(--color-muted-foreground)" }

/** Shared layout tokens for property insight cards */
export const insightCardHeaderClass = "w-full space-y-0 pb-0"
export const insightCardBodyClass =
  "flex min-h-0 flex-1 flex-col gap-6 px-4 pb-4 pt-3"
export const insightMetricGroupClass = "flex flex-col gap-1.5"
export const insightVisualGroupClass = "flex flex-col gap-3"
export const insightChartHeightClass = "h-[5.25rem] w-full min-h-0 shrink-0"

export function InsightCardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn(insightCardBodyClass, className)}>{children}</div>
  )
}

export function InsightMetricGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(insightMetricGroupClass, className)}>{children}</div>
}

export function InsightVisualGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(insightVisualGroupClass, className)}>{children}</div>
}

export function InsightWidgetHeader({
  title,
  subtitle,
  badges,
  helpText,
}: {
  title: string
  subtitle?: string
  badges?: ReactNode
  helpText?: string
}) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        {badges ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{badges}</div>
        ) : null}
      </div>
      <WidgetHelpButton title={title} helpText={helpText} />
    </div>
  )
}

export function InsightBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode
  variant?: "neutral" | "positive" | "negative"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
        variant === "positive" && "bg-muted text-foreground",
        variant === "negative" && "bg-muted text-muted-foreground",
        variant === "neutral" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

export function InsightStatRow({
  columns,
}: {
  columns: Array<{ label: string; value: string; unit?: string }>
}) {
  return (
    <div className="flex items-stretch divide-x divide-border rounded-lg border border-border bg-muted/20 py-2.5">
      {columns.map((col) => (
        <div key={col.label} className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
            {col.label}
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{col.value}</p>
          {col.unit ? <p className="text-[10px] text-muted-foreground">{col.unit}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function InsightBenchmarkBar({
  percent,
  label,
}: {
  percent: number
  label: string
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground" style={{ width: `${clamped}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

export function InsightMiniSparkline({
  data,
  height = 56,
  highlightIndex,
}: {
  data: InsightTrendPoint[]
  height?: number
  highlightIndex?: number
}) {
  const gradientId = `insight-spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const chartData = data.map((point, index) => ({
    ...point,
    highlight: index === highlightIndex ? point.value : null,
  }))

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={TICK_STYLE}
            interval={0}
            dy={4}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--foreground)"
            strokeWidth={1.75}
            strokeOpacity={0.55}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          {highlightIndex !== undefined ? (
            <Area
              type="monotone"
              dataKey="highlight"
              stroke="transparent"
              fill="transparent"
              dot={{ r: 3, fill: "var(--foreground)", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function InsightDistributionBars({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; count: number }>
}) {
  const max = Math.max(...items.map((item) => item.count), 1)
  return (
    <div>
      <p className="mb-2 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </p>
      <div className="flex h-14 items-end gap-1">
        {items.map((item) => {
          const heightPct = Math.max(10, (item.count / max) * 100)
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-muted-foreground/45"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[9px] tabular-nums text-muted-foreground">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function InsightRankedBarList({
  title,
  items,
  variant = "count",
}: {
  title: string
  items: Array<{ label: string; barValue: number; detail?: string; amount?: string }>
  variant?: "count" | "monthly"
}) {
  const max = Math.max(...items.map((item) => item.barValue), 1)

  return (
    <div>
      <p className="mb-2.5 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.label}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5"
          >
            <span className="whitespace-nowrap text-xs text-muted-foreground">{item.label}</span>
            <div className="h-1.5 min-w-0 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${Math.max(8, (item.barValue / max) * 100)}%` }}
              />
            </div>
            {variant === "monthly" ? (
              <div className="flex shrink-0 items-center gap-2">
                {item.detail ? (
                  <span className="text-[10px] text-muted-foreground">{item.detail}</span>
                ) : null}
                {item.amount ? (
                  <span className="w-10 text-right text-xs font-semibold tabular-nums text-foreground">
                    {item.amount}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="min-w-[1.25rem] shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {item.barValue}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InsightHighlightGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-muted/20 px-3 py-2.5"
        >
          <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function InsightCallout({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function InsightFooter({
  left,
  right,
  className,
}: {
  left: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5",
        className
      )}
    >
      <div className="min-w-0">{left}</div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}
