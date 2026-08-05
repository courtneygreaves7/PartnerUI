import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Ban,
  BarChart3,
  CalendarCheck,
  CalendarRange,
  ArrowRight,
  FlagTriangleRight,
  Clock,
  Coins,
  FileText,
  Gauge,
  Info,
  MousePointerClick,
  Package,
  Percent,
  PiggyBank,
  Receipt,
  RefreshCcw,
  Shield,
  Sigma,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { ChannelGridTable } from "@/components/sykes/channel-grid-table"
import { CancellationsReletsDashboard } from "@/components/cancellations-releats-dashboard"
import { FcValueLoopExplore } from "@/components/fc-value-loop-explore"
import { DdlValueLoopExplore } from "@/components/ddl-value-loop-explore"
import { OccupancyInsightsDashboard } from "@/components/occupancy-insights-dashboard"
import { PartnerImpactHero } from "@/components/partner-impact-hero"
import { InsightsSection } from "@/components/insights-section"
import {
  CollapsibleDataTable,
  MiniBarChart,
  Sparkline,
} from "@/components/sykes/sykes-visual-primitives"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getMetricHelp, getTrendHelp } from "@/lib/metric-help"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_PARTNER_REVENUE,
  DAMAGE_DEPOSIT_WAIVER_GRID,
  DDL_ATTACHMENT_VALUE_PER_PP,
  DDL_BOOKINGS_BY_DEPARTURE,
  DDL_VALUE_LOOP,
  FC_ATTACHMENT_VALUE_PER_PP,
  FC_BOOKINGS_BY_DEPARTURE,
  FC_VALUE_LOOP,
  FLEXIBLE_CANCELLATION_GRID,
  GROSS_BOOKINGS_TREND,
  MARGIN_EARNED_FC_DATA,
  MARKET_COMPARISON_VALUES,
  PARTNER_REVENUE,
  TOTAL_PRODUCTS_SUMMARY,
  formatAttachmentValuePerPp,
  type AttachmentValueChannel,
} from "@/lib/sykes-dashboard-data"
import {
  PORTFOLIO,
  formatGbp,
  formatPct,
  formatVolume,
  homeMetricsForPeriod,
  type HomePeriodMetrics,
  type ImpactPeriodId,
} from "@/lib/mock-portfolio"
import type { ActiveFilters } from "@/lib/chart-data"

const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
const PANEL = "rounded-2xl border border-border/60 bg-card p-6 shadow-xs"

type TabId = "pikl-stays" | "pikl-effect" | "pikl-market"

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "pikl-stays", label: "Pikl Stays" },
  { id: "pikl-effect", label: "Pikl Effect" },
  { id: "pikl-market", label: "Pikl Market" },
]

function parseNumeric(value: string): number {
  return Number(value.replace(/[^0-9.]/g, "")) || 0
}

const GROSS_BOOKINGS_DRIVER = ADDITIONAL_PARTNER_REVENUE.drivers.find(
  (d) => d.label === "Gross bookings"
)
const ATTACHMENT_DRIVER = PARTNER_REVENUE.drivers.find((d) =>
  d.label.startsWith("Attachment")
)

const PRODUCT_AVAILABLE_PCT = GROSS_BOOKINGS_DRIVER
  ? parseNumeric(GROSS_BOOKINGS_DRIVER.side)
  : Math.round(PORTFOLIO.offerRate * 100)
const ATTACHMENT_PCT = ATTACHMENT_DRIVER
  ? parseNumeric(ATTACHMENT_DRIVER.value)
  : PORTFOLIO.attachmentPct

const REVENUE_TOTAL = PORTFOLIO.generated / 1000

/**
 * Benchmark index scores (100 = market average) derived from partner vs market figures.
 */
const MARKET_BENCHMARKS = MARKET_COMPARISON_VALUES.map((item) => ({
  metric: item.metric,
  chartLabel: item.chartLabel,
  score: Math.round((item.partner / item.market) * 100),
}))

const PIKL_INDEX = Math.round(
  MARKET_BENCHMARKS.reduce((sum, item) => sum + item.score, 0) / MARKET_BENCHMARKS.length
)
const BELOW_MARKET_COUNT = MARKET_BENCHMARKS.filter((item) => item.score < 100).length
const ABOVE_MARKET_COUNT = MARKET_BENCHMARKS.length - BELOW_MARKET_COUNT

const TILE_ICONS: Array<{ match: string; icon: LucideIcon }> = [
  { match: "Attachment", icon: Package },
  { match: "Relet", icon: RefreshCcw },
  { match: "Margin", icon: PiggyBank },
  { match: "Incremental Cancellations & Relets", icon: RefreshCcw },
  { match: "Website Conversion", icon: MousePointerClick },
  { match: "Total bookings offered", icon: Package },
  { match: "Bookings offered product", icon: Package },
  { match: "Bookings offered a product", icon: Percent },
  { match: "Total Bookings", icon: CalendarCheck },
  { match: "Income per Booking", icon: Receipt },
  { match: "Income per booking", icon: Receipt },
  { match: "Total", icon: Sigma },
  { match: "Gross Bookings", icon: CalendarCheck },
  { match: "Lead Time", icon: Clock },
  { match: "Length of Stay", icon: CalendarRange },
  { match: "Spend per Booking", icon: Wallet },
  { match: "IPB", icon: Receipt },
  { match: "Cancellation Rate", icon: Ban },
  { match: "Rebookability Rate", icon: RefreshCcw },
  { match: "Rebookability Average value", icon: Coins },
  { match: "Pikl Index", icon: Gauge },
  { match: "Offer Conversion", icon: MousePointerClick },
  { match: "Guest Price", icon: Receipt },
  { match: "Insurance Premium", icon: Shield },
  { match: "Out of Test Conversion", icon: TrendingUp },
  { match: "Conversion Benefit", icon: Coins },
  { match: "DDL Guest Price", icon: Receipt },
]

function tileIcon(label: string): LucideIcon {
  const lower = label.toLowerCase()
  return TILE_ICONS.find((entry) => lower.includes(entry.match.toLowerCase()))?.icon ?? Sigma
}

function TileIcon({ label }: { label: string }) {
  const Icon = tileIcon(label)

  return <Icon className="size-4 shrink-0 text-primary" />
}

function MeasureHelpButton({
  title,
  helpText,
  className,
  tone = "default",
}: {
  title: string
  helpText?: string
  className?: string
  tone?: "default" | "onPrimary"
  side?: "top" | "bottom" | "left" | "right"
}) {
  const text = helpText ?? getMetricHelp(title)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-md p-1 transition-colors",
            tone === "onPrimary"
              ? "text-primary-foreground/80 hover:bg-white/15 hover:text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            className
          )}
          aria-label={`More information about ${title}`}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-left">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

/** Inline help — sits next to the metric heading/label. */
function MetricHelpActions({
  title,
  helpText,
  tone = "default",
}: {
  title: string
  helpText?: string
  tone?: "default" | "onPrimary"
}) {
  return <MeasureHelpButton title={title} helpText={helpText} tone={tone} />
}

/** Top-right insights link on home metric cards. */
function CardCornerLink({
  title,
  onOpenInsights,
  tone = "default",
}: {
  title: string
  onOpenInsights?: () => void
  tone?: "default" | "onPrimary"
}) {
  if (!onOpenInsights) return null

  return (
    <button
      type="button"
      onClick={onOpenInsights}
      aria-label={`View ${title} in insights`}
      className={cn(
        "absolute top-3 right-3 grid size-7 place-items-center rounded-md transition-colors",
        tone === "onPrimary"
          ? "text-primary-foreground/80 hover:bg-white/15 hover:text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <ArrowUpRight className="size-4" />
    </button>
  )
}

function HeadingWithHelp({
  title,
  helpTitle,
  helpText,
  tone = "default",
  className,
  titleClassName,
}: {
  title: string
  helpTitle?: string
  helpText?: string
  tone?: "default" | "onPrimary"
  className?: string
  titleClassName?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <h3 className={cn("text-sm font-semibold text-foreground", titleClassName)}>{title}</h3>
      <MetricHelpActions title={helpTitle ?? title} helpText={helpText} tone={tone} />
    </div>
  )
}

function LabelWithHelp({
  title,
  helpTitle,
  helpText,
  tone = "default",
  className,
  titleClassName,
}: {
  title: string
  helpTitle?: string
  helpText?: string
  tone?: "default" | "onPrimary"
  className?: string
  titleClassName?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <p className={cn("text-[13px] leading-snug text-muted-foreground", titleClassName)}>
        {title}
      </p>
      <MetricHelpActions title={helpTitle ?? title} helpText={helpText} tone={tone} />
    </div>
  )
}

function MonoPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-medium tabular-nums text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

function PanelEyebrow({
  label,
  sub,
  helpTitle,
  helpText,
}: {
  label: string
  sub?: string
  helpTitle?: string
  helpText?: string
}) {
  const showHelp = Boolean(helpTitle || helpText)
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <p className={MONO_LABEL}>{label}</p>
        {showHelp ? (
          <MetricHelpActions title={helpTitle ?? label} helpText={helpText} />
        ) : null}
      </div>
      {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function ProgressRow({
  label,
  value,
  percent,
  strong = true,
}: {
  label: string
  value: string
  percent: number
  strong?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 text-foreground">{label}</span>
        <span className="shrink-0 font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            strong ? "bg-primary" : "bg-primary/40"
          )}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  )
}

function DriverTile({
  label,
  value,
  trend,
  footnote,
  tooltip,
}: {
  label: string
  value: string
  trend?: string
  footnote?: string
  tooltip?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/25 p-4">
      <div className="flex items-center justify-between gap-2">
        <TileIcon label={label} />
        {trend ? <MonoPill>{trend}</MonoPill> : null}
      </div>
      <div className="space-y-1">
        <LabelWithHelp title={label} helpText={tooltip} />
        <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      </div>
      {footnote ? (
        <p className="mt-auto text-[9px] uppercase tracking-[0.12em] text-muted-foreground/90">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}

function TrendChip({
  value,
  tone = "up",
  label,
  helpText,
}: {
  value: string
  tone?: "up" | "down"
  /** Metric name used to look up trend context. */
  label?: string
  helpText?: string
}) {
  const Arrow = tone === "up" ? ArrowUp : ArrowDown
  const tip = helpText ?? (label ? getTrendHelp(label, value) : null)

  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-medium tabular-nums",
        tip && "cursor-help",
        tone === "up"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      )}
    >
      <Arrow className="size-3 shrink-0" strokeWidth={2.5} />
      {value}
    </span>
  )

  if (!tip) return chip

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${value}: ${tip}`}
        >
          {chip}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-left">
        {tip}
      </TooltipContent>
    </Tooltip>
  )
}

const REVENUE_MIX = [
  {
    label: "Margin",
    value: PORTFOLIO.fcMargin / 1000,
    display: formatGbp(PORTFOLIO.fcMargin, "thousands"),
    opacity: 0.9,
  },
  {
    label: "Website",
    value: PORTFOLIO.conversionUplift / 1000,
    display: formatGbp(PORTFOLIO.conversionUplift, "thousands"),
    opacity: 0.6,
  },
  {
    label: "Incremental",
    value: PORTFOLIO.incrementalTotal / 1000,
    display: formatGbp(PORTFOLIO.incrementalTotal, "thousands"),
    opacity: 0.3,
  },
] as const

const OFFER_CONVERSION_PCT = Math.round((ATTACHMENT_PCT / PRODUCT_AVAILABLE_PCT) * 100)
const GAP_TO_OFFER = PRODUCT_AVAILABLE_PCT - ATTACHMENT_PCT

function AttachmentGaugeCard() {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const arc = (ATTACHMENT_PCT / PRODUCT_AVAILABLE_PCT) * circumference

  return (
    <div className={cn(PANEL, "flex flex-col items-center")}>
      <div className="flex w-full items-center justify-center gap-1.5">
        <p className={MONO_LABEL}>Attachment Rate</p>
        <MetricHelpActions title="Attachment (average)" />
      </div>
      <div className="relative my-auto grid place-items-center py-5">
        <svg viewBox="0 0 112 112" className="size-28 -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="8"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            className="stroke-foreground"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
          />
        </svg>
        <p className="absolute text-2xl font-bold tabular-nums text-foreground">
          {ATTACHMENT_PCT}%
        </p>
      </div>
      <p className="text-sm font-semibold text-foreground">Product Attached</p>
      <p className="mt-1 text-xs text-muted-foreground">vs {PRODUCT_AVAILABLE_PCT}% Availability</p>
    </div>
  )
}

function KpiStatTile({
  label,
  value,
  chip,
  chipTone = "up",
  footnote,
  children,
}: {
  label: string
  value: string
  chip?: string
  chipTone?: "up" | "down"
  footnote?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-5")}>
      <div className="flex items-center justify-between gap-2">
        <TileIcon label={label} />
        {chip ? <TrendChip value={chip} tone={chipTone} label={label} /> : null}
      </div>
      <div className="space-y-1">
        <LabelWithHelp title={label} />
        <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
      </div>
      {children}
      {footnote ? (
        <p className="mt-auto text-[9px] uppercase tracking-[0.12em] text-muted-foreground/90">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}

const MARGIN_SHARE = Math.round((PORTFOLIO.fcMargin / PORTFOLIO.generated) * 100)
const INCREMENTAL_SHARE = Math.round((PORTFOLIO.incrementalTotal / PORTFOLIO.generated) * 100)
const CONVERSION_SHARE = Math.round((PORTFOLIO.conversionUplift / PORTFOLIO.generated) * 100)

const DRIVER_BREAKDOWN = [
  {
    label: "Attachment",
    value: formatPct(PORTFOLIO.attachmentPct, 1),
    corner: formatPct(PORTFOLIO.attachmentPct, 1),
    percent: ATTACHMENT_PCT,
    footnote: `${PRODUCT_AVAILABLE_PCT}% product available`,
  },
  {
    label: "Margin (ex. VAT)",
    value: formatGbp(PORTFOLIO.fcMargin, "thousands"),
    corner: `${MARGIN_SHARE}%`,
    percent: MARGIN_SHARE,
    footnote: "Ex. VAT",
  },
  {
    label: "Incremental cancellations & relets",
    value: formatGbp(PORTFOLIO.incrementalTotal, "thousands"),
    corner: `${INCREMENTAL_SHARE}%`,
    percent: INCREMENTAL_SHARE,
    footnote: `${INCREMENTAL_SHARE}% share`,
  },
  {
    label: "Website conversion",
    value: `${formatGbp(PORTFOLIO.conversionUplift, "thousands")} p/a`,
    corner: `${CONVERSION_SHARE}%`,
    percent: CONVERSION_SHARE,
    footnote: "+1% in testing · annualised",
  },
] as const

function PiklStaysTab() {
  const sparkData = GROSS_BOOKINGS_TREND.map((point) => ({ ...point }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr_0.8fr]">
        <div className={cn(PANEL, "flex flex-col")}>
          <div className="flex items-center gap-1.5">
            <p className={MONO_LABEL}>Partner Revenue</p>
            <MetricHelpActions title="Total" helpText={getMetricHelp("Total")} />
          </div>
          <p className="mt-4 text-5xl font-bold tracking-tight tabular-nums text-foreground">
            {PARTNER_REVENUE.headline}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Net of insurance premium rate + IPT
          </p>
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-border/60 pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Target Pacing</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  +12.4%
                </span>
                <Sparkline
                  data={sparkData}
                  showAxis={false}
                  className="h-5 w-14 text-emerald-600/70"
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Gross Total</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-foreground">£1,800k</p>
            </div>
          </div>
        </div>

        <div className={cn(PANEL, "flex flex-col")}>
          <div className="flex items-center gap-1.5">
            <p className={MONO_LABEL}>Revenue Mix by Driver</p>
            <MetricHelpActions title="Revenue Drivers" />
          </div>
          <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
            {REVENUE_MIX.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {item.display} ({Math.round((item.value / REVENUE_TOTAL) * 100)}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{
                      width: `${(item.value / REVENUE_TOTAL) * 100}%`,
                      opacity: item.opacity,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <AttachmentGaugeCard />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatTile
          label="Gross bookings"
          value={formatVolume(PORTFOLIO.bookings)}
          chip={GROSS_BOOKINGS_DRIVER?.trend ?? "+420"}
        >
          <Sparkline data={sparkData} showAxis={false} className="h-10 text-foreground/60" />
        </KpiStatTile>
        <KpiStatTile
          label="Avg Lead Time"
          value="125 Days"
          chip="+15d"
          footnote="Bench: 110 Non-FC"
        />
        <KpiStatTile label="Pikl Index Score" value={`${PIKL_INDEX} / 100`} chip="-39" chipTone="down">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-rose-600/80"
              style={{ width: `${PIKL_INDEX}%` }}
            />
          </div>
        </KpiStatTile>
        <KpiStatTile
          label="Offer Conversion"
          value={`${OFFER_CONVERSION_PCT}%`}
          chip="+4.2%"
          footnote={`Gap-to-offer: ${GAP_TO_OFFER}pp`}
        />
      </div>

      <div className={PANEL}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Driver Breakdown</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              All revenue drivers · {PARTNER_REVENUE.headline} total
            </p>
          </div>
          <span className={MONO_LABEL}>{DRIVER_BREAKDOWN.length} drivers</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DRIVER_BREAKDOWN.map((driver) => (
            <div
              key={driver.label}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/25 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <TileIcon label={driver.label} />
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {driver.corner}
                </span>
              </div>
              <div className="space-y-1">
                <LabelWithHelp title={driver.label} />
                <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                  {driver.value}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${driver.percent}%` }}
                />
              </div>
              <p className="mt-auto text-[9px] uppercase tracking-[0.12em] text-muted-foreground/90">
                {driver.footnote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PiklEffectTab() {
  const sparkData = GROSS_BOOKINGS_TREND.map((point) => ({ ...point }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(PANEL, "flex flex-col")}>
          <PanelEyebrow label="Gross bookings trend" sub="Monthly volume" helpTitle="Gross bookings trend" />
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <p className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
              {GROSS_BOOKINGS_DRIVER?.value ?? formatVolume(PORTFOLIO.bookings)}
            </p>
            <MonoPill>{GROSS_BOOKINGS_DRIVER?.trend ?? "+500"}</MonoPill>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">vs prior period</p>
          <div className="mt-auto pt-6">
            <Sparkline
              data={sparkData}
              valueFormatter={(v) => `${v}k`}
              className="h-24 text-foreground/80"
            />
          </div>
        </div>

        <div className={cn(PANEL, "flex flex-col")}>
          <PanelEyebrow label="Offer Rate" sub="Product availability" helpTitle="Offer Rate" />
          <div className="mt-6 space-y-5">
            <ProgressRow
              label="% Product available"
              value={`${PRODUCT_AVAILABLE_PCT}%`}
              percent={PRODUCT_AVAILABLE_PCT}
            />
            <ProgressRow
              label="Attachment (average)"
              value={ATTACHMENT_DRIVER?.value ?? formatPct(PORTFOLIO.attachmentPct, 1)}
              percent={ATTACHMENT_PCT}
              strong={false}
            />
          </div>
          <div className="mt-auto pt-6">
            <p className={cn(MONO_LABEL, "mb-2")}>Bookings trend</p>
            <Sparkline
              data={sparkData}
              valueFormatter={(v) => `${v}k`}
              className="h-16 text-foreground/80"
            />
          </div>
        </div>
      </div>

      <div className={PANEL}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Performance Drivers
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Pikl'd Stays effect</p>
          </div>
          <MonoPill>Profile vs without Flexible Cancellation</MonoPill>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {ADDITIONAL_PARTNER_REVENUE.drivers.map((driver) => (
            <DriverTile
              key={driver.label}
              label={driver.label}
              value={driver.value}
              trend={driver.trend}
              footnote={
                driver.versus
                  ? `vs ${driver.versus}`
                  : driver.side ?? undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PiklMarketTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <div className={cn(PANEL, "flex flex-col")}>
          <PanelEyebrow
            label="Pikl Index"
            sub="Weighted average vs market (100)"
            helpTitle="Pikl Index Score"
          />
          <p className="mt-5 text-6xl font-bold tracking-tight tabular-nums text-foreground">
            {PIKL_INDEX}
          </p>
          <MonoPill className="mt-3 w-fit">
            {PIKL_INDEX >= 100
              ? `Above market (+${PIKL_INDEX - 100})`
              : `Below market (${PIKL_INDEX - 100})`}
          </MonoPill>
          <p className="mt-3 text-xs text-muted-foreground">Market avg: 100</p>

          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border/60 pt-5">
            <div>
              <p className="text-xs text-muted-foreground">Below market</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {BELOW_MARKET_COUNT}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Above market</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {ABOVE_MARKET_COUNT}
              </p>
            </div>
          </div>
        </div>

        <div className={PANEL}>
          <PanelEyebrow
            label="Index by category"
            sub="Score out of 100"
            helpTitle="Partner vs Market"
          />
          <MiniBarChart
            data={MARKET_BENCHMARKS.map((item) => ({
              label: item.chartLabel,
              value: item.score,
            }))}
            className="mt-4 h-36 text-foreground/85"
          />
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className={cn(MONO_LABEL, "mb-4")}>Vs market average</p>
            <div className="space-y-4">
              {MARKET_BENCHMARKS.map((item) => (
                <ProgressRow
                  key={item.metric}
                  label={item.metric}
                  value={String(item.score)}
                  percent={Math.min(100, item.score)}
                />
              ))}
            </div>
            <p className="mt-5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground/90">
              100 = market average · placeholder benchmark data
            </p>
          </div>
        </div>
      </div>

      <div className={PANEL}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Benchmark Detail</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Partner vs market by metric</p>
          </div>
          <MonoPill>
            {BELOW_MARKET_COUNT} of {MARKET_BENCHMARKS.length} below market
          </MonoPill>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MARKET_BENCHMARKS.map((item) => {
            const delta = item.score - 100
            const vsMarket = delta >= 0 ? `Above market (+${delta})` : `Below market (${delta})`
            return (
            <div
              key={item.metric}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/25 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <TileIcon label={item.metric} />
                <MonoPill>{vsMarket}</MonoPill>
              </div>
              <div className="space-y-1">
                <LabelWithHelp title={item.metric} />
                <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                  {item.score}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, item.score)}%` }}
                />
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Set to true to restore the full tab visuals (kept intact below). */
const SHOW_TAB_CONTENT = false

const TAB_EMPTY_COPY: Record<TabId, { title: string; description: string }> = {
  "pikl-stays": {
    title: "Pikl Stays",
    description: "Partner revenue and driver breakdowns will be available here soon.",
  },
  "pikl-effect": {
    title: "Pikl Effect",
    description: "Additional partner revenue drivers will be available here soon.",
  },
  "pikl-market": {
    title: "Pikl Market",
    description: "Market comparison benchmarks will be available here soon.",
  },
}

function PiklStaysDriverCards({
  onOpenInsights,
  metrics,
}: {
  onOpenInsights?: () => void
  metrics: HomePeriodMetrics
}) {
  const drivers = [
    {
      label: "Attachment (average)",
      value: metrics.stays.attachmentLabel,
      support: metrics.stays.support.attachment,
    },
    {
      label: "Margin (ex. VAT) £m",
      value: metrics.stays.marginLabel,
      support: metrics.stays.support.margin,
    },
    {
      label: "Incremental cancellations & relets",
      value: metrics.stays.incrementalLabel,
      support: metrics.stays.support.incremental,
    },
    {
      label: "Website conversion*",
      value: metrics.stays.conversionLabel,
      support: metrics.stays.support.conversion,
    },
    {
      label: "Total",
      value: metrics.stays.generatedLabel,
      support: metrics.stays.support.total,
      highlight: true as const,
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {drivers.map((driver) => {
        const highlight = "highlight" in driver && driver.highlight

        return (
          <div
            key={driver.label}
            className={cn(
              PANEL,
              "relative flex flex-col gap-4 p-5",
              highlight &&
                "border-primary/80 bg-gradient-to-br from-primary to-[var(--brand-primary-dark)] text-primary-foreground shadow-sm"
            )}
          >
            <CardCornerLink
              title={driver.label}
              onOpenInsights={onOpenInsights}
              tone={highlight ? "onPrimary" : "default"}
            />
            <div>
              {highlight ? (
                <Sigma className="size-4 shrink-0 text-primary-foreground" />
              ) : (
                <TileIcon label={driver.label} />
              )}
            </div>
            <div className="space-y-1">
              <LabelWithHelp
                title={driver.label}
                tone={highlight ? "onPrimary" : "default"}
                titleClassName={
                  highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }
              />
              <p
                className={cn(
                  "text-xl font-bold tracking-tight tabular-nums",
                  highlight ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {driver.label === "Total" ? metrics.stays.headline : driver.value}
              </p>
            </div>
            <p
              className={cn(
                "mt-auto text-xs",
                highlight ? "text-primary-foreground/75" : "text-muted-foreground"
              )}
            >
              {driver.support}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function PiklEffectDriverCards({
  onOpenInsights,
  metrics,
}: {
  onOpenInsights?: () => void
  metrics: HomePeriodMetrics
}) {
  const drivers = [
    {
      label: "Gross bookings",
      value: metrics.effect.bookingsLabel,
      trend: metrics.effect.bookingsTrend,
      role: "volume" as const,
      side: `Volume base · ${metrics.effect.offerPct}% product available`,
      versus: null as string | null,
    },
    {
      label: "Average lead time",
      value: metrics.effect.leadLabel,
      trend: metrics.effect.leadTrend,
      role: "profile" as const,
      side: null as string | null,
      versus: metrics.effect.leadVersus,
    },
    {
      label: "Average length of stay",
      value: metrics.effect.losLabel,
      trend: metrics.effect.losTrend,
      role: "profile" as const,
      side: null as string | null,
      versus: metrics.effect.losVersus,
    },
    {
      label: "Avg spend per booking",
      value: metrics.effect.spendLabel,
      trend: metrics.effect.spendTrend,
      role: "profile" as const,
      side: null as string | null,
      versus: metrics.effect.spendVersus,
    },
    {
      label: "Average Pikl'd Stay IPB",
      value: metrics.effect.ipbLabel,
      trend: metrics.effect.ipbTrend,
      role: "profile" as const,
      side: null as string | null,
      versus: metrics.effect.ipbVersus,
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {drivers.map((driver) => (
        <div
          key={driver.label}
          className={cn(PANEL, "relative flex flex-col gap-4 p-5")}
        >
          <CardCornerLink title={driver.label} onOpenInsights={onOpenInsights} />
          <div className="flex items-start justify-between gap-2 pr-8">
            <TileIcon label={driver.label} />
            {driver.role === "volume" ? (
              <MonoPill className="mr-0">Volume base</MonoPill>
            ) : null}
          </div>
          <div className="space-y-1">
            <LabelWithHelp title={driver.label} />
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {driver.value}
              </p>
              <TrendChip value={driver.trend} label={driver.label} />
            </div>
          </div>
          <div className="mt-auto space-y-1">
            {driver.versus ? (
              <p className="text-xs font-medium text-foreground/80">
                vs {driver.versus}
              </p>
            ) : null}
            {driver.side ? (
              <p className="text-xs text-muted-foreground">{driver.side}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function PiklMarketDriverCards({
  onOpenInsights,
  metrics,
}: {
  onOpenInsights?: () => void
  metrics: HomePeriodMetrics
}) {
  const score = Math.round(
    (metrics.market.reduce((sum, item) => sum + item.partner / Math.max(item.market, 0.01), 0) /
      metrics.market.length) *
      100
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-[var(--brand-surface)] p-4 dark:bg-muted">
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
          Partner vs market
        </h2>
        <div className="@container overflow-x-auto">
          <div className="flex w-max gap-6">
            {metrics.market.map((item) => (
              <div
                key={item.metric}
                className={cn(
                  PANEL,
                  "relative flex w-[calc((100cqi-6rem)/4.25)] shrink-0 flex-col gap-4 p-5"
                )}
              >
                <CardCornerLink title={item.metric} onOpenInsights={onOpenInsights} />
                <div>
                  <TileIcon label={item.metric} />
                </div>
                <div className="space-y-1">
                  <LabelWithHelp title={item.metric} />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                      {item.value}
                    </p>
                    <TrendChip value={item.trend} tone={item.tone} label={item.metric} />
                  </div>
                </div>
                <p className="mt-auto text-xs text-muted-foreground">{item.side}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChartRowCard
        eyebrow="Partner vs Market"
        sub="Benchmark by metric"
        value={`${score}`}
        trend={`${score >= 100 ? "+" : ""}${score - 100}`}
        onOpenInsights={onOpenInsights}
      >
        <PartnerVsMarketBullets items={metrics.market} />
      </ChartRowCard>
    </div>
  )
}

function ChartRowCard({
  eyebrow,
  sub,
  value,
  trend,
  children,
  className,
  contentClassName,
  helpText,
  onOpenInsights,
}: {
  eyebrow: string
  sub?: string
  value?: string
  trend?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  helpText?: string
  onOpenInsights?: () => void
}) {
  return (
    <div className={cn(PANEL, "relative flex flex-col", className)}>
      <CardCornerLink title={eyebrow} onOpenInsights={onOpenInsights} />
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3",
          onOpenInsights && "pr-8"
        )}
      >
        <PanelEyebrow label={eyebrow} sub={sub} helpTitle={eyebrow} helpText={helpText} />
        {value ? (
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {value}
            </p>
            {trend ? <TrendChip value={trend} label={eyebrow} /> : null}
          </div>
        ) : null}
      </div>
      <div className={cn("mt-auto pt-5", contentClassName)}>{children}</div>
    </div>
  )
}

const STAYS_MARGIN_TREND_ALL = MARGIN_EARNED_FC_DATA.map((point) => ({
  label: point.month,
  value: point.value,
}))

const EFFECT_CHANNEL_ATTACH = (
  [
    { key: "website" as const, label: "Web" },
    { key: "app" as const, label: "App" },
    { key: "offline" as const, label: "Off" },
    { key: "ota" as const, label: "OTA" },
  ] as const
).map(({ key, label }) => ({
  label,
  value: Number(FLEXIBLE_CANCELLATION_GRID[1][key].value.replace(/[^0-9.]/g, "")) || 0,
}))

function slicePeriodTrend(
  data: Array<{ label: string; value: number }>,
  period: ImpactPeriodId,
  monthCount: number
) {
  if (period === "all") return data
  const end = Math.min(6, data.length - 1)
  const start = Math.max(0, end - monthCount + 1)
  return data.slice(start, end + 1)
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function StaysSecondRow({
  onOpenInsights,
  metrics,
}: {
  onOpenInsights?: () => void
  metrics: HomePeriodMetrics
}) {
  const marginTrend = slicePeriodTrend(
    STAYS_MARGIN_TREND_ALL,
    metrics.period,
    metrics.monthCount
  )

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Revenue Drivers"
        sub="Contribution by driver (£k)"
        value={metrics.stays.headline}
        className="xl:col-span-3"
        contentClassName="mt-0 flex min-h-0 flex-1 flex-col justify-center py-3"
        onOpenInsights={onOpenInsights}
      >
        <div className="space-y-2.5">
          {metrics.stays.driverBars.map((bar) => (
            <div key={bar.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="h-3 rounded-full"
                  style={{ width: bar.width, backgroundColor: bar.color }}
                />
                <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                  {bar.value}
                </span>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">{bar.label}</p>
            </div>
          ))}
        </div>
      </ChartRowCard>
      <ChartRowCard
        eyebrow="FC margin by month"
        sub="Partner margin (£k)"
        value={metrics.stays.marginLabel}
        className="xl:col-span-2"
        onOpenInsights={onOpenInsights}
      >
        <Sparkline
          data={marginTrend}
          valueFormatter={(v) => `£${v}k`}
          className="h-36 text-primary/80"
        />
      </ChartRowCard>
    </div>
  )
}

function EffectSecondRow({
  onOpenInsights,
  metrics,
}: {
  onOpenInsights?: () => void
  metrics: HomePeriodMetrics
}) {
  const bookingsTrend = slicePeriodTrend(
    GROSS_BOOKINGS_TREND.map((point) => ({ ...point })),
    metrics.period,
    metrics.monthCount
  )
  const channelAttach = EFFECT_CHANNEL_ATTACH.map((item) => ({
    ...item,
    value: Math.max(
      0,
      round1(item.value + (metrics.stays.attachmentPct - PORTFOLIO.attachmentPct))
    ),
  }))

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Gross bookings trend"
        sub="Monthly volume"
        value={metrics.effect.bookingsLabel}
        trend={metrics.effect.bookingsTrend}
        className="xl:col-span-3"
        onOpenInsights={onOpenInsights}
      >
        <Sparkline
          data={bookingsTrend}
          valueFormatter={(v) => `${v}k`}
          className="h-36 text-primary/80"
        />
      </ChartRowCard>
      <ChartRowCard
        eyebrow="FC attachment by channel"
        sub="Take-up %"
        value={metrics.stays.attachmentLabel}
        className="xl:col-span-2"
        onOpenInsights={onOpenInsights}
      >
        <MiniBarChart
          data={channelAttach}
          valueFormatter={(v) => `${v}%`}
          className="h-36 text-primary/80"
        />
      </ChartRowCard>
    </div>
  )
}

function PartnerVsMarketBullets({
  items,
  fillHeight = false,
}: {
  items: HomePeriodMetrics["market"]
  fillHeight?: boolean
}) {
  return (
    <div className={cn("pb-1", fillHeight && "flex min-h-0 flex-1 flex-col")}>
      <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        <span className="inline-flex items-center justify-end gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          Partner
        </span>
        <span className="w-px" aria-hidden />
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-slate-400" />
          Market
        </span>
      </div>

      <div className={cn(fillHeight && "flex min-h-0 flex-1 flex-col")}>
        {items.map((item) => {
          const max = Math.max(item.partner, item.market, 1)
          const partnerWidth = `${(item.partner / max) * 100}%`
          const marketWidth = `${(item.market / max) * 100}%`

          return (
            <div
              key={item.metric}
              className={cn(
                "border-b border-border/60 py-3 last:border-b-0",
                fillHeight && "flex flex-1 flex-col justify-center"
              )}
            >
              <p className="mb-2 text-xs text-muted-foreground">{item.metric}</p>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="w-[4.25rem] shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    {item.value}
                  </p>
                  <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
                    <div
                      className="ml-auto h-2 rounded-full bg-primary"
                      style={{ width: partnerWidth }}
                    />
                  </div>
                </div>

                <div className="h-5 w-px bg-border" aria-hidden />

                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-2 min-w-0 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-slate-400"
                      style={{ width: marketWidth }}
                    />
                  </div>
                  <p className="w-[4.25rem] shrink-0 text-sm tabular-nums text-muted-foreground">
                    {item.marketLabel}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const INSIGHTS_PRODUCT_TABS = [
  { id: "cal", label: "Flexible Cancellation" },
  { id: "ddl", label: "Damage Waiver" },
  { id: "occupancy", label: "Occupancy" },
  { id: "performance", label: "Cancellations & re-lets" },
] as const

export type InsightsProductId = (typeof INSIGHTS_PRODUCT_TABS)[number]["id"]

/** Full-width product switcher for the Insights page, styled like the Home tabs. */
export function InsightsProductTabs({
  value,
  onChange,
  elevated = false,
}: {
  value: InsightsProductId
  onChange: (id: InsightsProductId) => void
  /** Stronger chrome when the sticky bar sits on the sidebar surface colour. */
  elevated?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded-xl p-1",
        elevated
          ? "bg-[var(--panel-bg)] ring-1 ring-border/50 dark:bg-card"
          : "bg-muted"
      )}
    >
      {INSIGHTS_PRODUCT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "min-w-0 flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors sm:px-4 sm:text-sm",
            value === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : elevated
                ? "text-foreground/70 hover:text-foreground"
                : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

const CAL_CHANNEL_COLORS = [
  "var(--primary)",
  "color-mix(in oklab, var(--primary) 78%, white)",
  "color-mix(in oklab, var(--primary) 55%, white)",
  "color-mix(in oklab, var(--primary) 35%, white)",
] as const

const CAL_RATE_CARDS: Array<{
  label: string
  value: string
  trend: string
  tone: "up" | "down"
  /** Comparison figures only. Explanatory copy belongs in the tooltip. */
  detail?: string
}> = [
  {
    label: "FC guest price avg",
    value: "10%",
    trend: "+0.4pp",
    tone: "up",
  },
  {
    label: "Insurance premium rate avg",
    value: "6.35%",
    trend: "-0.2pp",
    tone: "down",
  },
  {
    label: "Out of test conversion",
    value: "1.0%",
    trend: "+0.3pp",
    tone: "up",
  },
  {
    label: "Conversion benefit",
    value: `1% = ${formatGbp(PORTFOLIO.conversionUplift, "thousands")}`,
    trend: "+£35k",
    tone: "up",
  },
]

function parseDisplayValue(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, "")) || 0
  if (value.includes("k") || value.includes("K")) return numeric * 1000
  return numeric
}

function channelShare(value: string, total: number): number {
  if (!total) return 0
  return Math.round((parseDisplayValue(value) / total) * 100)
}

function AttachmentDonut({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference

  return (
    <div
      className={cn(
        // h-0 + min-h-full: match the text row height without growing it
        "aspect-square h-0 min-h-full w-auto justify-self-end",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="block size-full -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="5"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
    </div>
  )
}

function AttachmentOpportunityCard({
  productLabel,
  channels,
  colors,
}: {
  productLabel: string
  channels: AttachmentValueChannel[]
  colors: readonly string[]
}) {
  const channelOnly = channels.filter((channel) =>
    ["website", "app", "offline", "ota"].includes(channel.key)
  )
  const total = channels.find((channel) => channel.key === "total")
  const maxValue = Math.max(...channelOnly.map((channel) => channel.valuePerPp), 1)

  return (
    <div className={cn(PANEL, "border-primary/25 bg-primary/[0.04] p-5")}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={MONO_LABEL}>Opportunity</p>
          <HeadingWithHelp
            className="mt-1"
            title={`1pp of ${productLabel} attachment is worth`}
            helpTitle="1pp attachment value"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated extra partner margin from a 1 percentage point lift · by channel
          </p>
        </div>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {total ? formatAttachmentValuePerPp(total.valuePerPp) : "—"}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {channelOnly.map((channel, index) => (
          <div
            key={channel.key}
            className="rounded-xl border border-border/60 bg-card px-3 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: colors[index] ?? colors[0] }}
                />
                {channel.label}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {channel.attachmentPct}%
              </span>
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums text-foreground">
              {formatAttachmentValuePerPp(channel.valuePerPp)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(channel.valuePerPp / maxValue) * 100}%`,
                  backgroundColor: colors[index] ?? colors[0],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductValueLoopScorecard({
  loop,
}: {
  loop: typeof FC_VALUE_LOOP | typeof DDL_VALUE_LOOP
}) {
  return (
    <div className={cn(PANEL, "p-5 sm:p-6")}>
      <div className="flex flex-col gap-1">
        <div className="min-w-0">
          <p className={MONO_LABEL}>Max revenue loop</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">{loop.title}</h3>
            <MeasureHelpButton title={loop.title} helpText={loop.story} />
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {loop.story}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 xl:flex xl:flex-row xl:items-stretch">
        {loop.steps.map((step, index) => {
          const isLast = index === loop.steps.length - 1
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
              <MeasureHelpButton title={step.label} helpText={step.help} />
            </div>
            <p className="mt-4 text-[28px] font-bold tracking-tight tabular-nums text-foreground">
              {step.value}
            </p>
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

function FcValueLoopScorecard() {
  return <ProductValueLoopScorecard loop={FC_VALUE_LOOP} />
}

function DdlValueLoopScorecard() {
  return <ProductValueLoopScorecard loop={DDL_VALUE_LOOP} />
}

/** CAL Flexible Cancellation analytics — channel volume, rates, margin, and full breakdown. */
export function InsightsCalPanel({
  onOpenRelets,
  onAskAi,
}: {
  onOpenRelets?: () => void
  onAskAi?: (prompt: string) => void
} = {}) {
  const bookingsRow = FLEXIBLE_CANCELLATION_GRID[0]
  const attachmentRowData = FLEXIBLE_CANCELLATION_GRID[1]
  const marginRow = FLEXIBLE_CANCELLATION_GRID[4]
  const benefitRow = FLEXIBLE_CANCELLATION_GRID[5]

  const bookingChannels = [
    { label: "Website", value: bookingsRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: bookingsRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: bookingsRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: bookingsRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]
  const bookingsTotal = parseDisplayValue(bookingsRow.total.value)
  const bookingsDirect = parseDisplayValue(bookingsRow.direct.value)
  const directShare = channelShare(bookingsRow.direct.value, bookingsTotal)

  const marginChannels = [
    { label: "Website", value: marginRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: marginRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: marginRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: marginRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]
  const marginTotal = parseDisplayValue(marginRow.total.value)

  const benefitChannels = [
    { label: "Website", value: benefitRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: benefitRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: benefitRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: benefitRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]
  const benefitTotal = parseDisplayValue(benefitRow.total.value)

  const fcBookingsTrend = MARGIN_EARNED_FC_DATA.map((point) => ({
    label: point.month,
    value: point.value,
  }))
  const fcBookingsByDeparture = FC_BOOKINGS_BY_DEPARTURE.map((point) => ({
    label: point.month,
    value: point.value,
  }))
  const departureBookingsTotal = FC_BOOKINGS_BY_DEPARTURE.reduce(
    (sum, point) => sum + point.value,
    0
  )

  return (
    <div className="flex flex-col">
      <InsightsSection
        id="insights-health"
        eyebrow="1 · How are we doing?"
        title="Commercial performance"
        description="See whether Flexible Cancellation is priced right, converting guests, and earning margin — plus how much booking volume it is carrying. This is the live commercial health check before you dig into behaviour and ops."
        badge={{ icon: BarChart3, label: "Health check" }}
        showDivider={false}
      >
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {CAL_RATE_CARDS.map((card) => (
            <div key={card.label} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
              <div>
                <TileIcon label={card.label} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
                  <MeasureHelpButton title={card.label} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                    {card.value}
                  </p>
                  <TrendChip value={card.trend} tone={card.tone} label={card.label} />
                </div>
              </div>
              {card.detail ? (
                <p className="mt-auto text-xs text-muted-foreground">{card.detail}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={MONO_LABEL}>Volume</p>
                <HeadingWithHelp className="mt-1" title="FC Bookings by channel" />
              </div>
              <TrendChip value="+4.2%" tone="up" label="FC Bookings by channel" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Direct</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {bookingsRow.direct.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Website + App + Offline · {directShare}% of total
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {bookingsRow.total.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Direct + OTA · {formatPct(PORTFOLIO.attachmentPct, 1)} of{" "}
                  {formatVolume(PORTFOLIO.bookings)} bookings
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {bookingChannels.map((channel) => (
                  <div
                    key={channel.label}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${channelShare(channel.value, bookingsTotal)}%`,
                      backgroundColor: channel.color,
                    }}
                    title={`${channel.label}: ${channel.value}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {bookingChannels.map((channel) => (
                  <span
                    key={channel.label}
                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    {channel.label} {channelShare(channel.value, bookingsTotal)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {bookingChannels.map((channel) => {
                const share = channelShare(channel.value, bookingsTotal)
                return (
                  <div key={channel.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground">{channel.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {channel.value}
                        <span className="ml-2 text-xs font-medium text-muted-foreground">
                          {share}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${share}%`, backgroundColor: channel.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">When FC was purchased · monthly</p>
                <p className="text-xs font-semibold tabular-nums text-foreground">
                  {bookingsDirect.toLocaleString("en-GB")} direct
                </p>
              </div>
              <Sparkline
                data={fcBookingsTrend}
                valueFormatter={(v) => v.toLocaleString("en-GB")}
                className="h-20 text-primary/70"
              />
            </div>
          </div>

          <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
            <div>
              <p className={MONO_LABEL}>Commercial</p>
              <HeadingWithHelp className="mt-1" title="Attachment & margin" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="min-w-0">
                  <LabelWithHelp title="FC Attachment" />
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                    {attachmentRowData.total.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Direct {attachmentRowData.direct.value} · Total {attachmentRowData.total.value}
                  </p>
                </div>
                <AttachmentDonut percent={parseDisplayValue(attachmentRowData.total.value)} />
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <LabelWithHelp title="FC Partner Margin" />
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {marginRow.total.value}
                </p>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {marginChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{
                        width: `${channelShare(channel.value, marginTotal)}%`,
                        backgroundColor: channel.color,
                      }}
                      title={`${channel.label}: ${channel.value}`}
                    />
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {marginChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="rounded-lg border border-border/60 bg-card px-3 py-2"
                    >
                      <p className="text-[11px] text-muted-foreground">{channel.label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                        {channel.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <LabelWithHelp title="Incremental cancellations & relets" />
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {benefitRow.total.value}
                </p>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {benefitChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{
                        width: `${channelShare(channel.value, benefitTotal)}%`,
                        backgroundColor: channel.color,
                      }}
                      title={`${channel.label}: ${channel.value}`}
                    />
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {benefitChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="rounded-lg border border-border/60 bg-card px-3 py-2"
                    >
                      <p className="text-[11px] text-muted-foreground">{channel.label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                        {channel.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-story"
        eyebrow="2 · The story"
        title="How Flexible Cancellation pays"
        description="Flexible Cancellation is not just cover sold. Guests convert onto it, some cancel (that is expected), ops re-lets the stay, and you keep — or even grow — the revenue. Follow that loop to see where money is made or lost."
        badge={{ icon: RefreshCcw, label: "Value loop" }}
      >
        <FcValueLoopScorecard />
      </InsightsSection>

      <InsightsSection
        id="insights-act"
        eyebrow="3 · Where to act"
        title="What is driving the results?"
        description="Use bedrooms, travel dates, and lead time to find where attachment is weak, cancels are high, or relets need work — then act on the shortlist."
        badge={{ icon: MousePointerClick, label: "Signals" }}
      >
        <FcValueLoopExplore onOpenRelets={onOpenRelets} onAskAi={onAskAi} />
      </InsightsSection>

      <InsightsSection
        id="insights-growth"
        eyebrow="4 · Growth opportunity"
        title="What happens if we sell a bit more?"
        description="Value of raising attachment by 1 percentage point, plus when travelling guests booked cover by departure month."
        badge={{ icon: TrendingUp, label: "Upside" }}
      >
        <AttachmentOpportunityCard
          productLabel="Flexible Cancellation"
          channels={FC_ATTACHMENT_VALUE_PER_PP}
          colors={CAL_CHANNEL_COLORS}
        />

        <div className={cn(PANEL, "flex flex-col gap-4 p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={MONO_LABEL}>Timing</p>
              <HeadingWithHelp className="mt-1" title="Departure period booked with FC" />
              <p className="mt-1 text-xs text-muted-foreground">
                When travelling guests booked with Flexible Cancellation · by departure month
              </p>
            </div>
            <p className="text-xs font-semibold tabular-nums text-foreground">
              {departureBookingsTotal.toLocaleString("en-GB")}
            </p>
          </div>
          <Sparkline
            data={fcBookingsByDeparture}
            valueFormatter={(v) => v.toLocaleString("en-GB")}
            className="h-28 text-primary/70"
          />
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-detail"
        eyebrow="5 · Full detail"
        title="Channel breakdown"
        description="Same metrics as above, row by row across Website, App, Offline, OTA, Direct, and Total. Open when you need the audit view."
        badge={{ icon: FileText, label: "Audit" }}
      >
        <CollapsibleDataTable title="View full channel breakdown" defaultOpen={false}>
          <ChannelGridTable rows={FLEXIBLE_CANCELLATION_GRID} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </InsightsSection>
    </div>
  )
}

const DDL_RATE_CARDS: Array<{
  label: string
  value: string
  trend: string
  tone: "up" | "down"
  /** Comparison figures only. Explanatory copy belongs in the tooltip. */
  detail?: string
}> = [
  {
    label: "DDL guest price avg",
    value: "£30",
    trend: "+£2",
    tone: "up",
  },
  {
    label: "Insurance premium rate avg",
    value: "2.12%",
    trend: "-0.1pp",
    tone: "down",
  },
  {
    label: "Out of test conversion",
    value: "0.4%",
    trend: "+0.1pp",
    tone: "up",
  },
  {
    label: "Conversion benefit",
    value: "£180k",
    trend: "+£20k",
    tone: "up",
  },
]

/** DDL Damage Waiver analytics — same story structure as FC Insights. */
export function InsightsDdlPanel({
  onAskAi,
}: {
  onAskAi?: (prompt: string) => void
} = {}) {
  const bookingsRow = DAMAGE_DEPOSIT_WAIVER_GRID[0]
  const attachmentRowData = DAMAGE_DEPOSIT_WAIVER_GRID[1]
  const marginRow = DAMAGE_DEPOSIT_WAIVER_GRID[4]
  const conversionRow = DAMAGE_DEPOSIT_WAIVER_GRID[5]

  const bookingChannels = [
    { label: "Website", value: bookingsRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: bookingsRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: bookingsRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: bookingsRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]
  const bookingsTotal = parseDisplayValue(bookingsRow.total.value)
  const bookingsDirect = parseDisplayValue(bookingsRow.direct.value)
  const directShare = channelShare(bookingsRow.direct.value, bookingsTotal)

  const marginChannels = [
    { label: "Website", value: marginRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: marginRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: marginRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: marginRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]
  const marginTotal = parseDisplayValue(marginRow.total.value)

  const conversionChannels = [
    { label: "Website", value: conversionRow.website.value, color: CAL_CHANNEL_COLORS[0] },
    { label: "App", value: conversionRow.app.value, color: CAL_CHANNEL_COLORS[1] },
    { label: "Offline", value: conversionRow.offline.value, color: CAL_CHANNEL_COLORS[2] },
    { label: "OTA", value: conversionRow.ota.value, color: CAL_CHANNEL_COLORS[3] },
  ]

  const ddlBookingsTrend = MARGIN_EARNED_FC_DATA.map((point) => ({
    label: point.month,
    value: Math.round(point.value * 0.4),
  }))
  const ddlBookingsByDeparture = DDL_BOOKINGS_BY_DEPARTURE.map((point) => ({
    label: point.month,
    value: point.value,
  }))
  const departureBookingsTotal = DDL_BOOKINGS_BY_DEPARTURE.reduce(
    (sum, point) => sum + point.value,
    0
  )

  return (
    <div className="flex flex-col">
      <InsightsSection
        id="insights-health"
        eyebrow="1 · How are we doing?"
        title="Commercial performance"
        description="See whether Damage Waiver is priced right, converting guests, and earning margin — plus how much booking volume it is carrying. This is the live commercial health check before you dig into behaviour and growth."
        badge={{ icon: BarChart3, label: "Health check" }}
        showDivider={false}
      >
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {DDL_RATE_CARDS.map((card) => (
            <div key={card.label} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
              <div>
                <TileIcon label={card.label} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
                  <MeasureHelpButton title={card.label} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                    {card.value}
                  </p>
                  <TrendChip value={card.trend} tone={card.tone} label={card.label} />
                </div>
              </div>
              {card.detail ? (
                <p className="mt-auto text-xs text-muted-foreground">{card.detail}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={MONO_LABEL}>Volume</p>
                <HeadingWithHelp className="mt-1" title="DDL Bookings by channel" />
              </div>
              <TrendChip value="+3.1%" tone="up" label="DDL Bookings by channel" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Direct</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {bookingsRow.direct.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Website + App + Offline · {directShare}% of total
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {bookingsRow.total.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Direct + OTA · {attachmentRowData.total.value} attachment overall
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {bookingChannels.map((channel) => (
                  <div
                    key={channel.label}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${channelShare(channel.value, bookingsTotal)}%`,
                      backgroundColor: channel.color,
                    }}
                    title={`${channel.label}: ${channel.value}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {bookingChannels.map((channel) => (
                  <span
                    key={channel.label}
                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    />
                    {channel.label} {channelShare(channel.value, bookingsTotal)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {bookingChannels.map((channel) => {
                const share = channelShare(channel.value, bookingsTotal)
                return (
                  <div key={channel.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground">{channel.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {channel.value}
                        <span className="ml-2 text-xs font-medium text-muted-foreground">
                          {share}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${share}%`, backgroundColor: channel.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">DDL bookings made · monthly</p>
                <p className="text-xs font-semibold tabular-nums text-foreground">
                  {bookingsDirect.toLocaleString("en-GB")} direct
                </p>
              </div>
              <Sparkline
                data={ddlBookingsTrend}
                valueFormatter={(v) => v.toLocaleString("en-GB")}
                className="h-20 text-primary/70"
              />
            </div>
          </div>

          <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
            <div>
              <p className={MONO_LABEL}>Commercial</p>
              <HeadingWithHelp
                className="mt-1"
                title="Attachment & margin"
                helpTitle="DDL Attachment & margin"
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="min-w-0">
                  <LabelWithHelp title="DDL Attachment" />
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                    {attachmentRowData.total.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Direct {attachmentRowData.direct.value} · Total {attachmentRowData.total.value}
                  </p>
                </div>
                <AttachmentDonut percent={parseDisplayValue(attachmentRowData.total.value)} />
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <LabelWithHelp title="DDL Partner Margin" />
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {marginRow.total.value}
                </p>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {marginChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{
                        width: `${channelShare(channel.value, marginTotal)}%`,
                        backgroundColor: channel.color,
                      }}
                      title={`${channel.label}: ${channel.value}`}
                    />
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {marginChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="rounded-lg border border-border/60 bg-card px-3 py-2"
                    >
                      <p className="text-[11px] text-muted-foreground">{channel.label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                        {channel.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <LabelWithHelp
                  title="Out of test conversion benefit"
                  helpTitle="Out of Test Conversion Benefit"
                />
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {conversionRow.total.value}
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {conversionChannels.map((channel) => (
                    <div
                      key={channel.label}
                      className="rounded-lg border border-border/60 bg-card px-3 py-2"
                    >
                      <p className="text-[11px] text-muted-foreground">{channel.label}</p>
                      <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                        {channel.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-story"
        eyebrow="2 · The story"
        title="How Damage Waiver pays"
        description="Damage Waiver is not just a deposit alternative. Guests convert onto it, you earn partner margin, and stronger take-up on direct channels lifts the book. Follow that loop to see where money is made or left behind."
        badge={{ icon: RefreshCcw, label: "Value loop" }}
      >
        <DdlValueLoopScorecard />
      </InsightsSection>

      <InsightsSection
        id="insights-act"
        eyebrow="3 · Where to act"
        title="What is driving the results?"
        description="Use bedrooms, travel dates, and lead time to find where attachment is weak — then act on the shortlist of channel and segment signals."
        badge={{ icon: MousePointerClick, label: "Signals" }}
      >
        <DdlValueLoopExplore onAskAi={onAskAi} />
      </InsightsSection>

      <InsightsSection
        id="insights-growth"
        eyebrow="4 · Growth opportunity"
        title="What happens if we sell a bit more?"
        description="Value of raising Damage Waiver attachment by 1 percentage point, plus when travelling guests booked the waiver by departure month."
        badge={{ icon: TrendingUp, label: "Upside" }}
      >
        <AttachmentOpportunityCard
          productLabel="Damage Waiver"
          channels={DDL_ATTACHMENT_VALUE_PER_PP}
          colors={CAL_CHANNEL_COLORS}
        />

        <div className={cn(PANEL, "flex flex-col gap-4 p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={MONO_LABEL}>Timing</p>
              <HeadingWithHelp className="mt-1" title="Departure period booked with DDL" />
              <p className="mt-1 text-xs text-muted-foreground">
                When travelling guests booked with Damage Waiver · by departure month
              </p>
            </div>
            <p className="text-xs font-semibold tabular-nums text-foreground">
              {departureBookingsTotal.toLocaleString("en-GB")}
            </p>
          </div>
          <Sparkline
            data={ddlBookingsByDeparture}
            valueFormatter={(v) => v.toLocaleString("en-GB")}
            className="h-28 text-primary/70"
          />
        </div>
      </InsightsSection>

      <InsightsSection
        id="insights-detail"
        eyebrow="5 · Full detail"
        title="Channel breakdown"
        description="Same metrics as above, row by row across Website, App, Offline, OTA, Direct, and Total. Open when you need the audit view."
        badge={{ icon: FileText, label: "Audit" }}
      >
        <CollapsibleDataTable title="View full channel breakdown" defaultOpen={false}>
          <ChannelGridTable rows={DAMAGE_DEPOSIT_WAIVER_GRID} className="border-0 shadow-none" />
        </CollapsibleDataTable>
      </InsightsSection>
    </div>
  )
}

/** Contribution to performance — cancellations & re-lets dashboard. */
export function InsightsContributionPanel({ filters: _filters }: { filters: ActiveFilters }) {
  return <CancellationsReletsDashboard />
}

/** Occupancy — partner vs market by departure week and bedrooms. */
export function InsightsOccupancyPanel() {
  return <OccupancyInsightsDashboard />
}

/** Top card row for the Insights page — same style as the Home tab cards. */
export function InsightsTopCards() {
  return (
    <div id="insights-top-cards" className="scroll-mt-36 rounded-2xl bg-[var(--brand-surface)] p-4 dark:bg-muted">
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        Total products
      </h2>
      <div className="@container overflow-x-auto">
        <div className="flex w-max gap-6">
          {TOTAL_PRODUCTS_SUMMARY.map((item) => (
            <div
              key={item.label}
              className={cn(PANEL, "flex w-[calc((100cqi-6rem)/4.25)] shrink-0 flex-col gap-4 p-5")}
            >
              <div>
                <TileIcon label={item.label} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] leading-snug text-muted-foreground">{item.label}</p>
                  <MeasureHelpButton title={item.label} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                    {item.value}
                  </p>
                  <TrendChip value={item.trend} tone={item.tone} label={item.label} />
                </div>
              </div>
              <p className="mt-auto text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Kept (exported) for reuse if a tab needs to revert to a placeholder.
export function TabEmptyState({ tabId }: { tabId: TabId }) {
  const copy = TAB_EMPTY_COPY[tabId]

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <FileText className="size-4" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">{copy.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
    </div>
  )
}

export function PartnerLandingPage({ onOpenInsights }: { onOpenInsights?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("pikl-stays")
  const [period, setPeriod] = useState<ImpactPeriodId>("ytd")
  const metrics = useMemo(() => homeMetricsForPeriod(period), [period])

  return (
    <div className="space-y-6">
      <PartnerImpactHero
        onOpenInsights={onOpenInsights}
        period={period}
        onPeriodChange={setPeriod}
      />

      <div className="flex w-full items-center gap-1 rounded-xl bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {SHOW_TAB_CONTENT ? (
        <>
          {activeTab === "pikl-stays" ? <PiklStaysTab /> : null}
          {activeTab === "pikl-effect" ? <PiklEffectTab /> : null}
          {activeTab === "pikl-market" ? <PiklMarketTab /> : null}
        </>
      ) : (
        <div className="space-y-6">
          {activeTab === "pikl-stays" ? (
            <>
              <PiklStaysDriverCards onOpenInsights={onOpenInsights} metrics={metrics} />
              <StaysSecondRow onOpenInsights={onOpenInsights} metrics={metrics} />
            </>
          ) : null}
          {activeTab === "pikl-effect" ? (
            <>
              <PiklEffectDriverCards onOpenInsights={onOpenInsights} metrics={metrics} />
              <EffectSecondRow onOpenInsights={onOpenInsights} metrics={metrics} />
            </>
          ) : null}
          {activeTab === "pikl-market" ? (
            <PiklMarketDriverCards onOpenInsights={onOpenInsights} metrics={metrics} />
          ) : null}
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
          © 2026 Pikl Insurance Services Ltd.
        </p>
        {onOpenInsights ? (
          <button
            type="button"
            onClick={onOpenInsights}
            className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Open Insights →
          </button>
        ) : null}
      </footer>
    </div>
  )
}
