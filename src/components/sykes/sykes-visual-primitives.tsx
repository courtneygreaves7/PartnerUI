import { useId, useState, type ReactNode } from "react"
import { Info, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
} from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type MiniChartPoint = { label: string; value: number }

const MINI_CHART_AXIS_STYLE = { fontSize: 10, fill: "var(--color-muted-foreground)" }

function MiniChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  valueFormatter?: (value: number) => string
}) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  if (value === undefined) return null

  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">{valueFormatter ? valueFormatter(value) : value}</p>
    </div>
  )
}

export function Sparkline({
  data,
  className,
  valueFormatter,
  showAxis = true,
}: {
  data: MiniChartPoint[]
  className?: string
  valueFormatter?: (value: number) => string
  showAxis?: boolean
}) {
  const gradientId = useId()

  return (
    <div className={cn("h-16 w-full text-foreground/70", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 2, left: 2, bottom: showAxis ? 14 : 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxis ? (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={MINI_CHART_AXIS_STYLE}
              interval={0}
              dy={2}
            />
          ) : null}
          <RechartsTooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={<MiniChartTooltip valueFormatter={valueFormatter} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: "currentColor" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MiniBarChart({
  data,
  className,
  valueFormatter,
}: {
  data: MiniChartPoint[]
  className?: string
  valueFormatter?: (value: number) => string
}) {
  return (
    <div className={cn("h-20 w-full text-foreground/70", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 14 }} barGap={4}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={MINI_CHART_AXIS_STYLE}
            interval={0}
            dy={4}
          />
          <RechartsTooltip
            cursor={{ fill: "var(--color-muted)" }}
            content={<MiniChartTooltip valueFormatter={valueFormatter} />}
          />
          <Bar
            dataKey="value"
            fill="currentColor"
            fillOpacity={0.75}
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const COMPOSITION_OPACITIES = [0.9, 0.65, 0.4] as const

export function MiniCompositionBar({
  data,
  className,
  valueFormatter,
}: {
  data: MiniChartPoint[]
  className?: string
  valueFormatter?: (value: number) => string
}) {
  const total = data.reduce((sum, point) => sum + point.value, 0) || 1

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-muted">
        {data.map((point, index) => (
          <div
            key={point.label}
            className="h-full bg-foreground transition-all"
            style={{
              width: `${(point.value / total) * 100}%`,
              opacity: COMPOSITION_OPACITIES[index] ?? 0.5,
            }}
            title={`${point.label}: ${valueFormatter ? valueFormatter(point.value) : point.value}`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {data.map((point, index) => (
          <div key={point.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full bg-foreground"
                style={{ opacity: COMPOSITION_OPACITIES[index] ?? 0.5 }}
              />
              <span className="truncate">{point.label}</span>
            </span>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-foreground">
              {valueFormatter ? valueFormatter(point.value) : point.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MiniCompositionSplit({
  data,
  className,
  valueFormatter,
}: {
  data: MiniChartPoint[]
  className?: string
  valueFormatter?: (value: number) => string
}) {
  const max = Math.max(...data.map((point) => point.value), 1)

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="min-w-0 flex-1 space-y-2.5">
        {data.map((point, index) => (
          <div key={point.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="size-1.5 shrink-0 rounded-full bg-foreground"
                style={{ opacity: COMPOSITION_OPACITIES[index] ?? 0.5 }}
              />
              <span className="truncate">{point.label}</span>
            </span>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-foreground">
              {valueFormatter ? valueFormatter(point.value) : point.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex h-[4.5rem] shrink-0 items-end justify-center gap-2.5 px-0.5">
        {data.map((point, index) => {
          const heightPct = Math.max(12, (point.value / max) * 100)

          return (
            <div key={point.label} className="flex h-full w-5 items-end justify-center">
              <div
                className="w-full rounded-t-md bg-foreground transition-all"
                style={{
                  height: `${heightPct}%`,
                  opacity: COMPOSITION_OPACITIES[index] ?? 0.5,
                }}
                title={`${point.label}: ${valueFormatter ? valueFormatter(point.value) : point.value}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MiniComparisonRows({
  data,
  className,
  valueFormatter,
  normalizeToHundred = false,
}: {
  data: MiniChartPoint[]
  className?: string
  valueFormatter?: (value: number) => string
  /** When true, each bar scales to 100 (for %-type metrics shown on their own scale). */
  normalizeToHundred?: boolean
}) {
  const max = normalizeToHundred ? 100 : Math.max(...data.map((point) => point.value), 1)

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((point) => {
        const percent = Math.min(100, (point.value / max) * 100)

        return (
          <div key={point.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] text-muted-foreground">{point.label}</span>
              <span className="shrink-0 text-[10px] font-semibold tabular-nums text-foreground">
                {valueFormatter ? valueFormatter(point.value) : point.value}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/75 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function NoteTooltip({ note }: { note: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Section note"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{note}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TrendPill({
  value,
  trend = "up",
  className,
}: {
  value: string
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  const Icon = trend === "down" ? TrendingDown : TrendingUp
  const tone =
    trend === "down"
      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      : trend === "up"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "bg-muted text-muted-foreground"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
        tone,
        className
      )}
    >
      {trend !== "neutral" ? <Icon className="size-3" /> : null}
      {value}
    </span>
  )
}

export function VisualCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  headerClassName,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
}) {
  return (
    <Card className={cn("h-auto overflow-hidden bg-card shadow-xs", className)}>
      <CardHeader className={cn("flex-row items-start justify-between space-y-0 pb-3", headerClassName)}>
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
              <Icon className="size-4" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className="pb-5">{children}</CardContent>
    </Card>
  )
}

export function KpiTile({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string
  value: string
  hint?: string
  trend?: { value: string; direction: "up" | "down" | "neutral" }
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
        {trend ? <TrendPill value={trend.value} trend={trend.direction} /> : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ChannelBarGroup({
  channels,
  className,
}: {
  channels: Array<{ label: string; value: string; fill: string; percent: number }>
  className?: string
}) {
  const max = Math.max(...channels.map((c) => c.percent), 1)

  return (
    <div className={cn("grid grid-cols-4 gap-3", className)}>
      {channels.map((channel) => (
        <div key={channel.label} className="flex flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end justify-center rounded-lg bg-muted/40 px-2 pb-2 pt-3">
            <div
              className="w-full max-w-10 rounded-t-md transition-all"
              style={{
                height: `${Math.max(12, (channel.percent / max) * 100)}%`,
                backgroundColor: channel.fill,
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums text-foreground">{channel.value}</p>
            <p className="text-[11px] text-muted-foreground">{channel.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgressMetricRow({
  label,
  value,
  percent,
  tone = "brand",
}: {
  label: string
  value: string
  percent: number
  tone?: "brand" | "accent" | "muted"
}) {
  const barColor = {
    brand: "bg-foreground/80",
    accent: "bg-muted-foreground/60",
    muted: "bg-muted-foreground/40",
  }[tone]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 text-muted-foreground">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}

export function CollapsibleDataTable({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <details
      className={cn(
        "group rounded-xl border border-border bg-card shadow-xs",
        className
      )}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
          {title}
        </span>
      </summary>
      <div className="border-t border-border px-1 pb-1">{children}</div>
    </details>
  )
}
