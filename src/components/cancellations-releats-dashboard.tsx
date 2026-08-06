import { useState } from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ArrowRight,
  FlagTriangleRight,
  Clock,
  FileText,
  Info,
  Lightbulb,
  MousePointerClick,
  PoundSterling,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  AVG_RELET_VALUE_HELP,
  CANCEL_RATE,
  CANCEL_RATE_BY_CHANNEL_HELP,
  CANCEL_RATE_FC,
  CANCEL_VOLUME,
  CANCEL_VOLUME_FC,
  CANCEL_VS_RELET_HELP,
  CHANNEL_META,
  CHANNEL_MIX,
  CHANNEL_MIX_DIRECT_SHARE,
  CHANNEL_MIX_HELP,
  CONTENT_METRIC_ROWS,
  LIVE_CANCELLATIONS,
  LIVE_CANCELLATIONS_HELP,
  METRICS_SUMMARY_HELP,
  OPS_VALUE_LOOP,
  PARTIAL_RELETS_HELP,
  PARTIAL_RELETS_INSIGHT,
  RELET_RATE,
  RELET_RATE_STAT,
  RELET_VALUE_AVG,
  RELET_VOLUME,
  RELET_VOLUME_FC,
  RELET_VOLUME_VS_FORECAST_HELP,
  SERIES_COLORS,
  TARGET_CARDS,
  TOP_KPI_CARDS,
  VOLUME_TREND,
  VOLUME_TREND_HELP,
  WEEKLY_CANCEL_RELET,
  deltaVsForecast,
  filterLiveCancellations,
  formatCurrency,
  formatMetricValue,
  formatPercent,
  formatReletFillLabel,
  formatVolume,
  getOverlapNightMask,
  getOverlappingNights,
  getRecoveredValue,
  getReletFills,
  isSplitRelet,
  summariseLiveCancellations,
  type LiveCancellationFilter,
} from "@/lib/cancellations-releats-data"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { PORTFOLIO } from "@/lib/mock-portfolio"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InsightsMetricHeatmap } from "@/components/insights-metric-heatmap"
import { InsightsSection } from "@/components/insights-section"

const PANEL = "rounded-2xl border border-border/60 bg-card p-3 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const TICK = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function MeasureHelp({ title, help }: { title: string; help: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`More information about ${title}`}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-left">
        {help}
      </TooltipContent>
    </Tooltip>
  )
}

function PanelTitle({
  title,
  help,
  className,
}: {
  title: string
  help: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <MeasureHelp title={title} help={help} />
    </div>
  )
}

function KpiIcon({
  icon,
  className,
}: {
  icon: (typeof TOP_KPI_CARDS)[number]["icon"]
  className?: string
}) {
  if (icon === "alert") return <AlertCircle className={className} />
  if (icon === "down") return <TrendingDown className={className} />
  if (icon === "refresh") return <RefreshCcw className={className} />
  if (icon === "risk") return <PoundSterling className={className} />
  return <TrendingUp className={className} />
}

function AccentKpiCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {TOP_KPI_CARDS.map((card) => {
        const attention =
          "deltaKind" in card && card.deltaKind === "attention"
        const deltaValue = Number.parseFloat(card.delta)
        const improved =
          !attention &&
          Number.isFinite(deltaValue) &&
          (card.higherIsBetter ? deltaValue > 0 : deltaValue < 0)
        const worsened =
          !attention &&
          Number.isFinite(deltaValue) &&
          (card.higherIsBetter ? deltaValue < 0 : deltaValue > 0)
        const tone = attention
          ? "attention"
          : improved
            ? "up"
            : worsened
              ? "down"
              : "neutral"
        const Arrow = tone === "down" ? ArrowDownRight : ArrowUpRight
        return (
          <div key={card.id} className={cn(PANEL, "flex flex-col gap-3")}>
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10">
              <KpiIcon icon={card.icon} className="size-4 text-primary" />
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
                <MeasureHelp title={card.label} help={card.help} />
              </div>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {card.value}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                      tone === "up"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : tone === "down"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                          : tone === "attention"
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                    )}
                    aria-label={card.delta}
                  >
                    {tone === "up" || tone === "down" ? (
                      <Arrow className="size-3 shrink-0" strokeWidth={2.5} />
                    ) : null}
                    {card.delta}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-left">
                  {card.delta}
                </TooltipContent>
              </Tooltip>
            </div>
            {card.context.length > 0 ? (
              <div className="mt-auto space-y-0.5">
                {card.context.map((line) => (
                  <p key={line} className="text-xs text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function TargetProgressCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {TARGET_CARDS.map((card) => {
        const max = Math.max(card.actual, card.target) * 1.08
        const actualPct = (card.actual / max) * 100
        const targetPct = (card.target / max) * 100
        const onTrack = card.lowerIsBetter
          ? card.actual <= card.target
          : card.actual >= card.target
        return (
          <div key={card.id} className={cn(PANEL, "flex flex-col gap-4")}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <p className={MONO_LABEL}>{card.label}</p>
                <MeasureHelp title={card.label} help={card.help} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide uppercase",
                  onTrack
                    ? "text-primary"
                    : "text-amber-800 dark:text-amber-300"
                )}
              >
                {card.status}
              </span>
            </div>
            <div>
              <p className={cn("font-bold tracking-tight tabular-nums text-foreground", FIGURE_24PX_CLASS)}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.targetLabel}</p>
            </div>
            <div className="relative mt-auto h-2.5 rounded-full bg-muted">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  onTrack ? "bg-primary" : "bg-amber-500/80"
                )}
                style={{ width: `${Math.min(actualPct, 100)}%` }}
              />
              <div
                className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-foreground"
                style={{ left: `${targetPct}%` }}
                title="Target"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VolumeTrendChart() {
  return (
    <div className={PANEL}>
      <div className="mb-4">
        <PanelTitle title="6-month volume trend" help={VOLUME_TREND_HELP} />
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cancellations vs re-lets · Feb–Jul 2026
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: SERIES_COLORS.cancellations }} />
            Cancellations
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: SERIES_COLORS.relets }} />
            Re-lets
          </span>
        </div>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={VOLUME_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reletFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES_COLORS.relets} stopOpacity={0.35} />
                <stop offset="100%" stopColor={SERIES_COLORS.relets} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cancelFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES_COLORS.cancellations} stopOpacity={0.2} />
                <stop offset="100%" stopColor={SERIES_COLORS.cancellations} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} width={36} />
            <RechartsTooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="cancellations"
              name="Cancellations"
              stroke={SERIES_COLORS.cancellations}
              fill="url(#cancelFill)"
              strokeWidth={2}
              dot={{ r: 3, fill: SERIES_COLORS.cancellations }}
            />
            <Area
              type="monotone"
              dataKey="relets"
              name="Re-lets"
              stroke={SERIES_COLORS.relets}
              fill="url(#reletFill)"
              strokeWidth={2}
              dot={{ r: 3, fill: SERIES_COLORS.relets }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MetricsSummaryTable() {
  const [mode, setMode] = useState<"cancellations" | "relets">("cancellations")

  const cancelRows = CONTENT_METRIC_ROWS.filter((row) =>
    row.id.startsWith("cancellation")
  )
  const reletRows = CONTENT_METRIC_ROWS.filter((row) => row.id.startsWith("relet"))
  const rows = mode === "cancellations" ? cancelRows : reletRows

  const deltas =
    mode === "cancellations"
      ? CHANNEL_META.map(({ key }) => deltaVsForecast(CANCEL_VOLUME[key], CANCEL_VOLUME_FC[key]))
      : CHANNEL_META.map(({ key }) => deltaVsForecast(RELET_VOLUME[key], RELET_VOLUME_FC[key]))

  const deltaDirect =
    mode === "cancellations"
      ? deltaVsForecast(CANCEL_VOLUME.direct, CANCEL_VOLUME_FC.direct)
      : deltaVsForecast(RELET_VOLUME.direct, RELET_VOLUME_FC.direct)
  const deltaTotal =
    mode === "cancellations"
      ? deltaVsForecast(CANCEL_VOLUME.total, CANCEL_VOLUME_FC.total)
      : deltaVsForecast(RELET_VOLUME.total, RELET_VOLUME_FC.total)

  return (
    <div className={PANEL}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PanelTitle title="Metrics summary" help={METRICS_SUMMARY_HELP} />
          <p className="mt-0.5 text-xs text-muted-foreground">
            All channels · Actual and forecast · Jul 2026
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5 text-xs font-medium">
          {(["cancellations", "relets"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "rounded-full px-3 py-1.5 capitalize transition-colors",
                mode === option
                  ? "border border-border bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option === "cancellations" ? "Cancellations" : "Re-lets"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Metric</th>
              {CHANNEL_META.map((channel) => (
                <th
                  key={channel.key}
                  className="px-2 py-2 text-center text-xs font-medium"
                  style={{ color: channel.color }}
                >
                  {channel.label}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-xs font-medium text-primary">
                Direct
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border/70",
                  row.muted && "text-muted-foreground"
                )}
              >
                <td className="py-2.5 pr-3 text-xs font-medium">
                  {row.label}
                  {row.muted ? (
                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
                      Forecast
                    </span>
                  ) : null}
                </td>
                {CHANNEL_META.map((channel) => (
                  <td key={channel.key} className="px-2 py-2.5 text-center tabular-nums">
                    {formatMetricValue(row.values[channel.key], row.format)}
                  </td>
                ))}
                <td className="px-2 py-2.5 text-center tabular-nums text-primary">
                  {formatMetricValue(row.values.direct, row.format)}
                </td>
                <td className="px-2 py-2.5 text-center font-semibold tabular-nums text-foreground">
                  {formatMetricValue(row.values.total, row.format)}
                </td>
              </tr>
            ))}
            <tr className="bg-primary/5">
              <td className="py-2.5 pr-3 text-xs font-semibold text-primary">Δ vs forecast</td>
              {deltas.map((delta, index) => (
                <td
                  key={CHANNEL_META[index].key}
                  className={cn(
                    "px-2 py-2.5 text-center text-xs font-semibold tabular-nums",
                    delta === 0 ? "text-muted-foreground" : "text-primary"
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {formatVolume(delta)}
                </td>
              ))}
              <td
                className={cn(
                  "px-2 py-2.5 text-center text-xs font-semibold tabular-nums",
                  deltaDirect === 0 ? "text-muted-foreground" : "text-primary"
                )}
              >
                {deltaDirect > 0 ? "+" : ""}
                {formatVolume(deltaDirect)}
              </td>
              <td
                className={cn(
                  "px-2 py-2.5 text-center text-xs font-semibold tabular-nums",
                  deltaTotal === 0 ? "text-muted-foreground" : "text-primary"
                )}
              >
                {deltaTotal > 0 ? "+" : ""}
                {formatVolume(deltaTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChannelMixCard() {
  const maxShare = Math.max(...CHANNEL_MIX.map((item) => item.share))
  return (
    <div className={PANEL}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <PanelTitle title="Channel mix distribution" help={CHANNEL_MIX_HELP} />
        <span className={MONO_LABEL}>Share of bookings</span>
      </div>
      <ul className="space-y-4">
        {CHANNEL_MIX.map((item, index) => (
          <li key={item.key} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(item.share / maxShare) * 100}%`,
                  opacity: 1 - index * 0.18,
                }}
              />
            </div>
            <span className="text-right text-sm font-semibold tabular-nums text-foreground">
              {item.share}%
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">Direct (A+B+C)</span>
        <span className="font-semibold tabular-nums text-foreground">
          {CHANNEL_MIX_DIRECT_SHARE}%
        </span>
      </div>
    </div>
  )
}

function CancelVsReletBars() {
  return (
    <div className={PANEL}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PanelTitle title="Cancellation vs re-let" help={CANCEL_VS_RELET_HELP} />
        <div className="flex gap-3 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary/40" />
            Cancel
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Re-let
          </span>
        </div>
      </div>
      <div className="flex h-44 items-end justify-between gap-2 px-1">
        {WEEKLY_CANCEL_RELET.map((day) => {
          const max = 160
          return (
            <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full max-w-8 flex-col-reverse gap-1">
                <div
                  className="w-full rounded-full bg-primary"
                  style={{ height: `${(day.relet / max) * 100}%` }}
                  title={`Re-let ${day.relet}`}
                />
                <div
                  className="w-full rounded-full bg-primary/35"
                  style={{ height: `${(day.cancel / max) * 100}%` }}
                  title={`Cancel ${day.cancel}`}
                />
              </div>
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {day.day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReletRateStatCard() {
  const marketGap = round1(PORTFOLIO.reletPct - RELET_RATE_STAT.marketPct)
  const barMax = Math.max(...RELET_RATE_STAT.channels.map((channel) => channel.rate), 1)

  return (
    <div className={cn(PANEL, "flex flex-col")}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <TrendingUp className="size-5" />
        </span>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <ArrowUpRight className="size-3.5 text-muted-foreground" />
            {RELET_RATE_STAT.delta}
          </p>
          <p className="text-xs text-muted-foreground">{RELET_RATE_STAT.deltaLabel}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5">
          <p className={MONO_LABEL}>{RELET_RATE_STAT.label}</p>
          <MeasureHelp title={RELET_RATE_STAT.label} help={RELET_RATE_STAT.help} />
        </div>
        <p className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {RELET_RATE_STAT.value}
          </span>
          <span className="text-sm text-muted-foreground">{RELET_RATE_STAT.unit}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
              marketGap >= 0
                ? "border-border/70 bg-muted/40 text-muted-foreground"
                : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
            )}
          >
            {marketGap >= 0 ? "+" : ""}
            {marketGap}pp vs market
          </span>
        </p>
      </div>

      <div className="mt-auto border-t border-border/60 pt-4">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          By channel
        </p>
        <ul className="space-y-3">
          {RELET_RATE_STAT.channels.map((channel) => (
            <li key={channel.key} className="grid grid-cols-[4.5rem_1fr_2.75rem] items-center gap-2">
              <span className="truncate text-xs text-muted-foreground">{channel.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${(channel.rate / barMax) * 100}%`,
                    opacity: 0.55 + (channel.rate / barMax) * 0.45,
                  }}
                />
              </div>
              <span className="text-right text-xs font-semibold tabular-nums text-foreground">
                {formatPercent(channel.rate)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Market {formatPercent(RELET_RATE_STAT.marketPct)}
        </p>
      </div>
    </div>
  )
}

function CancellationRateByChannel() {
  return (
    <div className={PANEL}>
      <div className="mb-4">
        <PanelTitle title="Cancellation rate by channel" help={CANCEL_RATE_BY_CHANNEL_HELP} />
        <p className="mt-0.5 text-xs text-muted-foreground">Actual vs forecast %</p>
      </div>
      <ul className="space-y-4">
        {CHANNEL_META.map((channel) => {
          const actual = CANCEL_RATE[channel.key]
          const forecast = CANCEL_RATE_FC[channel.key]
          const delta = round1(actual - forecast)
          const barMax = 18
          return (
            <li key={channel.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <span className="size-2 rounded-full" style={{ background: channel.color }} />
                  {channel.label}
                </span>
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="font-medium text-primary">
                    {delta > 0 ? "+" : ""}
                    {delta}pp
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatPercent(actual)}
                  </span>
                </span>
              </div>
              <div className="relative h-1.5 rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(actual / barMax) * 100}%`,
                    background: channel.color,
                  }}
                />
                <div
                  className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-foreground/70"
                  style={{ left: `${(forecast / barMax) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Forecast: {formatPercent(forecast)}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ReletVolumeVsForecast() {
  const data = CHANNEL_META.map((channel) => ({
    channel: channel.label,
    actual: RELET_VOLUME[channel.key],
    forecast: RELET_VOLUME_FC[channel.key],
    color: channel.color,
  }))

  return (
    <div className={PANEL}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <PanelTitle title="Re-let volume vs forecast" help={RELET_VOLUME_VS_FORECAST_HELP} />
          <p className="mt-0.5 text-xs text-muted-foreground">Jul 2026 by channel</p>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#99C4FF]" />
            Forecast
          </span>
        </div>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" tick={TICK} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="channel"
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <RechartsTooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: 12,
              }}
            />
            <Bar dataKey="forecast" name="Forecast" fill="#99C4FF" radius={[0, 4, 4, 0]} barSize={10} />
            <Bar dataKey="actual" name="Actual" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AvgReletValueByChannel() {
  return (
    <div className={PANEL}>
      <div className="mb-4">
        <PanelTitle title="Avg re-let value" help={AVG_RELET_VALUE_HELP} />
        <p className="mt-0.5 text-xs text-muted-foreground">Revenue recovered per re-let (£)</p>
      </div>
      <ul className="space-y-4">
        {CHANNEL_META.map((channel) => {
          const value = RELET_VALUE_AVG[channel.key]
          const rate = RELET_RATE[channel.key]
          const units = RELET_VOLUME[channel.key]
          return (
            <li key={channel.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <span className="size-2 rounded-full" style={{ background: channel.color }} />
                  {channel.label}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${rate}%`, background: channel.color }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Re-let rate: {formatPercent(rate)}</span>
                <span>{formatVolume(units)} units</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function OverlapNightBar({
  nights,
  mask,
}: {
  nights: number
  mask: boolean[]
}) {
  return (
    <div
      className="mt-1.5 flex h-1.5 w-full max-w-[5.5rem] gap-px overflow-hidden rounded-full"
      title={`${mask.filter(Boolean).length} of ${nights} nights overlapped`}
      aria-hidden
    >
      {Array.from({ length: nights }, (_, index) => (
        <span
          key={index}
          className={cn(
            "min-w-0 flex-1",
            mask[index]
              ? "bg-emerald-500/80 dark:bg-emerald-400/70"
              : "bg-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}

function SplitMetricRing({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const basePct = Math.min(100, Math.max(0, percent))
  const overflowPct = Math.min(100, Math.max(0, percent - 100))
  const baseLen = (basePct / 100) * circumference
  const overflowLen = (overflowPct / 100) * circumference

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("size-11 shrink-0 text-primary", className)}
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth="3"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        className="stroke-current"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${baseLen} ${circumference}`}
        transform="rotate(-90 24 24)"
      />
      {overflowPct > 0 ? (
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          className="stroke-current opacity-40"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${overflowLen} ${circumference}`}
          transform="rotate(-90 24 24)"
        />
      ) : null}
    </svg>
  )
}

function PartialReletsInsight() {
  const { example, splitSharePct, splitRecoveredPct, singleRecoveredPct, avgOverlapPct } =
    PARTIAL_RELETS_INSIGHT
  const uplift =
    ((example.recoveredValue - example.cancelledValue) / example.cancelledValue) * 100
  const fillPct = Math.round(
    (example.overlappingNights / example.cancelledNights) * 100
  )

  const metrics = [
    {
      label: "Of re-lets",
      value: formatPercent(splitSharePct),
      percent: splitSharePct,
      hint: "are split fills",
      ringClass: "text-primary",
    },
    {
      label: ">2 Rec",
      value: formatPercent(splitRecoveredPct),
      percent: splitRecoveredPct,
      hint: "of cancelled value",
      ringClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "x1 Recovery",
      value: formatPercent(singleRecoveredPct),
      percent: singleRecoveredPct,
      hint: "of cancelled value",
      ringClass: "text-primary/70",
    },
    {
      label: "Avg overlap",
      value: formatPercent(avgOverlapPct),
      percent: avgOverlapPct,
      hint: "of cancelled nights",
      ringClass: "text-primary/55",
    },
  ] as const

  return (
    <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <p className={MONO_LABEL}>Revenue opportunity</p>
          <PanelTitle title="Split re-lets" help={PARTIAL_RELETS_HELP} className="mt-1" />
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
            Filling a cancelled stay with more than one shorter booking often recovers more
            than rebooking the full length to a single guest. Overlap shows how many cancelled
            nights were filled.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border/60">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex min-w-0 flex-col items-start px-0 sm:items-center sm:px-3 sm:text-center first:sm:pl-0 last:sm:pr-0"
            >
              <p className={cn(MONO_LABEL, "whitespace-nowrap")}>{metric.label}</p>
              <div className="mt-2.5">
                <SplitMetricRing percent={metric.percent} className={metric.ringClass} />
              </div>
              <p
                className={cn(
                  "mt-2 font-bold tracking-tight tabular-nums text-foreground",
                  FIGURE_24PX_CLASS
                )}
              >
                {metric.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/25 px-4 py-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">Example from live list</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <span>
                {example.cancelledNights}n cancel ({formatCurrency(example.cancelledValue)})
                filled as
              </span>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {example.fillsLabel}
              </span>
              <span>
                · {example.overlappingNights} of {example.cancelledNights} nights overlap
              </span>
            </p>
            <div className="mt-3 flex max-w-md items-center gap-3">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                {fillPct}% fill
              </span>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-sm font-semibold tabular-nums text-foreground">
              Recovered {formatCurrency(example.recoveredValue)}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="size-3.5" />
              +{round1(uplift)}% vs cancelled value
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveSummarySpark({ values }: { values: number[] }) {
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {values.map((value, index) => (
        <span
          key={index}
          className="w-1 rounded-sm bg-primary/70"
          style={{ height: `${Math.max(18, value)}%` }}
        />
      ))}
    </div>
  )
}

function LiveCancellationsPanel() {
  const [filter, setFilter] = useState<LiveCancellationFilter>("awaiting")
  const summary = summariseLiveCancellations(LIVE_CANCELLATIONS)
  const rows = filterLiveCancellations(LIVE_CANCELLATIONS, filter)
  const channelLabel = (key: (typeof CHANNEL_META)[number]["key"]) =>
    CHANNEL_META.find((channel) => channel.key === key)?.label ?? key

  const summaryCards: Array<{
    id: LiveCancellationFilter
    title: string
    badge: string
    badgeTone: "attention" | "risk" | "positive"
    meta: string
    value: string
    valueHint: string
    spark: number[]
  }> = [
    {
      id: "awaiting",
      title: "Not re-let",
      badge: "Open",
      badgeTone: "attention",
      meta: "Live book · awaiting recovery",
      value: String(summary.awaiting),
      valueHint: "stays",
      spark: [42, 55, 48, 62, 58, 70],
    },
    {
      id: "awaiting",
      title: "At risk",
      badge: "Attention",
      badgeTone: "risk",
      meta: "Cancelled value still open",
      value: formatCurrency(summary.valueAtRisk),
      valueHint: "open",
      spark: [35, 48, 52, 44, 60, 68],
    },
    {
      id: "split",
      title: "Split fills",
      badge: "Recovered",
      badgeTone: "positive",
      meta: "Multi-booking re-lets",
      value: String(summary.split),
      valueHint: "fills",
      spark: [28, 36, 40, 55, 48, 62],
    },
  ]

  const filters: Array<{ id: LiveCancellationFilter; label: string; count: number }> = [
    { id: "awaiting", label: "Not re-let", count: summary.awaiting },
    { id: "relet", label: "Re-let", count: summary.relet },
    { id: "split", label: "Split fills", count: summary.split },
    { id: "all", label: "All", count: summary.total },
  ]

  return (
    <div className={PANEL}>
      <div>
        <p className={MONO_LABEL}>Booking detail</p>
        <PanelTitle title="Live cancellations" help={LIVE_CANCELLATIONS_HELP} className="mt-1" />
        <p className="mt-1 max-w-xl text-xs text-muted-foreground">
          Focus on stays still open for re-let. Re-let rows show fill pattern, overlapping
          nights of the cancelled stay, and recovered value.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const active = filter === card.id
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => setFilter(card.id)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left shadow-xs transition-colors",
                active
                  ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20"
                  : "hover:bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                    card.badgeTone === "positive"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : card.badgeTone === "risk"
                        ? "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                  )}
                >
                  {card.badgeTone === "positive" ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : (
                    <AlertCircle className="size-3" strokeWidth={2.5} />
                  )}
                  {card.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{card.meta}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                <p className="text-sm font-medium tabular-nums text-foreground">
                  <span className="font-semibold">{card.value}</span>{" "}
                  <span className="font-normal text-muted-foreground">{card.valueHint}</span>
                </p>
                <LiveSummarySpark values={card.spark} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === item.id
                ? "border-foreground/20 bg-background text-foreground shadow-sm"
                : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums text-muted-foreground">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="h-10 px-3 text-xs">Ref</TableHead>
              <TableHead className="px-3 text-xs">Property</TableHead>
              <TableHead className="px-3 text-xs">Channel</TableHead>
              <TableHead className="px-3 text-xs">Cancelled</TableHead>
              <TableHead className="px-3 text-xs">Check-in</TableHead>
              <TableHead className="px-3 text-right text-xs">Value</TableHead>
              <TableHead className="px-3 text-xs">Flexible Cancellation</TableHead>
              <TableHead className="px-3 text-xs">Re-let</TableHead>
              <TableHead className="px-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  Overlap
                  <MeasureHelp
                    title="Overlap"
                    help="How many nights of the cancelled stay were covered by re-let booking(s). Gaps show nights still empty inside the original dates."
                  />
                </span>
              </TableHead>
              <TableHead className="px-3 text-right text-xs">Recovered</TableHead>
              <TableHead className="px-3 text-right text-xs">Days open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No cancellations in this view.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((booking) => {
                const awaiting = booking.reletStatus === "awaiting"
                const fills = getReletFills(booking)
                const split = isSplitRelet(booking)
                const fillLabel = formatReletFillLabel(booking)
                const recovered = getRecoveredValue(booking)
                const overlappingNights = getOverlappingNights(booking)
                const overlapMask = getOverlapNightMask(booking)
                const uncoveredNights = booking.nights - overlappingNights
                const recoveredUplift =
                  !awaiting && booking.value > 0
                    ? ((recovered - booking.value) / booking.value) * 100
                    : null

                return (
                  <TableRow
                    key={booking.id}
                    className={cn(awaiting && "bg-primary/[0.03]")}
                  >
                    <TableCell className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      {booking.id}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="text-sm text-foreground">{booking.property}</div>
                      <div className="text-[11px] text-muted-foreground">{booking.brand}</div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
                      {channelLabel(booking.channel)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-sm tabular-nums">
                      {booking.cancelledAt}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-sm tabular-nums">
                      {booking.checkIn}
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        · {booking.nights}n
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">
                      {formatCurrency(booking.value)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      {booking.hasFlexibleCancellation ? (
                        <span className="inline-flex rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Yes
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                          awaiting
                            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                            : split
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "border-border bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {awaiting ? "Not re-let" : split ? "Split" : "Re-let"}
                      </span>
                      {!awaiting && fillLabel ? (
                        <div className="mt-1 text-[11px] font-medium tabular-nums text-foreground">
                          {fillLabel}
                        </div>
                      ) : null}
                      {!awaiting && fills.length > 0 ? (
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {fills.map((fill) => fill.ref).join(", ")}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      {awaiting ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div>
                          <div className="text-sm font-medium tabular-nums text-foreground">
                            {overlappingNights}/{booking.nights}n
                          </div>
                          <OverlapNightBar nights={booking.nights} mask={overlapMask} />
                          {uncoveredNights > 0 ? (
                            <div className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">
                              {uncoveredNights}n gap
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              Full overlap
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right text-sm tabular-nums">
                      {awaiting ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div>
                          <div className="font-medium text-foreground">
                            {formatCurrency(recovered)}
                          </div>
                          {recoveredUplift !== null && recoveredUplift !== 0 ? (
                            <div
                              className={cn(
                                "text-[10px] font-medium",
                                recoveredUplift > 0
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-muted-foreground"
                              )}
                            >
                              {recoveredUplift > 0 ? "+" : ""}
                              {round1(recoveredUplift)}%
                            </div>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right text-sm tabular-nums">
                      {awaiting ? (
                        <span className="font-semibold text-foreground">{booking.daysOpen}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function OpsValueLoopScorecard() {
  return (
    <div className={cn(PANEL, "p-5 sm:p-6")}>
      <div className="flex flex-col gap-1">
        <div className="min-w-0">
          <p className={MONO_LABEL}>Recovery loop</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">{OPS_VALUE_LOOP.title}</h3>
            <MeasureHelp title={OPS_VALUE_LOOP.title} help={OPS_VALUE_LOOP.story} />
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {OPS_VALUE_LOOP.story}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 xl:flex xl:flex-row xl:items-stretch">
        {OPS_VALUE_LOOP.steps.map((step, index) => {
          const isLast = index === OPS_VALUE_LOOP.steps.length - 1
          const StepIcon = isLast ? FlagTriangleRight : ArrowRight
          return (
          <div
            key={step.id}
            className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-xs sm:px-5"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <StepIcon className="size-3.5" strokeWidth={2.5} aria-hidden />
              </span>
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-muted-foreground">
                {step.label}
              </p>
              <MeasureHelp title={step.label} help={step.help} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-[28px] font-bold tracking-tight tabular-nums leading-none text-foreground">
                {step.value}
              </p>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                  step.badgeTone === "positive" &&
                    "border-primary/20 bg-primary/5 text-primary",
                  step.badgeTone === "attention" &&
                    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
                  step.badgeTone === "neutral" &&
                    "border-border/70 bg-muted/40 text-muted-foreground"
                )}
              >
                {step.badge}
              </span>
            </div>
            <p className="mt-auto pt-3 text-[11px] leading-snug text-muted-foreground">
              {step.hint}
            </p>
          </div>
          )
        })}
      </div>
    </div>
  )
}

function OpsRecoveryOpportunity() {
  const summary = summariseLiveCancellations(LIVE_CANCELLATIONS)
  const gapToStrongRelet = Math.max(0, 65 - PORTFOLIO.reletPct)

  const metrics = [
    {
      label: "Open cancels",
      value: String(summary.awaiting),
      hint: "unfilled bookings",
      icon: AlertCircle,
      tone: "attention" as const,
    },
    {
      label: "Avg days open",
      value: String(round1(summary.avgDaysOpen)),
      hint: "days since cancellation",
      icon: Clock,
      tone: "neutral" as const,
    },
    {
      label: "Split re-lets",
      value: String(summary.split),
      hint: "partial fills in progress",
      icon: Sparkles,
      tone: "primary" as const,
    },
  ] as const

  return (
    <div className={cn(PANEL, "overflow-hidden p-0")}>
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
            Opportunity
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Value still waiting to be re-let
            </h3>
            <MeasureHelp
              title="Value still waiting to be re-let"
              help="Cancelled booking value on the live list that has not been filled yet: unrealised revenue still open for recovery."
            />
          </div>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Cancelled booking value on the live list that has not been filled yet
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className={MONO_LABEL}>At stake</p>
          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-amber-800 dark:text-amber-300">
            {formatCurrency(summary.valueAtRisk)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">unrealised revenue</p>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-5 sm:grid-cols-3 sm:px-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="relative rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {metric.label}
                </p>
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-lg",
                    metric.tone === "attention" &&
                      "bg-amber-500/10 text-amber-800 dark:text-amber-300",
                    metric.tone === "neutral" && "bg-muted text-muted-foreground",
                    metric.tone === "primary" && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-2xl font-bold tracking-tight tabular-nums",
                  metric.tone === "attention" && "text-amber-800 dark:text-amber-300",
                  metric.tone === "neutral" && "text-foreground",
                  metric.tone === "primary" && "text-primary"
                )}
              >
                {metric.value}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.hint}</p>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border/60 bg-muted/25 px-5 py-3 sm:px-6">
        <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {gapToStrongRelet > 0 ? (
              <>
                Closing{" "}
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  {gapToStrongRelet.toFixed(1)}pp
                </span>{" "}
                toward a{" "}
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  65% re-let rate
                </span>{" "}
                would shrink open cancels fastest.
              </>
            ) : (
              "Re-let is already at a strong level. Keep clearing the open book."
            )}
          </span>
        </p>
      </div>
    </div>
  )
}

export function CancellationsReletsDashboard() {
  return (
    <div className="flex flex-col">
      <InsightsSection
        id="insights-health"
        eyebrow="1 · How are we doing?"
        title="Ops performance"
        description="See cancel volume, re-let rate, and value still open this month: the live health check before you dig into recovery behaviour and channel detail."
        badge={{ icon: BarChart3, label: "Health check" }}
        showDivider={false}
      >
        <AccentKpiCards />
        <div className="flex justify-center py-1" aria-hidden>
          <div className="h-px w-12 bg-border" />
        </div>
        <TargetProgressCards />
      </InsightsSection>

      <InsightsSection
        id="insights-story"
        eyebrow="2 · The story"
        title="How cancellations still pay"
        description="Cancels are expected when guests have Flexible Cancellation. Re-let turns those stays back into revenue: follow the loop from cancel volume to recovery, and see what is still open."
        badge={{ icon: RefreshCcw, label: "Value loop" }}
      >
        <OpsValueLoopScorecard />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <VolumeTrendChart />
          <ReletRateStatCard />
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-act"
        eyebrow="3 · Where to act"
        title="What is driving recovery?"
        description="Use cancel and re-let heatmaps, partial re-let proof, and the live open book to decide where ops should act first."
        badge={{ icon: MousePointerClick, label: "Signals" }}
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <InsightsMetricHeatmap metricId="cancellation" eyebrow="Cancel rate" />
          <InsightsMetricHeatmap metricId="relet" eyebrow="Relet rate" />
        </div>
        <PartialReletsInsight />
        <LiveCancellationsPanel />
      </InsightsSection>

      <InsightsSection
        id="insights-growth"
        eyebrow="4 · Growth opportunity"
        title="What happens if we recover more?"
        description="Value still sitting in open cancels: clearing these stays is the fastest ops lever to protect revenue."
        badge={{ icon: TrendingUp, label: "Upside" }}
      >
        <OpsRecoveryOpportunity />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChannelMixCard />
          <CancelVsReletBars />
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-detail"
        eyebrow="5 · Full detail"
        title="Channel breakdown"
        description="Rates, volumes, and forecasts by channel: open when you need the audit view behind the ops story."
        badge={{ icon: FileText, label: "Audit" }}
      >
        <MetricsSummaryTable />
        <div className="grid gap-6 xl:grid-cols-3">
          <CancellationRateByChannel />
          <ReletVolumeVsForecast />
          <AvgReletValueByChannel />
        </div>
      </InsightsSection>
    </div>
  )
}
