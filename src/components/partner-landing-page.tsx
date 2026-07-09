import { useState } from "react"
import {
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
  Sigma,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { ChannelGridTable } from "@/components/sykes/channel-grid-table"
import {
  ChannelBarGroup,
  CollapsibleDataTable,
  MiniBarChart,
  Sparkline,
  VisualCard,
} from "@/components/sykes/sykes-visual-primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_PARTNER_REVENUE,
  FLEXIBLE_CANCELLATION_GRID,
  GROSS_BOOKINGS_TREND,
  MARKET_COMPARISON_METRICS,
  PARTNER_REVENUE,
  PROPOSITION_NOTES,
  TOTAL_PRODUCTS_SUMMARY,
} from "@/lib/sykes-dashboard-data"

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
]

function tileIcon(label: string): LucideIcon {
  return TILE_ICONS.find((entry) => label.includes(entry.match))?.icon ?? Sigma
}

function TileIcon({ label }: { label: string }) {
  const Icon = tileIcon(label)

  return <Icon className="size-4 shrink-0 text-muted-foreground" />
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
            strong ? "bg-foreground/80" : "bg-muted-foreground/50"
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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium tabular-nums",
        tone === "up"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
      )}
    >
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
                  className="h-full rounded-full bg-foreground/75"
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
              tooltip={"note" in driver ? driver.note : undefined}
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
                  className="h-full rounded-full bg-foreground/75"
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
  "Website Conversion*": "*measured as +1% during testing",
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
          title={"note" in driver ? driver.note : undefined}
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
      {MARKET_COMPARISON_METRICS.map((metric) => (
        <div key={metric} className={cn(PANEL, "flex flex-col gap-4 p-5")}>
          <div className="flex items-start justify-between gap-2">
            <TileIcon label={metric} />
            {onOpenInsights ? (
              <button
                type="button"
                onClick={onOpenInsights}
                aria-label={`View ${metric} in insights`}
                className="-m-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowUpRight className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-[13px] leading-snug text-muted-foreground">{metric}</p>
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">—</p>
          </div>
          <p className="mt-auto text-xs text-muted-foreground">Partner vs Market · TBC</p>
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
}: {
  eyebrow: string
  sub?: string
  value?: string
  trend?: string
  children: React.ReactNode
  className?: string
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
      <div className="mt-auto pt-5">{children}</div>
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

const STAYS_CHART_DATA = PARTNER_REVENUE.drivers
  .filter((d) => !("highlight" in d && d.highlight) && !d.label.startsWith("Attachment"))
  .map((d) => ({ label: d.label.split(" ")[0], value: parseNumeric(d.value) }))

function StaysSecondRow({ onOpenInsights }: { onOpenInsights?: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <ChartRowCard
        eyebrow="Revenue Drivers"
        sub="Contribution by driver (£k)"
        value={PARTNER_REVENUE.headline}
        className="xl:col-span-3"
      >
        <MiniBarChart
          data={[...STAYS_CHART_DATA]}
          valueFormatter={(v) => `£${v}k`}
          className="h-36 text-foreground/75"
        />
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
          className="h-36 text-foreground/75"
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
        className="xl:col-span-3"
      >
        <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">Benchmark data TBC</p>
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

const CAL_CHANNEL_COLORS = ["#27272a", "#3f3f46", "#52525b", "#71717a"] as const

const CAL_RATE_CARDS = [
  { label: "FC Guest Price Avg", value: "10%", hint: "Works with dynamic pricing" },
  { label: "Insurance Premium Rate Avg", value: "6.35%", hint: "Works with dynamic pricing" },
  { label: "Out of Test Conversion", value: "1.0%", hint: "Website only · App / Offline / OTA N/A" },
  { label: "Conversion Benefit", value: "1% = £900k", hint: "Out of test conversion value" },
] as const

const CAL_MARGIN_ROWS = [
  {
    label: "FC Partner Margin",
    hint: "Partner margin from flexible cancellation",
  },
  {
    label: "Commission & Booking Fee Benefit",
    hint: "Benefit from incremental cancellations",
  },
] as const

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

/** CAL Flexible Cancellation analytics — channel volume, rates, margin, and full breakdown. */
export function InsightsCalPanel() {
  const bookingsRow = FLEXIBLE_CANCELLATION_GRID[0]
  const channelBars = [
    { label: "Website", value: bookingsRow.website.value, percent: 85 },
    { label: "App", value: bookingsRow.app.value, percent: 62 },
    { label: "Offline", value: bookingsRow.offline.value, percent: 48 },
    { label: "OTA", value: bookingsRow.ota.value, percent: 35 },
  ].map((channel, index) => ({
    ...channel,
    fill: CAL_CHANNEL_COLORS[index] ?? "#71717a",
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className={MONO_LABEL}>Proposition</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Flexible Cancellation
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{PROPOSITION_NOTES.flexibleCancellation}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CAL_RATE_CARDS.map((card) => (
          <div key={card.label} className={cn(PANEL, "flex flex-col gap-2 p-5")}>
            <p className="text-[13px] leading-snug text-muted-foreground">{card.label}</p>
            <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {card.value}
            </p>
            <p className="mt-auto text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <VisualCard
          title="FC Bookings by channel"
          subtitle="Website · App · Offline · OTA · Direct = A+B+C · Total = A+B+C+D"
        >
          <ChannelBarGroup channels={channelBars} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">Direct</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{bookingsRow.direct.value}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{bookingsRow.total.value}</p>
            </div>
          </div>
        </VisualCard>

        <VisualCard title="Attachment & margin" subtitle="Key commercial measures by channel">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">FC Attachment</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Attachment rate across Website, App, Offline, OTA, Direct and Total
              </p>
            </div>
            {CAL_MARGIN_ROWS.map((row) => (
              <div
                key={row.label}
                className="rounded-xl border border-border/70 bg-muted/20 p-4"
              >
                <p className="text-xs font-medium text-foreground">{row.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{row.hint}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Website A", "App B", "Offline C", "OTA D"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold tabular-nums text-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </VisualCard>
      </div>

      <CollapsibleDataTable title="View full channel breakdown" defaultOpen>
        <ChannelGridTable rows={FLEXIBLE_CANCELLATION_GRID} className="border-0 shadow-none" />
      </CollapsibleDataTable>
    </div>
  )
}

/** DDL placeholder until Damage Deposit Waiver analytics are wired the same way. */
export function InsightsDdlPanel() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <BarChart3 className="size-4" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">Damage Deposit Waiver</p>
      <p className="mt-1 text-sm text-muted-foreground">
        DDL channel performance will be available here soon.
      </p>
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
            </div>
            <div className="space-y-1">
              <p className="text-[13px] leading-snug text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">
                {item.value}
              </p>
            </div>
            <p className="mt-auto text-xs text-muted-foreground">Total Products</p>
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

export function PartnerLandingPage({ onOpenInsights }: { onOpenInsights?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("pikl-stays")

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <span className={cn(MONO_LABEL, "block")}>Partner Dashboard</span>
          <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            Howdy, Partner
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s how your Pikl&apos;d Stays performance is tracking.
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
