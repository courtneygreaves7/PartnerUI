import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type DataTableColumn = {
  key: string
  heading: string
  align?: "left" | "right"
}

export type DataTableRow = {
  id: string
  /** Primary field shown bold/italic in the first column. */
  primary: string
  cells: Record<string, string>
  href?: string
  linkLabel?: string
}

export type DataTableWidgetProps = {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  className?: string
}

/** Tabular results list with optional per-row detail links. */
export function DataTableWidget({ columns, rows, className }: DataTableWidgetProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-medium italic text-muted-foreground",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {column.heading}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium italic text-muted-foreground">
                <span className="sr-only">Link</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 tabular-nums text-foreground",
                      column.align === "right" ? "text-right" : "text-left",
                      index === 0 && "font-semibold italic"
                    )}
                  >
                    {index === 0 ? row.primary : (row.cells[column.key] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  {row.href ? (
                    <a
                      href={row.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {row.linkLabel ?? "Link"}
                      <ArrowRight className="size-3.5" />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
