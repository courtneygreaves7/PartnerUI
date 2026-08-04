import { CircleHelp } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type WidgetHelpButtonProps = {
  title: string
  helpText?: string
}

export function WidgetHelpButton({ title, helpText }: WidgetHelpButtonProps) {
  const icon = (
    <CircleHelp className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
  )

  if (!helpText) {
    return <span aria-hidden>{icon}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="shrink-0 transition-colors hover:text-foreground"
          aria-label={`More information about ${title}`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        {helpText}
      </TooltipContent>
    </Tooltip>
  )
}
