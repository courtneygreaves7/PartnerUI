import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"

import { Sparkline } from "@/components/sykes/sykes-visual-primitives"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import {
  IMPACT_PERIODS,
  impactForPeriod,
  formatGbp,
  type ImpactPeriodId,
} from "@/lib/mock-portfolio"
import { PARTNER_IMPACT_HERO, SYKES_MONTHS } from "@/lib/sykes-dashboard-data"
import { cn } from "@/lib/utils"

const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

/** Seasonal share of annual value (sums ≈ 1). */
const MONTH_SHARES = [0.07, 0.07, 0.08, 0.08, 0.08, 0.09, 0.1, 0.11, 0.09, 0.08, 0.07, 0.08]

const PERIOD_MONTH_COUNT: Record<ImpactPeriodId, number> = {
  mtd: 1,
  qtd: 3,
  ytd: 7,
  all: 12,
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function refreshedLabel() {
  const now = new Date()
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  const through = now
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    })
    .replace(",", "")
  return `Refreshed today at ${time} · ${through}`
}

function monthsInPeriod(period: ImpactPeriodId) {
  const count = PERIOD_MONTH_COUNT[period]
  const end = 6
  const start = Math.max(0, end - count + 1)
  if (period === "all") {
    return SYKES_MONTHS.map((label, index) => ({ label, share: MONTH_SHARES[index] ?? 0.08 }))
  }
  return SYKES_MONTHS.slice(start, end + 1).map((label, i) => ({
    label,
    share: MONTH_SHARES[start + i] ?? 0.08,
  }))
}

function buildGeneratedSeries(period: ImpactPeriodId, generated: number) {
  const months = monthsInPeriod(period)
  const shareSum = months.reduce((sum, m) => sum + m.share, 0) || 1
  return months.map((m) => ({
    label: m.label,
    value: Math.round((generated * m.share) / shareSum),
  }))
}

/** Cumulative £ left on the table without +1pp attachment, through the period. */
function buildMissedCumulativeSeries(period: ImpactPeriodId, periodMissed: number) {
  const months = monthsInPeriod(period)
  const shareSum = months.reduce((sum, m) => sum + m.share, 0) || 1
  let running = 0
  return months.map((m) => {
    running += Math.round((periodMissed * m.share) / shareSum)
    return { label: m.label, value: running }
  })
}

type PartnerImpactHeroProps = {
  onOpenInsights?: () => void
  className?: string
  period?: ImpactPeriodId
  onPeriodChange?: (period: ImpactPeriodId) => void
}

export function PartnerImpactHero({
  onOpenInsights,
  className,
  period: periodProp,
  onPeriodChange,
}: PartnerImpactHeroProps) {
  const [uncontrolledPeriod, setUncontrolledPeriod] = useState<ImpactPeriodId>("ytd")
  const period = periodProp ?? uncontrolledPeriod
  const setPeriod = (next: ImpactPeriodId) => {
    onPeriodChange?.(next)
    if (periodProp === undefined) setUncontrolledPeriod(next)
  }
  const impact = impactForPeriod(period)
  /** Pro-rata of annual +1pp value for the selected period — what was left behind. */
  const periodMissed = Math.round(impact.available * impact.weight)

  const breakdown = [
    { label: "Margin", value: formatGbp(impact.margin, "thousands") },
    { label: "Conversion", value: formatGbp(impact.conversion, "thousands") },
    { label: "Re-let", value: formatGbp(impact.incremental, "thousands") },
  ] as const

  const generatedSeries = useMemo(
    () => buildGeneratedSeries(period, impact.generated),
    [period, impact.generated]
  )
  const missedSeries = useMemo(
    () => buildMissedCumulativeSeries(period, periodMissed),
    [period, periodMissed]
  )

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,_rgb(var(--primary-rgb)_/_0.14),_transparent_65%)]"
        />
        <div className="relative z-10 grid gap-6 px-6 py-7 sm:px-10 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-8">
          <div className="flex flex-col items-start justify-center text-left">
            <span
              className={cn(
                MONO_LABEL,
                "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-2.5 py-1 shadow-xs backdrop-blur-sm"
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Partner Dashboard
            </span>
            <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              {timeOfDayGreeting()}, {PARTNER_BRANDING.userDisplayName}
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Stays performance, product effect, and market benchmarks — pick a lens,
              then see what you have already made and what is still open.
            </p>

            <div className="mt-4 flex w-fit flex-col gap-2.5">
              <div
                role="tablist"
                aria-label="Impact period"
                className="flex flex-wrap justify-start gap-1.5"
              >
                {IMPACT_PERIODS.map((item) => {
                  const active = item.id === period
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPeriod(item.id)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-border/70 bg-card/80 text-muted-foreground backdrop-blur-sm hover:border-border hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <div className="w-0 min-w-full rounded-full border border-dashed border-emerald-500/45 bg-emerald-500/[0.06] px-3 py-1.5 dark:bg-emerald-500/10">
                <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                    Live
                  </span>
                  <span
                    aria-hidden
                    className="h-3 w-px shrink-0 bg-border/70"
                  />
                  <span className="min-w-0 truncate text-[11px] leading-snug text-muted-foreground">
                    {refreshedLabel()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:items-stretch">
            <div className="relative flex min-h-0 flex-col gap-3 rounded-xl border border-border/60 bg-[var(--panel-bg)] p-4">
              <div className="absolute right-3 top-3">
                <WidgetHelpButton
                  title="Your impact"
                  helpText={`${PARTNER_IMPACT_HERO.generatedHint}. Chart shows how that value landed across months in the selected period. Breakdown: ${breakdown
                    .map((item) => `${item.label} ${item.value}`)
                    .join(", ")}.`}
                />
              </div>
              <div className="min-w-0 pr-7">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                  Secured
                </span>
                <p className={cn(MONO_LABEL, "mt-2")}>{PARTNER_IMPACT_HERO.generatedLabel}</p>
                <p className="mt-2 text-[26px] font-bold tracking-tight tabular-nums text-primary sm:text-[28px]">
                  {formatGbp(impact.generated, "exact")}
                </p>
                <p className="mt-1 min-h-[2.75rem] text-[11px] leading-snug text-muted-foreground">
                  Margin, conversion uplift, and re-let benefit
                  <span className="mt-1 block text-[10px] font-medium text-primary/80">
                    {breakdown.map((item) => `${item.label} ${item.value}`).join(" · ")}
                  </span>
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/60 px-2 pt-1.5 pb-0.5">
                <p className="px-1 text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Value earned by month
                </p>
                <Sparkline
                  data={generatedSeries}
                  className="h-20 text-primary"
                  valueFormatter={(v) => formatGbp(v, "exact")}
                />
              </div>

              <div className="mt-auto flex min-h-9 items-center">
                {onOpenInsights ? (
                  <button
                    type="button"
                    onClick={onOpenInsights}
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-primary/15"
                  >
                    Explore secured value
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary/70"
                  >
                    Secured this period
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex min-h-0 flex-col gap-3 rounded-xl border border-amber-500/25 bg-card p-4">
              <div className="absolute right-3 top-3">
                <WidgetHelpButton
                  title="Still on the table"
                  helpText={`${PARTNER_IMPACT_HERO.availableHint}. The sparkline shows how that missed margin would have built up month by month in the selected period.`}
                />
              </div>
              <div className="min-w-0 pr-7">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-amber-800 uppercase dark:text-amber-300">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                  </span>
                  At risk
                </span>
                <p className={cn(MONO_LABEL, "mt-2")}>{PARTNER_IMPACT_HERO.availableLabel}</p>
                <p className="mt-2 text-[26px] font-bold tracking-tight tabular-nums text-amber-700 sm:text-[28px] dark:text-amber-400">
                  {formatGbp(periodMissed, "exact")}
                </p>
                <p className="mt-1 min-h-[2.75rem] text-[11px] leading-snug text-muted-foreground">
                  Margin left behind without{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="cursor-help border-b border-dotted border-amber-700/50 font-medium text-amber-800 dark:border-amber-400/50 dark:text-amber-300"
                      >
                        +1pp
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-56">
                      1 percentage point (1pp) — for example attachment rising from 12.5% to
                      13.5%.
                    </TooltipContent>
                  </Tooltip>{" "}
                  attachment
                  <span className="mt-1 block text-[10px] font-medium text-amber-800/80 dark:text-amber-300/80">
                    {period !== "all"
                      ? `${formatGbp(impact.available, "exact")} full-year if the gap stays open`
                      : "Opportunity still open across the book"}
                  </span>
                </p>
              </div>

              <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-2 pt-1.5 pb-0.5 dark:bg-amber-500/10">
                <p className="px-1 text-[9px] font-medium uppercase tracking-[0.12em] text-amber-800/70 dark:text-amber-300/70">
                  Cumulative left on the table
                </p>
                <Sparkline
                  data={missedSeries}
                  className="h-20 text-amber-600 dark:text-amber-400"
                  valueFormatter={(v) => formatGbp(v, "exact")}
                />
              </div>

              <div className="mt-auto flex min-h-9 items-center">
                {onOpenInsights ? (
                  <button
                    type="button"
                    onClick={onOpenInsights}
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-900 transition-colors hover:border-amber-600/60 hover:bg-amber-500/15 dark:text-amber-200"
                  >
                    See where to capture this
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-[11px] font-semibold text-amber-800/70 dark:text-amber-300/70"
                  >
                    Capture with attachment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
