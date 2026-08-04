import { useMemo, useState } from "react"
import {
  ArrowRight,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Info,
  Rocket,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FC_LOOP_MATRIX_HELP,
  FC_LOOP_OPPORTUNITIES_HELP,
  FC_LOOP_PROOF,
  HEAT_BANDS,
  HEAT_DIMENSION_OPTIONS,
  buildFcLoopMatrix,
  describeFcLoopBehaviour,
  formatCurrency,
  getFcLoopOpportunities,
  getFilterDimension,
  type FcLoopBehaviourKind,
  type FcLoopCellMetrics,
  type FcLoopOpportunity,
  type HeatDimension,
} from "@/lib/fc-value-loop-data"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
const SELECT_CLASS =
  "h-8 w-full appearance-none rounded-md border border-border bg-background py-0 pr-8 pl-2.5 text-xs leading-none text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
      strokeWidth={2}
      aria-hidden
    />
  )
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
    <label className="flex min-w-[7.5rem] flex-col gap-1">
      <span className={MONO_LABEL}>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as HeatDimension)}
          className={SELECT_CLASS}
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

function heatSwatchBackground(value: number, min: number, max: number) {
  const t = max <= min ? 0.5 : (value - min) / (max - min)
  const pct = Math.round(14 + t * 82)
  return `color-mix(in oklab, var(--color-primary) ${pct}%, white)`
}

function behaviourBadgeClass(kind: FcLoopBehaviourKind) {
  if (kind === "high-cancel-soft-fill") {
    return "bg-amber-500/15 text-amber-900 dark:text-amber-200"
  }
  if (kind === "strong-fill-weak-cover") {
    return "bg-primary/15 text-primary"
  }
  if (kind === "low-cancel-strong-fill" || kind === "value-beat") {
    return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
  }
  return "bg-foreground/5 text-foreground/70"
}

function MatrixCellSwatch({
  cell,
  title,
  colourMin,
  colourMax,
}: {
  cell: FcLoopCellMetrics
  title: string
  colourMin: number
  colourMax: number
}) {
  const relet = Math.min(100, Math.max(0, cell.relet))
  const behaviour = describeFcLoopBehaviour(cell)
  const label = `${title}: relet ${relet.toFixed(1)}%`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="size-10 shrink-0 rounded-md outline-none transition-[transform,box-shadow] hover:scale-105 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/40"
          style={{
            backgroundColor: heatSwatchBackground(relet, colourMin, colourMax),
          }}
          aria-label={label}
        />
      </TooltipTrigger>
      <TooltipContent
        variant="plain"
        className="max-w-56 space-y-1.5 px-3 py-2.5 text-left"
      >
        <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          Relet {relet.toFixed(1)}%
        </p>
        {behaviour.kind !== "balanced" ? (
          <p className="text-[11px] text-muted-foreground">{behaviour.badge}</p>
        ) : null}
        <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-1.5 text-[10px] tabular-nums">
          <div>
            <p className="text-muted-foreground">ATT</p>
            <p className="font-medium text-foreground">{cell.sales.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">CXL</p>
            <p className="font-medium text-foreground">{cell.cancel.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">REC</p>
            <p className="font-medium text-foreground">
              {cell.recoveredPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

type FcValueLoopExploreProps = {
  onOpenRelets?: () => void
  onAskAi?: (prompt: string) => void
}

export function FcValueLoopExplore({ onOpenRelets, onAskAi }: FcValueLoopExploreProps) {
  const [rowDim, setRowDim] = useState<HeatDimension>("bedroom")
  const [colDim, setColDim] = useState<HeatDimension>("departure")
  const [filterId, setFilterId] = useState<string | "all">("all")

  const filterDim = getFilterDimension(rowDim, colDim)
  const filterBands = HEAT_BANDS[filterDim]
  const filterLabel =
    HEAT_DIMENSION_OPTIONS.find((option) => option.id === filterDim)?.label ?? "Filter"

  const matrix = useMemo(
    () =>
      buildFcLoopMatrix({
        rowDim,
        colDim,
        filterId,
        colourMetric: "relet",
      }),
    [rowDim, colDim, filterId]
  )

  const opportunities = useMemo(() => getFcLoopOpportunities(), [])

  const handleRowChange = (next: HeatDimension) => {
    if (next === colDim) setColDim(rowDim)
    setRowDim(next)
    setFilterId("all")
  }

  const handleColChange = (next: HeatDimension) => {
    if (next === rowDim) setRowDim(colDim)
    setColDim(next)
    setFilterId("all")
  }

  return (
    <div className="space-y-6">
      <div className={PANEL}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-sm">
            <p className={MONO_LABEL}>Behaviour drivers</p>
            <div className="mt-1 flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                By bedrooms and travel dates
              </h3>
              <MeasureHelp title="By bedrooms and travel dates" help={FC_LOOP_MATRIX_HELP} />
            </div>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Colour shows relet strength. Hover a swatch for ATT, CXL, and REC.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
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
            <label className="flex min-w-[7.5rem] flex-col gap-1">
              <span className={MONO_LABEL}>Filter</span>
              <div className="relative">
                <select
                  value={filterId}
                  onChange={(event) =>
                    setFilterId(event.target.value === "all" ? "all" : event.target.value)
                  }
                  className={SELECT_CLASS}
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
                    className="w-10 px-0.5 pb-2 text-center text-[10px] font-medium tracking-wide text-muted-foreground/80"
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
                    const cell = matrix.cells[rowIndex]?.[colIndex] ?? null
                    if (!cell) {
                      return (
                        <td key={col.id} className="p-0">
                          <div className="size-10 rounded-md bg-transparent" />
                        </td>
                      )
                    }
                    return (
                      <td key={col.id} className="p-0">
                        <MatrixCellSwatch
                          cell={cell}
                          title={`${row.label} · ${col.label}`}
                          colourMin={matrix.colourMin}
                          colourMax={matrix.colourMax}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Colour = relet rate · hover for ATT · CXL · REC
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Lower relet</span>
            <div className="flex h-3 items-center gap-0.5" aria-hidden>
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
            <span>Higher relet</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
        <ActSignalsPanel
          opportunities={opportunities}
          onOpenRelets={onOpenRelets}
          onAskAi={onAskAi}
        />
        <ProofPanel onOpenRelets={onOpenRelets} />
      </div>
    </div>
  )
}

type SignalFilter = "all" | FcLoopOpportunity["signal"]

function signalMeta(signal: FcLoopOpportunity["signal"]) {
  if (signal === "risk") {
    return {
      label: "Risk",
      Icon: CircleAlert,
      chip: "text-amber-800 dark:text-amber-300",
    }
  }
  if (signal === "opportunity") {
    return {
      label: "Opportunity",
      Icon: Rocket,
      chip: "text-primary",
    }
  }
  return {
    label: "Success",
    Icon: CircleCheck,
    chip: "text-emerald-700 dark:text-emerald-400",
  }
}

function ActSignalsPanel({
  opportunities,
  onOpenRelets,
  onAskAi,
}: {
  opportunities: FcLoopOpportunity[]
  onOpenRelets?: () => void
  onAskAi?: (prompt: string) => void
}) {
  const [filter, setFilter] = useState<SignalFilter>("all")

  const counts = {
    all: opportunities.length,
    risk: opportunities.filter((item) => item.signal === "risk").length,
    opportunity: opportunities.filter((item) => item.signal === "opportunity").length,
    success: opportunities.filter((item) => item.signal === "success").length,
  }

  const visible =
    filter === "all"
      ? opportunities
      : opportunities.filter((item) => item.signal === filter)

  const tabs: Array<{ id: SignalFilter; label: string; count: number }> = [
    { id: "all", label: "All signals", count: counts.all },
    { id: "risk", label: "Risk", count: counts.risk },
    { id: "opportunity", label: "Opportunity", count: counts.opportunity },
    { id: "success", label: "Success", count: counts.success },
  ]

  function handleAction(item: FcLoopOpportunity) {
    if (item.actionTarget === "releats") {
      onOpenRelets?.()
      return
    }
    if (item.actionTarget === "ask-ai") {
      onAskAi?.(item.askPrompt)
    }
  }

  function actionAvailable(item: FcLoopOpportunity) {
    if (item.actionTarget === "releats") return Boolean(onOpenRelets)
    if (item.actionTarget === "ask-ai") return Boolean(onAskAi)
    return false
  }

  return (
    <div className={PANEL}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            Act
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">Where to run the business</h3>
            <MeasureHelp title="Where to run the business" help={FC_LOOP_OPPORTUNITIES_HELP} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Raise conversion where re-let is strong, fix recovery gaps, watch soft regions, and
            copy what already pays.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-2.5 py-2 text-xs font-medium transition-colors",
              filter === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}{" "}
            <span className="tabular-nums text-muted-foreground">{tab.count}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 max-h-[calc(3.5*(6.25rem+0.625rem)-0.625rem)] space-y-2.5 overflow-y-auto overscroll-contain pr-1">
        {visible.map((item) => {
          const meta = signalMeta(item.signal)
          const Icon = meta.Icon
          return (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-border/70 bg-background"
            >
              <div className="flex min-h-[5.5rem]">
                <div className="min-w-0 flex-1 space-y-1.5 px-3.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold",
                        meta.chip
                      )}
                    >
                      <Icon className="size-3.5" />
                      {meta.label}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.title}
                    </span>
                    {item.regionLabel ? (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        Region
                      </span>
                    ) : null}
                    {item.behaviour ? (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                          behaviourBadgeClass(item.behaviour.kind)
                        )}
                      >
                        {item.behaviour.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-snug text-foreground">{item.detail}</p>
                  {item.openRisk ? (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {item.openRisk.count} open cancel
                        {item.openRisk.count === 1 ? "" : "s"}
                      </span>
                      {" · "}
                      {formatCurrency(item.openRisk.value)} at risk
                    </p>
                  ) : null}
                </div>
                <div className="flex w-[9.5rem] shrink-0 flex-col justify-between border-l border-border/70 px-3.5 py-3 sm:w-[11rem]">
                  <div className="space-y-1">
                    {item.metricsList.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                          {metric.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    {actionAvailable(item) ? (
                      <button
                        type="button"
                        onClick={() => handleAction(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {item.actionLabel}
                        <ArrowRight className="size-3" />
                      </button>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
                        title="Deep-link coming soon"
                      >
                        {item.actionLabel}
                        <span className="text-[10px] font-normal text-muted-foreground/70">
                          · soon
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
        {visible.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            No signals in this filter.
          </li>
        ) : null}
      </ul>
    </div>
  )
}

function ProofPanel({ onOpenRelets }: { onOpenRelets?: () => void }) {
  const examples = FC_LOOP_PROOF.examples
  const totalRecovered = examples.reduce((sum, item) => sum + item.recoveredValue, 0)
  const totalGain = examples.reduce((sum, item) => sum + item.gain, 0)

  return (
    <div className={cn(PANEL, "flex h-full flex-col")}>
      <span className="inline-flex w-fit items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-emerald-700 uppercase dark:text-emerald-400">
        Proof
      </span>
      <div className="mt-2 flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">{FC_LOOP_PROOF.title}</h3>
        <MeasureHelp title={FC_LOOP_PROOF.title} help={FC_LOOP_PROOF.help} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{FC_LOOP_PROOF.summary}</p>

      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border/60 pt-4">
        <div>
          <p className="text-lg font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(totalRecovered)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Recovered across {examples.length} latest re-lets
          </p>
        </div>
        {totalGain !== 0 ? (
          <p
            className={cn(
              "text-xs font-semibold tabular-nums",
              totalGain > 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          >
            {totalGain > 0 ? "+" : ""}
            {formatCurrency(totalGain)} vs cancelled
          </p>
        ) : null}
      </div>

      <ul className="mt-3 space-y-2">
        {examples.map((example) => (
          <li
            key={example.id}
            className="rounded-xl border border-border/70 bg-background px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {example.property}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {example.cancelledNights}n → {example.fillsLabel}
                  {example.isSplit ? " · split" : ""}
                  <span className="text-muted-foreground/70"> · {example.cancelledAt}</span>
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatCurrency(example.recoveredValue)}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] font-medium tabular-nums",
                    example.gain > 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : example.gain < 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-muted-foreground"
                  )}
                >
                  {example.gain > 0 ? "+" : ""}
                  {formatCurrency(example.gain)}
                  {example.gain !== 0
                    ? ` (${example.upliftPct > 0 ? "+" : ""}${Math.round(example.upliftPct)}%)`
                    : " matched"}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>Cancelled {formatCurrency(example.cancelledValue)}</span>
              <span className="font-medium text-foreground/70">Re-let revenue</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        {onOpenRelets ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full rounded-full text-xs"
            onClick={onOpenRelets}
          >
            Open Cancellations &amp; re-lets
            <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            See live bookings and split fills on Cancellations &amp; re-lets.
          </p>
        )}
      </div>
    </div>
  )
}
