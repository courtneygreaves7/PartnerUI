import { useEffect, useState } from "react"

import type { InsightsProductId } from "@/components/partner-landing-page"
import { cn } from "@/lib/utils"

export type InsightsAnchorItem = {
  id: string
  label: string
  step?: string
}

const SHARED_TOP: InsightsAnchorItem = {
  id: "insights-top-cards",
  label: "Products",
}

const STORY_ARCS: Record<InsightsProductId, InsightsAnchorItem[]> = {
  cal: [
    SHARED_TOP,
    { id: "insights-health", label: "Health", step: "1" },
    { id: "insights-story", label: "Story", step: "2" },
    { id: "insights-act", label: "Act", step: "3" },
    { id: "insights-growth", label: "Growth", step: "4" },
    { id: "insights-detail", label: "Detail", step: "5" },
  ],
  ddl: [
    SHARED_TOP,
    { id: "insights-health", label: "Health", step: "1" },
    { id: "insights-story", label: "Story", step: "2" },
    { id: "insights-act", label: "Act", step: "3" },
    { id: "insights-growth", label: "Growth", step: "4" },
    { id: "insights-detail", label: "Detail", step: "5" },
  ],
  performance: [
    SHARED_TOP,
    { id: "insights-health", label: "Health", step: "1" },
    { id: "insights-story", label: "Story", step: "2" },
    { id: "insights-act", label: "Act", step: "3" },
    { id: "insights-growth", label: "Growth", step: "4" },
    { id: "insights-detail", label: "Detail", step: "5" },
  ],
  occupancy: [
    SHARED_TOP,
    { id: "insights-health", label: "Health", step: "1" },
    { id: "insights-story", label: "Story", step: "2" },
    { id: "insights-act", label: "Act", step: "3" },
  ],
}

type InsightsAnchorNavProps = {
  product: InsightsProductId
  className?: string
}

export function InsightsAnchorNav({ product, className }: InsightsAnchorNavProps) {
  const items = STORY_ARCS[product]
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  useEffect(() => {
    setActiveId(items[0]?.id ?? "")
  }, [product, items])

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target
        if (top?.id) setActiveId(top.id)
      },
      {
        root: null,
        // Account for sticky product tabs + this anchor row
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.08, 0.2, 0.4],
      }
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [items, product])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    setActiveId(id)
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav
      aria-label="Jump to section"
      className={cn("flex items-center gap-1.5 overflow-x-auto pb-0.5", className)}
    >
      {items.map((item) => {
        const active = activeId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/60 bg-background/80 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {item.step ? (
              <span
                className={cn(
                  "inline-grid size-4 place-items-center rounded-full text-[9px] font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.step}
              </span>
            ) : null}
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
