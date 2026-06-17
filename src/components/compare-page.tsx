import { useMemo, useState } from "react"
import { ArrowLeftRight, Play } from "lucide-react"

import { CompareFilterPanel } from "@/components/compare/compare-filter-panel"
import { CompareMetricSection } from "@/components/compare/compare-metric-section"
import { Button } from "@/components/ui/button"
import {
  buildCompareSections,
  DEFAULT_COMPARE_SIDE,
  formatCompareDateRange,
  getBrandLabel,
  getPartnerLabel,
  type CompareSideFilters,
} from "@/lib/compare-data"

export function ComparePage() {
  const [primaryDraft, setPrimaryDraft] = useState<CompareSideFilters>({
    ...DEFAULT_COMPARE_SIDE,
    partner: "partner-a",
  })
  const [comparisonDraft, setComparisonDraft] = useState<CompareSideFilters>({
    ...DEFAULT_COMPARE_SIDE,
    partner: "partner-b",
  })
  const [primaryApplied, setPrimaryApplied] = useState(primaryDraft)
  const [comparisonApplied, setComparisonApplied] = useState(comparisonDraft)

  const sections = useMemo(
    () => buildCompareSections(primaryApplied, comparisonApplied),
    [primaryApplied, comparisonApplied]
  )

  function runComparison() {
    setPrimaryApplied(primaryDraft)
    setComparisonApplied(comparisonDraft)
  }

  function swapSides() {
    setPrimaryDraft(comparisonDraft)
    setComparisonDraft(primaryDraft)
    setPrimaryApplied(comparisonApplied)
    setComparisonApplied(primaryApplied)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <CompareFilterPanel
          variant="primary"
          filters={primaryDraft}
          onChange={setPrimaryDraft}
          disablePartnerId={comparisonDraft.partner}
        />
        <CompareFilterPanel
          variant="comparison"
          filters={comparisonDraft}
          onChange={setComparisonDraft}
          disablePartnerId={primaryDraft.partner}
        />
      </div>

      <div className="flex justify-center">
        <Button className="min-w-52" onClick={runComparison}>
          <Play className="size-3.5" />
          Run comparison
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          <span className="w-1 shrink-0 rounded-full bg-emerald-600" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Primary
            </p>
            <p className="truncate text-sm font-medium">
              {getPartnerLabel(primaryApplied.partner)} · {getBrandLabel(primaryApplied.brand)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCompareDateRange(primaryApplied)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            vs
          </span>
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={swapSides}>
            <ArrowLeftRight className="size-3.5" />
            Swap
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch justify-end gap-3">
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Comparison
            </p>
            <p className="truncate text-sm font-medium">
              {getPartnerLabel(comparisonApplied.partner)} ·{" "}
              {getBrandLabel(comparisonApplied.brand)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCompareDateRange(comparisonApplied)}
            </p>
          </div>
          <span className="w-1 shrink-0 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <CompareMetricSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  )
}
