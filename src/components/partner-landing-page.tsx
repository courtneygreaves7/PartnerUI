import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Ban,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  Clock,
  Coins,
  Download,
  FileText,
  Gauge,
  LifeBuoy,
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
import {
  CollapsibleDataTable,
  MiniBarChart,
  Sparkline,
} from "@/components/sykes/sykes-visual-primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_PARTNER_REVENUE,
  buildContributionToPerformanceGrid,
  DAMAGE_DEPOSIT_WAIVER_GRID,
  FINANCIALS_GRID,
  FLEXIBLE_CANCELLATION_GRID,
  GROSS_BOOKINGS_TREND,
  MARGIN_EARNED_FC_DATA,
  MARKET_COMPARISON_METRICS,
  MARKET_COMPARISON_VALUES,
  PARTNER_REVENUE,
  TOTAL_PRODUCTS_SUMMARY,
} from "@/lib/sykes-dashboard-data"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import type { ActiveFilters } from "@/lib/chart-data"
import { scaleInsightsChannelGrid } from "@/lib/reporting-data"

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

const TOTAL_DRIVER = PARTNER_REVENUE.drivers.find((d) => d.label === "Total")
const REVENUE_TOTAL = TOTAL_DRIVER ? parseNumeric(TOTAL_DRIVER.value) : 1800

const GROSS_BOOKINGS_DRIVER = ADDITIONAL_PARTNER_REVENUE.drivers.find(
  (d) => d.label === "Gross Bookings"
)
const ATTACHMENT_DRIVER = PARTNER_REVENUE.drivers.find((d) =>
  d.label.startsWith("Attachment")
)

const PRODUCT_AVAILABLE_PCT = GROSS_BOOKINGS_DRIVER
  ? parseNumeric(GROSS_BOOKINGS_DRIVER.side)
  : 65
const ATTACHMENT_PCT = ATTACHMENT_DRIVER ? parseNumeric(ATTACHMENT_DRIVER.value) : 14

/**
 * Placeholder benchmark scores (100 = market average) so the market view can be
 * laid out ahead of real data. Clearly flagged as placeholder in the UI.
 */
const MARKET_BENCHMARKS = [
  { metric: MARKET_COMPARISON_METRICS[0], chartLabel: "Cancellation rate", score: 72 },
  { metric: MARKET_COMPARISON_METRICS[1], chartLabel: "Rebook rate", score: 58 },
  { metric: MARKET_COMPARISON_METRICS[2], chartLabel: "Rebook avg value", score: 45 },
  { metric: MARKET_COMPARISON_METRICS[3], chartLabel: "Lead time", score: 68 },
  { metric: MARKET_COMPARISON_METRICS[4], chartLabel: "Length of stay", score: 61 },
] as const

const PIKL_INDEX = Math.round(
  MARKET_BENCHMARKS.reduce((sum, item) => sum + item.score, 0) / MARKET_BENCHMARKS.length
)
const BELOW_MARKET_COUNT = MARKET_BENCHMARKS.filter((item) => item.score < 100).length
const ABOVE_MARKET_COUNT = MARKET_BENCHMARKS.length - BELOW_MARKET_COUNT

const TILE_ICONS: Array<{ match: string; icon: LucideIcon }> = [
  { match: "Attachment", icon: Package },
  { match: "Margin", icon: PiggyBank },
  { match: "Incremental Cancellations", icon: RefreshCcw },
  { match: "Website Conversion", icon: MousePointerClick },
  { match: "% of Bookings that are offered", icon: Percent },
  { match: "offered a Product", icon: Package },
  { match: "Total Bookings", icon: CalendarCheck },
  { match: "Income per Booking", icon: Receipt },
  { match: "Total", icon: Sigma },
  { match: "Gross Bookings", icon: CalendarCheck },
  { match: "Lead Time", icon: Clock },
  { match: "Length of Stay", icon: CalendarRange },
  { match: "Customer Spend", icon: Wallet },
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
  return TILE_ICONS.find((entry) => label.includes(entry.match))?.icon ?? Sigma
}

function TileIcon({ label }: { label: string }) {
  const Icon = tileIcon(label)

  return <Icon className="size-4 shrink-0 text-primary" />
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

function PanelEyebrow({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="space-y-1">
      <p className={MONO_LABEL}>{label}</p>
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
    <div
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/25 p-4"
      title={tooltip}
    >
      <div className="flex items-center justify-between gap-2">
        <TileIcon label={label} />
        {trend ? <MonoPill>{trend}</MonoPill> : null}
      </div>
      <div className="space-y-1">
        <p className="text-[13px] leading-snug text-muted-foreground">{label}</p>
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

function TrendChip({ value, tone = "up" }: { value: string; tone?: "up" | "down" }) {
  const Arrow = tone === "up" ? ArrowUp : ArrowDown

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-medium tabular-nums",
        tone === "up"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      )}
    >
      <Arrow className="size-3 shrink-0" strokeWidth={2.5} />
      {value}
    </span>
  )
}

const REVENUE_MIX = [
  { label: "Margin", value: 900, display: "£900k", opacity: 0.9 },
  { label: "Website", value: 800, display: "£800k", opacity: 0.6 },
  { label: "Incremental", value: 100, display: "£100k", opacity: 0.3 },
] as const

const OFFER_CONVERSION_PCT = Math.round((ATTACHMENT_PCT / PRODUCT_AVAILABLE_PCT) * 100)
const GAP_TO_OFFER = PRODUCT_AVAILABLE_PCT - ATTACHMENT_PCT

function AttachmentGaugeCard() {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const arc = (ATTACHMENT_PCT / PRODUCT_AVAILABLE_PCT) * circumference

  return (
    <div className={cn(PANEL, "flex flex-col items-center")}>
      <p className={MONO_LABEL}>Attachment Rate</p>
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
        {chip ? <TrendChip value={chip} tone={chipTone} /> : null}
      </div>
      <div className="space-y-1">
        <p className="text-[13px] leading-snug text-muted-foreground">{label}</p>
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

const DRIVER_BREAKDOWN = [
  {
    label: "Attachment",
    value: "14%",
    corner: "14%",
    percent: ATTACHMENT_PCT,
    footnote: `${PRODUCT_AVAILABLE_PCT}% product available`,
  },
  {
    label: "Margin (ex. VAT)",
    value: "£900k",
    corner: "50%",
    percent: 50,
    footnote: "Ex. VAT",
  },
  {
    label: "Incremental Cancellations & Relets",
    value: "£100k",
    corner: "6%",
    percent: 6,
    footnote: "6% share",
  },
  {
    label: "Website Conversion",
    value: "£800k p/a",
    corner: "44%",
    percent: 44,
    footnote: "+1% in testing · annualised",
  },
] as const

function PiklStaysTab() {
  const sparkData = GROSS_BOOKINGS_TREND.map((point) => ({ ...point }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr_0.8fr]">
        <div className={cn(PANEL, "flex flex-col")}>
          <p className={MONO_LABEL}>Partner Revenue</p>
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
          <p className={MONO_LABEL}>Revenue Mix by Driver</p>
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
        <KpiStatTile label="Gross Bookings" value="690k" chip="+125k">
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
                <p className="text-[13px] leading-snug text-muted-foreground">{driver.label}</p>
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
          <PanelEyebrow label="Gross Bookings Trend" sub="Monthly volume" />
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <p className="text-5xl font-bold tracking-tight tabular-nums text-foreground">
              {GROSS_BOOKINGS_DRIVER?.value ?? "690k"}
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
          <PanelEyebrow label="Offer Rate" sub="Product availability" />
          <div className="mt-6 space-y-5">
            <ProgressRow
              label="% Product available"
              value={`${PRODUCT_AVAILABLE_PCT}%`}
              percent={PRODUCT_AVAILABLE_PCT}
            />
            <ProgressRow
              label="Attachment (Average)"
              value={ATTACHMENT_DRIVER?.value ?? "14%"}
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
          <MonoPill>All drivers up vs non-FC</MonoPill>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {ADDITIONAL_PARTNER_REVENUE.drivers.map((driver) => (
            <DriverTile
              key={driver.label}
              label={driver.label}
              value={driver.value}
              trend={driver.trend}
              footnote={driver.side}
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
          <PanelEyebrow label="Pikl Index" sub="Weighted average vs market (100)" />
          <p className="mt-5 text-6xl font-bold tracking-tight tabular-nums text-foreground">
            {PIKL_INDEX}
          </p>
          <MonoPill className="mt-3 w-fit">Below market ({PIKL_INDEX - 100})</MonoPill>
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
          <PanelEyebrow label="Index by category" sub="Score out of 100" />
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
                  percent={item.score}
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {MARKET_BENCHMARKS.map((item) => (
            <div
              key={item.metric}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/25 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <TileIcon label={item.metric} />
                <MonoPill>Below market ({item.score - 100})</MonoPill>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] leading-snug text-muted-foreground">{item.metric}</p>
                <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                  {item.score}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
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

function driverAmount(labelIncludes: string): number {
  const driver = PARTNER_REVENUE.drivers.find((d) => d.label.includes(labelIncludes))
  return driver ? parseNumeric(driver.value) : 0
}

const MARGIN_SHARE_PCT = Math.round((driverAmount("Margin") / REVENUE_TOTAL) * 100)
const INCREMENTAL_SHARE_PCT = Math.round(
  (driverAmount("Incremental") / REVENUE_TOTAL) * 100
)

const STAYS_CARD_SUPPORT: Record<string, string> = {
  "Attachment (Average)": `vs ${PRODUCT_AVAILABLE_PCT}% product availability`,
  "Margin (ex. VAT) £m": `${MARGIN_SHARE_PCT}% of total partner revenue`,
  "Incremental Cancellations & Relets": `${INCREMENTAL_SHARE_PCT}% of total partner revenue`,
  "Website Conversion*": "Website conversion uplift",
  Total: PARTNER_REVENUE.headlineNote,
}

function PiklStaysDriverCards({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {PARTNER_REVENUE.drivers.map((driver) => (
        <div key={driver.label} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
          <div className="flex items-start justify-between gap-2">
            <TileIcon label={driver.label} />
            {onOpenInsights ? (
              <button
                type="button"
                onClick={onOpenInsights}
                aria-label={`View ${driver.label} in insights`}
                className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-snug text-muted-foreground">{driver.label}</p>
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {driver.label === "Total" ? PARTNER_REVENUE.headline : driver.value}
            </p>
          </div>
          <p className="mt-auto text-xs text-muted-foreground">
            {STAYS_CARD_SUPPORT[driver.label]}
          </p>
        </div>
      ))}
    </div>
  )
}

function PiklEffectDriverCards({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {ADDITIONAL_PARTNER_REVENUE.drivers.map((driver) => (
        <div
          key={driver.label}
          className={cn(PANEL, "flex flex-col gap-4 p-5")}
        >
          <div className="flex items-start justify-between gap-2">
            <TileIcon label={driver.label} />
            {onOpenInsights ? (
              <button
                type="button"
                onClick={onOpenInsights}
                aria-label={`View ${driver.label} in insights`}
                className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-snug text-muted-foreground">{driver.label}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {driver.value}
              </p>
              <TrendChip value={driver.trend} />
            </div>
          </div>
          <p className="mt-auto text-xs text-muted-foreground">{driver.side}</p>
        </div>
      ))}
    </div>
  )
}

function PiklMarketDriverCards({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
      {MARKET_COMPARISON_VALUES.map((item) => (
        <div key={item.metric} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
          <div className="flex items-start justify-between gap-2">
            <TileIcon label={item.metric} />
            {onOpenInsights ? (
              <button
                type="button"
                onClick={onOpenInsights}
                aria-label={`View ${item.metric} in insights`}
                className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-snug text-muted-foreground">{item.metric}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {item.value}
              </p>
              <TrendChip value={item.trend} tone={item.tone} />
            </div>
          </div>
          <p className="mt-auto text-xs text-muted-foreground">{item.side}</p>
        </div>
      ))}
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
}: {
  eyebrow: string
  sub?: string
  value?: string
  trend?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div className={cn(PANEL, "flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelEyebrow label={eyebrow} sub={sub} />
        {value ? (
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {value}
            </p>
            {trend ? <TrendChip value={trend} /> : null}
          </div>
        ) : null}
      </div>
      <div className={cn("mt-auto pt-5", contentClassName)}>{children}</div>
    </div>
  )
}

const QUICK_ACTIONS: Array<{
  label: string
  description: string
  icon: LucideIcon
  action: "insights" | "none"
}> = [
  { label: "Open insights", description: "Full performance detail", icon: BarChart3, action: "insights" },
  { label: "Export report", description: "Download a snapshot", icon: Download, action: "none" },
  { label: "Schedule report", description: "Set a recurring send", icon: CalendarClock, action: "none" },
  { label: "Get support", description: "Contact the partner team", icon: LifeBuoy, action: "none" },
]

function QuickActionsCard({
  onOpenInsights,
  className,
}: {
  onOpenInsights?: () => void
  className?: string
}) {
  return (
    <div className={cn(PANEL, "flex flex-col", className)}>
      <PanelEyebrow label="Quick Actions" />
      <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
        {QUICK_ACTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action === "insights" ? onOpenInsights : undefined}
            className="group flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-border/50 bg-muted/25 p-4 text-left transition-colors hover:border-border hover:bg-muted/50"
          >
            <div className="flex w-full items-start justify-between gap-2">
              <item.icon className="size-4 shrink-0 text-muted-foreground" />
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const STAYS_DRIVER_BARS = [
  { label: "Incremental", width: "28%", color: "#0054CC", value: "£100k" },
  { label: "Website", width: "72%", color: "#3389FF", value: "£800k" },
  { label: "Margin", width: "100%", color: "#99C4FF", value: "£900k" },
] as const

function StaysSecondRow({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Revenue Drivers"
        sub="Contribution by driver (£k)"
        value={PARTNER_REVENUE.headline}
        className="xl:col-span-3"
        contentClassName="mt-0 flex min-h-0 flex-1 flex-col justify-center py-3"
      >
        <div className="space-y-2.5">
          {STAYS_DRIVER_BARS.map((bar) => (
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
      <QuickActionsCard onOpenInsights={onOpenInsights} className="xl:col-span-2" />
    </div>
  )
}

function EffectSecondRow({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Gross Bookings Trend"
        sub="Monthly volume"
        value={GROSS_BOOKINGS_DRIVER?.value ?? "690k"}
        trend={GROSS_BOOKINGS_DRIVER?.trend ?? "+500"}
        className="xl:col-span-3"
      >
        <Sparkline
          data={GROSS_BOOKINGS_TREND.map((point) => ({ ...point }))}
          valueFormatter={(v) => `${v}k`}
          className="h-36 text-primary/80"
        />
      </ChartRowCard>
      <QuickActionsCard onOpenInsights={onOpenInsights} className="xl:col-span-2" />
    </div>
  )
}

function MarketSecondRow({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Partner vs Market"
        sub="Benchmark by metric"
        value="92"
        trend="-8"
        className="xl:col-span-3"
      >
        <div className="space-y-3 pb-1">
          {MARKET_COMPARISON_VALUES.map((item, index) => {
            const widths = ["72%", "58%", "45%", "68%", "61%"]
            return (
              <div key={item.metric} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{item.metric}</span>
                  <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: widths[index], opacity: 1 - index * 0.12 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </ChartRowCard>
      <QuickActionsCard onOpenInsights={onOpenInsights} className="xl:col-span-2" />
    </div>
  )
}

const INSIGHTS_PRODUCT_TABS = [
  { id: "cal", label: "CAL" },
  { id: "ddl", label: "DDL" },
] as const

export type InsightsProductId = (typeof INSIGHTS_PRODUCT_TABS)[number]["id"]

/** Full-width CAL / DDL product switcher for the Insights page, styled like the Home tabs. */
export function InsightsProductTabs({
  value,
  onChange,
}: {
  value: InsightsProductId
  onChange: (id: InsightsProductId) => void
}) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl bg-muted p-1">
      {INSIGHTS_PRODUCT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            value === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

const CAL_CHANNEL_COLORS = ["#006BFF", "#3389FF", "#66A6FF", "#99C4FF"] as const

const CAL_RATE_CARDS = [
  { label: "FC Guest Price Avg", value: "10%", trend: "+0.4pp", tone: "up" as const },
  { label: "Insurance Premium Rate Avg", value: "6.35%", trend: "-0.2pp", tone: "down" as const },
  { label: "Out of Test Conversion", value: "1.0%", trend: "+0.3pp", tone: "up" as const },
  { label: "Conversion Benefit", value: "1% = £900k", trend: "+£50k", tone: "up" as const },
] as const

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
      className={cn("relative grid size-14 shrink-0 place-items-center", className)}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
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

/** CAL Flexible Cancellation analytics — channel volume, rates, margin, and full breakdown. */
export function InsightsCalPanel() {
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

  return (
    <div className="space-y-6">
      <div>
        <p className={MONO_LABEL}>Product</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Flexible Cancellation
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CAL_RATE_CARDS.map((card) => (
          <div key={card.label} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
            <div className="flex items-start justify-between gap-2">
              <TileIcon label={card.label} />
              <TrendChip value={card.trend} tone={card.tone} />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={MONO_LABEL}>Volume</p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">FC Bookings by channel</h3>
            </div>
            <TrendChip value="+4.2%" tone="up" />
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
                Direct + OTA · 14% of 690k bookings
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
                <span key={channel.label} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
                      <span className="ml-2 text-xs font-medium text-muted-foreground">{share}%</span>
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
              <p className="text-xs text-muted-foreground">FC bookings made · monthly</p>
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
            <h3 className="mt-1 text-sm font-semibold text-foreground">Attachment & margin</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">FC Attachment</p>
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
              <p className="text-xs font-medium text-foreground">FC Partner Margin</p>
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
              <p className="text-xs font-medium text-foreground">Commission & Booking Fee Benefit</p>
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

      <CollapsibleDataTable title="View full channel breakdown" defaultOpen>
        <ChannelGridTable rows={FLEXIBLE_CANCELLATION_GRID} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

const DDL_RATE_CARDS = [
  { label: "DDL Guest Price Avg", value: "£30", trend: "+£2", tone: "up" as const },
  { label: "Insurance Premium Rate Avg", value: "2.12%", trend: "-0.1pp", tone: "down" as const },
  { label: "Out of Test Conversion", value: "0.4%", trend: "+0.1pp", tone: "up" as const },
  { label: "Conversion Benefit", value: "£180k", trend: "+£20k", tone: "up" as const },
] as const

/** DDL Damage Deposit Waiver analytics — same layout as CAL, driven by DDL grid data. */
export function InsightsDdlPanel() {
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

  return (
    <div className="space-y-6">
      <div>
        <p className={MONO_LABEL}>Product</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Damage Deposit Waiver
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DDL_RATE_CARDS.map((card) => (
          <div key={card.label} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
            <div className="flex items-start justify-between gap-2">
              <TileIcon label={card.label} />
              <TrendChip value={card.trend} tone={card.tone} />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={cn(PANEL, "flex flex-col gap-5 p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={MONO_LABEL}>Volume</p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">DDL Bookings by channel</h3>
            </div>
            <TrendChip value="+3.1%" tone="up" />
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
                Direct + OTA · 6.8% attachment overall
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
            <h3 className="mt-1 text-sm font-semibold text-foreground">Attachment & margin</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">DDL Attachment</p>
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
              <p className="text-xs font-medium text-foreground">DDL Partner Margin</p>
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
              <p className="text-xs font-medium text-foreground">Out of Test Conversion Benefit</p>
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

      <CollapsibleDataTable title="View full channel breakdown" defaultOpen>
        <ChannelGridTable rows={DAMAGE_DEPOSIT_WAIVER_GRID} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

function findContributionRow(rows: ReturnType<typeof buildContributionToPerformanceGrid>, label: string) {
  return rows.find((row) => row.label === label)
}

/** Contribution to performance — derived from FC/DDL proposition grids above. */
export function InsightsContributionPanel({ filters }: { filters: ActiveFilters }) {
  const fcGrid = scaleInsightsChannelGrid(FLEXIBLE_CANCELLATION_GRID, filters.brand)
  const ddlGrid = scaleInsightsChannelGrid(DAMAGE_DEPOSIT_WAIVER_GRID, filters.brand)
  const contributionGrid = buildContributionToPerformanceGrid(fcGrid, ddlGrid)
  const financialsGrid = scaleInsightsChannelGrid(FINANCIALS_GRID, filters.brand)

  const cancelVolume = findContributionRow(contributionGrid, "Cancellation Volume")
  const cancelRate = findContributionRow(contributionGrid, "Cancellation Avg %")
  const reletVolume = findContributionRow(contributionGrid, "Relet Volume")
  const leadTravel = findContributionRow(
    contributionGrid,
    "Average Lead time between Booking and Travel"
  )

  const summaryCards = [
    {
      label: "Cancellation volume",
      value: cancelVolume?.total.value ?? "—",
      sub: `Direct ${cancelVolume?.direct.value ?? "—"}`,
    },
    {
      label: "Cancellation avg %",
      value: cancelRate?.total.value ?? "—",
      sub: `FC ${findContributionRow(contributionGrid, "Cancellation % Avg FC")?.total.value ?? "—"}`,
    },
    {
      label: "Relet volume",
      value: reletVolume?.total.value ?? "—",
      sub: `Re-let ${findContributionRow(contributionGrid, "Re-let % Avg")?.total.value ?? "—"}`,
    },
    {
      label: "Avg lead time (booking → travel)",
      value: leadTravel?.total.value ?? "—",
      sub: `FC ${findContributionRow(contributionGrid, "Average Lead time between Booking and Travel FC")?.total.value ?? "—"}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className={MONO_LABEL}>Performance</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Contribution to performance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cancellations, relets, lead times and financials — calculated from the proposition
          metrics above (Direct = Website + App + Offline, Total = Direct + OTA).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={cn(PANEL, "flex flex-col gap-3 p-5")}>
            <TileIcon label={card.label} />
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <CollapsibleDataTable
        title="Cancellations, relets & lead times"
        defaultOpen
      >
        <ChannelGridTable rows={contributionGrid} className="border-0 shadow-none" />
      </CollapsibleDataTable>

      <CollapsibleDataTable title="Financials" defaultOpen={false}>
        <ChannelGridTable rows={financialsGrid} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

/** Top card row for the Insights page — same style as the Home tab cards. */
export function InsightsTopCards() {
  return (
    <div className="@container overflow-x-auto pb-1">
      <div className="flex w-max gap-6">
        {TOTAL_PRODUCTS_SUMMARY.map((item) => (
          <div
            key={item.label}
            className={cn(PANEL, "flex w-[calc((100cqi-6rem)/4.25)] shrink-0 flex-col gap-4 p-5")}
          >
            <div className="flex items-start justify-between gap-2">
              <TileIcon label={item.label} />
              <TrendChip value={item.trend} tone={item.tone} />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
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

function timeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function PartnerLandingPage({ onOpenInsights }: { onOpenInsights?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("pikl-stays")

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <span className={cn(MONO_LABEL, "block")}>Partner Dashboard</span>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {timeOfDayGreeting()}, {PARTNER_BRANDING.userDisplayName}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Review stays performance, product effect, and market benchmarks.
          </p>
        </div>

        {onOpenInsights ? (
          <Button onClick={onOpenInsights} className="h-10 shrink-0 gap-2 px-4">
            <BarChart3 className="size-4" />
            Open insights
          </Button>
        ) : null}
      </header>

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
        /* All tab contents are stacked in the same grid cell so the row height
           always matches the tallest tab, preventing layout shift on switch. */
        <div className="grid">
          {(
            [
              [
                "pikl-stays",
                <>
                  <PiklStaysDriverCards onOpenInsights={onOpenInsights} />
                  <StaysSecondRow onOpenInsights={onOpenInsights} />
                </>,
              ],
              [
                "pikl-effect",
                <>
                  <PiklEffectDriverCards onOpenInsights={onOpenInsights} />
                  <EffectSecondRow onOpenInsights={onOpenInsights} />
                </>,
              ],
              [
                "pikl-market",
                <>
                  <PiklMarketDriverCards onOpenInsights={onOpenInsights} />
                  <MarketSecondRow onOpenInsights={onOpenInsights} />
                </>,
              ],
            ] as Array<[TabId, React.ReactNode]>
          ).map(([tabId, content]) => (
            <div
              key={tabId}
              aria-hidden={activeTab !== tabId}
              className={cn(
                "col-start-1 row-start-1 space-y-6",
                activeTab !== tabId && "invisible"
              )}
            >
              {content}
            </div>
          ))}
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
