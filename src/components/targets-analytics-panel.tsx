import { useMemo, useState } from "react"
import { ArrowLeftRight, LineChart, Play, TrendingDown, TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { CompareMetricSection } from "@/components/compare/compare-metric-section"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LandingTarget } from "@/lib/landing-targets-data"
import type { MemberTargets } from "@/lib/targets-store"
import {
  buildTargetsCompareSections,
  DEFAULT_TARGETS_COMPARE_COMPARISON,
  DEFAULT_TARGETS_COMPARE_PRIMARY,
  formatTargetsCompareSide,
  getTargetsCompareSummary,
  getTargetsProgressTrend,
  TARGETS_COMPARE_PERIODS,
  TARGETS_COMPARE_SCOPES,
  type TargetsCompareSide,
} from "@/lib/targets-compare-data"
import { cn } from "@/lib/utils"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

type TargetsCompareFilterPanelProps = {
  variant: "primary" | "comparison"
  filters: TargetsCompareSide
  onChange: (filters: TargetsCompareSide) => void
}

function TargetsCompareFilterPanel({
  variant,
  filters,
  onChange,
}: TargetsCompareFilterPanelProps) {
  const isPrimary = variant === "primary"

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              isPrimary ? "bg-compare-primary" : "bg-compare-comparison"
            )}
          />
          <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            {isPrimary ? "Primary" : "Comparison"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Field>
          <Label className="text-[11px] text-muted-foreground">Scope</Label>
          <Select
            value={filters.scope}
            onValueChange={(value) =>
              onChange({ ...filters, scope: value as TargetsCompareSide["scope"] })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGETS_COMPARE_SCOPES.map((scope) => (
                <SelectItem key={scope.id} value={scope.id}>
                  {scope.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Label className="text-[11px] text-muted-foreground">Period</Label>
          <Select
            value={filters.period}
            onValueChange={(value) =>
              onChange({ ...filters, period: value as TargetsCompareSide["period"] })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGETS_COMPARE_PERIODS.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  )
}

function TargetsAchievementTrendChart({
  primary,
  comparison,
}: {
  primary: TargetsCompareSide
  comparison: TargetsCompareSide
}) {
  const chartData = useMemo(() => {
    const primaryTrend = getTargetsProgressTrend(primary.period)
    const comparisonTrend = getTargetsProgressTrend(comparison.period)

    return primaryTrend.map((point, index) => ({
      label: point.label,
      primary: point.value,
      comparison: comparisonTrend[index]?.value ?? 0,
    }))
  }, [primary.period, comparison.period])

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <LineChart className="size-4 text-foreground" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Achievement trend</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Month-on-month progress for the selected primary and comparison periods.
          </p>
        </div>
      </div>

      <div className="mt-5 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={TICK_STYLE}
              dy={4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={TICK_STYLE}
              width={28}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: "11px",
              }}
              formatter={(value) => [`${value}%`, ""]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="primary"
              name={formatTargetsCompareSide(primary)}
              stroke="var(--compare-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="comparison"
              name={formatTargetsCompareSide(comparison)}
              stroke="var(--compare-comparison)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

type TargetsAnalyticsPanelProps = {
  orgTargets: LandingTarget[]
  memberTargets: MemberTargets[]
}

export function TargetsAnalyticsPanel({
  orgTargets,
  memberTargets,
}: TargetsAnalyticsPanelProps) {
  const [primaryDraft, setPrimaryDraft] = useState(DEFAULT_TARGETS_COMPARE_PRIMARY)
  const [comparisonDraft, setComparisonDraft] = useState(DEFAULT_TARGETS_COMPARE_COMPARISON)
  const [primaryApplied, setPrimaryApplied] = useState(primaryDraft)
  const [comparisonApplied, setComparisonApplied] = useState(comparisonDraft)

  const sections = useMemo(
    () =>
      buildTargetsCompareSections(
        primaryApplied,
        comparisonApplied,
        orgTargets,
        memberTargets
      ),
    [primaryApplied, comparisonApplied, orgTargets, memberTargets]
  )

  const summary = useMemo(
    () =>
      getTargetsCompareSummary(
        primaryApplied,
        comparisonApplied,
        orgTargets,
        memberTargets
      ),
    [primaryApplied, comparisonApplied, orgTargets, memberTargets]
  )

  function runComparison() {
    setPrimaryApplied(primaryDraft)
    setComparisonApplied(comparisonDraft)
  }

  function swapSides() {
    setPrimaryDraft(comparisonDraft)
    setComparisonDraft(primaryDraft)
    setPrimaryApplied(comparisonApplied)
    setComparisonApplied(primaryApplied)
  }

  const TrendIcon = summary.delta >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
            <LineChart className="size-4 text-foreground" strokeWidth={2} />
          </div>
          <h2 className="text-base font-semibold text-foreground">Targets analytics</h2>
        </div>
        <p className="max-w-xl text-right text-sm text-muted-foreground">
          Compare organisation and team target achievement across periods.
        </p>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <TargetsCompareFilterPanel
          variant="primary"
          filters={primaryDraft}
          onChange={setPrimaryDraft}
        />

        <div className="flex flex-col items-center justify-center gap-3 px-2 py-4">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            vs
          </span>
          <Button type="button" className="h-9 min-w-40 gap-2 text-xs" onClick={runComparison}>
            <Play className="size-3.5" />
            Run comparison
          </Button>
        </div>

        <TargetsCompareFilterPanel
          variant="comparison"
          filters={comparisonDraft}
          onChange={setComparisonDraft}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          <span className="w-1 shrink-0 rounded-full bg-compare-primary" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Primary
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {formatTargetsCompareSide(primaryApplied)}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {summary.primaryAchievement}%
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums",
              summary.delta >= 0
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            <TrendIcon className="size-3" strokeWidth={2.25} />
            {summary.delta >= 0 ? "+" : ""}
            {summary.delta} pts
          </span>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={swapSides}>
            <ArrowLeftRight className="size-3.5" />
            Swap
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch justify-end gap-3">
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Comparison
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {formatTargetsCompareSide(comparisonApplied)}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {summary.comparisonAchievement}%
            </p>
          </div>
          <span className="w-1 shrink-0 rounded-full bg-compare-comparison" />
        </div>
      </div>

      <TargetsAchievementTrendChart primary={primaryApplied} comparison={comparisonApplied} />

      <div className="space-y-6">
        {sections.map((section) => (
          <CompareMetricSection
            key={section.title}
            section={section}
            exportSlug={`targets-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          />
        ))}
      </div>
    </div>
  )
}
