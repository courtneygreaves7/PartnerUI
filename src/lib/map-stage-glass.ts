import { cn } from "@/lib/utils"

/** Frosted glass chrome for overlays on map / globe stages. */
export const mapStageGlass = {
  panel: cn(
    "border border-white/25 bg-white/55 text-foreground",
    "shadow-[0_8px_32px_rgb(0_0_0_/_0.14)] backdrop-blur-xl backdrop-saturate-150",
    "dark:border-white/15 dark:bg-white/[0.08] dark:text-white dark:shadow-[0_8px_32px_rgb(0_0_0_/_0.4)]"
  ),
  /** Dark ocean / globe night stages — always translucent white glass. */
  panelOnDark: cn(
    "border border-white/18 bg-white/[0.1] text-white",
    "shadow-[0_8px_32px_rgb(0_0_0_/_0.35)] backdrop-blur-xl backdrop-saturate-150"
  ),
  /** Light heatmap canvas — frosted white glass. */
  panelOnLight: cn(
    "border border-white/55 bg-white/65 text-foreground",
    "shadow-[0_8px_28px_rgb(0_0_0_/_0.1)] backdrop-blur-xl backdrop-saturate-150"
  ),
  inset: cn(
    "rounded-full border border-white/30 bg-white/25",
    "dark:border-white/10 dark:bg-white/[0.06]"
  ),
  insetOnDark: "rounded-full border border-white/15 bg-white/[0.08]",
  insetOnLight: "rounded-full border border-black/[0.06] bg-black/[0.04]",
} as const
