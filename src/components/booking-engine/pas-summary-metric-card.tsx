import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useId } from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { CHART_AREA_GRADIENT_FROM, CHART_BAR_FILL_SOFT_CLASS, CHART_BAR_MUTED_CLASS, CHART_LINE } from "@/lib/chart-colors"
import { cn } from "@/lib/utils"

type PasSummaryMetricCardProps = {
  title: string
  value: string
  icon: LucideIcon
  trendLabel?: string
  trendContext?: string
  footer?: string
  chartCaption?: string
  chartValues?: number[]
  chartLabels?: string[]
  chartStyle?: "bars" | "sparkline"
  detail?: ReactNode
  className?: string
  compact?: boolean
}

function MiniSparkline({ values, compact = false }: { values: number[]; compact?: boolean }) {
  const gradientId = `pas-sparkline-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const data = values.map((value, index) => ({ label: String(index), value }))

  return (
    <div className={cn("w-full min-w-0", compact ? "min-h-[28px] flex-1" : "h-9")}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0.14} />
              <stop offset="100%" stopColor={CHART_AREA_GRADIENT_FROM} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_LINE}
            strokeWidth={compact ? 1.25 : 1.5}
            strokeOpacity={0.55}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function MiniBarChart({
  values,
  labels,
  compact = false,
}: {
  values: number[]
  labels?: string[]
  compact?: boolean
}) {
  const max = Math.max(...values, 1)
  const showLabels = labels?.length === values.length

  return (
    <div className={cn("flex items-end", compact ? "h-6 gap-0.5" : "h-9 gap-1")}>
      {values.map((value, index) => {
        const isLast = index === values.length - 1
        const heightPct = Math.max(showLabels ? 38 : 12, (value / max) * 100)

        return (
          <div key={index} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className={cn(
                "flex w-full flex-col justify-end rounded-sm",
                showLabels && "items-center",
                isLast ? CHART_BAR_FILL_SOFT_CLASS : CHART_BAR_MUTED_CLASS,
                showLabels && (compact ? "min-h-[22px]" : "min-h-[28px]")
              )}
              style={{ height: `${heightPct}%` }}
            >
              {showLabels ? (
                <span
                  className={cn(
                    "pb-0.5 font-semibold leading-none",
                    compact ? "text-[7px]" : "text-[8px]",
                    isLast ? "text-background/90" : "text-muted-foreground"
                  )}
                >
                  {labels[index]}
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function PasSummaryMetricCard({
  title,
  value,
  icon: Icon,
  trendLabel,
  trendContext,
  footer,
  chartCaption,
  chartValues,
  chartLabels,
  chartStyle,
  detail,
  className,
  compact = false,
}: PasSummaryMetricCardProps) {
  const resolvedChartStyle =
    chartStyle ?? (chartLabels?.length ? "bars" : chartValues?.length ? "sparkline" : undefined)
  const usesSparkline = resolvedChartStyle === "sparkline" && chartValues?.length

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-border bg-card shadow-xs",
        compact ? "p-2.5" : "p-3",
        usesSparkline && compact && "h-full",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground",
            compact ? "size-6" : "size-7"
          )}
        >
          <Icon className={compact ? "size-3" : "size-3.5"} strokeWidth={2} />
        </div>
        {trendLabel ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/40 font-medium text-muted-foreground tabular-nums",
              compact ? "px-1 py-px text-[9px]" : "px-1.5 py-0.5 text-[10px]"
            )}
          >
            <TrendingUp className="size-2.5 shrink-0" strokeWidth={2.25} />
            {trendLabel}
          </span>
        ) : null}
      </div>

      <div className={cn("min-w-0 shrink-0", compact ? "mt-1.5" : "mt-2")}>
        <p
          className={cn(
            "font-medium leading-tight text-muted-foreground",
            compact ? "text-[10px]" : "text-xs"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "font-semibold leading-tight tracking-tight tabular-nums text-foreground",
            compact ? "mt-0.5 text-sm" : "mt-0.5 text-lg"
          )}
        >
          {value}
        </p>
        {trendContext ? (
          <p
            className={cn(
              "leading-tight text-muted-foreground",
              compact ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]"
            )}
          >
            {trendContext}
          </p>
        ) : null}
      </div>

      {usesSparkline ? (
        <div className={cn("flex min-h-0 flex-col", compact ? "mt-2 flex-1" : "mt-2")}>
          {chartCaption ? (
            <p
              className={cn(
                "mb-1.5 leading-tight text-muted-foreground",
                compact ? "text-[9px]" : "text-[10px]"
              )}
            >
              {chartCaption}
            </p>
          ) : null}
          <MiniSparkline values={chartValues} compact={compact} />
          {footer ? (
            <p
              className={cn(
                "shrink-0 leading-tight text-muted-foreground",
                compact ? "mt-1.5 text-[9px]" : "mt-2 text-[10px]"
              )}
            >
              {footer}
            </p>
          ) : null}
        </div>
      ) : (
        <div className={cn("mt-auto", compact ? "pt-1.5" : "pt-2")}>
          {detail ? detail : null}
          {!detail && chartValues?.length ? (
            <>
              {chartCaption ? (
                <p
                  className={cn(
                    "mb-1.5 leading-tight text-muted-foreground",
                    compact ? "text-[9px]" : "text-[10px]"
                  )}
                >
                  {chartCaption}
                </p>
              ) : null}
              <MiniBarChart values={chartValues} labels={chartLabels} compact={compact} />
            </>
          ) : null}
          {footer ? (
            <p
              className={cn(
                "leading-tight text-muted-foreground",
                compact ? "text-[9px]" : "text-[10px]",
                detail || chartValues?.length ? "mt-1" : undefined
              )}
            >
              {footer}
            </p>
          ) : null}
        </div>
      )}
    </article>
  )
}

export const PAS_YTD_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
export const PAS_PARTNERS_CHART_STUB = [4, 5, 5, 6, 6, 7]
export const PAS_BRANDS_CHART_STUB = [9, 10, 11, 11, 12, 13]
export const PAS_USERS_CHART_STUB = [16, 18, 19, 20, 22, 24]
export const PAS_BOOKINGS_CHART_STUB = [780, 810, 835, 860, 890, 950]
export const PAS_REVENUE_CHART_STUB = [268, 278, 285, 295, 305, 317]
export const PAS_PROPERTIES_CHART_STUB = [138, 142, 148, 152, 158, 162]
export const PAS_POLICIES_CHART_STUB = [38, 40, 41, 43, 44, 46]
