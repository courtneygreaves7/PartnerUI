import type { ReactNode } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
      ? "bg-rose-100 text-rose-800"
      : trend === "up"
        ? "bg-emerald-100 text-emerald-800"
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
  action,
  children,
  className,
  headerClassName,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
}) {
  return (
    <Card className={cn("h-auto overflow-hidden bg-card shadow-xs", className)}>
      <CardHeader className={cn("flex-row items-start justify-between space-y-0 pb-3", headerClassName)}>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
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
    brand: "bg-[var(--brand-primary)]",
    accent: "bg-[var(--brand-accent)]",
    muted: "bg-muted-foreground/50",
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
  return (
    <details
      className={cn(
        "group rounded-xl border border-border bg-card shadow-xs",
        className
      )}
      open={defaultOpen}
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
