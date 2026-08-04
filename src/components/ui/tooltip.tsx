import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/** Latest pointer — updated without React state so tooltips don't remount on move. */
const lastPointer = { x: 0, y: 0 }

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (event) => {
      lastPointer.x = event.clientX
      lastPointer.y = event.clientY
    },
    { passive: true, capture: true }
  )
}

function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 0,
  disableHoverableContent = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
      {...props}
    />
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

function placeAtCursor(el: HTMLElement, sideOffset: number) {
  const x = lastPointer.x
  const y = lastPointer.y - sideOffset
  // Beat Radix / floating-ui inline transforms every frame while open.
  el.style.setProperty("position", "fixed", "important")
  el.style.setProperty("left", `${x}px`, "important")
  el.style.setProperty("top", `${y}px`, "important")
  el.style.setProperty("right", "auto", "important")
  el.style.setProperty("bottom", "auto", "important")
  el.style.setProperty("transform", "translate(-50%, -100%)", "important")
  el.style.setProperty("margin", "0", "important")
  el.style.setProperty("max-width", "min(18rem, calc(100vw - 1.5rem))", "important")
}

function TooltipContent({
  className,
  side = "top",
  align = "center",
  sideOffset = 14,
  collisionPadding = 12,
  avoidCollisions = true,
  variant = "default",
  followCursor = true,
  style,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: "default" | "plain"
  /** Position near the pointer (default). Set false to anchor to the trigger. */
  followCursor?: boolean
}) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!followCursor) return
    const el = contentRef.current
    if (!el) return

    let raf = 0
    const tick = () => {
      placeAtCursor(el, sideOffset)
      raf = window.requestAnimationFrame(tick)
    }

    placeAtCursor(el, sideOffset)
    raf = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(raf)
  }, [followCursor, sideOffset])

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={contentRef}
        side={side}
        align={align}
        sideOffset={followCursor ? 0 : sideOffset}
        collisionPadding={collisionPadding}
        avoidCollisions={followCursor ? false : avoidCollisions}
        className={cn(
          "z-[80] max-w-64 text-xs leading-relaxed animate-in fade-in-0 zoom-in-95",
          variant === "plain"
            ? "rounded-md border border-border/60 bg-card px-3 py-1.5 text-foreground shadow-md"
            : "rounded-md bg-[var(--tooltip)] px-3 py-1.5 text-[var(--tooltip-foreground)] shadow-md",
          followCursor && "pointer-events-none data-[state=delayed-open]:animate-none data-[state=instant-open]:animate-none",
          className
        )}
        style={style}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
