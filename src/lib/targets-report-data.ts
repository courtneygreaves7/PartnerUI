import {
  getOverallTargetAchievement,
  getTargetAchievementPercent,
  type LandingTarget,
} from "@/lib/landing-targets-data"
import { TEAM_MEMBERS } from "@/lib/team-data"
import type { MemberTargets } from "@/lib/targets-store"
import type { CompareMetric, CompareSection } from "@/lib/compare-data"
import {
  getTargetsProgressTrend,
  type TargetsComparePeriodId,
  type TargetsCompareScopeId,
} from "@/lib/targets-compare-data"

export type TargetsReportScope = "organisation" | "team" | "member"
export type TargetsReportRange = "week" | "month" | "quarter" | "ytd"

export type TargetsReportComparisonMode = "period" | "member"

export type TargetsReportComparison = {
  mode: TargetsReportComparisonMode
  range: TargetsReportRange
  year: number
  memberId: string
}

export type TargetsReportConfig = {
  scope: TargetsReportScope
  memberId: string
  range: TargetsReportRange
  year: number
  format: "pdf" | "xlsx"
  compareEnabled: boolean
  comparison: TargetsReportComparison
}

export const TARGETS_REPORT_SCOPES: {
  id: TargetsReportScope
  label: string
  description: string
}[] = [
  {
    id: "organisation",
    label: "Organisation",
    description: "Organisation-wide target metrics and achievement.",
  },
  {
    id: "team",
    label: "Team",
    description: "Average achievement across all team members.",
  },
  {
    id: "member",
    label: "Member",
    description: "Individual target assignments for one team member.",
  },
]

export const TARGETS_REPORT_RANGES: {
  id: TargetsReportRange
  label: string
}[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "ytd", label: "YTD" },
]

export const TARGETS_REPORT_YEARS = [2024, 2025, 2026] as const

export const DEFAULT_TARGETS_REPORT_CONFIG: TargetsReportConfig = {
  scope: "organisation",
  memberId: TEAM_MEMBERS[0]?.id ?? "",
  range: "ytd",
  year: 2026,
  format: "pdf",
  compareEnabled: true,
  comparison: {
    mode: "period",
    range: "ytd",
    year: 2025,
    memberId: TEAM_MEMBERS[1]?.id ?? "",
  },
}

const RANGE_LABELS: Record<TargetsReportRange, string> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  ytd: "YTD",
}

const PERIOD_ACTUAL_SCALE: Record<TargetsComparePeriodId, number> = {
  "ytd-jun-2026": 1,
  "ytd-jun-2025": 0.84,
  "h1-2026": 0.72,
  "h1-2025": 0.68,
}

const RANGE_SCALE: Record<TargetsReportRange, number> = {
  week: 0.12,
  month: 0.28,
  quarter: 0.58,
  ytd: 1,
}

const YEAR_PERIOD: Record<number, TargetsComparePeriodId> = {
  2026: "ytd-jun-2026",
  2025: "ytd-jun-2025",
  2024: "h1-2025",
}

function getReportPeriodId(config: Pick<TargetsReportConfig, "range" | "year">) {
  if (config.range === "quarter") {
    return config.year >= 2026 ? "h1-2026" : "h1-2025"
  }

  return YEAR_PERIOD[config.year] ?? "ytd-jun-2026"
}

function getReportScopeId(config: Pick<TargetsReportConfig, "scope" | "memberId">): TargetsCompareScopeId {
  if (config.scope === "organisation") return "organisation"
  if (config.scope === "team") return "team"
  return `member-${config.memberId}` as TargetsCompareScopeId
}

function scaleTargets(
  targets: LandingTarget[],
  period: TargetsComparePeriodId,
  range: TargetsReportRange
): LandingTarget[] {
  const scale = PERIOD_ACTUAL_SCALE[period] * RANGE_SCALE[range]

  return targets.map((target) => ({
    ...target,
    actual:
      target.format === "count"
        ? Math.round(target.actual * scale)
        : Number((target.actual * scale).toFixed(target.format === "percent" ? 1 : 0)),
  }))
}

function getTeamAchievementForPeriod(
  memberTargets: MemberTargets[],
  period: TargetsComparePeriodId,
  range: TargetsReportRange
) {
  const scale = PERIOD_ACTUAL_SCALE[period] * RANGE_SCALE[range]
  const assignments = memberTargets.flatMap((entry) => entry.assignments)
  if (assignments.length === 0) return 0

  const sum = assignments.reduce((acc, assignment) => {
    const scaledActual = assignment.actual * scale
    return acc + getTargetAchievementPercent(scaledActual, assignment.target)
  }, 0)

  return Math.round(sum / assignments.length)
}

function getMemberAchievementForPeriod(
  memberTargets: MemberTargets[],
  memberId: string,
  period: TargetsComparePeriodId,
  range: TargetsReportRange
) {
  const entry = memberTargets.find((item) => item.memberId === memberId)
  if (!entry || entry.assignments.length === 0) return 0

  const scale = PERIOD_ACTUAL_SCALE[period] * RANGE_SCALE[range]
  const sum = entry.assignments.reduce((acc, assignment) => {
    const scaledActual = assignment.actual * scale
    return acc + getTargetAchievementPercent(scaledActual, assignment.target)
  }, 0)

  return Math.round(sum / entry.assignments.length)
}

export function formatTargetsReportPeriod(config: Pick<TargetsReportConfig, "range" | "year">) {
  const rangeLabel = RANGE_LABELS[config.range]
  if (config.range === "ytd") return `${rangeLabel} ${config.year}`
  return `${rangeLabel} · ${config.year}`
}

export function formatTargetsReportScopeLabel(
  config: Pick<TargetsReportConfig, "scope" | "memberId">
) {
  if (config.scope === "organisation") return "Organisation targets"
  if (config.scope === "team") return "Team targets"

  return formatTargetsReportMemberLabel(config.memberId)
}

export function formatTargetsReportMemberLabel(memberId: string) {
  const member = TEAM_MEMBERS.find((entry) => entry.id === memberId)
  return member?.name ?? "Team member"
}

export function getDefaultComparisonMemberId(primaryMemberId: string) {
  return TEAM_MEMBERS.find((member) => member.id !== primaryMemberId)?.id ?? primaryMemberId
}

export function isMemberToMemberComparison(config: TargetsReportConfig) {
  return config.scope === "member" && config.comparison.mode === "member"
}

export function formatTargetsReportPrimaryCompareLabel(config: TargetsReportConfig) {
  if (isMemberToMemberComparison(config)) {
    return formatTargetsReportMemberLabel(config.memberId)
  }
  return formatTargetsReportPeriod(config)
}

export function formatTargetsReportComparisonLabel(config: TargetsReportConfig) {
  if (isMemberToMemberComparison(config)) {
    return formatTargetsReportMemberLabel(config.comparison.memberId)
  }
  return formatTargetsReportPeriod(config.comparison)
}

export function formatTargetsReportTitle(config: TargetsReportConfig) {
  return `${formatTargetsReportScopeLabel(config)} · ${formatTargetsReportPeriod(config)}`
}

export function getTargetsReportAchievement(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
) {
  const period = getReportPeriodId(config)

  if (config.scope === "organisation") {
    return getOverallTargetAchievement(scaleTargets(orgTargets, period, config.range))
  }

  if (config.scope === "team") {
    return getTeamAchievementForPeriod(memberTargets, period, config.range)
  }

  return getMemberAchievementForPeriod(
    memberTargets,
    config.memberId,
    period,
    config.range
  )
}

export function getTargetsReportOrgTargets(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[]
) {
  const period = getReportPeriodId(config)
  return scaleTargets(orgTargets, period, config.range)
}

export function getTargetsReportTrend(config: TargetsReportConfig) {
  const period = getReportPeriodId(config)
  const trend = getTargetsProgressTrend(period)
  const rangeScale = RANGE_SCALE[config.range]

  return trend.map((point) => ({
    ...point,
    value: Math.round(point.value * rangeScale),
  }))
}

export function getTargetsReportMemberAssignments(
  config: TargetsReportConfig,
  memberTargets: MemberTargets[]
) {
  return memberTargets.find((entry) => entry.memberId === config.memberId)?.assignments ?? []
}

export function withReportComparison(
  config: TargetsReportConfig,
  comparison: TargetsReportComparison = config.comparison
): TargetsReportConfig {
  if (config.scope === "member" && comparison.mode === "member") {
    return {
      ...config,
      memberId: comparison.memberId,
    }
  }

  return {
    ...config,
    range: comparison.range,
    year: comparison.year,
  }
}

export function getTargetsReportComparisonAchievement(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
) {
  return getTargetsReportAchievement(withReportComparison(config), orgTargets, memberTargets)
}

export function getTargetsReportComparisonTrend(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
) {
  const primaryTrend = getTargetsReportTrend(config)

  if (isMemberToMemberComparison(config)) {
    const primaryAchievement = getTargetsReportAchievement(config, orgTargets, memberTargets)
    const comparisonAchievement = getTargetsReportComparisonAchievement(
      config,
      orgTargets,
      memberTargets
    )
    const ratio = primaryAchievement > 0 ? comparisonAchievement / primaryAchievement : 1

    return primaryTrend.map((point) => ({
      label: point.label,
      primary: point.value,
      comparison: Math.min(100, Math.round(point.value * ratio)),
    }))
  }

  const comparisonTrend = getTargetsReportTrend(withReportComparison(config))

  return primaryTrend.map((point, index) => ({
    label: point.label,
    primary: point.value,
    comparison: comparisonTrend[index]?.value ?? 0,
  }))
}

function buildAchievementMetric(
  label: string,
  left: number,
  right: number
): CompareMetric {
  const delta = right - left
  const deltaTone =
    Math.abs(delta) < 1 ? "neutral" : delta > 0 ? "positive" : "negative"
  const sign = delta > 0 ? "+" : ""

  return {
    label,
    left,
    right,
    leftDisplay: `${left}%`,
    rightDisplay: `${right}%`,
    deltaDisplay: Math.abs(delta) < 1 ? "—" : `${sign}${delta} pts`,
    deltaTone,
  }
}

export function buildTargetsReportCompareSections(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
): CompareSection[] {
  if (!config.compareEnabled) return []

  const comparisonConfig = withReportComparison(config)
  const sections: CompareSection[] = []

  if (config.scope === "organisation") {
    const leftOrg = getTargetsReportOrgTargets(config, orgTargets)
    const rightOrg = getTargetsReportOrgTargets(comparisonConfig, orgTargets)

    sections.push({
      title: "Organisation targets",
      metrics: [
        buildAchievementMetric(
          "Overall achievement",
          getOverallTargetAchievement(leftOrg),
          getOverallTargetAchievement(rightOrg)
        ),
        ...orgTargets.map((target, index) =>
          buildAchievementMetric(
            target.label,
            getTargetAchievementPercent(leftOrg[index]?.actual ?? 0, leftOrg[index]?.target ?? 1),
            getTargetAchievementPercent(
              rightOrg[index]?.actual ?? 0,
              rightOrg[index]?.target ?? 1
            )
          )
        ),
      ],
    })
  }

  if (config.scope === "team") {
    sections.push({
      title: "Team targets",
      metrics: [
        buildAchievementMetric(
          "Average achievement",
          getTargetsReportAchievement(config, orgTargets, memberTargets),
          getTargetsReportComparisonAchievement(config, orgTargets, memberTargets)
        ),
      ],
    })
  }

  if (config.scope === "member") {
    const primaryAchievement = getTargetsReportAchievement(config, orgTargets, memberTargets)
    const comparisonAchievement = getTargetsReportComparisonAchievement(
      config,
      orgTargets,
      memberTargets
    )

    const metrics: CompareMetric[] = [
      buildAchievementMetric("Overall achievement", primaryAchievement, comparisonAchievement),
    ]

    if (isMemberToMemberComparison(config)) {
      const primaryAssignments = getTargetsReportMemberAssignments(config, memberTargets)
      const comparisonAssignments = getTargetsReportMemberAssignments(
        { ...config, memberId: config.comparison.memberId },
        memberTargets
      )

      metrics.push({
        label: "Target assignments",
        left: primaryAssignments.length,
        right: comparisonAssignments.length,
        leftDisplay: String(primaryAssignments.length),
        rightDisplay: String(comparisonAssignments.length),
        deltaDisplay:
          comparisonAssignments.length === primaryAssignments.length
            ? "—"
            : `${comparisonAssignments.length - primaryAssignments.length > 0 ? "+" : ""}${comparisonAssignments.length - primaryAssignments.length}`,
        deltaTone:
          comparisonAssignments.length === primaryAssignments.length
            ? "neutral"
            : comparisonAssignments.length > primaryAssignments.length
              ? "positive"
              : "negative",
      })
    }

    sections.push({
      title: isMemberToMemberComparison(config) ? "Member comparison" : "Member targets",
      metrics,
    })
  }

  return sections
}

export function getTargetsReportComparisonDelta(
  config: TargetsReportConfig,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
) {
  const primary = getTargetsReportAchievement(config, orgTargets, memberTargets)
  const comparison = getTargetsReportComparisonAchievement(config, orgTargets, memberTargets)
  return { primary, comparison, delta: primary - comparison }
}

export function configToCompareSide(config: TargetsReportConfig) {
  return {
    scope: getReportScopeId(config),
    period: getReportPeriodId(config),
  }
}
