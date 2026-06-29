export type TeamWorkStatus = "in_progress" | "completed" | "in_review" | "blocked"

export type TeamMember = {
  id: string
  name: string
  initials: string
  role: string
  online: boolean
  lastWorkedOn: string
  status: TeamWorkStatus
}

export const TEAM_STATUS_LABELS: Record<TeamWorkStatus, string> = {
  in_progress: "In progress",
  completed: "Completed",
  in_review: "In review",
  blocked: "Blocked",
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "courtney",
    name: "Courtney Greaves",
    initials: "CG",
    role: "Head of PAS",
    online: true,
    lastWorkedOn: "Partner Alpha rate review",
    status: "in_progress",
  },
  {
    id: "james",
    name: "James O'Brien",
    initials: "JO",
    role: "Insights lead",
    online: true,
    lastWorkedOn: "Q2 insights export",
    status: "completed",
  },
  {
    id: "sarah",
    name: "Sarah Chen",
    initials: "SC",
    role: "Policy administrator",
    online: false,
    lastWorkedOn: "Brand Beta policy setup",
    status: "in_progress",
  },
  {
    id: "marcus",
    name: "Marcus Webb",
    initials: "MW",
    role: "Commercial analyst",
    online: false,
    lastWorkedOn: "DDL take-up analysis",
    status: "in_review",
  },
  {
    id: "elena",
    name: "Elena Vasquez",
    initials: "EV",
    role: "Partner onboarding",
    online: true,
    lastWorkedOn: "Partner Gamma onboarding",
    status: "in_progress",
  },
  {
    id: "tom",
    name: "Tom Fletcher",
    initials: "TF",
    role: "Integrations engineer",
    online: false,
    lastWorkedOn: "API webhook configuration",
    status: "completed",
  },
  {
    id: "priya",
    name: "Priya Nair",
    initials: "PN",
    role: "Targets & planning",
    online: true,
    lastWorkedOn: "YTD target adjustments",
    status: "blocked",
  },
  {
    id: "liam",
    name: "Liam Okonkwo",
    initials: "LO",
    role: "Rate management",
    online: true,
    lastWorkedOn: "EUR rate card updates",
    status: "in_progress",
  },
  {
    id: "rachel",
    name: "Rachel Kim",
    initials: "RK",
    role: "Reporting",
    online: false,
    lastWorkedOn: "Cancellation trend report",
    status: "completed",
  },
  {
    id: "david",
    name: "David Park",
    initials: "DP",
    role: "Data quality",
    online: true,
    lastWorkedOn: "Property mapping QA",
    status: "in_review",
  },
  {
    id: "nina",
    name: "Nina Hoffmann",
    initials: "NH",
    role: "Compliance",
    online: false,
    lastWorkedOn: "Partner Delta compliance check",
    status: "in_progress",
  },
  {
    id: "alex",
    name: "Alex Rivera",
    initials: "AR",
    role: "Operations",
    online: true,
    lastWorkedOn: "Weekly bookings summary",
    status: "completed",
  },
]
