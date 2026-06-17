import type { CompareMetric, CompareSection } from "@/lib/compare-data"
import { cn } from "@/lib/utils"

function ButterflyRow({ metric }: { metric: CompareMetric }) {
  const max = Math.max(metric.left, metric.right, 1)
  const leftWidth = `${(metric.left / max) * 100}%`
  const rightWidth = `${(metric.right / max) * 100}%`

  return (
    <div className="relative min-h-11 border-b border-border py-4 pr-28 pl-5 last:border-b-0">
      <p className="max-w-[36%] text-sm text-muted-foreground">{metric.label}</p>

      <p
        className={cn(
          "absolute top-1/2 right-5 -translate-y-1/2 text-right text-sm font-medium tabular-nums",
          metric.deltaTone === "positive" && "text-emerald-700 dark:text-emerald-400",
          metric.deltaTone === "negative" && "text-rose-600 dark:text-rose-400",
          metric.deltaTone === "neutral" && "text-muted-foreground"
        )}
      >
        {metric.deltaDisplay}
      </p>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="grid grid-cols-[5rem_12rem_5rem] items-center gap-2">
          <p className="text-right text-sm font-medium tabular-nums">{metric.leftDisplay}</p>

          <div className="grid grid-cols-2 gap-0.5">
            <div className="flex justify-end">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="ml-auto h-2 rounded-full bg-emerald-700 dark:bg-emerald-600"
                  style={{ width: leftWidth }}
                />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-blue-700 dark:bg-blue-600"
                  style={{ width: rightWidth }}
                />
              </div>
            </div>
          </div>

          <p className="text-sm font-medium tabular-nums">{metric.rightDisplay}</p>
        </div>
      </div>
    </div>
  )
}

export function CompareMetricSection({ section }: { section: CompareSection }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
        {section.title}
      </h3>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {section.metrics.map((metric) => (
          <ButterflyRow key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  )
}
