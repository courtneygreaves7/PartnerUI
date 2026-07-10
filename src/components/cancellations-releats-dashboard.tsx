import { useState } from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCcw,
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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  CANCEL_RATE,
  CANCEL_RATE_FC,
  CANCEL_VOLUME,
  CANCEL_VOLUME_FC,
  CHANNEL_META,
  CHANNEL_MIX,
  CHANNEL_MIX_DIRECT_SHARE,
  CONTENT_METRIC_ROWS,
  KPI_CARDS,
  RELET_RATE,
  RELET_RATE_STAT,
  RELET_VALUE_AVG,
  RELET_VOLUME,
  RELET_VOLUME_FC,
  SERIES_COLORS,
  TARGET_CARDS,
  VOLUME_TREND,
  WEEKLY_CANCEL_RELET,
  deltaVsForecast,
  formatCurrency,
  formatMetricValue,
  formatPercent,
  formatVolume,
} from "@/lib/cancellations-releats-data"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

const TICK = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function KpiIcon({ icon, className }: { icon: (typeof KPI_CARDS)[number]["icon"]; className?: string }) {
  if (icon === "alert") return <AlertCircle className={className} />
  if (icon === "down") return <TrendingDown className={className} />
  if (icon === "refresh") return <RefreshCcw className={className} />
  return <TrendingUp className={className} />
}

function AccentKpiCards() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_CARDS.map((card) => {
        const tone = card.delta.startsWith("-") ? "down" : "up"
        const Arrow = tone === "up" ? ArrowUpRight : ArrowDownRight
        return (
          <div key={card.id} className={cn(PANEL, "flex flex-col gap-4")}>
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10">
                <KpiIcon icon={card.icon} className="size-4 text-primary" />
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-medium tabular-nums",
                  tone === "up"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                )}
              >
                <Arrow className="size-3 shrink-0" strokeWidth={2.5} />
                {card.delta.replace(/ vs .+$/, "")}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {card.value}
              </p>
            </div>
            <p className="mt-auto text-xs text-muted-foreground">{card.detail}</p>
          </div>
        )
      })}
    </div>
  )
}

function TargetProgressCards() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {TARGET_CARDS.map((card) => {
        const max = Math.max(card.actual, card.target) * 1.08
        const actualPct = (card.actual / max) * 100
        const targetPct = (card.target / max) * 100
        return (
          <div key={card.id} className={cn(PANEL, "flex flex-col gap-4")}>
            <div className="flex items-start justify-between gap-3">
              <p className={MONO_LABEL}>{card.label}</p>
              <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
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
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
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
        <h3 className="text-sm font-semibold text-foreground">6-month volume trend</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cancellations vs re-lets — Feb–Jul 2026
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
            <Tooltip
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Metrics summary</h3>
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
                      FC
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
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Channel mix distribution</h3>
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Cancellation vs re-let</h3>
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
  return (
    <div className={cn(PANEL, "flex flex-col gap-5")}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <TrendingUp className="size-5" />
        </span>
        <div className="text-right">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <ArrowUpRight className="size-3.5" />
            {RELET_RATE_STAT.delta}
          </p>
          <p className="text-xs text-muted-foreground">{RELET_RATE_STAT.deltaLabel}</p>
        </div>
      </div>
      <div>
        <p className={MONO_LABEL}>{RELET_RATE_STAT.label}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {RELET_RATE_STAT.value}
          </span>
          <span className="text-sm text-muted-foreground">{RELET_RATE_STAT.unit}</span>
        </p>
      </div>
      <div className="mt-auto flex h-12 items-end gap-1.5">
        {RELET_RATE_STAT.bars.map((height, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-t-md",
              index < 3 ? "bg-primary/35" : "bg-primary"
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function CancellationRateByChannel() {
  return (
    <div className={PANEL}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Cancellation rate by channel</h3>
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
              <p className="text-[11px] text-muted-foreground">FC: {formatPercent(forecast)}</p>
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Re-let volume vs forecast</h3>
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
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: 12,
              }}
            />
            <Bar dataKey="forecast" name="Forecast" fill="#99C4FF" radius={[0, 4, 4, 0]} barSize={10} />
            <Bar dataKey="actual" name="Actual" fill="#006BFF" radius={[0, 4, 4, 0]} barSize={10} />
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
        <h3 className="text-sm font-semibold text-foreground">Avg re-let value</h3>
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

function round1(n: number) {
  return Math.round(n * 10) / 10
}

export function CancellationsReletsDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <p className={MONO_LABEL}>Performance</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Cancellations &amp; re-lets
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Channel breakdown for Jul 2026.
        </p>
      </div>

      <AccentKpiCards />
      <TargetProgressCards />

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <VolumeTrendChart />
        <ReletRateStatCard />
      </div>

      <MetricsSummaryTable />

      <div className="grid gap-8 lg:grid-cols-2">
        <ChannelMixCard />
        <CancelVsReletBars />
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        <CancellationRateByChannel />
        <ReletVolumeVsForecast />
        <AvgReletValueByChannel />
      </div>
    </div>
  )
}
