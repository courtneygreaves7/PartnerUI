import { formatCount, formatCurrency } from "@/lib/booking-engine-data"

export type LandingTarget = {
  id: string
  label: string
  actual: number
  target: number
  format: "count" | "percent" | "currency"
  currency?: "GBP" | "EUR"
}

export type TargetProgressPoint = {
  label: string
  value: number
}

export const LANDING_TARGETS: LandingTarget[] = [
  {
    id: "bookings",
    label: "Bookings",
    actual: 124_500,
    target: 160_000,
    format: "count",
  },
  {
    id: "cal-takeup",
    label: "CAL take-up",
    actual: 3.8,
    target: 5.0,
    format: "percent",
  },
  {
    id: "revenue",
    label: "Revenue",
    actual: 284_560_000,
    target: 320_000_000,
    format: "currency",
    currency: "GBP",
  },
  {
    id: "new-partners",
    label: "New partners",
    actual: 2,
    target: 3,
    format: "count",
  },
]

export const LANDING_TARGET_PROGRESS_CHART: TargetProgressPoint[] = [
  { label: "Jan", value: 12 },
  { label: "Feb", value: 26 },
  { label: "Mar", value: 39 },
  { label: "Apr", value: 52 },
  { label: "May", value: 66 },
  { label: "Jun", value: 78 },
]

export const TARGET_METRIC_TRENDS: Record<string, TargetProgressPoint[]> = {
  bookings: [
    { label: "Jan", value: 16 },
    { label: "Feb", value: 31 },
    { label: "Mar", value: 44 },
    { label: "Apr", value: 58 },
    { label: "May", value: 69 },
    { label: "Jun", value: 78 },
  ],
  revenue: [
    { label: "Jan", value: 24 },
    { label: "Feb", value: 41 },
    { label: "Mar", value: 55 },
    { label: "Apr", value: 68 },
    { label: "May", value: 79 },
    { label: "Jun", value: 89 },
  ],
}

export function getTargetAchievementPercent(actual: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((actual / target) * 100))
}

export function formatTargetValue(target: LandingTarget) {
  if (target.format === "percent") return `${target.actual.toFixed(1)}%`
  if (target.format === "currency") {
    return formatCurrency(target.actual, target.currency ?? "GBP")
  }
  return formatCount(target.actual)
}

export function formatTargetGoal(target: LandingTarget) {
  if (target.format === "percent") return `${target.target.toFixed(1)}%`
  if (target.format === "currency") {
    return formatCurrency(target.target, target.currency ?? "GBP")
  }
  return formatCount(target.target)
}

export function getOverallTargetAchievement(targets: LandingTarget[]) {
  if (targets.length === 0) return 0
  const total = targets.reduce(
    (sum, target) => sum + getTargetAchievementPercent(target.actual, target.target),
    0
  )
  return Math.round(total / targets.length)
}
