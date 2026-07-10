import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WidgetHelpButton } from "@/components/widgets/widget-help-button"
import { cn } from "@/lib/utils"

export type StackedDataRow = {
  label: string
  value: string
}

export type StackedDataWidgetProps = {
  title: string
  rows: StackedDataRow[]
  helpText?: string
  className?: string
}

/** Stacked label/value pairs — typically two date-range or metric rows. */
export function StackedDataWidget({
  title,
  rows,
  helpText,
  className,
}: StackedDataWidgetProps) {
  return (
    <Card className={cn("h-auto bg-card shadow-xs", className)}>
      <CardHeader className="relative items-center justify-center pb-2 pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <div className="absolute top-4 right-4">
          <WidgetHelpButton title={title} helpText={helpText} />
        </div>
      </CardHeader>

      <CardContent className="space-y-0 pb-4">
        {rows.slice(0, 2).map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-2.5"
          >
            <span className="min-w-0 flex-1 text-sm italic text-muted-foreground">
              {row.label}
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
