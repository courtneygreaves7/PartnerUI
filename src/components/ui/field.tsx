import * as React from "react"

import { cn } from "@/lib/utils"

/** 6px vertical gap between a field label and the control below it. */
export const fieldLabelGapClassName = "gap-1.5"

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col", fieldLabelGapClassName, className)} {...props} />
  )
}
