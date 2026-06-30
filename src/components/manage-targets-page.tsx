import { useId, useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarCheck,
  Handshake,
  Percent,
  Plus,
  PoundSterling,
  Search,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast"
import {
  memberMatchesSearch,
  TeamMemberAvatar,
  TeamMemberListItem,
} from "@/components/team-member-list-item"
import { TargetsReportPanel } from "@/components/targets-report-panel"
import {
  getTargetAchievementPercent,
  getOverallTargetAchievement,
  formatTargetGoal,
  formatTargetValue,
  LANDING_TARGET_PROGRESS_CHART,
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
}

const SHOW_TARGETS_HEADER_SUMMARY = false

const TARGET_TABS = [
  { id: "organisation", label: "Organisation targets" },
  { id: "team", label: "Team targets" },
  { id: "report", label: "Report" },
] as const

const tabTriggerClass =
  "flex-1 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"

const ORG_TARGET_META: Record<string, { icon: LucideIcon }> = {
  bookings: { icon: CalendarCheck },
  "cal-takeup": { icon: Percent },
  revenue: { icon: PoundSterling },
  "new-partners": { icon: Handshake },
}

function TargetCompareBar({
  label,
  value,
  fillPercent,
  variant,
}: {
  label: string
  value: string
  fillPercent: number
  variant: "goal" | "actual"
}) {
  const clamped = Math.min(100, Math.max(0, fillPercent))

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-[10px] font-semibold text-muted-foreground">{label}</span>
      <div className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width]",
            variant === "goal" ? "bg-muted-foreground/30" : "bg-foreground"
          )}
          style={{ width: `${variant === "goal" ? 100 : clamped}%` }}
        />
      </div>
      <span className="w-[4.5rem] shrink-0 text-right text-[10px] font-medium tabular-nums text-foreground sm:w-20">
        {value}
      </span>
    </div>
  )
}

function TargetAchievementVisual({ target }: { target: LandingTarget }) {
  const percent = getTargetAchievementPercent(target.actual, target.target)

  return (
    <div className="space-y-3 py-1">
      <div className="space-y-2.5">
        <TargetCompareBar
          label="Goal"
          value={formatTargetGoal(target)}
          fillPercent={100}
          variant="goal"
        />
        <TargetCompareBar
          label="Actual"
          value={formatTargetValue(target)}
          fillPercent={percent}
          variant="actual"
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-[10px] font-medium text-muted-foreground">
        <span>{percent}% of goal</span>
        <span className="tabular-nums text-foreground">
          {formatTargetValue(target)} / {formatTargetGoal(target)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
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

function MemberTargetProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-foreground transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

const memberTargetLabelClass =
  "text-[10px] font-semibold tracking-widest text-muted-foreground uppercase"

const memberTargetLabelOffsetClass = "sm:pt-[1.125rem]"

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
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <Icon className="size-4 text-foreground" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">{target.label}</h3>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
              {percent}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border/70 bg-muted/15 px-3 py-3">
        <TargetAchievementVisual target={target} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field>
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
        </Field>
        <Field>
          <Label className="text-[11px] text-muted-foreground">Actual</Label>
          <div className="flex h-9 items-center rounded-md border border-border bg-muted/20 px-3 text-xs tabular-nums text-foreground">
            {formatTargetValue(target)}
          </div>
        </Field>
      </div>
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
    <div className="rounded-xl border border-border bg-card py-4 pl-4 pr-6 shadow-xs sm:pr-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem]">
          <Field>
            <div className="mb-1.5 flex flex-col gap-1">
              <Target className="size-3.5 text-muted-foreground" strokeWidth={2} />
              <Label className={memberTargetLabelClass}>Metric description</Label>
            </div>
            <Input
              value={assignment.label}
              onChange={(event) => onChange({ label: event.target.value })}
              className="h-10 bg-muted/25 text-xs"
            />
          </Field>
          <Field>
            <Label
              className={cn(
                memberTargetLabelClass,
                memberTargetLabelOffsetClass,
                "mb-1.5 block"
              )}
            >
              Actual
            </Label>
            <Input
              type="number"
              min={0}
              value={assignment.actual}
              onChange={(event) =>
                onChange({ actual: Number.parseFloat(event.target.value) || 0 })
              }
              className="h-10 bg-muted/25 text-xs tabular-nums"
            />
          </Field>
          <Field>
            <Label
              className={cn(
                memberTargetLabelClass,
                memberTargetLabelOffsetClass,
                "mb-1.5 block"
              )}
            >
              Target
            </Label>
            <Input
              type="number"
              min={0}
              value={assignment.target}
              onChange={(event) =>
                onChange({ target: Number.parseFloat(event.target.value) || 0 })
              }
              className="h-10 bg-muted/25 text-xs tabular-nums"
            />
          </Field>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mb-0.5 size-9 shrink-0 justify-self-center text-muted-foreground hover:text-foreground"
          onClick={onRemove}
          aria-label={`Remove ${assignment.label}`}
        >
          <Trash2 className="size-4" />
        </Button>

        <p className="mt-4 text-sm font-medium text-foreground">{percent}% achieved</p>
        <p className="mt-4 justify-self-center text-sm font-medium tabular-nums text-foreground">
          {assignment.actual} / {assignment.target}
        </p>

        <div className="col-span-2 mt-2">
          <MemberTargetProgressBar percent={percent} />
        </div>
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
  className,
}: {
  label: string
  value: string | number
  trendLabel: string
  trend?: "up" | "down" | "neutral"
  sparklineData?: TargetProgressPoint[]
  barValues?: number[]
  className?: string
}) {
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp

  return (
    <article
      className={cn(
        "min-w-0 rounded-lg border border-border bg-card px-3 py-2.5 shadow-xs",
        className
      )}
    >
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

export function ManageTargetsPage({ onBack }: ManageTargetsPageProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("organisation")
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
  }

  return (
    <div className="w-full space-y-6">
      <div className="shrink-0 pb-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-muted-foreground">Home · Targets</p>
          <Button type="button" variant="outline" className="h-9 gap-2 text-xs" onClick={onBack}>
            <ArrowLeft className="size-3.5" />
            Back to home
          </Button>
        </div>

        <div className="mt-1 min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Manage targets
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Set organisation-wide goals and assign targets to team members for YTD to June 2026.
          </p>
        </div>
      </div>

      {SHOW_TARGETS_HEADER_SUMMARY ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
      ) : null}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-8">
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

        <TabsContent value="team" className="mt-0">
          <div className="grid gap-8 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start">
            <aside className="flex flex-col lg:sticky lg:top-0 lg:max-h-[calc(100dvh-14rem)] lg:overflow-hidden">
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
                  className="h-9 rounded-full pl-9 text-xs"
                  placeholder="Search team members…"
                  aria-label="Search team members"
                />
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
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

            <section className="rounded-xl border border-border bg-card p-8 shadow-xs">
              {selectedMember && selectedMemberTargets ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <TeamMemberAvatar
                        initials={selectedMember.initials}
                        online={selectedMember.online}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-foreground">
                            {selectedMember.name}
                          </h2>
                          <TeamStatusBadge status={selectedMember.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {selectedMember.role}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last worked on: {selectedMember.lastWorkedOn}
                        </p>
                      </div>
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

                  <div className="space-y-4 pt-6">
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

                  <div className="flex justify-end pt-6">
                    <Button type="button" className="h-9 text-xs" onClick={handleSaveTeam}>
                      Save team member targets
                    </Button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="report" className="mt-0">
          <TargetsReportPanel
            orgTargets={orgTargets}
            memberTargets={memberTargets}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
