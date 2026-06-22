import type { ReactNode } from "react"
import { Info, Lightbulb } from "lucide-react"

import {
  ComponentPreview,
  getPreviewLayout,
} from "@/components/components-doc/component-previews"
import type { ComponentCatalogEntry, ComponentPropDoc } from "@/lib/components-catalog"
import { cn } from "@/lib/utils"

export function DocCallout({
  children,
  variant = "info",
}: {
  children: ReactNode
  variant?: "info" | "tip"
}) {
  const Icon = variant === "tip" ? Lightbulb : Info

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        variant === "tip"
          ? "border-amber-200/80 bg-amber-50/50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100"
          : "border-border bg-muted/30 text-foreground"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 opacity-70" />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  )
}

export function PropsTable({ props }: { props: ComponentPropDoc[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Prop</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
            <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground sm:table-cell">
              Default
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 align-top">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                  {prop.name}
                </code>
                {prop.required ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                    required
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 align-top">
                <code className="text-xs text-muted-foreground">{prop.type}</code>
              </td>
              <td className="hidden px-4 py-3 align-top sm:table-cell">
                {prop.defaultValue ? (
                  <code className="text-xs text-muted-foreground">{prop.defaultValue}</code>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#fafafa] dark:bg-muted/20">
      <div className="border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Usage
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  )
}

export function PreviewFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/20 p-6",
        wide ? "w-full" : "max-w-2xl"
      )}
    >
      {children}
    </div>
  )
}

export function ComponentDocBlock({ entry }: { entry: ComponentCatalogEntry }) {
  const { wide } = getPreviewLayout(entry.id)

  return (
    <article id={entry.id} className="scroll-mt-24 space-y-6 border-b border-border pb-12 last:border-b-0">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{entry.name}</h3>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {entry.category.replace(/-/g, " ")}
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <PreviewFrame wide={wide}>
              <ComponentPreview id={entry.id} />
            </PreviewFrame>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              When to use
            </p>
            <DocCallout>{entry.whenToUse}</DocCallout>
          </div>

          {entry.props.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Props
              </p>
              <PropsTable props={entry.props} />
            </div>
          ) : null}

          <div className="space-y-2">
            <CodeBlock code={entry.usageExample} />
          </div>

          {entry.notes?.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </p>
              <ul className="space-y-2">
                {entry.notes.map((note) => (
                  <li key={note}>
                    <DocCallout variant="tip">{note}</DocCallout>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <MetaPanel entry={entry} />
        </aside>
      </div>
    </article>
  )
}

function MetaPanel({ entry }: { entry: ComponentCatalogEntry }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm shadow-xs">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Import</p>
        <code className="mt-1.5 block break-all rounded bg-muted px-2 py-1.5 text-xs">
          {`import { ${entry.name} } from "${entry.importPath}"`}
        </code>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">File</p>
        <code className="mt-1.5 block break-all text-xs text-muted-foreground">{entry.filePath}</code>
      </div>
    </div>
  )
}
