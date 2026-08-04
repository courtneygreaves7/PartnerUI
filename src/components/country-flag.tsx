import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Portfolio / globe country codes that can show a flag badge. */
export type FlagCountryCode =
  | "UK"
  | "IE"
  | "FR"
  | "ES"
  | "NL"
  | "DE"
  | "IT"
  | "PT"
  | "US"

type FlagProps = { className?: string }

/** Circular flag face — square artboard clipped to a circle. */
function FlagSvg({ className, children }: FlagProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/20",
        className
      )}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  )
}

function BritishFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="2" />
      <path d="M16 0 V32 M0 16 H32" stroke="#fff" strokeWidth="8" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="4.5" />
    </FlagSvg>
  )
}

function IrishFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="10.67" height="32" fill="#169B62" />
      <rect x="10.67" width="10.66" height="32" fill="#fff" />
      <rect x="21.33" width="10.67" height="32" fill="#FF883E" />
    </FlagSvg>
  )
}

function FrenchFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="10.67" height="32" fill="#002395" />
      <rect x="10.67" width="10.66" height="32" fill="#fff" />
      <rect x="21.33" width="10.67" height="32" fill="#ED2939" />
    </FlagSvg>
  )
}

function SpanishFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="32" height="32" fill="#AA151B" />
      <rect y="8" width="32" height="16" fill="#F1BF00" />
    </FlagSvg>
  )
}

function DutchFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="32" height="10.67" fill="#AE1C28" />
      <rect y="10.67" width="32" height="10.66" fill="#fff" />
      <rect y="21.33" width="32" height="10.67" fill="#21468B" />
    </FlagSvg>
  )
}

function GermanFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="32" height="10.67" fill="#000" />
      <rect y="10.67" width="32" height="10.66" fill="#D00" />
      <rect y="21.33" width="32" height="10.67" fill="#FFCE00" />
    </FlagSvg>
  )
}

function ItalianFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="10.67" height="32" fill="#009246" />
      <rect x="10.67" width="10.66" height="32" fill="#fff" />
      <rect x="21.33" width="10.67" height="32" fill="#CE2B37" />
    </FlagSvg>
  )
}

function PortugueseFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="13" height="32" fill="#006600" />
      <rect x="13" width="19" height="32" fill="#FF0000" />
      <circle cx="13" cy="16" r="5" fill="#FFCC00" />
      <circle cx="13" cy="16" r="3" fill="#FFF" />
      <circle cx="13" cy="16" r="1.5" fill="#003399" />
    </FlagSvg>
  )
}

function UsFlag({ className }: FlagProps) {
  return (
    <FlagSvg className={className}>
      <rect width="32" height="32" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * (32 / 13)} width="32" height={32 / 13} fill="#fff" />
      ))}
      <rect width="14" height="17" fill="#3C3B6E" />
    </FlagSvg>
  )
}

export function CountryFlag({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  switch (code) {
    case "FR":
      return <FrenchFlag className={className} />
    case "ES":
      return <SpanishFlag className={className} />
    case "IE":
      return <IrishFlag className={className} />
    case "NL":
      return <DutchFlag className={className} />
    case "DE":
      return <GermanFlag className={className} />
    case "IT":
      return <ItalianFlag className={className} />
    case "PT":
      return <PortugueseFlag className={className} />
    case "US":
      return <UsFlag className={className} />
    case "UK":
    default:
      return <BritishFlag className={className} />
  }
}
