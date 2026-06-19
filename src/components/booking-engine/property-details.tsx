import {
  Bath,
  Car,
  Flame,
  TreePine,
  Waves,
  Wifi,
  Wine,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataSnapshotWidget } from "@/components/widgets/data-snapshot-widget"
import {
  type PropertyDetails,
  type PropertyFeatureId,
} from "@/lib/property-details-data"

const FEATURE_ICONS: Record<PropertyFeatureId, LucideIcon> = {
  pool: Waves,
  fireplace: Flame,
  bar: Wine,
  "double-bath-tub": Bath,
  garden: TreePine,
  parking: Car,
  wifi: Wifi,
}

type PropertyDetailsProps = {
  details: PropertyDetails
}

export function PropertyDetailsPanel({ details }: PropertyDetailsProps) {
  return (
    <div className="space-y-5">
      <div className="@container min-w-0">
        <DataSnapshotWidget
          title="Overview"
          rows={details.overview.map((field) => ({
            label: field.label,
            value: field.value,
          }))}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="mb-4 text-base font-semibold">Description</h3>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {details.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-1">
          <CardContent className="p-5">
            <h3 className="mb-4 text-base font-semibold">Features</h3>
            <ul className="space-y-3">
              {details.features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.id]
                return (
                  <li
                    key={feature.id}
                    className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium">{feature.label}</span>
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold">Fetch Property Data</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <Input
              readOnly
              value={details.fetchUrlPrefix}
              className="bg-muted/40 text-muted-foreground sm:max-w-[280px]"
            />
            <Input defaultValue={details.fetchSlug} className="min-w-0 flex-1" />
          </div>
          <Button className="shrink-0">Fetch Data</Button>
        </div>
      </section>
    </div>
  )
}
