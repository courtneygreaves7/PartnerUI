import { useState } from "react"
import {
  Download,
  FileBarChart,
  FileText,
  LineChart,
  Play,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
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
import { TeamMemberAvatar } from "@/components/team-member-list-item"
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
import { useToast } from "@/components/ui/toast"
import {
  getTargetAchievementPercent,
  type LandingTarget,
} from "@/lib/landing-targets-data"
import { TEAM_MEMBERS } from "@/lib/team-data"
import type { MemberTargets } from "@/lib/targets-store"
import {
  buildTargetsReportCompareSections,
  DEFAULT_TARGETS_REPORT_CONFIG,
  formatTargetsReportComparisonLabel,
  formatTargetsReportMemberLabel,
  formatTargetsReportPeriod,
  formatTargetsReportPrimaryCompareLabel,
  formatTargetsReportScopeLabel,
  formatTargetsReportTitle,
  getDefaultComparisonMemberId,
  getTargetsReportAchievement,
  getTargetsReportComparisonDelta,
  getTargetsReportComparisonTrend,
  getTargetsReportMemberAssignments,
  getTargetsReportOrgTargets,
  isMemberToMemberComparison,
  TARGETS_REPORT_RANGES,
  TARGETS_REPORT_SCOPES,
  TARGETS_REPORT_YEARS,
  type TargetsReportComparison,
  type TargetsReportComparisonMode,
  type TargetsReportConfig,
  type TargetsReportRange,
} from "@/lib/targets-report-data"
import { cn } from "@/lib/utils"

const TICK_STYLE = { fontSize: 11, fill: "var(--color-muted-foreground)" }

function ReportScopeCard({
  selected,
  onSelect,
  label,
  description,
}: {
  selected: boolean
  onSelect: () => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-foreground/20 bg-muted/20 ring-1 ring-foreground/10"
          : "border-border bg-muted/10 hover:bg-muted/25"
      )}
    >
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
    </button>
  )
}

function ReportRangeToggle({
  value,
  onChange,
}: {
  value: TargetsReportRange
  onChange: (value: TargetsReportRange) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-muted/30 p-1">
      {TARGETS_REPORT_RANGES.map((range) => (
        <button
          key={range.id}
          type="button"
          onClick={() => onChange(range.id)}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
            value === range.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}

function ReportPreviewVisual({
  config,
  achievement,
  comparisonAchievement,
  orgTargets,
  memberAssignments,
}: {
  config: TargetsReportConfig
  achievement: number
  comparisonAchievement?: number
  orgTargets: LandingTarget[]
  memberAssignments: ReturnType<typeof getTargetsReportMemberAssignments>
}) {
  const member = TEAM_MEMBERS.find((entry) => entry.id === config.memberId)

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-muted/40 via-card to-muted/25 p-5">
      <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-foreground/[0.03]" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full bg-foreground/[0.04]" />

      <div className="relative mx-auto w-full max-w-[15rem]">
        <div className="rounded-lg border border-border bg-background shadow-md">
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
              <FileBarChart className="size-4 text-foreground" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-foreground">Targets report</p>
              <p className="truncate text-[9px] text-muted-foreground">
                {config.compareEnabled
                  ? isMemberToMemberComparison(config)
                    ? `${formatTargetsReportMemberLabel(config.memberId)} vs ${formatTargetsReportMemberLabel(config.comparison.memberId)}`
                    : `${formatTargetsReportPeriod(config)} vs ${formatTargetsReportPeriod(config.comparison)}`
                  : formatTargetsReportPeriod(config)}
              </p>
            </div>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
              {config.format}
            </span>
          </div>

          <div className="space-y-2.5 p-3">
            {config.scope === "organisation" ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-medium text-foreground">Organisation</span>
                  <span className="text-[9px] font-bold tabular-nums text-foreground">
                    {achievement}%
                    {config.compareEnabled && comparisonAchievement !== undefined
                      ? ` vs ${comparisonAchievement}%`
                      : null}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${achievement}%` }}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {orgTargets.slice(0, 3).map((target) => (
                    <div key={target.id} className="flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/40"
                          style={{
                            width: `${getTargetAchievementPercent(target.actual, target.target)}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-[7px] tabular-nums text-muted-foreground">
                        {getTargetAchievementPercent(target.actual, target.target)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {config.scope === "team" ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-medium text-foreground">Team targets</span>
                  <span className="text-[9px] font-bold tabular-nums text-foreground">
                    {achievement}%
                  </span>
                </div>
                <div className="mt-2 flex items-end justify-center gap-1">
                  {[42, 68, 55, 80, 61].map((height, index) => (
                    <div
                      key={index}
                      className="w-2.5 rounded-sm bg-foreground/25"
                      style={{ height: `${height * 0.22}px` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {config.scope === "member" && member ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex items-center gap-2">
                  <TeamMemberAvatar initials={member.initials} online={member.online} className="scale-75" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-medium text-foreground">{member.name}</p>
                    <p className="text-[8px] text-muted-foreground">{member.role}</p>
                  </div>
                  <span className="text-[9px] font-bold tabular-nums text-foreground">
                    {achievement}%
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {memberAssignments.slice(0, 2).map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/40"
                          style={{
                            width: `${getTargetAchievementPercent(assignment.actual, assignment.target)}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-[7px] tabular-nums text-muted-foreground">
                        {getTargetAchievementPercent(assignment.actual, assignment.target)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportComparisonModeToggle({
  value,
  onChange,
}: {
  value: TargetsReportComparisonMode
  onChange: (value: TargetsReportComparisonMode) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/30 p-1">
      <button
        type="button"
        onClick={() => onChange("period")}
        className={cn(
          "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
          value === "period"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Another period
      </button>
      <button
        type="button"
        onClick={() => onChange("member")}
        className={cn(
          "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
          value === "member"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Another member
      </button>
    </div>
  )
}

function ReportComparisonSummary({
  config,
  summary,
}: {
  config: TargetsReportConfig
  summary: ReturnType<typeof getTargetsReportComparisonDelta>
}) {
  const TrendIcon = summary.delta >= 0 ? TrendingUp : TrendingDown
  const memberComparison = isMemberToMemberComparison(config)

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/10 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {memberComparison ? "Primary member" : "Current period"}
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{summary.primary}%</p>
        <p className="text-xs text-muted-foreground">
          {formatTargetsReportPrimaryCompareLabel(config)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 sm:px-2">
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
        <span className="text-[10px] text-muted-foreground">vs</span>
      </div>

      <div className="sm:text-right">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          {memberComparison ? "Comparison member" : "Comparison period"}
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{summary.comparison}%</p>
        <p className="text-xs text-muted-foreground">
          {formatTargetsReportComparisonLabel(config)}
        </p>
      </div>
    </div>
  )
}

function ReportComparisonTrendChart({
  config,
  orgTargets,
  memberTargets,
}: {
  config: TargetsReportConfig
  orgTargets: LandingTarget[]
  memberTargets: MemberTargets[]
}) {
  const chartData = getTargetsReportComparisonTrend(config, orgTargets, memberTargets)
  const memberComparison = isMemberToMemberComparison(config)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <LineChart className="size-4 text-foreground" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Achievement trend</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {memberComparison
              ? `${formatTargetsReportMemberLabel(config.memberId)} compared with ${formatTargetsReportMemberLabel(config.comparison.memberId)} for ${formatTargetsReportPeriod(config).toLowerCase()}.`
              : `${formatTargetsReportPeriod(config)} compared with ${formatTargetsReportPeriod(config.comparison).toLowerCase()}.`}
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
              name={formatTargetsReportPrimaryCompareLabel(config)}
              stroke="var(--compare-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="comparison"
              name={formatTargetsReportComparisonLabel(config)}
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

function defaultComparisonFor(
  config: Pick<TargetsReportConfig, "range" | "year" | "memberId" | "comparison">
): TargetsReportComparison {
  return {
    mode: config.comparison.mode,
    range: config.range,
    year: Math.max(TARGETS_REPORT_YEARS[0], config.year - 1),
    memberId: getDefaultComparisonMemberId(config.memberId),
  }
}

type TargetsReportPanelProps = {
  orgTargets: LandingTarget[]
  memberTargets: MemberTargets[]
}

export function TargetsReportPanel({
  orgTargets,
  memberTargets,
}: TargetsReportPanelProps) {
  const { toast } = useToast()
  const [draft, setDraft] = useState<TargetsReportConfig>(DEFAULT_TARGETS_REPORT_CONFIG)
  const [generatedConfig, setGeneratedConfig] = useState<TargetsReportConfig | null>(null)

  const draftAchievement = getTargetsReportAchievement(draft, orgTargets, memberTargets)
  const draftComparison = draft.compareEnabled
    ? getTargetsReportComparisonDelta(draft, orgTargets, memberTargets)
    : null

  function updateDraft<K extends keyof TargetsReportConfig>(key: K, value: TargetsReportConfig[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value }

      if (key === "range" || key === "year") {
        if (next.compareEnabled && next.comparison.range === current.range && next.comparison.year === current.comparison.year) {
          next.comparison = defaultComparisonFor(next)
        }
      }

      return next
    })
  }

  function updateComparison(updates: Partial<TargetsReportComparison>) {
    setDraft((current) => ({
      ...current,
      comparison: { ...current.comparison, ...updates },
    }))
  }

  function handleGenerate() {
    if (draft.scope === "member" && !draft.memberId) return
    if (
      draft.compareEnabled &&
      isMemberToMemberComparison(draft) &&
      draft.comparison.memberId === draft.memberId
    ) {
      return
    }

    setGeneratedConfig({ ...draft })
    toast({
      title: "Targets report generated",
      description: `${formatTargetsReportTitle(draft)} · ${draft.format.toUpperCase()}`,
    })
  }

  const generatedAchievement = generatedConfig
    ? getTargetsReportAchievement(generatedConfig, orgTargets, memberTargets)
    : 0
  const generatedComparison = generatedConfig?.compareEnabled
    ? getTargetsReportComparisonDelta(generatedConfig, orgTargets, memberTargets)
    : null
  const generatedOrgTargets = generatedConfig
    ? getTargetsReportOrgTargets(generatedConfig, orgTargets)
    : []
  const generatedMemberAssignments = generatedConfig
    ? getTargetsReportMemberAssignments(generatedConfig, memberTargets)
    : []
  const generatedCompareSections = generatedConfig
    ? buildTargetsReportCompareSections(generatedConfig, orgTargets, memberTargets)
    : []

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-start">
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
            <FileText className="size-4 text-foreground" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">Generate targets report</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a report type and period. Turn on comparison to include trend and metric charts.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <Field>
            <Label className="text-[11px] text-muted-foreground">Report type</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {TARGETS_REPORT_SCOPES.map((scope) => (
                <ReportScopeCard
                  key={scope.id}
                  selected={draft.scope === scope.id}
                  onSelect={() => updateDraft("scope", scope.id)}
                  label={scope.label}
                  description={scope.description}
                />
              ))}
            </div>
          </Field>

          {draft.scope === "member" ? (
            <Field>
              <Label className="text-[11px] text-muted-foreground">Team member</Label>
              <Select
                value={draft.memberId}
                onValueChange={(value) => {
                  setDraft((current) => {
                    const next = { ...current, memberId: value }
                    if (next.comparison.memberId === value) {
                      next.comparison = {
                        ...next.comparison,
                        memberId: getDefaultComparisonMemberId(value),
                      }
                    }
                    return next
                  })
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <Field>
            <Label className="text-[11px] text-muted-foreground">Period</Label>
            <ReportRangeToggle
              value={draft.range}
              onChange={(value) => updateDraft("range", value)}
            />
          </Field>

          <Field>
            <Label className="text-[11px] text-muted-foreground">Year</Label>
            <Select
              value={String(draft.year)}
              onValueChange={(value) => updateDraft("year", Number.parseInt(value, 10))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGETS_REPORT_YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <button
            type="button"
            onClick={() =>
              updateDraft("compareEnabled", !draft.compareEnabled)
            }
            className={cn(
              "w-full rounded-lg border p-3 text-left transition-colors",
              draft.compareEnabled
                ? "border-foreground/20 bg-muted/20 ring-1 ring-foreground/10"
                : "border-border bg-muted/10 hover:bg-muted/25"
            )}
          >
            <p className="text-xs font-medium text-foreground">
              {draft.scope === "member" ? "Include comparison" : "Include period comparison"}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {draft.scope === "member"
                ? "Compare another period or another team member in the report."
                : "Adds achievement trend and side-by-side metric charts to the report."}
            </p>
          </button>

          {draft.compareEnabled ? (
            <div className="space-y-4 rounded-lg border border-border/70 bg-muted/10 p-4">
              <p className="text-[11px] font-medium text-muted-foreground">Compare to</p>

              {draft.scope === "member" ? (
                <ReportComparisonModeToggle
                  value={draft.comparison.mode}
                  onChange={(mode) => updateComparison({ mode })}
                />
              ) : null}

              {draft.scope === "member" && draft.comparison.mode === "member" ? (
                <Field>
                  <Label className="text-[11px] text-muted-foreground">Comparison member</Label>
                  <Select
                    value={draft.comparison.memberId}
                    onValueChange={(value) => updateComparison({ memberId: value })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.filter((member) => member.id !== draft.memberId).map(
                        (member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <>
                  <ReportRangeToggle
                    value={draft.comparison.range}
                    onChange={(value) => updateComparison({ range: value })}
                  />
                  <Select
                    value={String(draft.comparison.year)}
                    onValueChange={(value) =>
                      updateComparison({ year: Number.parseInt(value, 10) })
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGETS_REPORT_YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          ) : null}

          <Field>
            <Label className="text-[11px] text-muted-foreground">Report format</Label>
            <Select
              value={draft.format}
              onValueChange={(value) => updateDraft("format", value as TargetsReportConfig["format"])}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF summary</SelectItem>
                <SelectItem value="xlsx">Excel workbook</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5 text-xs text-muted-foreground">
            {formatTargetsReportScopeLabel(draft)} · {formatTargetsReportPeriod(draft)}
            {draft.compareEnabled && draftComparison
              ? ` vs ${formatTargetsReportComparisonLabel(draft)} (${draftComparison.primary}% vs ${draftComparison.comparison}%)`
              : ` · ${draftAchievement}% achievement`}
          </div>

          <Button
            type="button"
            className="h-9 w-full gap-2 text-xs"
            onClick={handleGenerate}
            disabled={
              (draft.scope === "member" && !draft.memberId) ||
              (draft.compareEnabled &&
                isMemberToMemberComparison(draft) &&
                draft.comparison.memberId === draft.memberId)
            }
          >
            <Play className="size-3.5" />
            Generate report
          </Button>
        </div>
      </section>

      <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
            <FileBarChart className="size-4 text-foreground" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Report preview</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {generatedConfig
                ? generatedConfig.compareEnabled
                  ? `Comparison report · ${formatTargetsReportPrimaryCompareLabel(generatedConfig)} vs ${formatTargetsReportComparisonLabel(generatedConfig)}`
                  : formatTargetsReportTitle(generatedConfig)
                : "Generate a report to preview the export."}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {generatedConfig ? (
            <div className="space-y-5">
              <ReportPreviewVisual
                config={generatedConfig}
                achievement={generatedAchievement}
                comparisonAchievement={generatedComparison?.comparison}
                orgTargets={generatedOrgTargets}
                memberAssignments={generatedMemberAssignments}
              />

              {generatedConfig.compareEnabled && generatedComparison ? (
                <ReportComparisonSummary
                  config={generatedConfig}
                  summary={generatedComparison}
                />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Achievement</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                      {generatedAchievement}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Period</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {formatTargetsReportPeriod(generatedConfig)}
                    </p>
                  </div>
                </div>
              )}

              {!generatedConfig.compareEnabled && generatedConfig.scope === "organisation" ? (
                <ul className="space-y-2 border-t border-border pt-4">
                  {generatedOrgTargets.map((target) => (
                    <li
                      key={target.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-foreground">{target.label}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {getTargetAchievementPercent(target.actual, target.target)}% of goal
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {!generatedConfig.compareEnabled && generatedConfig.scope === "member" ? (
                <ul className="space-y-2 border-t border-border pt-4">
                  {generatedMemberAssignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-foreground">{assignment.label}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {getTargetAchievementPercent(assignment.actual, assignment.target)}% of goal
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {generatedConfig.compareEnabled ? (
                <div className="space-y-6 border-t border-border pt-5">
                  <ReportComparisonTrendChart
                    config={generatedConfig}
                    orgTargets={orgTargets}
                    memberTargets={memberTargets}
                  />
                  {generatedCompareSections.map((section) => (
                    <CompareMetricSection
                      key={section.title}
                      section={section}
                      exportSlug={`targets-report-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-4 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/30">
                <FileBarChart className="size-5 text-muted-foreground" strokeWidth={2} />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">No report generated yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Configure the report on the left, then generate to preview. Enable comparison for
                period-over-period charts.
              </p>
            </div>
          )}
        </div>

        {generatedConfig ? (
          <div className="border-t border-border bg-muted/10 p-5">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-background/70 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                <FileText className="size-3.5 text-foreground" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">Report ready to download</p>
                <p className="text-[10px] text-muted-foreground">
                  {generatedConfig.compareEnabled
                    ? `${formatTargetsReportPrimaryCompareLabel(generatedConfig)} vs ${formatTargetsReportComparisonLabel(generatedConfig)}`
                    : formatTargetsReportTitle(generatedConfig)}{" "}
                  · {generatedConfig.format.toUpperCase()}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
