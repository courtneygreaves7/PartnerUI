import { useEffect, useRef, type ReactNode } from "react"

import { scrollToTop } from "@/lib/scroll-to-top"
import { cn } from "@/lib/utils"

type ScrollResetContainerProps = {
  resetKey: string | number
  className?: string
  children: ReactNode
}

export function ScrollResetContainer({ resetKey, className, children }: ScrollResetContainerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToTop(ref.current)
  }, [resetKey])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
