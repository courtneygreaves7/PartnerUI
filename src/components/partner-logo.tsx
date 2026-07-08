import { cn } from "@/lib/utils"
import { PARTNER_BRANDING } from "@/lib/partner-branding"

type PartnerLogoProps = {
  className?: string
  compact?: boolean
  variant?: "sidebar" | "hero"
}

export function PartnerLogo({ className, compact = false, variant = "sidebar" }: PartnerLogoProps) {
  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div
          aria-hidden
          className="grid size-12 place-items-center rounded-xl bg-[var(--brand-primary)] text-white"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
            <path d="M12 3 4 9.5V20h6v-5h4v5h6V9.5L12 3Zm0 2.8 6 4.7V18h-2v-5H10v5H6v-7.5l6-4.7Z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {PARTNER_BRANDING.name}
        </h1>
      </div>
    )
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-primary)] text-white"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M12 3 4 9.5V20h6v-5h4v5h6V9.5L12 3Zm0 2.8 6 4.7V18h-2v-5H10v5H6v-7.5l6-4.7Z" />
        </svg>
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            {PARTNER_BRANDING.shortName}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">Holiday Cottages</p>
        </div>
      ) : null}
    </div>
  )
}
