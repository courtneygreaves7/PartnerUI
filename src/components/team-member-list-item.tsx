import { ArrowRight } from "lucide-react"

import {
  TEAM_STATUS_LABELS,
  type TeamMember,
  type TeamWorkStatus,
} from "@/lib/team-data"
import { cn } from "@/lib/utils"

type TeamMemberListItemProps = {
  member: TeamMember
  selected: boolean
  assignmentCount: number
  achievementPercent: number
  maxAchievement: number
  onSelect: () => void
}

const STATUS_TAG_CLASS: Record<TeamWorkStatus, string> = {
  in_progress: "border-border bg-muted/50 text-muted-foreground",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  in_review: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  blocked: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
}

export function TeamMemberAvatar({
  initials,
  online,
  className,
}: {
  initials: string
  online: boolean
  className?: string
}) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        aria-hidden
      >
        {initials}
      </div>
      <span
        className={cn(
          "absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-card",
          online ? "bg-emerald-500" : "bg-muted-foreground/35"
        )}
        aria-label={online ? "Online" : "Offline"}
      />
    </div>
  )
}

export function memberMatchesSearch(member: TeamMember, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  return (
    member.name.toLowerCase().includes(normalized) ||
    member.role.toLowerCase().includes(normalized) ||
    member.initials.toLowerCase().includes(normalized)
  )
}

export function TeamMemberListItem({
  member,
  selected,
  assignmentCount,
  achievementPercent,
  maxAchievement,
  onSelect,
}: TeamMemberListItemProps) {
  const progressPct =
    maxAchievement > 0 ? Math.min(100, (achievementPercent / maxAchievement) * 100) : 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        selected
          ? "border-foreground/25 bg-muted/50"
          : "border-border bg-card hover:bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-foreground">{member.name}</p>
        {selected ? (
          <ArrowRight className="size-4 shrink-0 text-foreground" strokeWidth={2} aria-hidden />
        ) : null}
      </div>

      <div className="mt-1.5 flex items-center gap-2 text-[11px]">
        <span className="font-semibold tabular-nums text-foreground">
          {assignmentCount} {assignmentCount === 1 ? "target" : "targets"}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold tabular-nums text-foreground">{achievementPercent}% avg</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-medium",
            STATUS_TAG_CLASS[member.status]
          )}
        >
          {TEAM_STATUS_LABELS[member.status]}
        </span>
        {member.online ? (
          <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Online
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Achievement</span>
          <span className="font-semibold tabular-nums text-foreground">{achievementPercent}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground/35"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </button>
  )
}
