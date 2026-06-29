import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  COMPARE_BRANDS,
  COMPARE_PARTNERS,
  type CompareSideFilters,
} from "@/lib/compare-data"
import { cn } from "@/lib/utils"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

type CompareFilterPanelProps = {
  variant: "primary" | "comparison"
  filters: CompareSideFilters
  onChange: (filters: CompareSideFilters) => void
  disablePartnerId?: string
}

export function CompareFilterPanel({
  variant,
  filters,
  onChange,
  disablePartnerId,
}: CompareFilterPanelProps) {
  const isPrimary = variant === "primary"

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-2 rounded-full", isPrimary ? "bg-compare-primary" : "bg-compare-comparison")}
          />
          <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            {isPrimary ? "Primary" : "Comparison"}
          </span>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label>Partner</Label>
            <Select
              value={filters.partner}
              onValueChange={(value) =>
                onChange({ ...filters, partner: value as CompareSideFilters["partner"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARE_PARTNERS.map((partner) => (
                  <SelectItem
                    key={partner.id}
                    value={partner.id}
                    disabled={partner.id === disablePartnerId}
                  >
                    {partner.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label>Brand</Label>
            <Select
              value={filters.brand}
              onValueChange={(value) =>
                onChange({ ...filters, brand: value as CompareSideFilters["brand"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARE_BRANDS.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <Label>Period</Label>
          <Tabs
            value={filters.dateRange}
            onValueChange={(value) =>
              onChange({
                ...filters,
                dateRange: value as CompareSideFilters["dateRange"],
              })
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="calendar-month">Month</TabsTrigger>
              <TabsTrigger value="year-to-month-end">YTD</TabsTrigger>
              <TabsTrigger value="custom-range">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label>Year</Label>
            <Select
              value={filters.year}
              onValueChange={(value) => onChange({ ...filters, year: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label>Month</Label>
            <Select
              value={filters.month}
              onValueChange={(value) => onChange({ ...filters, month: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </div>
  )
}
