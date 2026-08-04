import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />
}

function resolveHorizontalSide(trigger: HTMLElement) {
  const { left, right } = trigger.getBoundingClientRect()
  const spaceRight = window.innerWidth - right
  const spaceLeft = left

  return spaceRight >= spaceLeft ? "right" : "left"
}

function TooltipContent({
  className,
  side: sideProp,
  align = "center",
  sideOffset = 8,
  collisionPadding = 12,
  avoidCollisions = true,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: "default" | "plain"
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [autoSide, setAutoSide] = React.useState<"left" | "right">("right")

  React.useLayoutEffect(() => {
    if (sideProp) return

    const content = contentRef.current
    if (!content?.id) return

    const trigger = document.querySelector<HTMLElement>(
      `[aria-describedby="${CSS.escape(content.id)}"]`
    )
    if (!trigger) return

    setAutoSide(resolveHorizontalSide(trigger))
  })

  const side = sideProp ?? autoSide

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={contentRef}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        avoidCollisions={avoidCollisions}
        className={cn(
          "z-50 max-w-56 text-xs animate-in fade-in-0 zoom-in-95",
          variant === "plain"
            ? "rounded-md border border-border/60 bg-card px-3 py-1.5 text-foreground shadow-md"
            : "rounded-md bg-[var(--tooltip)] px-3 py-1.5 text-[var(--tooltip-foreground)] shadow-md",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
