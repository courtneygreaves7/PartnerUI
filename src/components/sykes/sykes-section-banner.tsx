import { cn } from "@/lib/utils"

type SykesSectionBannerProps = {
  title: string
  className?: string
}

export function SykesSectionBanner({ title, className }: SykesSectionBannerProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-[#6b21a8] px-4 py-3 text-sm font-semibold text-white",
        className
      )}
    >
      {title}
    </div>
  )
}
