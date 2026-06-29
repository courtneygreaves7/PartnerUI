import * as React from "react"
import { Calendar, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const isTimeInput = type === "time"
  const isDateTimeInput =
    type === "date" || isTimeInput || type === "datetime-local"

  const input = (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-field px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isDateTimeInput && "date-time-input",
        className
      )}
      {...props}
    />
  )

  if (!isDateTimeInput) {
    return input
  }

  const Icon = isTimeInput ? Clock : Calendar

  return (
    <div className="relative">
      {input}
      <Icon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

export { Input }
