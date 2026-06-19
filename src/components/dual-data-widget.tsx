import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"

export type DualDataDataset = {
  title: string
  value: string
  clarification: string
}

export type DualDataWidgetProps = {
  primaryTitle: string
  datasetA: DualDataDataset
  datasetB: DualDataDataset
  helpText?: string
}

function DatasetColumn({ title, value, clarification }: DualDataDataset) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-foreground @sm:text-3xl">
        {value}
      </p>
      <p className="mt-1.5 truncate text-xs italic text-muted-foreground @sm:text-sm">
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
}: DualDataWidgetProps) {
  return (
    <Card className="@container flex h-full min-w-0 flex-col bg-card shadow-xs">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <h3 className="min-w-0 pr-2 text-sm font-semibold text-muted-foreground">{primaryTitle}</h3>
        <WidgetHelpButton title={primaryTitle} helpText={helpText} />
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center pb-5">
        <div className="flex min-w-0 items-stretch">
          <div className="min-w-0 flex-1 pr-3 @sm:pr-6">
            <DatasetColumn {...datasetA} />
          </div>
          <div aria-hidden className="w-px shrink-0 self-stretch bg-border" />
          <div className="min-w-0 flex-1 pl-3 @sm:pl-6">
            <DatasetColumn {...datasetB} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
