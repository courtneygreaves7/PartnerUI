import { cn } from "@/lib/utils"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import { type BrandThemeId } from "@/lib/brand-theme"

type PartnerLogoProps = {
  className?: string
  compact?: boolean
  variant?: "sidebar" | "hero"
  /** Force white logo (e.g. on blue gradient backgrounds). */
  inverted?: boolean
  brandTheme?: BrandThemeId
}

/** Circular Sykes house mark for collapsed / compact UI. */
function SykesHouseMark({
  className,
  inverted = false,
}: {
  className?: string
  inverted?: boolean
}) {
  const stroke = inverted ? "currentColor" : "var(--primary)"

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-7 shrink-0", inverted && "text-white", className)}
    >
      <circle cx="16" cy="16" r="13.25" stroke={stroke} strokeWidth="2.25" />
      <path
        d="M9.5 17.25 L16 11.25 L22.5 17.25"
        stroke={stroke}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.15 12.85 V10.6"
        stroke={stroke}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PiklWordmark({
  className,
  compact = false,
  inverted = false,
  variant = "sidebar",
}: {
  className?: string
  compact?: boolean
  inverted?: boolean
  variant?: "sidebar" | "hero"
}) {
  if (compact) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center", className)}>
        <span
          className={cn(
            "grid size-7 place-items-center rounded-full text-[11px] font-bold tracking-tight",
            inverted
              ? "bg-white/15 text-white"
              : "bg-primary/10 text-primary"
          )}
        >
          P
        </span>
        <span className="sr-only">Pikl</span>
      </div>
    )
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-start", className)}>
      <span
        className={cn(
          "font-bold tracking-tight",
          variant === "hero" ? "text-2xl" : "text-xl",
          inverted ? "text-white" : "text-primary"
        )}
      >
        Pikl
      </span>
      <p
        className={cn(
          "mt-1 text-[9px] font-bold tracking-[0.14em] uppercase",
          inverted ? "text-white/70" : "text-muted-foreground"
        )}
      >
        Partner portal
      </p>
    </div>
  )
}

export function PartnerLogo({
  className,
  compact = false,
  variant = "sidebar",
  inverted = false,
  brandTheme = "sykes",
}: PartnerLogoProps) {
  if (brandTheme === "pikl") {
    return (
      <PiklWordmark
        className={className}
        compact={compact}
        inverted={inverted}
        variant={variant}
      />
    )
  }

  if (compact) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center", className)}>
        <SykesHouseMark inverted={inverted} />
        <span className="sr-only">{PARTNER_BRANDING.shortName}</span>
      </div>
    )
  }

  const markSize = variant === "hero" ? "size-9" : "size-7"
  const wordSize = variant === "hero" ? "text-2xl" : "text-lg"

  return (
    <div className={cn("flex min-w-0 flex-col items-start", className)}>
      <div
        className={cn(
          "flex items-center gap-2.5",
          inverted ? "text-white" : "text-foreground"
        )}
        role="img"
        aria-label={PARTNER_BRANDING.shortName}
      >
        <SykesHouseMark
          inverted={inverted}
          className={markSize}
        />
        <span
          aria-hidden
          className={cn(
            "h-5 w-px shrink-0 sm:h-6",
            inverted ? "bg-white/45" : "bg-border"
          )}
        />
        <span
          className={cn(
            "font-bold uppercase tracking-[0.04em]",
            wordSize,
            inverted ? "text-white" : "text-foreground"
          )}
        >
          {PARTNER_BRANDING.shortName}
        </span>
      </div>
    </div>
  )
}
