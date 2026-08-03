import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FIGURE_24PX_CLASS } from "@/lib/figure-styles"
import { cn } from "@/lib/utils"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"

export type DualDataDataset = {
  title: string
  value: string
  clarification: string
  /** Optional override for this column’s value size/colour. */
  valueClassName?: string
}

export type DualDataWidgetProps = {
  primaryTitle?: string
  datasetA: DualDataDataset
  datasetB: DualDataDataset
  helpText?: string
  valueClassName?: string
  className?: string
}

function DatasetColumn({
  title,
  value,
  clarification,
  valueClassName,
}: DualDataDataset & { valueClassName?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-muted-foreground">{title}</p>
      <p
        className={cn(
          "mt-2 font-bold tracking-tight tabular-nums text-foreground",
          valueClassName ?? FIGURE_24PX_CLASS
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-snug text-muted-foreground @sm:text-sm">
        {clarification}
      </p>
    </div>
  )
}

export function DualDataWidget({
  primaryTitle,
  datasetA,
  datasetB,
  helpText,
  valueClassName,
  className,
}: DualDataWidgetProps) {
  return (
    <Card className={cn("@container flex h-full min-w-0 flex-col bg-card shadow-xs", className)}>
      {primaryTitle ? (
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
          <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{primaryTitle}</h3>
          <WidgetHelpButton title={primaryTitle} helpText={helpText} />
        </CardHeader>
      ) : null}

      <CardContent className={cn("flex flex-1 flex-col justify-center pb-5", !primaryTitle && "pt-5")}>
        <div className="flex min-w-0 items-stretch">
          <div className="min-w-0 flex-1 pr-3 @sm:pr-6">
            <DatasetColumn
              {...datasetA}
              valueClassName={datasetA.valueClassName ?? valueClassName}
            />
          </div>
          <div aria-hidden className="w-px shrink-0 self-stretch bg-border" />
          <div className="min-w-0 flex-1 pl-3 @sm:pl-6">
            <DatasetColumn
              {...datasetB}
              valueClassName={datasetB.valueClassName ?? valueClassName}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
