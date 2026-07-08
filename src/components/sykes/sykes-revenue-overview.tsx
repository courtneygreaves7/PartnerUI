import type { ReactNode } from "react"
import { TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DualDataListWidget } from "@/components/widgets/dual-data-list-widget"
import { HeadlineDataWidget } from "@/components/widgets/headline-data-widget"
import { cn } from "@/lib/utils"
import {
  ADDITIONAL_PARTNER_REVENUE,
  MARKET_COMPARISON_METRICS,
  PARTNER_REVENUE,
} from "@/lib/sykes-dashboard-data"

function RevenueDriverList({
  title,
  theme,
  children,
}: {
  title: string
  theme: "pink" | "blue" | "green"
  children: ReactNode
}) {
  const themeClass = {
    pink: "border-rose-200 bg-rose-50/70",
    blue: "border-sky-200 bg-sky-50/70",
    green: "border-emerald-200 bg-emerald-50/70",
  }[theme]

  return (
    <Card className={cn("border shadow-xs", themeClass)}>
      <CardHeader className="pb-2 pt-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">{children}</CardContent>
    </Card>
  )
}

function AdditionalRevenueRow({
  label,
  value,
  trend,
  side,
  note,
}: {
  label: string
  value: string
  trend?: string
  side?: string
  note?: string
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/80 p-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{label}</p>
          {side ? <p className="shrink-0 text-xs text-muted-foreground">{side}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
          {trend ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <TrendingUp className="size-3.5" />
              {trend}
            </div>
          ) : null}
        </div>
      </div>
      {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}

export function SykesRevenueOverview() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-3">
        <HeadlineDataWidget
          compact
          title="Pikl'd Stays: Partner Revenue"
          value={PARTNER_REVENUE.headline}
          label={PARTNER_REVENUE.headlineNote}
          className="border-rose-200 bg-rose-50/60"
          valueClassName="text-3xl"
        />
        <RevenueDriverList title="Partner Revenue Drivers:" theme="pink">
          {PARTNER_REVENUE.drivers.map((driver) => {
            const highlight = "highlight" in driver && driver.highlight
            return (
            <div
              key={driver.label}
              className={cn(
                "flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-card/80 px-3 py-2",
                highlight && "border-rose-300 bg-rose-100/60 font-semibold"
              )}
            >
              <div>
                <p className="text-sm text-foreground">{driver.label}</p>
                {"note" in driver && driver.note ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{driver.note}</p>
                ) : null}
              </div>
              <p className="text-sm font-bold tabular-nums text-foreground">{driver.value}</p>
            </div>
            )
          })}
        </RevenueDriverList>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <HeadlineDataWidget
          compact
          title="Pikl'd Stays Effect: Additional Partner Revenue"
          value={ADDITIONAL_PARTNER_REVENUE.headline}
          label="Estimated uplift from Pikl'd Stays"
          className="border-sky-200 bg-sky-50/60"
          valueClassName="text-3xl"
        />
        <RevenueDriverList title="Additional Partner Revenue Drivers" theme="blue">
          {ADDITIONAL_PARTNER_REVENUE.drivers.map((driver) => (
            <AdditionalRevenueRow key={driver.label} {...driver} />
          ))}
        </RevenueDriverList>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <HeadlineDataWidget
          compact
          title="Pikl Index: Market Comparison"
          value="—"
          label="Benchmark against market averages"
          className="border-emerald-200 bg-emerald-50/60"
          valueClassName="text-3xl"
        />
        <DualDataListWidget
          className="border-emerald-200 bg-emerald-50/40"
          title="Partner vs Market"
          rows={MARKET_COMPARISON_METRICS.map((metric) => ({
            label: metric,
            value: "—",
          }))}
        />
      </div>
    </div>
  )
}
