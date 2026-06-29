import {
  LANDING_TARGETS,
  type LandingTarget,
} from "@/lib/landing-targets-data"
import { TEAM_MEMBERS } from "@/lib/team-data"

export type MemberTargetAssignment = {
  id: string
  label: string
  actual: number
  target: number
  format: LandingTarget["format"]
  currency?: LandingTarget["currency"]
}

export type MemberTargets = {
  memberId: string
  assignments: MemberTargetAssignment[]
}

const ORG_TARGETS_STORAGE_KEY = "keystone-org-targets"
const MEMBER_TARGETS_STORAGE_KEY = "keystone-member-targets"

const DEFAULT_MEMBER_TARGETS: Record<string, MemberTargetAssignment[]> = {
  courtney: [
    { id: "partner-reviews", label: "Partner reviews", actual: 4, target: 6, format: "count" },
    { id: "policy-signoffs", label: "Policy sign-offs", actual: 3, target: 5, format: "count" },
  ],
  james: [
    { id: "insight-reports", label: "Insight reports", actual: 6, target: 8, format: "count" },
    { id: "dashboard-exports", label: "Dashboard exports", actual: 4, target: 6, format: "count" },
  ],
  sarah: [
    { id: "policies-setup", label: "Policies set up", actual: 7, target: 10, format: "count" },
  ],
  marcus: [
    { id: "ddl-analysis", label: "DDL analyses", actual: 2, target: 4, format: "count" },
    { id: "cal-takeup", label: "CAL take-up reviews", actual: 3, target: 5, format: "count" },
  ],
  elena: [
    { id: "onboardings", label: "Partner onboardings", actual: 2, target: 3, format: "count" },
  ],
  priya: [
    { id: "target-adjustments", label: "Target adjustments", actual: 2, target: 4, format: "count" },
    { id: "forecast-updates", label: "Forecast updates", actual: 5, target: 6, format: "count" },
  ],
  liam: [
    { id: "rate-updates", label: "Rate card updates", actual: 8, target: 12, format: "count" },
  ],
  rachel: [
    { id: "reports-published", label: "Reports published", actual: 5, target: 6, format: "count" },
  ],
}

function readOrgTargets(): LandingTarget[] | null {
  try {
    const stored = localStorage.getItem(ORG_TARGETS_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as LandingTarget[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function readMemberTargets(): MemberTargets[] | null {
  try {
    const stored = localStorage.getItem(MEMBER_TARGETS_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as MemberTargets[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function buildDefaultMemberTargets(): MemberTargets[] {
  return TEAM_MEMBERS.map((member) => ({
    memberId: member.id,
    assignments:
      DEFAULT_MEMBER_TARGETS[member.id] ?? [
        {
          id: "completed-tasks",
          label: "Completed tasks",
          actual: 5,
          target: 8,
          format: "count",
        },
      ],
  }))
}

export function getOrgTargets(): LandingTarget[] {
  return readOrgTargets() ?? LANDING_TARGETS.map((target) => ({ ...target }))
}

export function saveOrgTargets(targets: LandingTarget[]) {
  localStorage.setItem(ORG_TARGETS_STORAGE_KEY, JSON.stringify(targets))
}

export function getMemberTargets(): MemberTargets[] {
  const stored = readMemberTargets()
  if (!stored) return buildDefaultMemberTargets()

  const byMemberId = new Map(stored.map((entry) => [entry.memberId, entry]))
  return TEAM_MEMBERS.map((member) => {
    const existing = byMemberId.get(member.id)
    return (
      existing ?? {
        memberId: member.id,
        assignments: DEFAULT_MEMBER_TARGETS[member.id] ?? [
          {
            id: "completed-tasks",
            label: "Completed tasks",
            actual: 5,
            target: 8,
            format: "count",
          },
        ],
      }
    )
  })
}

export function saveMemberTargets(targets: MemberTargets[]) {
  localStorage.setItem(MEMBER_TARGETS_STORAGE_KEY, JSON.stringify(targets))
}

export function getMemberTargetsById(memberId: string) {
  return getMemberTargets().find((entry) => entry.memberId === memberId)
}
