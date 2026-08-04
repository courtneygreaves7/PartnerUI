import { useState } from "react"
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Info,
  Rocket,
} from "lucide-react"

import { InsightsMetricHeatmap } from "@/components/insights-metric-heatmap"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DDL_LOOP_OPPORTUNITIES_HELP,
  DDL_OPPORTUNITIES,
  type DdlOpportunity,
  type DdlSignal,
} from "@/lib/ddl-value-loop-data"
import { cn } from "@/lib/utils"

const PANEL = "rounded-2xl border border-border/60 bg-card p-5 shadow-xs"

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

function signalMeta(signal: DdlSignal) {
  if (signal === "risk") {
    return {
      label: "Risk",
      chip: "text-amber-700 dark:text-amber-400",
      Icon: CircleAlert,
    }
  }
  if (signal === "opportunity") {
    return {
      label: "Opportunity",
      chip: "text-primary",
      Icon: Rocket,
    }
  }
  return {
    label: "Success",
    chip: "text-emerald-700 dark:text-emerald-400",
    Icon: CircleCheck,
  }
}

type SignalFilter = "all" | DdlSignal

function DdlActSignals({ onAskAi }: { onAskAi?: (prompt: string) => void }) {
  const [filter, setFilter] = useState<SignalFilter>("all")
  const opportunities = DDL_OPPORTUNITIES

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

  function handleAction(item: DdlOpportunity) {
    if (item.actionTarget === "ask-ai") onAskAi?.(item.askPrompt)
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
            <MeasureHelp title="Where to run the business" help={DDL_LOOP_OPPORTUNITIES_HELP} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Push take-up where attachment is soft, protect channels that already pay, and chase the
            +1pp upside.
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
                  </div>
                  <p className="text-sm leading-snug text-foreground">{item.detail}</p>
                  {item.footnote ? (
                    <p className="text-[11px] text-muted-foreground">{item.footnote}</p>
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
                    {onAskAi ? (
                      <button
                        type="button"
                        onClick={() => handleAction(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {item.actionLabel}
                        <ArrowRight className="size-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">{item.actionLabel}</span>
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

type DdlValueLoopExploreProps = {
  onAskAi?: (prompt: string) => void
}

export function DdlValueLoopExplore({ onAskAi }: DdlValueLoopExploreProps) {
  return (
    <div className="space-y-6">
      <InsightsMetricHeatmap metricId="attachment" eyebrow="DDL attachment" />
      <DdlActSignals onAskAi={onAskAi} />
    </div>
  )
}
