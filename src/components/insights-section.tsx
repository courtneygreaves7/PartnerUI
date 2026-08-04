import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

export type InsightsSectionBadge = {
  icon: LucideIcon
  label: string
}

type InsightsSectionProps = {
  eyebrow: string
  title: string
  description: string
  badge?: InsightsSectionBadge
  /** Short rule above this section (skip on the first). */
  showDivider?: boolean
  children: React.ReactNode
  className?: string
}

/** Shared Insights story block — header + page-colour content shell. */
export function InsightsSection({
  eyebrow,
  title,
  description,
  badge,
  showDivider = true,
  children,
  className,
}: InsightsSectionProps) {
  const BadgeIcon = badge?.icon

  return (
    <section className={className}>
      {showDivider ? (
        <div className="my-8 flex justify-center" aria-hidden>
          <div className="h-px w-12 bg-border" />
        </div>
      ) : null}
      <div className="space-y-6 rounded-2xl border border-border/40 bg-[var(--panel-bg)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className={MONO_LABEL}>{eyebrow}</p>
            <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-snug text-muted-foreground">{description}</p>
          </div>
          {badge && BadgeIcon ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary"
              )}
            >
              <BadgeIcon className="size-3.5 text-primary" />
              {badge.label}
            </span>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}
