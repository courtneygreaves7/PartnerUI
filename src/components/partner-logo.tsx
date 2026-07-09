import { cn } from "@/lib/utils"
import { PARTNER_BRANDING } from "@/lib/partner-branding"
import sykesLogoBlue from "@/assets/sykes-holiday-cottages-logo.png"
import sykesLogoMask from "@/assets/sykes-logo-mask.png"

type PartnerLogoProps = {
  className?: string
  compact?: boolean
  variant?: "sidebar" | "hero"
  /** Force white logo (e.g. on blue gradient backgrounds). */
  inverted?: boolean
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

export function PartnerLogo({
  className,
  compact = false,
  variant = "sidebar",
  inverted = false,
}: PartnerLogoProps) {
  if (compact) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center", className)}>
        <SykesHouseMark inverted={inverted} />
        <span className="sr-only">{PARTNER_BRANDING.name}</span>
      </div>
    )
  }

  const sizeClass =
    variant === "hero" ? "h-10 w-auto max-w-[220px]" : "h-6 w-auto max-w-[140px]"

  const whiteLogo = (
    <span
      role="img"
      aria-label={PARTNER_BRANDING.name}
      className={cn("aspect-[1024/201] shrink-0 bg-white", sizeClass)}
      style={{
        WebkitMaskImage: `url(${sykesLogoMask})`,
        maskImage: `url(${sykesLogoMask})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  )

  if (inverted) {
    return <div className={cn("flex min-w-0 items-center", className)}>{whiteLogo}</div>
  }

  return (
    <div className={cn("flex min-w-0 items-center", className)}>
      <img
        src={sykesLogoBlue}
        alt={PARTNER_BRANDING.name}
        className={cn("object-contain object-left dark:hidden", sizeClass)}
      />
      <span
        role="img"
        aria-label={PARTNER_BRANDING.name}
        className={cn(
          "hidden aspect-[1024/201] shrink-0 bg-white dark:inline-block",
          sizeClass
        )}
        style={{
          WebkitMaskImage: `url(${sykesLogoMask})`,
          maskImage: `url(${sykesLogoMask})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </div>
  )
}
