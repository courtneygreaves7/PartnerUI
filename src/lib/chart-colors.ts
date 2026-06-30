/** Semantic chart tokens — defined in index.css (:root / .dark) */

export const CHART_LINE = "var(--chart-line)"
export const CHART_BAR = "var(--chart-bar)"
export const CHART_BAR_MUTED = "var(--chart-bar-muted)"
export const CHART_BAR_GOAL = "var(--chart-bar-goal)"
export const CHART_NEGATIVE = "var(--chart-negative)"

export const CHART_SERIES_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-accent)",
  "var(--chart-negative)",
] as const

export function chartSeriesColor(index: number): string {
  return CHART_SERIES_PALETTE[index % CHART_SERIES_PALETTE.length]
}

export const CHART_AREA_GRADIENT_FROM = "var(--chart-1)"
export const CHART_AREA_GRADIENT_TO = "var(--chart-1)"

export const CHART_BAR_FILL_CLASS = "bg-[var(--chart-bar)]"
export const CHART_BAR_FILL_SOFT_CLASS = "bg-[var(--chart-bar)]/70"
export const CHART_BAR_FILL_FADED_CLASS = "bg-[var(--chart-bar)]/40"
export const CHART_BAR_FILL_LIGHT_CLASS = "bg-[var(--chart-bar)]/35"
export const CHART_BAR_MUTED_CLASS = "bg-[var(--chart-bar-muted)]"
export const CHART_BAR_GOAL_CLASS = "bg-[var(--chart-bar-goal)]"

export const CHART_RANK_BAR_CLASSES = [
  "bg-[var(--chart-rank-1)]",
  "bg-[var(--chart-rank-2)]",
  "bg-[var(--chart-rank-3)]",
] as const

export const CHART_RANK_DOT_CLASSES = CHART_RANK_BAR_CLASSES
