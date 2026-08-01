import { useMemo, useState } from "react"
import { Info } from "lucide-react"

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

const PANEL = "rounded-2xl border border-border/60 bg-card p-3 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

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
      <TooltipContent side="top" className="max-w-64 text-left">
        {help}
      </TooltipContent>
    </Tooltip>
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
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className={MONO_LABEL}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as HeatDimension)}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
    </label>
  )
}

function cellBackground(value: number | null, min: number, max: number) {
  if (value === null) return "transparent"
  const t = heatIntensity(value, min, max)
  const alpha = 0.12 + t * 0.72
  return `color-mix(in oklab, var(--color-primary) ${Math.round(alpha * 100)}%, transparent)`
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

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          <label className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-1">
            <span className={MONO_LABEL}>Filter</span>
            <select
              value={filterId}
              onChange={(event) =>
                setFilterId(event.target.value === "all" ? "all" : event.target.value)
              }
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="all">All {filterLabel.toLowerCase()}</option>
              {filterBands.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="px-1 pb-2 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {
                  HEAT_DIMENSION_OPTIONS.find((option) => option.id === rowDim)
                    ?.label
                }
              </th>
              {matrix.colBands.map((col) => (
                <th
                  key={col.id}
                  className="px-1 pb-2 text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rowBands.map((row, rowIndex) => (
              <tr key={row.id}>
                <th className="whitespace-nowrap px-1 py-1 text-left text-xs font-medium text-foreground">
                  {row.label}
                </th>
                {matrix.colBands.map((col, colIndex) => {
                  const value = matrix.values[rowIndex]?.[colIndex] ?? null
                  return (
                    <td key={col.id} className="p-0">
                      <div
                        className={cn(
                          "flex h-11 items-center justify-center rounded-md border border-border/40 text-xs font-semibold tabular-nums",
                          value === null
                            ? "bg-muted/30 text-muted-foreground"
                            : "text-foreground"
                        )}
                        style={{
                          backgroundColor: cellBackground(
                            value,
                            matrix.min,
                            matrix.max
                          ),
                        }}
                        title={
                          value === null
                            ? "No data"
                            : `${row.label} · ${col.label}: ${formatHeatValue(value)}`
                        }
                      >
                        {formatHeatValue(value)}
                      </div>
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
            className="h-2 w-24 rounded-full"
            style={{
              background:
                "linear-gradient(to right, color-mix(in oklab, var(--color-primary) 12%, transparent), color-mix(in oklab, var(--color-primary) 84%, transparent))",
            }}
          />
          <span>Higher</span>
        </div>
      </div>
    </div>
  )
}
