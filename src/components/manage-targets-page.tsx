import { useId, useMemo, useState, type ReactNode } from "react"
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Download,
  FileBarChart,
  FileText,
  Handshake,
  Percent,
  Play,
  Plus,
  PoundSterling,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import {
  memberMatchesSearch,
  TeamMemberListItem,
} from "@/components/team-member-list-item"
import { TargetsAnalyticsPanel } from "@/components/targets-analytics-panel"
import {
  getTargetAchievementPercent,
  getOverallTargetAchievement,
  formatTargetGoal,
  formatTargetValue,
  LANDING_TARGET_PROGRESS_CHART,
  TARGET_METRIC_TRENDS,
  type LandingTarget,
  type TargetProgressPoint,
} from "@/lib/landing-targets-data"
import { TEAM_MEMBERS, TEAM_STATUS_LABELS, type TeamMember } from "@/lib/team-data"
import {
  getMemberTargets,
  getOrgTargets,
  saveMemberTargets,
  saveOrgTargets,
  type MemberTargetAssignment,
  type MemberTargets,
} from "@/lib/targets-store"
import { cn } from "@/lib/utils"

type ManageTargetsPageProps = {
  onBack: () => void
  onTabChange?: (tab: string) => void
}

const TICK_STYLE = { fontSize: 9, fill: "var(--color-muted-foreground)" }

const TARGET_TABS = [
  { id: "organisation", label: "Organisation targets" },
  { id: "team", label: "Team targets" },
  { id: "analytics", label: "Analytics" },
  { id: "report", label: "Report" },
] as const

const tabTriggerClass =
  "flex-1 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"

const ORG_TARGET_META: Record<
  string,
  { icon: LucideIcon; visual: "pace-area" | "arc" | "compare-bars" | "steps" }
> = {
  bookings: { icon: CalendarCheck, visual: "pace-area" },
  "cal-takeup": { icon: Percent, visual: "arc" },
  revenue: { icon: PoundSterling, visual: "compare-bars" },
  "new-partners": { icon: Handshake, visual: "steps" },
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const startX = cx + radius * Math.cos(startAngle)
  const startY = cy - radius * Math.sin(startAngle)
  const endX = cx + radius * Math.cos(endAngle)
  const endY = cy - radius * Math.sin(endAngle)
  const largeArc = startAngle - endAngle > Math.PI ? 1 : 0
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
}

function TargetMiniArc({ percent }: { percent: number }) {
  const radius = 52
  const cx = 80
  const cy = 68
  const clamped = Math.min(100, Math.max(0, percent))
  const startAngle = Math.PI
  const endAngle = 0
  const filledAngle = startAngle - (clamped / 100) * Math.PI
  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle)
  const fillPath = describeArc(cx, cy, radius, startAngle, filledAngle)

  return (
    <div className="relative mx-auto h-20 w-full max-w-[10.5rem]">
      <svg viewBox="0 0 160 78" className="h-full w-full" aria-hidden>
        <path
          d={trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-muted"
        />
        <path
          d={fillPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-foreground"
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p className="text-lg font-bold tabular-nums text-foreground">{clamped}%</p>
        <p className="text-[9px] text-muted-foreground">of goal</p>
      </div>
    </div>
  )
}

function TargetPaceAreaChart({ targetId }: { targetId: string }) {
  const gradientId = `target-pace-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const data = TARGET_METRIC_TRENDS[targetId] ?? TARGET_METRIC_TRENDS.bookings

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={TICK_STYLE}
            interval={0}
            dy={2}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--foreground)"
            strokeWidth={1.75}
            strokeOpacity={0.55}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function TargetCompareBars({ actual, target }: { actual: number; target: number }) {
  const actualPct = target > 0 ? Math.min(100, (actual / target) * 100) : 0

  return (
    <div className="flex h-20 items-end justify-center gap-8">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-14 w-9 items-end rounded-md bg-muted/50 p-0.5">
          <div
            className="w-full rounded-sm bg-foreground/80 transition-[height]"
            style={{ height: `${actualPct}%` }}
          />
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">Actual</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-14 w-9 items-end rounded-md bg-muted/50 p-0.5">
          <div className="h-full w-full rounded-sm bg-foreground/20" />
        </div>
        <span className="text-[9px] font-medium text-muted-foreground">Goal</span>
      </div>
    </div>
  )
}

function TargetStepTrack({ actual, target }: { actual: number; target: number }) {
  const steps = Math.max(1, Math.min(8, Math.ceil(target)))
  const filled = Math.min(steps, Math.max(0, Math.round(actual)))

  return (
    <div className="flex h-20 items-center justify-center gap-2 px-2">
      {Array.from({ length: steps }, (_, index) => (
        <div
          key={index}
          className={cn(
            "h-11 min-w-0 flex-1 max-w-14 rounded-lg border transition-colors",
            index < filled
              ? "border-foreground/15 bg-foreground/75 shadow-xs"
              : "border-border bg-muted/35"
          )}
        />
      ))}
    </div>
  )
}

function TargetMetricVisual({
  target,
  percent,
}: {
  target: LandingTarget
  percent: number
}) {
  const meta = ORG_TARGET_META[target.id] ?? ORG_TARGET_META.bookings

  if (meta.visual === "arc") {
    return <TargetMiniArc percent={percent} />
  }

  if (meta.visual === "compare-bars") {
    return <TargetCompareBars actual={target.actual} target={target.target} />
  }

  if (meta.visual === "steps") {
    return <TargetStepTrack actual={target.actual} target={target.target} />
  }

  return <TargetPaceAreaChart targetId={target.id} />
}

function getMemberAchievementPercent(assignments: MemberTargetAssignment[]) {
  if (assignments.length === 0) return 0
  const sum = assignments.reduce(
    (acc, assignment) =>
      acc + getTargetAchievementPercent(assignment.actual, assignment.target),
    0
  )
  return Math.round(sum / assignments.length)
}

function TeamStatusBadge({ status }: { status: TeamMember["status"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "completed" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "in_progress" && "bg-muted text-muted-foreground",
        status === "in_review" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        status === "blocked" && "bg-red-500/10 text-red-700 dark:text-red-400"
      )}
    >
      {TEAM_STATUS_LABELS[status]}
    </span>
  )
}

function TargetProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-foreground transition-[width]"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function OrganisationTargetCard({
  target,
  onTargetChange,
}: {
  target: LandingTarget
  onTargetChange: (value: number) => void
}) {
  const percent = getTargetAchievementPercent(target.actual, target.target)
  const meta = ORG_TARGET_META[target.id] ?? ORG_TARGET_META.bookings
  const Icon = meta.icon

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <Icon className="size-4 text-foreground" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{target.label}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Current: {formatTargetValue(target)}
              </p>
            </div>
            {meta.visual !== "arc" ? (
              <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                {percent}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/70 bg-muted/15 px-2 py-2">
        <TargetMetricVisual target={target} percent={percent} />
      </div>

      <Field className="mt-3">
        <Label htmlFor={`org-target-${target.id}`} className="text-[11px] text-muted-foreground">
          Target goal
        </Label>
        <Input
          id={`org-target-${target.id}`}
          type="number"
          step={target.format === "percent" ? "0.1" : "1"}
          min={0}
          value={target.target}
          onChange={(event) => onTargetChange(Number.parseFloat(event.target.value) || 0)}
          className="h-9 text-xs tabular-nums"
        />
        <p className="text-[10px] text-muted-foreground">
          Goal: {formatTargetGoal({ ...target, target: target.target })}
        </p>
      </Field>
    </article>
  )
}

function MemberTargetEditor({
  assignment,
  onChange,
  onRemove,
}: {
  assignment: MemberTargetAssignment
  onChange: (updates: Partial<MemberTargetAssignment>) => void
  onRemove: () => void
}) {
  const percent = getTargetAchievementPercent(assignment.actual, assignment.target)

  return (
    <div className="rounded-lg border border-border bg-muted/15 p-3">
      <div className="flex items-start justify-between gap-3">
        <Field className="min-w-0 flex-1">
          <Label className="text-[11px] text-muted-foreground">Metric</Label>
          <Input
            value={assignment.label}
            onChange={(event) => onChange({ label: event.target.value })}
            className="h-9 text-xs"
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="mt-6 size-8 shrink-0 text-muted-foreground"
          onClick={onRemove}
          aria-label={`Remove ${assignment.label}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field>
          <Label className="text-[11px] text-muted-foreground">Actual</Label>
          <Input
            type="number"
            min={0}
            value={assignment.actual}
            onChange={(event) =>
              onChange({ actual: Number.parseFloat(event.target.value) || 0 })
            }
            className="h-9 text-xs tabular-nums"
          />
        </Field>
        <Field>
          <Label className="text-[11px] text-muted-foreground">Target</Label>
          <Input
            type="number"
            min={0}
            value={assignment.target}
            onChange={(event) =>
              onChange({ target: Number.parseFloat(event.target.value) || 0 })
            }
            className="h-9 text-xs tabular-nums"
          />
        </Field>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <span>{percent}% achieved</span>
        <span>
          {assignment.actual} / {assignment.target}
        </span>
      </div>
      <div className="mt-1.5">
        <TargetProgressBar percent={percent} />
      </div>
    </div>
  )
}

const TEAM_SIZE_TREND: TargetProgressPoint[] = [
  { label: "Jan", value: 8 },
  { label: "Feb", value: 9 },
  { label: "Mar", value: 9 },
  { label: "Apr", value: 10 },
  { label: "May", value: 11 },
  { label: "Jun", value: 12 },
]

function HeaderSummarySparkline({ data }: { data: TargetProgressPoint[] }) {
  const gradientId = `header-sparkline-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  return (
    <div className="h-7 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.14} />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeOpacity={0.55}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function HeaderSummaryBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)

  return (
    <div className="flex h-7 items-end gap-1">
      {values.map((value, index) => {
        const isLast = index === values.length - 1
        const heightPct = Math.max(18, (value / max) * 100)

        return (
          <div key={index} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className={cn(
                "w-full rounded-sm transition-[height]",
                isLast ? "bg-foreground/70" : "bg-muted"
              )}
              style={{ height: `${heightPct}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function HeaderSummaryWidget({
  label,
  value,
  trendLabel,
  trend = "up",
  sparklineData,
  barValues,
}: {
  label: string
  value: string | number
  trendLabel: string
  trend?: "up" | "down" | "neutral"
  sparklineData?: TargetProgressPoint[]
  barValues?: number[]
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp

  return (
    <article className="min-w-[9.5rem] rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-px text-[9px] font-medium tabular-nums",
            trend === "up" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            trend === "down" && "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
            trend === "neutral" && "border-border bg-muted/40 text-muted-foreground"
          )}
        >
          {trend !== "neutral" ? <TrendIcon className="size-2.5 shrink-0" strokeWidth={2.25} /> : null}
          {trendLabel}
        </span>
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums leading-none text-foreground">{value}</p>
      <div className="mt-2">
        {sparklineData ? <HeaderSummarySparkline data={sparklineData} /> : null}
        {barValues ? <HeaderSummaryBars values={barValues} /> : null}
      </div>
    </article>
  )
}

function ReportScopeOption({
  selected,
  onToggle,
  children,
}: {
  selected: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        selected
          ? "border-foreground/20 bg-muted/20 ring-1 ring-foreground/10"
          : "border-border bg-muted/10 hover:bg-muted/25"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/35 bg-background"
        )}
        aria-hidden
      >
        {selected ? <Check className="size-2.5" strokeWidth={3} /> : null}
      </div>
      <div className="min-w-0 text-xs font-medium text-foreground">{children}</div>
    </div>
  )
}

function ReportPreviewVisual({
  orgAchievement,
  teamSummary,
  reportFormat,
  includeOrganisation,
  includeTeam,
  orgTargets,
}: {
  orgAchievement: number
  teamSummary: number
  reportFormat: "pdf" | "xlsx"
  includeOrganisation: boolean
  includeTeam: boolean
  orgTargets: LandingTarget[]
}) {
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
              <p className="text-[9px] text-muted-foreground">YTD to June 2026</p>
            </div>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
              {reportFormat}
            </span>
          </div>

          <div className="space-y-2.5 p-3">
            {includeOrganisation ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-medium text-foreground">Organisation</span>
                  <span className="text-[9px] font-bold tabular-nums text-foreground">
                    {orgAchievement}%
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${orgAchievement}%` }}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {orgTargets.slice(0, 3).map((target) => (
                    <div key={target.id} className="flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-muted" />
                      <span className="w-6 shrink-0 text-right text-[7px] tabular-nums text-muted-foreground">
                        {getTargetAchievementPercent(target.actual, target.target)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {includeTeam ? (
              <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-medium text-foreground">Team targets</span>
                  <span className="text-[9px] font-bold tabular-nums text-foreground">
                    {teamSummary}%
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

            {!includeOrganisation && !includeTeam ? (
              <div className="rounded-md border border-dashed border-border px-2 py-4 text-center">
                <p className="text-[9px] text-muted-foreground">Select sections to preview</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function TargetsReportPanel({
  orgTargets,
  memberTargets,
  teamSummary,
}: {
  orgTargets: LandingTarget[]
  memberTargets: MemberTargets[]
  teamSummary: number
}) {
  const { toast } = useToast()
  const [reportFormat, setReportFormat] = useState<"pdf" | "xlsx">("pdf")
  const [includeOrganisation, setIncludeOrganisation] = useState(true)
  const [includeTeam, setIncludeTeam] = useState(true)
  const [generated, setGenerated] = useState(false)

  const orgAchievement = getOverallTargetAchievement(orgTargets)
  const teamAssignmentCount = memberTargets.reduce(
    (count, entry) => count + entry.assignments.length,
    0
  )
  const canGenerate = includeOrganisation || includeTeam

  function handleGenerate() {
    if (!canGenerate) return
    setGenerated(true)
    toast({
      title: "Targets report generated",
      description: `Your ${reportFormat.toUpperCase()} report is ready to download.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:items-start">
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
              <FileText className="size-4 text-foreground" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Generate targets report</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Export organisation and team target progress for YTD to June 2026.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field>
              <Label className="text-[11px] text-muted-foreground">Report format</Label>
              <Select
                value={reportFormat}
                onValueChange={(value) => setReportFormat(value as "pdf" | "xlsx")}
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

            <div>
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">Include sections</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <ReportScopeOption
                  selected={includeOrganisation}
                  onToggle={() => setIncludeOrganisation((current) => !current)}
                >
                  Organisation targets
                  <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                    {orgTargets.length} metrics · {orgAchievement}% avg
                  </span>
                </ReportScopeOption>
                <ReportScopeOption
                  selected={includeTeam}
                  onToggle={() => setIncludeTeam((current) => !current)}
                >
                  Team targets
                  <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                    {TEAM_MEMBERS.length} members · {teamAssignmentCount} assignments
                  </span>
                </ReportScopeOption>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/15 px-3 py-2.5 text-xs text-muted-foreground">
              Period: YTD to June 2026 · Generated reports include achievement %, goals, and
              progress visuals where available.
            </div>
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
                Snapshot of what will be included in the export.
              </p>
            </div>
          </div>

          <div className="p-5">
            <ReportPreviewVisual
              orgAchievement={orgAchievement}
              teamSummary={teamSummary}
              reportFormat={reportFormat}
              includeOrganisation={includeOrganisation}
              includeTeam={includeTeam}
              orgTargets={orgTargets}
            />

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted-foreground">Organisation</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                  {includeOrganisation ? `${orgAchievement}%` : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted-foreground">Team</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                  {includeTeam ? `${teamSummary}%` : "—"}
                </p>
              </div>
            </div>

            {includeOrganisation ? (
              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {orgTargets.map((target) => (
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
          </div>

          <div className="mt-auto border-t border-border bg-muted/10 p-5">
            {generated ? (
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/70 px-3 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                  <FileText className="size-3.5 text-foreground" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">Report ready to download</p>
                  <p className="text-[10px] text-muted-foreground">
                    Targets report · YTD to June 2026 · {reportFormat.toUpperCase()}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
                  <Download className="size-3.5" />
                  Download
                </Button>
              </div>
            ) : null}

            <Button
              type="button"
              className="h-9 w-full gap-2 text-xs"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              <Play className="size-3.5" />
              Generate report
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export function ManageTargetsPage({ onBack, onTabChange }: ManageTargetsPageProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("organisation")
  const isTeamTab = activeTab === "team"
  const [orgTargets, setOrgTargets] = useState<LandingTarget[]>(() => getOrgTargets())
  const [memberTargets, setMemberTargets] = useState<MemberTargets[]>(() => getMemberTargets())
  const [selectedMemberId, setSelectedMemberId] = useState(TEAM_MEMBERS[0]?.id ?? "")
  const [memberSearch, setMemberSearch] = useState("")

  const selectedMember = TEAM_MEMBERS.find((member) => member.id === selectedMemberId)
  const selectedMemberTargets = memberTargets.find(
    (entry) => entry.memberId === selectedMemberId
  )

  const memberAchievementById = useMemo(() => {
    return new Map(
      memberTargets.map((entry) => [
        entry.memberId,
        getMemberAchievementPercent(entry.assignments),
      ])
    )
  }, [memberTargets])

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((member) => memberMatchesSearch(member, memberSearch))
  }, [memberSearch])

  const maxMemberAchievement = useMemo(() => {
    const values = TEAM_MEMBERS.map(
      (member) => memberAchievementById.get(member.id) ?? 0
    )
    return Math.max(...values, 1)
  }, [memberAchievementById])

  const teamSummary = useMemo(() => {
    const totals = memberTargets.flatMap((entry) => entry.assignments)
    if (totals.length === 0) return 0
    const sum = totals.reduce(
      (acc, assignment) =>
        acc + getTargetAchievementPercent(assignment.actual, assignment.target),
      0
    )
    return Math.round(sum / totals.length)
  }, [memberTargets])

  const orgAchievement = useMemo(
    () => getOverallTargetAchievement(orgTargets),
    [orgTargets]
  )

  const orgAchievementBars = useMemo(
    () => orgTargets.map((target) => getTargetAchievementPercent(target.actual, target.target)),
    [orgTargets]
  )

  const achievementTrendDelta = useMemo(() => {
    const points = LANDING_TARGET_PROGRESS_CHART
    const last = points[points.length - 1]?.value ?? 0
    const prev = points[points.length - 2]?.value ?? 0
    return last - prev
  }, [])

  const teamSizeDelta = useMemo(() => {
    const points = TEAM_SIZE_TREND
    const last = points[points.length - 1]?.value ?? 0
    const prev = points[0]?.value ?? 0
    return last - prev
  }, [])

  function updateOrgTarget(id: string, targetValue: number) {
    setOrgTargets((current) =>
      current.map((target) =>
        target.id === id ? { ...target, target: targetValue } : target
      )
    )
  }

  function updateMemberAssignment(
    memberId: string,
    assignmentId: string,
    updates: Partial<MemberTargetAssignment>
  ) {
    setMemberTargets((current) =>
      current.map((entry) => {
        if (entry.memberId !== memberId) return entry
        return {
          ...entry,
          assignments: entry.assignments.map((assignment) =>
            assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
          ),
        }
      })
    )
  }

  function addMemberAssignment(memberId: string) {
    setMemberTargets((current) =>
      current.map((entry) => {
        if (entry.memberId !== memberId) return entry
        const nextId = `custom-${Date.now()}`
        return {
          ...entry,
          assignments: [
            ...entry.assignments,
            {
              id: nextId,
              label: "New metric",
              actual: 0,
              target: 1,
              format: "count",
            },
          ],
        }
      })
    )
  }

  function removeMemberAssignment(memberId: string, assignmentId: string) {
    setMemberTargets((current) =>
      current.map((entry) => {
        if (entry.memberId !== memberId) return entry
        return {
          ...entry,
          assignments: entry.assignments.filter(
            (assignment) => assignment.id !== assignmentId
          ),
        }
      })
    )
  }

  function handleSaveOrganisation() {
    saveOrgTargets(orgTargets)
    toast({
      title: "Organisation targets saved",
      description: "Dashboard targets have been updated for this period.",
    })
  }

  function handleSaveTeam() {
    saveMemberTargets(memberTargets)
    toast({
      title: "Team targets saved",
      description: "Individual target assignments have been updated.",
    })
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
        isTeamTab ? "flex h-full min-h-0 flex-1 flex-col gap-6" : "space-y-6 pb-8"
      )}
    >
      <div className="shrink-0 border-b border-border pb-5">
        <div className="mb-3 flex justify-end">
          <Button type="button" variant="outline" className="h-9 gap-2 text-xs" onClick={onBack}>
            <ArrowLeft className="size-3.5" />
            Back to home
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Home · Targets</p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-foreground">
              Manage targets
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Set organisation-wide goals and assign targets to team members for YTD to June 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <HeaderSummaryWidget
              label="Org metrics"
              value={orgTargets.length}
              trendLabel={`${orgAchievement}% avg`}
              trend={orgAchievement >= 60 ? "up" : "down"}
              barValues={orgAchievementBars}
            />
            <HeaderSummaryWidget
              label="Team members"
              value={TEAM_MEMBERS.length}
              trendLabel={`+${teamSizeDelta} YTD`}
              trend="up"
              sparklineData={TEAM_SIZE_TREND}
            />
            <HeaderSummaryWidget
              label="Avg achievement"
              value={`${teamSummary}%`}
              trendLabel={`+${achievementTrendDelta} pts`}
              trend={achievementTrendDelta >= 0 ? "up" : "down"}
              sparklineData={LANDING_TARGET_PROGRESS_CHART}
            />
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className={cn("gap-5", isTeamTab && "flex min-h-0 flex-1 flex-col overflow-hidden")}
      >
        <TabsList className="h-auto w-full justify-start rounded-lg bg-muted p-1">
          {TARGET_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className={tabTriggerClass}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="organisation" className="mt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {orgTargets.map((target) => (
              <OrganisationTargetCard
                key={target.id}
                target={target}
                onTargetChange={(value) => updateOrgTarget(target.id, value)}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="button" className="h-9 text-xs" onClick={handleSaveOrganisation}>
              Save organisation targets
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden">
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-stretch">
            <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              <div className="relative mb-3 shrink-0">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={memberSearch}
                  onChange={(event) => {
                    const query = event.target.value
                    setMemberSearch(query)
                    const matches = TEAM_MEMBERS.filter((member) =>
                      memberMatchesSearch(member, query)
                    )
                    if (
                      matches.length > 0 &&
                      !matches.some((member) => member.id === selectedMemberId)
                    ) {
                      setSelectedMemberId(matches[0].id)
                    }
                  }}
                  className="h-9 pl-9 text-xs"
                  placeholder="Search team members…"
                  aria-label="Search team members"
                />
              </div>

              <div className="h-0 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const memberEntry = memberTargets.find(
                      (entry) => entry.memberId === member.id
                    )
                    const assignmentCount = memberEntry?.assignments.length ?? 0
                    const achievementPercent = memberAchievementById.get(member.id) ?? 0

                    return (
                      <TeamMemberListItem
                        key={member.id}
                        member={member}
                        selected={member.id === selectedMemberId}
                        assignmentCount={assignmentCount}
                        achievementPercent={achievementPercent}
                        maxAchievement={maxMemberAchievement}
                        onSelect={() => setSelectedMemberId(member.id)}
                      />
                    )
                  })
                ) : (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    No team members match your search.
                  </p>
                )}
              </div>
            </aside>

            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              {selectedMember && selectedMemberTargets ? (
                <>
                  <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                          {selectedMember.name}
                        </h2>
                        <TeamStatusBadge status={selectedMember.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{selectedMember.role}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last worked on: {selectedMember.lastWorkedOn}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => addMemberAssignment(selectedMember.id)}
                    >
                      <Plus className="size-3.5" />
                      Add target
                    </Button>
                  </div>

                  <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="flex min-h-full flex-col">
                      <div className="space-y-3">
                        {selectedMemberTargets.assignments.length > 0 ? (
                          selectedMemberTargets.assignments.map((assignment) => (
                            <MemberTargetEditor
                              key={assignment.id}
                              assignment={assignment}
                              onChange={(updates) =>
                                updateMemberAssignment(
                                  selectedMember.id,
                                  assignment.id,
                                  updates
                                )
                              }
                              onRemove={() =>
                                removeMemberAssignment(selectedMember.id, assignment.id)
                              }
                            />
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed border-border bg-muted/15 px-4 py-10 text-center">
                            <p className="text-sm font-medium text-foreground">No targets assigned</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Add a target metric for {selectedMember.name}.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-4 h-8 gap-1.5 text-xs"
                              onClick={() => addMemberAssignment(selectedMember.id)}
                            >
                              <Plus className="size-3.5" />
                              Add target
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto flex justify-end pt-6">
                        <Button type="button" className="h-9 text-xs" onClick={handleSaveTeam}>
                          Save team member target
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <TargetsAnalyticsPanel
            orgTargets={orgTargets}
            memberTargets={memberTargets}
          />
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          <TargetsReportPanel
            orgTargets={orgTargets}
            memberTargets={memberTargets}
            teamSummary={teamSummary}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
