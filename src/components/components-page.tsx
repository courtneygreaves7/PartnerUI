import { useEffect, useState } from "react"
import { BookOpen, Layers, Search } from "lucide-react"

import { ComponentDocBlock, CodeBlock, DocCallout, PropsTable } from "@/components/components-doc/doc-primitives"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  componentCategories,
  componentsCatalog,
  figureStyleTokens,
} from "@/lib/components-catalog"
import { componentsCatalogExtra } from "@/lib/components-catalog-extra"
import { cn } from "@/lib/utils"

const fullCatalog = [...componentsCatalog, ...componentsCatalogExtra]

function TableOfContents({
  activeId,
  onNavigate,
}: {
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav className="space-y-6 text-sm">
      {componentCategories.map((category) => {
        const items = fullCatalog.filter((entry) => entry.category === category.id)
        if (items.length === 0) return null

        return (
          <div key={category.id}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {category.title}
            </p>
            <ul className="space-y-0.5">
              {items.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(entry.id)}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent",
                      activeId === entry.id
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {entry.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Reference
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onNavigate("design-tokens")}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent",
                activeId === "design-tokens"
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              Design tokens
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export function ComponentsPage() {
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState(fullCatalog[0]?.id ?? "")

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCatalog = fullCatalog.filter((entry) => {
    if (!normalizedQuery) return true
    const haystack = [
      entry.name,
      entry.description,
      entry.whenToUse,
      entry.filePath,
      entry.category,
      ...entry.props.map((prop) => `${prop.name} ${prop.description}`),
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(normalizedQuery)
  })

  const filteredCategories = componentCategories
    .map((category) => ({
      ...category,
      entries: filteredCatalog.filter((entry) => entry.category === category.id),
    }))
    .filter((category) => category.entries.length > 0)

  function scrollToSection(id: string) {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => {
    const sections = [...fullCatalog.map((entry) => entry.id), "design-tokens"]

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [filteredCatalog.length])

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-6xl pb-16">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="size-4" />
          <span>Keystone design system</span>
        </div>

        <div className="flex gap-10">
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-8 space-y-4">
              <div className="flex h-9 items-center gap-2 text-sm font-medium">
                <BookOpen className="size-4 text-muted-foreground" />
                <span>On this page</span>
              </div>
              <TableOfContents activeId={activeId} onNavigate={scrollToSection} />
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-10">
            <header className="space-y-4 border-b border-border pb-8">
              <h1 className="text-3xl font-semibold tracking-tight leading-9">Components</h1>
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                A living library of every Keystone component — stored, documented, and refined here.
                Each entry includes a live preview, props reference, usage example, and source file.
              </p>

              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search components, props, or files…"
                  className="pl-9"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {fullCatalog.length} components documented
              </p>
            </header>

          {filteredCategories.length === 0 ? (
            <DocCallout>No components match &ldquo;{query}&rdquo;.</DocCallout>
          ) : (
            filteredCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-24 space-y-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>

                <div className="space-y-12">
                  {category.entries.map((entry) => (
                    <ComponentDocBlock key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))
          )}

          <Separator />

          <section id="design-tokens" className="scroll-mt-24 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">Design tokens</h2>
              <p className="text-sm text-muted-foreground">
                Shared typography and layout constants used across widgets and charts.
              </p>
            </div>

            <PropsTable
              props={figureStyleTokens.map((token) => ({
                name: token.name,
                type: "string | number",
                description: `${token.usage} — \`${token.value}\``,
              }))}
            />

            <CodeBlock
              code={`import { FIGURE_20PX_CLASS, FIGURE_30PX_CLASS } from "@/lib/figure-styles"
import { CHART_HEIGHT } from "@/lib/chart-styles"

<HeadlineDataWidget valueClassName={FIGURE_20PX_CLASS} ... />
<ResponsiveContainer width="100%" height={CHART_HEIGHT} />`}
            />
          </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
