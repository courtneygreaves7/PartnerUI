/**
 * Region reusability & recovery — historical cancel / re-let / value-kept
 * by marketing region, plus a simple forward outlook for planning.
 */

import { REGION_OPTIONS } from "@/lib/chart-data"

export type RegionRecoveryId = Exclude<(typeof REGION_OPTIONS)[number]["value"], "all-regions">

export type RegionRecoveryMonth = {
  label: string
  year: number
  month: string
  cancellations: number
  relets: number
  cancelRate: number
  reletRate: number
  /** Recovered value as % of cancelled booking value (can exceed 100%). */
  recoveryRate: number
}

export type RegionRecoveryProfile = {
  id: RegionRecoveryId
  label: string
  /** Plain-English note on demand / seasonality. */
  character: string
  history: RegionRecoveryMonth[]
  latest: RegionRecoveryMonth
  /** Simple next-quarter outlook from recent trend. */
  outlook: {
    label: string
    cancelRate: number
    reletRate: number
    recoveryRate: number
    confidence: "indicative"
    narrative: string
  }
  trend: {
    reletDelta: number
    recoveryDelta: number
    cancelDelta: number
    reletDirection: "improving" | "softening" | "stable"
    recoveryDirection: "improving" | "softening" | "stable"
  }
}

const REGION_META: Record<
  RegionRecoveryId,
  { character: string; cancelBias: number; reletBias: number; recoveryBias: number; volume: number }
> = {
  "south-west": {
    character: "High summer demand; strong re-let when lead time allows.",
    cancelBias: 0.4,
    reletBias: 8,
    recoveryBias: 10,
    volume: 1.35,
  },
  "south-east": {
    character: "Steady year-round demand; recovery usually close to cancelled value.",
    cancelBias: -0.2,
    reletBias: 4,
    recoveryBias: 4,
    volume: 1.1,
  },
  wales: {
    character: "Shoulder-season soft spots; re-let needs earlier push.",
    cancelBias: 0.8,
    reletBias: -4,
    recoveryBias: -6,
    volume: 0.85,
  },
  scotland: {
    character: "Peak summer fills well; shoulder months need more attention.",
    cancelBias: 0.3,
    reletBias: 1,
    recoveryBias: 0,
    volume: 0.95,
  },
  "lake-district": {
    character: "Premium short breaks; good re-let when priced for short lead.",
    cancelBias: -0.5,
    reletBias: 6,
    recoveryBias: 8,
    volume: 1.05,
  },
  yorkshire: {
    character: "Solid mid-week demand; recovery often above cancelled value on splits.",
    cancelBias: 0.1,
    reletBias: 5,
    recoveryBias: 7,
    volume: 1.0,
  },
  "east-of-england": {
    character: "Softer shoulder demand — historically slower re-let.",
    cancelBias: 1.0,
    reletBias: -8,
    recoveryBias: -10,
    volume: 0.75,
  },
  midlands: {
    character: "Mixed leisure mix; re-let improves when weekends are open.",
    cancelBias: 0.5,
    reletBias: -2,
    recoveryBias: -3,
    volume: 0.8,
  },
  "north-west": {
    character: "City-break overlap helps fill; coastal pockets are slower.",
    cancelBias: 0.2,
    reletBias: 2,
    recoveryBias: 1,
    volume: 0.9,
  },
  "north-east": {
    character: "Smaller pool — cancels take longer to re-let historically.",
    cancelBias: 1.2,
    reletBias: -10,
    recoveryBias: -12,
    volume: 0.65,
  },
}

const HISTORY_KEYS = [
  { month: "Jun", year: 2025 },
  { month: "Jul", year: 2025 },
  { month: "Aug", year: 2025 },
  { month: "Sep", year: 2025 },
  { month: "Oct", year: 2025 },
  { month: "Nov", year: 2025 },
  { month: "Dec", year: 2025 },
  { month: "Jan", year: 2026 },
  { month: "Feb", year: 2026 },
  { month: "Mar", year: 2026 },
  { month: "Apr", year: 2026 },
  { month: "May", year: 2026 },
  { month: "Jun", year: 2026 },
] as const

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function direction(delta: number): "improving" | "softening" | "stable" {
  if (delta >= 1.5) return "improving"
  if (delta <= -1.5) return "softening"
  return "stable"
}

function buildHistory(id: RegionRecoveryId): RegionRecoveryMonth[] {
  const meta = REGION_META[id]
  const n = HISTORY_KEYS.length

  return HISTORY_KEYS.map(({ month, year }, index) => {
    const season = month === "Jul" || month === "Aug" ? 1 : month === "Jun" || month === "Sep" ? 0.55 : 0
    const progress = index / (n - 1)
    // Mild structural improvement in re-let / recovery into 2026
    const reletRate = round1(
      clamp(52 + meta.reletBias + season * 10 + progress * 3.5 + Math.sin(index * 0.7) * 1.2, 28, 92)
    )
    const cancelRate = round1(
      clamp(10.4 + meta.cancelBias - progress * 0.7 + (1 - season) * 0.4, 6, 16)
    )
    const recoveryRate = round1(
      clamp(88 + meta.recoveryBias + season * 8 + progress * 4 + (reletRate - 60) * 0.25, 62, 128)
    )
    const baseCancels = Math.round((120 + season * 180) * meta.volume)
    const cancellations = Math.max(8, baseCancels + Math.round(Math.sin(index + meta.volume) * 8))
    const relets = Math.round((cancellations * reletRate) / 100)

    return {
      label: `${month} ${year}`,
      year,
      month,
      cancellations,
      relets,
      cancelRate,
      reletRate,
      recoveryRate,
    }
  })
}

function buildOutlook(history: RegionRecoveryMonth[], character: string) {
  const recent = history.slice(-6)
  const earlier = history.slice(0, 6)
  const avg = (rows: RegionRecoveryMonth[], key: keyof RegionRecoveryMonth) =>
    rows.reduce((sum, row) => sum + (row[key] as number), 0) / rows.length

  const reletDelta = round1(avg(recent, "reletRate") - avg(earlier, "reletRate"))
  const recoveryDelta = round1(avg(recent, "recoveryRate") - avg(earlier, "recoveryRate"))
  const cancelDelta = round1(avg(recent, "cancelRate") - avg(earlier, "cancelRate"))

  const latest = history[history.length - 1]!
  const cancelRate = round1(clamp(latest.cancelRate + cancelDelta * 0.35, 5, 18))
  const reletRate = round1(clamp(latest.reletRate + reletDelta * 0.45, 25, 95))
  const recoveryRate = round1(clamp(latest.recoveryRate + recoveryDelta * 0.45, 60, 130))

  const narrative =
    reletDelta >= 1.5
      ? `History points to further re-let gains if peak-season fill patterns hold. ${character}`
      : reletDelta <= -1.5
        ? `Recent history shows softer re-let — treat the outlook as a watchlist, not a guarantee. ${character}`
        : `Re-let has been fairly steady; expect a similar recovery band unless demand shifts. ${character}`

  return {
    trend: {
      reletDelta,
      recoveryDelta,
      cancelDelta,
      reletDirection: direction(reletDelta),
      recoveryDirection: direction(recoveryDelta),
    },
    outlook: {
      label: "Jul–Sep 2026 (indicative)",
      cancelRate,
      reletRate,
      recoveryRate,
      confidence: "indicative" as const,
      narrative,
    },
  }
}

function buildProfile(id: RegionRecoveryId): RegionRecoveryProfile {
  const option = REGION_OPTIONS.find((row) => row.value === id)!
  const history = buildHistory(id)
  const { trend, outlook } = buildOutlook(history, REGION_META[id].character)
  return {
    id,
    label: option.label,
    character: REGION_META[id].character,
    history,
    latest: history[history.length - 1]!,
    outlook,
    trend,
  }
}

export const REGION_RECOVERY_IDS = Object.keys(REGION_META) as RegionRecoveryId[]

export const REGION_RECOVERY_PROFILES: RegionRecoveryProfile[] = REGION_RECOVERY_IDS.map(buildProfile)

export function getRegionRecovery(id: RegionRecoveryId): RegionRecoveryProfile {
  return REGION_RECOVERY_PROFILES.find((row) => row.id === id)!
}

export type RegionRecoveryOpportunity = {
  id: RegionRecoveryId
  label: string
  kind: "leak" | "strong" | "watch"
  metrics: string
  detail: string
  askPrompt: string
}

/** Regions to focus — weak recovery / strong proof / watchlist. */
export function getRegionRecoveryOpportunities(): RegionRecoveryOpportunity[] {
  const ranked = [...REGION_RECOVERY_PROFILES].sort(
    (a, b) => a.latest.reletRate - b.latest.reletRate
  )
  const leak = ranked[0]!
  const secondLeak = ranked[1]!
  const strong = [...REGION_RECOVERY_PROFILES].sort(
    (a, b) => b.latest.recoveryRate - a.latest.recoveryRate
  )[0]!
  const improving = [...REGION_RECOVERY_PROFILES]
    .filter((row) => row.trend.reletDirection === "improving")
    .sort((a, b) => b.trend.reletDelta - a.trend.reletDelta)[0]

  const out: RegionRecoveryOpportunity[] = [
    {
      id: leak.id,
      label: leak.label,
      kind: "leak",
      metrics: `Re-let ${leak.latest.reletRate}% · Recovery ${leak.latest.recoveryRate}% · Cancel ${leak.latest.cancelRate}%`,
      detail: "Historically the softest re-let — highest risk of lost cancelled booking value.",
      askPrompt: `Drill into ${leak.label} region recovery — historical re-let and outlook`,
    },
    {
      id: secondLeak.id,
      label: secondLeak.label,
      kind: "watch",
      metrics: `Re-let ${secondLeak.latest.reletRate}% · Recovery ${secondLeak.latest.recoveryRate}%`,
      detail: "Second softest region on re-let — worth watching before peak demand.",
      askPrompt: `Drill into ${secondLeak.label} region recovery — historical re-let and outlook`,
    },
    {
      id: strong.id,
      label: strong.label,
      kind: "strong",
      metrics: `Recovery ${strong.latest.recoveryRate}% · Re-let ${strong.latest.reletRate}%`,
      detail: "Best value kept after cancel — a playbook region for commercial proof.",
      askPrompt: `Drill into ${strong.label} region recovery — historical re-let and outlook`,
    },
  ]

  if (improving && improving.id !== strong.id && improving.id !== leak.id) {
    out.push({
      id: improving.id,
      label: improving.label,
      kind: "strong",
      metrics: `Re-let trend +${improving.trend.reletDelta} pp`,
      detail: "Clearest historical improvement — useful for near-term prediction confidence.",
      askPrompt: `Drill into ${improving.label} region recovery — historical re-let and outlook`,
    })
  }

  return out.slice(0, 4)
}

/** Match prompts like “Drill into South West region recovery …” */
export function matchRegionRecoveryFromPrompt(prompt: string): RegionRecoveryId | null {
  const lower = prompt.toLowerCase()

  const aliases: Array<{ id: RegionRecoveryId; terms: string[] }> = [
    { id: "south-west", terms: ["south west", "south-west", "cornwall", "devon", "dorset"] },
    { id: "south-east", terms: ["south east", "south-east"] },
    { id: "lake-district", terms: ["lake district", "lake-district", "cumbria", "lakes"] },
    { id: "east-of-england", terms: ["east of england", "east-of-england", "east anglia"] },
    { id: "north-west", terms: ["north west", "north-west"] },
    { id: "north-east", terms: ["north east", "north-east"] },
    { id: "yorkshire", terms: ["yorkshire", "north yorkshire"] },
    { id: "midlands", terms: ["midlands"] },
    { id: "wales", terms: ["wales"] },
    { id: "scotland", terms: ["scotland"] },
  ]

  for (const alias of aliases) {
    if (alias.terms.some((term) => lower.includes(term))) return alias.id
  }

  for (const profile of REGION_RECOVERY_PROFILES) {
    if (lower.includes(profile.label.toLowerCase())) return profile.id
  }

  return null
}

export function wantsRegionRecoveryAdvice(lower: string) {
  const aboutRegion =
    lower.includes("region") ||
    lower.includes("county") ||
    lower.includes("area") ||
    lower.includes("geography") ||
    lower.includes("cornwall") ||
    lower.includes("devon") ||
    lower.includes("wales") ||
    lower.includes("scotland") ||
    lower.includes("yorkshire") ||
    lower.includes("lake")

  const aboutRecovery =
    lower.includes("reusab") ||
    lower.includes("recover") ||
    lower.includes("relet") ||
    lower.includes("re-let") ||
    lower.includes("fill again") ||
    lower.includes("predict") ||
    lower.includes("outlook") ||
    lower.includes("historical")

  return aboutRegion && aboutRecovery
}
