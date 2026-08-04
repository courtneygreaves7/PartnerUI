import { useMemo, useState, type ComponentType } from "react"
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Clock,
  Info,
  ListFilter,
  type LucideProps,
} from "lucide-react"

import {
  HEAT_BANDS,
  HEAT_DIMENSION_OPTIONS,
  HEAT_METRICS,
  HEATMAP_INTRO,
  buildHeatMatrix,
  formatHeatValue,
  getFilterDimension,
  heatIntensity,
  type HeatDimension,
  type HeatMetricId,
} from "@/lib/insights-heatmap-data"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PANEL = "@container rounded-2xl border border-border/60 bg-card p-3 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
const SELECT_CLASS =
  "h-8 w-full appearance-none rounded-md border border-border bg-background py-0 text-xs leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
/** Compact (side-by-side cards): icon placeholders. Wider: full labels. */
const SELECT_COMPACT =
  "pr-7 pl-2 text-transparent @min-[34rem]:pl-2.5 @min-[34rem]:text-foreground"

const DIMENSION_ICONS: Record<
  HeatDimension,
  ComponentType<LucideProps>
> = {
  bedroom: BedDouble,
  departure: CalendarDays,
  leadTime: Clock,
}

function MeasureHelp({ title, help }: { title: string; help: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`More information about ${title}`}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-left">
        {help}
      </TooltipContent>
    </Tooltip>
  )
}

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      strokeWidth={2}
      aria-hidden
    />
  )
}

function IconPlaceholder({
  icon: Icon,
  label,
}: {
  icon: ComponentType<LucideProps>
  label: string
}) {
  return (
    <span
      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-[calc(100%-0.25rem)] items-center justify-center pr-4 @min-[34rem]:hidden"
      aria-hidden
    >
      <Icon className="size-3.5 text-foreground" strokeWidth={2} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

function DimensionSelect({
  label,
  value,
  onChange,
  options,
  disabledIds = [],
}: {
  label: string
  value: HeatDimension
  onChange: (next: HeatDimension) => void
  options: typeof HEAT_DIMENSION_OPTIONS
  disabledIds?: HeatDimension[]
}) {
  const selected =
    options.find((option) => option.id === value)?.label ?? label
  const Icon = DIMENSION_ICONS[value]

  return (
    <label className="flex min-w-0 flex-col gap-1" title={`${label}: ${selected}`}>
      <span className={MONO_LABEL}>{label}</span>
      <div className="relative min-w-0">
        <IconPlaceholder icon={Icon} label={selected} />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as HeatDimension)}
          aria-label={`${label}: ${selected}`}
          className={cn(SELECT_CLASS, SELECT_COMPACT)}
        >
          {options.map((option) => (
            <option
              key={option.id}
              value={option.id}
              disabled={disabledIds.includes(option.id)}
            >
              {option.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </label>
  )
}

function cellBackground(value: number | null, min: number, max: number) {
  if (value === null) return "transparent"
  const t = heatIntensity(value, min, max)
  // Pale → deep primary, matching swatch-style heatmaps.
  const alpha = 0.14 + t * 0.82
  return `color-mix(in oklab, var(--color-primary) ${Math.round(alpha * 100)}%, white)`
}

type InsightsMetricHeatmapProps = {
  metricId: HeatMetricId
  className?: string
  /** Optional eyebrow override. */
  eyebrow?: string
}

export function InsightsMetricHeatmap({
  metricId,
  className,
  eyebrow = "Explore",
}: InsightsMetricHeatmapProps) {
  const metric = HEAT_METRICS[metricId]
  const [rowDim, setRowDim] = useState<HeatDimension>("bedroom")
  const [colDim, setColDim] = useState<HeatDimension>("departure")
  const [filterId, setFilterId] = useState<string | "all">("all")

  const filterDim = getFilterDimension(rowDim, colDim)
  const filterBands = HEAT_BANDS[filterDim]
  const filterLabel =
    HEAT_DIMENSION_OPTIONS.find((option) => option.id === filterDim)?.label ?? "Filter"

  const matrix = useMemo(
    () =>
      buildHeatMatrix({
        cells: metric.cells,
        rowDim,
        colDim,
        filterId,
      }),
    [metric.cells, rowDim, colDim, filterId]
  )

  const handleRowChange = (next: HeatDimension) => {
    if (next === colDim) {
      setColDim(rowDim)
    }
    setRowDim(next)
    setFilterId("all")
  }

  const handleColChange = (next: HeatDimension) => {
    if (next === rowDim) {
      setRowDim(colDim)
    }
    setColDim(next)
    setFilterId("all")
  }

  return (
    <div className={cn(PANEL, className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className={MONO_LABEL}>{eyebrow}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              {metric.label} heatmap
            </h3>
            <MeasureHelp title={`${metric.label} heatmap`} help={metric.help} />
          </div>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">{HEATMAP_INTRO}</p>
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
          <DimensionSelect
            label="Rows"
            value={rowDim}
            onChange={handleRowChange}
            options={HEAT_DIMENSION_OPTIONS}
          />
          <DimensionSelect
            label="Columns"
            value={colDim}
            onChange={handleColChange}
            options={HEAT_DIMENSION_OPTIONS}
            disabledIds={[rowDim]}
          />
          <label
            className="flex min-w-0 flex-col gap-1"
            title={`Filter: ${
              filterId === "all"
                ? `All ${filterLabel.toLowerCase()}`
                : (filterBands.find((band) => band.id === filterId)?.label ?? filterId)
            }`}
          >
            <span className={MONO_LABEL}>Filter</span>
            <div className="relative min-w-0">
              <IconPlaceholder
                icon={ListFilter}
                label={
                  filterId === "all"
                    ? `All ${filterLabel.toLowerCase()}`
                    : (filterBands.find((band) => band.id === filterId)?.label ??
                      filterId)
                }
              />
              <select
                value={filterId}
                onChange={(event) =>
                  setFilterId(event.target.value === "all" ? "all" : event.target.value)
                }
                aria-label={`Filter by ${filterLabel}`}
                className={cn(SELECT_CLASS, SELECT_COMPACT)}
              >
                <option value="all">All {filterLabel.toLowerCase()}</option>
                {filterBands.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="px-1 pb-2 text-left text-[10px] font-medium tracking-wide text-muted-foreground/80">
                {
                  HEAT_DIMENSION_OPTIONS.find((option) => option.id === rowDim)
                    ?.label
                }
              </th>
              {matrix.colBands.map((col) => (
                <th
                  key={col.id}
                  className="w-9 px-0.5 pb-2 text-center text-[10px] font-medium tracking-wide text-muted-foreground/80"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rowBands.map((row, rowIndex) => (
              <tr key={row.id}>
                <th className="whitespace-nowrap px-1 py-0.5 text-left text-[11px] font-medium text-muted-foreground">
                  {row.label}
                </th>
                {matrix.colBands.map((col, colIndex) => {
                  const value = matrix.values[rowIndex]?.[colIndex] ?? null
                  if (value === null) {
                    return (
                      <td key={col.id} className="p-0">
                        <div className="size-9 rounded-md" />
                      </td>
                    )
                  }
                  const label = `${row.label} · ${col.label}: ${formatHeatValue(value)}`
                  return (
                    <td key={col.id} className="p-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="size-9 shrink-0 rounded-md outline-none transition-[transform,box-shadow] hover:scale-105 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/40"
                            style={{
                              backgroundColor: cellBackground(
                                value,
                                matrix.min,
                                matrix.max
                              ),
                            }}
                            aria-label={label}
                          />
                        </TooltipTrigger>
                        <TooltipContent variant="plain" className="text-left">
                          <p className="font-medium text-foreground">
                            {formatHeatValue(value)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {row.label} · {col.label}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Showing{" "}
          {filterId === "all"
            ? `all ${filterLabel.toLowerCase()}`
            : (filterBands.find((band) => band.id === filterId)?.label ?? filterId)}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Lower</span>
          <div
            className="flex h-3 items-center gap-0.5"
            aria-hidden
          >
            {[0.14, 0.32, 0.5, 0.68, 0.86].map((alpha) => (
              <span
                key={alpha}
                className="size-3 rounded-[3px]"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--color-primary) ${Math.round(alpha * 100)}%, white)`,
                }}
              />
            ))}
          </div>
          <span>Higher</span>
        </div>
      </div>
    </div>
  )
}
