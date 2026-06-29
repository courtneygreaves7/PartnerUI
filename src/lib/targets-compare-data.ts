import {
  getOverallTargetAchievement,
  getTargetAchievementPercent,
  LANDING_TARGET_PROGRESS_CHART,
  type LandingTarget,
  type TargetProgressPoint,
} from "@/lib/landing-targets-data"
import { TEAM_MEMBERS } from "@/lib/team-data"
import type { MemberTargets } from "@/lib/targets-store"
import type { CompareMetric, CompareSection } from "@/lib/compare-data"

export const TARGETS_COMPARE_PERIODS = [
  { id: "ytd-jun-2026", label: "YTD to June 2026" },
  { id: "ytd-jun-2025", label: "YTD to June 2025" },
  { id: "h1-2026", label: "H1 2026" },
  { id: "h1-2025", label: "H1 2025" },
] as const

export const TARGETS_COMPARE_SCOPES = [
  { id: "organisation", label: "Organisation targets" },
  { id: "team", label: "Team targets" },
] as const

export type TargetsComparePeriodId = (typeof TARGETS_COMPARE_PERIODS)[number]["id"]
export type TargetsCompareScopeId = (typeof TARGETS_COMPARE_SCOPES)[number]["id"]

export type TargetsCompareSide = {
  period: TargetsComparePeriodId
  scope: TargetsCompareScopeId
}

export const DEFAULT_TARGETS_COMPARE_PRIMARY: TargetsCompareSide = {
  period: "ytd-jun-2026",
  scope: "organisation",
}

export const DEFAULT_TARGETS_COMPARE_COMPARISON: TargetsCompareSide = {
  period: "ytd-jun-2025",
  scope: "organisation",
}

const PERIOD_ACTUAL_SCALE: Record<TargetsComparePeriodId, number> = {
  "ytd-jun-2026": 1,
  "ytd-jun-2025": 0.84,
  "h1-2026": 0.72,
  "h1-2025": 0.68,
}

const PERIOD_PROGRESS_SCALE: Record<TargetsComparePeriodId, number> = {
  "ytd-jun-2026": 1,
  "ytd-jun-2025": 0.88,
  "h1-2026": 0.82,
  "h1-2025": 0.79,
}

function scaleTargets(
  targets: LandingTarget[],
  period: TargetsComparePeriodId
): LandingTarget[] {
  const scale = PERIOD_ACTUAL_SCALE[period]
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
  period: TargetsComparePeriodId
) {
  const scale = PERIOD_ACTUAL_SCALE[period]
  const assignments = memberTargets.flatMap((entry) => entry.assignments)
  if (assignments.length === 0) return 0

  const sum = assignments.reduce((acc, assignment) => {
    const scaledActual = assignment.actual * scale
    return acc + getTargetAchievementPercent(scaledActual, assignment.target)
  }, 0)

  return Math.round(sum / assignments.length)
}

function getMembersOnTrackPercent(
  memberTargets: MemberTargets[],
  period: TargetsComparePeriodId
) {
  const scale = PERIOD_ACTUAL_SCALE[period]
  if (memberTargets.length === 0) return 0

  const onTrack = memberTargets.filter((entry) => {
    if (entry.assignments.length === 0) return false
    const avg =
      entry.assignments.reduce(
        (sum, assignment) =>
          sum + getTargetAchievementPercent(assignment.actual * scale, assignment.target),
        0
      ) / entry.assignments.length
    return avg >= 60
  }).length

  return Math.round((onTrack / memberTargets.length) * 100)
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

function buildValueMetric(
  label: string,
  left: number,
  right: number,
  leftDisplay: string,
  rightDisplay: string
): CompareMetric {
  const delta = right - left
  const deltaTone =
    Math.abs(delta) < 0.05 ? "neutral" : delta > 0 ? "positive" : "negative"

  return {
    label,
    left,
    right,
    leftDisplay,
    rightDisplay,
    deltaDisplay:
      Math.abs(delta) < 0.05
        ? "—"
        : `${delta > 0 ? "+" : ""}${Math.round(delta)}%`,
    deltaTone,
  }
}

export function getTargetsPeriodLabel(period: TargetsComparePeriodId) {
  return TARGETS_COMPARE_PERIODS.find((entry) => entry.id === period)?.label ?? period
}

export function getTargetsScopeLabel(scope: TargetsCompareScopeId) {
  return TARGETS_COMPARE_SCOPES.find((entry) => entry.id === scope)?.label ?? scope
}

export function formatTargetsCompareSide(side: TargetsCompareSide) {
  return `${getTargetsScopeLabel(side.scope)} · ${getTargetsPeriodLabel(side.period)}`
}

export function getTargetsProgressTrend(
  period: TargetsComparePeriodId
): TargetProgressPoint[] {
  const scale = PERIOD_PROGRESS_SCALE[period]
  return LANDING_TARGET_PROGRESS_CHART.map((point) => ({
    ...point,
    value: Math.round(point.value * scale),
  }))
}

export function buildTargetsCompareSections(
  primary: TargetsCompareSide,
  comparison: TargetsCompareSide,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
): CompareSection[] {
  const sections: CompareSection[] = []

  if (primary.scope === "organisation" || comparison.scope === "organisation") {
    const leftOrg = scaleTargets(orgTargets, primary.period)
    const rightOrg = scaleTargets(orgTargets, comparison.period)

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

  if (primary.scope === "team" || comparison.scope === "team") {
    sections.push({
      title: "Team targets",
      metrics: [
        buildAchievementMetric(
          "Average achievement",
          getTeamAchievementForPeriod(memberTargets, primary.period),
          getTeamAchievementForPeriod(memberTargets, comparison.period)
        ),
        buildValueMetric(
          "Members on track (≥60%)",
          getMembersOnTrackPercent(memberTargets, primary.period),
          getMembersOnTrackPercent(memberTargets, comparison.period),
          `${getMembersOnTrackPercent(memberTargets, primary.period)}%`,
          `${getMembersOnTrackPercent(memberTargets, comparison.period)}%`
        ),
        {
          label: "Active team members",
          left: TEAM_MEMBERS.length,
          right: TEAM_MEMBERS.length,
          leftDisplay: String(TEAM_MEMBERS.length),
          rightDisplay: String(TEAM_MEMBERS.length),
          deltaDisplay: "—",
          deltaTone: "neutral",
        },
        {
          label: "Total assignments",
          left: memberTargets.reduce((sum, entry) => sum + entry.assignments.length, 0),
          right: memberTargets.reduce((sum, entry) => sum + entry.assignments.length, 0),
          leftDisplay: String(
            memberTargets.reduce((sum, entry) => sum + entry.assignments.length, 0)
          ),
          rightDisplay: String(
            memberTargets.reduce((sum, entry) => sum + entry.assignments.length, 0)
          ),
          deltaDisplay: "—",
          deltaTone: "neutral",
        },
      ],
    })
  }

  return sections
}

export function getTargetsCompareSummary(
  primary: TargetsCompareSide,
  comparison: TargetsCompareSide,
  orgTargets: LandingTarget[],
  memberTargets: MemberTargets[]
) {
  const primaryAchievement =
    primary.scope === "organisation"
      ? getOverallTargetAchievement(scaleTargets(orgTargets, primary.period))
      : getTeamAchievementForPeriod(memberTargets, primary.period)

  const comparisonAchievement =
    comparison.scope === "organisation"
      ? getOverallTargetAchievement(scaleTargets(orgTargets, comparison.period))
      : getTeamAchievementForPeriod(memberTargets, comparison.period)

  return {
    primaryAchievement,
    comparisonAchievement,
    delta: primaryAchievement - comparisonAchievement,
  }
}
