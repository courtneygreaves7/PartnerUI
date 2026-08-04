import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const MONO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground"

export type InsightsSectionBadge = {
  icon: LucideIcon
  label: string
}

type InsightsSectionProps = {
  id?: string
  eyebrow: string
  title: string
  description: string
  badge?: InsightsSectionBadge
  /** Left primary accent bar on the section shell. */
  accent?: boolean
  /** Short rule above this section (skip on the first). */
  showDivider?: boolean
  children: React.ReactNode
  className?: string
}

function SectionEyebrow({ eyebrow }: { eyebrow: string }) {
  const match = eyebrow.match(/^(\d+)\s*[·.]\s*(.+)$/)
  if (!match) {
    return <p className={MONO_LABEL}>{eyebrow}</p>
  }

  const [, step, label] = match
  return (
    <p className={cn(MONO_LABEL, "flex items-center gap-2")}>
      <span className="inline-grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold tracking-normal text-primary-foreground">
        {step}
      </span>
      <span>{label}</span>
    </p>
  )
}

/** Shared Insights story block — header + page-colour content shell. */
export function InsightsSection({
  id,
  eyebrow,
  title,
  description,
  badge,
  accent = false,
  showDivider = true,
  children,
  className,
}: InsightsSectionProps) {
  const BadgeIcon = badge?.icon

  return (
    <section id={id} className={cn(id && "scroll-mt-36", className)}>
      {showDivider ? (
        <div className="my-8 flex justify-center" aria-hidden>
          <div className="h-px w-12 bg-border" />
        </div>
      ) : null}
      <div
        className={cn(
          "relative space-y-6 overflow-hidden rounded-2xl border border-border/40 bg-[var(--panel-bg)] p-5 sm:p-6",
          accent && "pl-6 sm:pl-7"
        )}
      >
        {accent ? (
          <span
            className="absolute inset-y-0 left-0 w-1 bg-primary"
            aria-hidden
          />
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <SectionEyebrow eyebrow={eyebrow} />
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
