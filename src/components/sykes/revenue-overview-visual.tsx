import type { ReactNode } from "react"
import { useId } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import {
  ChannelBarGroup,
  KpiTile,
  ProgressMetricRow,
  TrendPill,
  VisualCard,
} from "@/components/sykes/sykes-visual-primitives"
import { MetricTrendWidget } from "@/components/widgets/metric-trend-widget"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_PARTNER_REVENUE,
  MARKET_COMPARISON_METRICS,
  PARTNER_REVENUE,
} from "@/lib/sykes-dashboard-data"

const REVENUE_SPLIT = [
  { name: "Margin (ex. VAT)", value: 900, color: "#006b6b" },
  { name: "Website conversion", value: 800, color: "#e87722" },
  { name: "Incremental canx & relets", value: 100, color: "#7c3aed" },
]

const CHANNEL_COLORS = {
  website: "#006b6b",
  app: "#2563eb",
  offline: "#e87722",
  ota: "#7c3aed",
}

function RevenueDonutCard() {
  const gradientId = useId()

  return (
    <VisualCard
      title="Pikl'd Stays: Partner Revenue"
      subtitle={PARTNER_REVENUE.headlineNote}
      className="border-rose-100 bg-gradient-to-br from-rose-50/80 to-card xl:col-span-2"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
            {PARTNER_REVENUE.headline}
          </p>
          <div className="mt-5 space-y-3">
            {PARTNER_REVENUE.drivers
              .filter((d) => !("highlight" in d && d.highlight))
              .map((driver) => (
                <div key={driver.label} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{driver.label}</p>
                    {"note" in driver && driver.note ? (
                      <p className="text-xs text-muted-foreground">{driver.note}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums">{driver.value}</p>
                </div>
              ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-100/50 px-3 py-2">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-bold tabular-nums">£1,800k</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006b6b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#004d4d" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <Pie
                data={REVENUE_SPLIT}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
              >
                {REVENUE_SPLIT.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? `url(#${gradientId})` : entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {REVENUE_SPLIT.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold tabular-nums text-foreground">£{item.value}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualCard>
  )
}

function AttachmentGaugeCard() {
  return (
    <VisualCard
      title="Product attachment"
      subtitle="Average across all bookings"
      className="border-violet-100 bg-gradient-to-br from-violet-50/70 to-card"
    >
      <div className="flex flex-col items-center py-2">
        <div className="relative grid size-32 place-items-center">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-muted)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${14 * 3.01} ${(100 - 14) * 3.01}`}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold tabular-nums">14%</p>
            <p className="text-[10px] text-muted-foreground">Attachment</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          65% of bookings offered a product
        </p>
      </div>
    </VisualCard>
  )
}

function additionalDriverHint(
  driver: (typeof ADDITIONAL_PARTNER_REVENUE.drivers)[number]
) {
  if ("side" in driver) return driver.side
  if ("note" in driver) return driver.note
  return undefined
}

export function RevenueOverviewVisual() {
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <RevenueDonutCard />
        <AttachmentGaugeCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADDITIONAL_PARTNER_REVENUE.drivers.map((driver) => (
          <KpiTile
            key={driver.label}
            label={driver.label}
            value={driver.value}
            hint={additionalDriverHint(driver)}
            trend={driver.trend ? { value: driver.trend, direction: "up" } : undefined}
            className="bg-gradient-to-br from-sky-50/60 to-card"
          />
        ))}
        <KpiTile
          label="Additional partner revenue"
          value={ADDITIONAL_PARTNER_REVENUE.headline}
          hint="Pikl'd Stays effect — estimated uplift"
          className="border-sky-200 bg-gradient-to-br from-sky-50/80 to-card md:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricTrendWidget
          insightLayout
          title="Gross bookings trend"
          value="690k"
          trendLabel="+500"
          trend="up"
          comparisonLabel="vs prior period"
          scopeLabel="65% product availability"
          rateLabel="Bookings with product offered"
          chartData={[
            { label: "Jan", value: 520 },
            { label: "Feb", value: 545 },
            { label: "Mar", value: 580 },
            { label: "Apr", value: 610 },
            { label: "May", value: 640 },
            { label: "Jun", value: 690 },
          ]}
          className="h-auto"
        />

        <VisualCard
          title="Pikl Index: Market comparison"
          subtitle="Partner vs market benchmarks"
          className="border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-card"
        >
          <div className="space-y-4">
            {MARKET_COMPARISON_METRICS.map((metric, index) => (
              <ProgressMetricRow
                key={metric}
                label={metric}
                value="—"
                percent={[72, 58, 45, 68, 61][index] ?? 50}
                tone={index % 2 === 0 ? "brand" : "accent"}
              />
            ))}
            <p className="text-xs text-muted-foreground">
              Benchmark data pending — bars show relative index placeholders.
            </p>
          </div>
        </VisualCard>
      </div>
    </div>
  )
}

export function TotalProductsVisual() {
  const offeredPercent = 65

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total bookings", value: "690k", trend: "+5%" },
          { label: "Offered a product", value: "65%", trend: undefined },
          { label: "Bookings offered", value: "448,500", trend: undefined },
          { label: "Total margin earned", value: "800k", trend: "+8%" },
          { label: "Income per booking", value: "4.01", trend: "+2%" },
        ].map((item) => (
          <KpiTile
            key={item.label}
            label={item.label}
            value={item.value}
            trend={item.trend ? { value: item.trend, direction: "up" } : undefined}
          />
        ))}
      </div>

      <VisualCard title="Product offer funnel" subtitle="From total bookings to margin earned">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">690k</p>
            <p className="mt-1 text-xs text-muted-foreground">Total bookings</p>
          </div>
          <TrendPill value={`${offeredPercent}%`} trend="up" />
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">448,500</p>
            <p className="mt-1 text-xs text-muted-foreground">Offered a product</p>
          </div>
          <span className="hidden text-muted-foreground lg:block">→</span>
          <div className="rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-[var(--brand-primary)]">800k</p>
            <p className="mt-1 text-xs text-muted-foreground">Margin earned</p>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]"
            style={{ width: `${offeredPercent}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {offeredPercent}% of bookings are offered a Pikl product · £4.01 income per booking achieved
        </p>
      </VisualCard>
    </div>
  )
}

export function PropositionVisualSection({
  title,
  subtitle,
  accentClass,
  channelBars,
  rateCards,
  table,
}: {
  title: string
  subtitle?: string
  accentClass: string
  channelBars: { label: string; value: string }[]
  rateCards: Array<{ label: string; value: string; tone?: string }>
  table: ReactNode
}) {
  const bars = channelBars.map((channel, index) => ({
    ...channel,
    fill: Object.values(CHANNEL_COLORS)[index] ?? "#006b6b",
    percent: [85, 62, 48, 35][index] ?? 40,
  }))

  return (
    <div className="space-y-4">
      <VisualCard title={title} subtitle={subtitle} className={accentClass}>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Volume by channel
            </p>
            <ChannelBarGroup channels={bars} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rateCards.map((card) => (
              <div
                key={card.label}
                className={cn(
                  "rounded-xl border border-border/70 p-4",
                  card.tone ?? "bg-muted/20"
                )}
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </VisualCard>
      {table}
    </div>
  )
}
