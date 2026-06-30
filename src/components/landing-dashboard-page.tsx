import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import {
  BarChart3,
  ChevronRight,
  FileText,
  GripVertical,
  LayoutPanelTop,
  Package,
  Plus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"

import { FilterContextPill } from "@/components/filter-context-pill"

import { getProductSplit } from "@/components/bookings-snapshot"
import { ManageTargetsPage } from "@/components/manage-targets-page"
import { ScrollResetContainer } from "@/components/scroll-reset-container"
import { TargetsSnapshot } from "@/components/targets-snapshot"
import { TeamMemberAvatar } from "@/components/team-member-list-item"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MetricTrendWidget } from "@/components/widgets/metric-trend-widget"
import { ProductSplitWidget } from "@/components/widgets/product-split-widget"
import {
  type ActiveFilters,
  buildBookingTrendChart,
  deriveBookingTrendMeta,
  getBookingProfile,
} from "@/lib/chart-data"
import { metricCardGridClass } from "@/lib/card-layout"
import { INSIGHTS_WIDGET_HELP_TEXT } from "@/lib/insights-widget-labels"
import { TEAM_MEMBERS, TEAM_STATUS_LABELS, type TeamMember } from "@/lib/team-data"
import { cn } from "@/lib/utils"

type HomeView = "dashboard" | "manage-targets"

export type BookingEngineView = "partners" | "properties" | "bookings"
export type BookingEngineAction =
  | "add-partner"
  | "add-policy"
  | "add-product"
  | "add-capacity"

export type LandingDestination =
  | { section: "booking-engine"; view?: BookingEngineView; action?: BookingEngineAction }
  | { section: "insights"; anchor?: string }
  | { section: "admin" }

type LandingDashboardPageProps = {
  filters: ActiveFilters
  onNavigate: (destination: LandingDestination) => void
  isCustomising?: boolean
}

const PANEL_BORDER_CLASS = "border-border bg-card"
const PANEL_CUSTOMISE_BORDER_CLASS = "border-2 border-dashed border-primary/50 bg-card"

type DashboardCardId = "operations" | "intelligence" | "targets" | "team"

const DEFAULT_CARD_ORDER: DashboardCardId[] = [
  "operations",
  "intelligence",
  "targets",
  "team",
]

const CARD_ORDER_STORAGE_KEY = "keystone-landing-card-order"

/** Keep the team card height stable; only the member list scrolls beyond this. */
const TEAM_LIST_MAX_HEIGHT_CLASS = "max-h-96"

function getInitialCardOrder(): DashboardCardId[] {
  try {
    const stored = localStorage.getItem(CARD_ORDER_STORAGE_KEY)
    if (!stored) return DEFAULT_CARD_ORDER

    const parsed = JSON.parse(stored) as DashboardCardId[]
    const isValid =
      parsed.length === DEFAULT_CARD_ORDER.length &&
      DEFAULT_CARD_ORDER.every((id) => parsed.includes(id))

    return isValid ? parsed : DEFAULT_CARD_ORDER
  } catch {
    return DEFAULT_CARD_ORDER
  }
}

function reorderCards(order: DashboardCardId[], fromIndex: number, toIndex: number) {
  const next = [...order]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function areCardsInSameRow(order: DashboardCardId[], a: DashboardCardId, b: DashboardCardId) {
  const aIndex = order.indexOf(a)
  const bIndex = order.indexOf(b)
  if (aIndex < 0 || bIndex < 0) return false
  return Math.floor(aIndex / 2) === Math.floor(bIndex / 2)
}

type DragHandleProps = HTMLAttributes<HTMLButtonElement>

function CustomiseDashboardToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      className="pointer-events-auto fixed bottom-8 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-white p-4 text-zinc-900 shadow-lg">
        <LayoutPanelTop className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Customise your dashboard</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            Drag Operations, Intelligence, Targets, and Team using the grip handles. Your
            layout is saved automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

function DragHandleButton({
  label,
  dragHandleProps,
}: {
  label: string
  dragHandleProps: DragHandleProps
}) {
  return (
    <button
      type="button"
      {...dragHandleProps}
      className={cn(
        "mt-0.5 inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:cursor-grabbing",
        dragHandleProps.className
      )}
      aria-label={`Drag to reorder ${label}`}
    >
      <GripVertical className="size-4" />
    </button>
  )
}

function DraggableDashboardSlot({
  cardId,
  index,
  enabled,
  onReorder,
  slotRef,
  className,
  style,
  children,
}: {
  cardId: DashboardCardId
  index: number
  enabled: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
  slotRef?: React.RefObject<HTMLDivElement | null>
  className?: string
  style?: React.CSSProperties
  children: (dragHandleProps?: DragHandleProps) => ReactNode
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)

  const dragHandleProps: DragHandleProps = {
    draggable: true,
    onDragStart: (event) => {
      event.dataTransfer.setData("text/dashboard-card-index", String(index))
      event.dataTransfer.effectAllowed = "move"
      setIsDragging(true)
    },
    onDragEnd: () => {
      setIsDragging(false)
      setIsDropTarget(false)
    },
  }

  return (
    <div
      ref={slotRef}
      data-card-id={cardId}
      className={cn(
        "min-w-0",
        className,
        enabled && isDragging && "ring-2 ring-primary/30",
        enabled && isDropTarget && "rounded-xl ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
      )}
      style={style}
      onDragOver={
        enabled
          ? (event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setIsDropTarget(true)
            }
          : undefined
      }
      onDragLeave={enabled ? () => setIsDropTarget(false) : undefined}
      onDrop={
        enabled
          ? (event) => {
              event.preventDefault()
              const fromIndex = Number(event.dataTransfer.getData("text/dashboard-card-index"))
              if (!Number.isNaN(fromIndex) && fromIndex !== index) {
                onReorder(fromIndex, index)
              }
              setIsDropTarget(false)
            }
          : undefined
      }
    >
      {children(enabled ? dragHandleProps : undefined)}
    </div>
  )
}

type TeamWorkStatus = TeamMember["status"]

const ADMIN_ACTIVITIES = [
  {
    id: "users",
    label: "User management",
    description: "Roles, access and invitations",
  },
  {
    id: "api",
    label: "API & integrations",
    description: "Keys, webhooks and connections",
  },
  {
    id: "logs",
    label: "System logs",
    description: "Audit trail and error monitoring",
  },
  {
    id: "platform",
    label: "Platform settings",
    description: "Environment and feature flags",
  },
] as const

function TeamWorkStatusBadge({ status }: { status: TeamWorkStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
        status === "completed" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "in_progress" && "bg-muted text-muted-foreground",
        status === "in_review" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        status === "blocked" && "bg-red-500/10 text-red-700 dark:text-red-400"
      )}
    >
      {TEAM_STATUS_LABELS[status]}
    </span>
  )
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <TeamMemberAvatar initials={member.initials} online={member.online} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.lastWorkedOn}</p>
      </div>
      <TeamWorkStatusBadge status={member.status} />
    </li>
  )
}

function QuickActionTile({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-xs transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

function PanelHeaderAccent({ colors }: { colors: string[] }) {
  return (
    <div className="flex shrink-0 items-stretch gap-1.5 self-stretch" aria-hidden>
      {colors.map((colorClass, index) => (
        <span key={index} className={cn("w-0.5 shrink-0 rounded-full", colorClass)} />
      ))}
    </div>
  )
}

function DashboardPanel({
  label,
  subtitle,
  linkLabel,
  onLinkClick,
  headerAction,
  headerAccentColors,
  dragHandleProps,
  children,
  className,
  variant = "fill",
  customiseMode = false,
}: {
  label: string
  subtitle: string
  linkLabel?: string
  onLinkClick?: () => void
  headerAction?: React.ReactNode
  headerAccentColors?: string[]
  dragHandleProps?: DragHandleProps
  children?: React.ReactNode
  className?: string
  variant?: "fill" | "compact"
  customiseMode?: boolean
}) {
  const hasBody = children != null

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border shadow-xs",
        variant === "fill" && hasBody ? "h-full min-h-0" : "",
        customiseMode ? PANEL_CUSTOMISE_BORDER_CLASS : PANEL_BORDER_CLASS,
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-stretch gap-3">
          {dragHandleProps ? (
            <DragHandleButton label={label} dragHandleProps={dragHandleProps} />
          ) : null}
          {headerAccentColors?.length ? (
            <PanelHeaderAccent colors={headerAccentColors} />
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {headerAction ? (
          <div className="shrink-0">{headerAction}</div>
        ) : linkLabel && onLinkClick ? (
          <button
            type="button"
            onClick={onLinkClick}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {linkLabel}
            <ChevronRight className="size-3.5" />
          </button>
        ) : null}
      </header>
      {hasBody ? (
        <div
          className={cn(
            "flex flex-col border-t border-border/50 px-5 py-4",
            variant === "fill" && "min-h-0 flex-1 overflow-hidden"
          )}
        >
          {children}
        </div>
      ) : null}
    </article>
  )
}

export function LandingDashboardPage({
  filters,
  onNavigate,
  isCustomising = false,
}: LandingDashboardPageProps) {
  const booking = getBookingProfile(filters)
  const productSplit = getProductSplit(booking)
  const bookingTrend = deriveBookingTrendMeta(booking.total)
  const bookingChart = buildBookingTrendChart(booking.total)
  const [cardOrder, setCardOrder] = useState<DashboardCardId[]>(getInitialCardOrder)
  const [homeView, setHomeView] = useState<HomeView>("dashboard")
  const [targetsRefreshKey, setTargetsRefreshKey] = useState(0)
  const intelligenceRef = useRef<HTMLDivElement>(null)
  const targetsRef = useRef<HTMLDivElement>(null)
  const [intelligenceHeight, setIntelligenceHeight] = useState<number>()
  const [targetsHeight, setTargetsHeight] = useState<number>()
  const [showCustomiseToast, setShowCustomiseToast] = useState(false)

  const handleCardReorder = useCallback((fromIndex: number, toIndex: number) => {
    setCardOrder((current) => {
      const next = reorderCards(current, fromIndex, toIndex)
      localStorage.setItem(CARD_ORDER_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    if (!isCustomising) {
      setShowCustomiseToast(false)
      return
    }

    setShowCustomiseToast(true)
  }, [isCustomising])

  const syncOpsWithIntel = areCardsInSameRow(cardOrder, "operations", "intelligence")
  const syncTeamWithTargets = areCardsInSameRow(cardOrder, "targets", "team")

  useEffect(() => {
    const element = intelligenceRef.current
    if (!element || !syncOpsWithIntel) {
      setIntelligenceHeight(undefined)
      return
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height
      if (height > 0) {
        setIntelligenceHeight(height)
      }
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [cardOrder, booking.total, syncOpsWithIntel])

  useEffect(() => {
    const element = targetsRef.current
    if (!element) {
      setTargetsHeight(undefined)
      return
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height
      if (height > 0) {
        setTargetsHeight(height)
      }
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [cardOrder])

  function renderDashboardCard(cardId: DashboardCardId, dragHandleProps?: DragHandleProps) {
    switch (cardId) {
      case "operations":
        return (
          <DashboardPanel
            className={syncOpsWithIntel ? "h-full" : undefined}
            variant={syncOpsWithIntel ? "fill" : "compact"}
            customiseMode={isCustomising}
            label="Operations"
            subtitle="Create new items or access common functions"
            headerAccentColors={["bg-green-500"]}
            linkLabel="Manage"
            onLinkClick={() => onNavigate({ section: "booking-engine" })}
            dragHandleProps={dragHandleProps}
          >
            <div
              className={cn(
                "grid grid-cols-2 gap-3",
                syncOpsWithIntel && "min-h-0 flex-1 content-start"
              )}
            >
              <QuickActionTile
                title="New Policy"
                description="Create a new policy"
                icon={FileText}
                onClick={() =>
                  onNavigate({ section: "booking-engine", view: "partners", action: "add-policy" })
                }
              />
              <QuickActionTile
                title="New Partner"
                description="Add a new partner"
                icon={Users}
                onClick={() =>
                  onNavigate({ section: "booking-engine", view: "partners", action: "add-partner" })
                }
              />
              <QuickActionTile
                title="New Product"
                description="Create a new product"
                icon={Package}
                onClick={() =>
                  onNavigate({ section: "booking-engine", view: "partners", action: "add-product" })
                }
              />
              <QuickActionTile
                title="New Capacity"
                description="Add capacity provider"
                icon={BarChart3}
                onClick={() =>
                  onNavigate({ section: "booking-engine", view: "partners", action: "add-capacity" })
                }
              />
            </div>
          </DashboardPanel>
        )

      case "intelligence":
        return (
          <DashboardPanel
            variant="compact"
            customiseMode={isCustomising}
            label="Intelligence"
            subtitle="Insights, trends & benchmarks"
            headerAccentColors={["bg-purple-500"]}
            linkLabel="Full report"
            onLinkClick={() => onNavigate({ section: "insights" })}
            dragHandleProps={dragHandleProps}
          >
            <div className={cn(metricCardGridClass, "@container min-w-0 grid-cols-2")}>
              <MetricTrendWidget
                className="min-w-0"
                title="Total bookings"
                value={booking.total}
                trendLabel={bookingTrend.trendLabel}
                trend={bookingTrend.trend}
                comparisonLabel={bookingTrend.comparisonLabel}
                chartData={bookingChart}
                scopeLabel="All selected partners and brands"
                rateLabel={bookingTrend.dailyAverage}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
              <ProductSplitWidget
                className="min-w-0"
                totalLabel={productSplit.totalLabel}
                segmentA={{
                  label: "CAL",
                  value: booking.calSales,
                  sharePercent: productSplit.calSharePercent,
                  takeUpLabel: booking.calPct,
                  trend: productSplit.calTrend,
                }}
                segmentB={{
                  label: "DDL",
                  value: booking.ddlSales,
                  sharePercent: productSplit.ddlSharePercent,
                  takeUpLabel: booking.ddlPct,
                  trend: productSplit.ddlTrend,
                }}
                helpText={INSIGHTS_WIDGET_HELP_TEXT}
              />
            </div>
          </DashboardPanel>
        )

      case "targets":
        return (
          <DashboardPanel
            variant="compact"
            customiseMode={isCustomising}
            label="Targets"
            subtitle="Progress against this period's goals"
            headerAccentColors={["bg-rose-500"]}
            linkLabel="Manage targets"
            onLinkClick={() => setHomeView("manage-targets")}
            dragHandleProps={dragHandleProps}
          >
            <TargetsSnapshot key={targetsRefreshKey} />
          </DashboardPanel>
        )

      case "team":
        return (
          <DashboardPanel
            className={syncTeamWithTargets ? "h-full" : undefined}
            variant={syncTeamWithTargets ? "fill" : "compact"}
            customiseMode={isCustomising}
            label="Team"
            subtitle="Who's working on what"
            headerAccentColors={["bg-indigo-500"]}
            dragHandleProps={dragHandleProps}
            headerAction={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <FileText className="size-3.5" />
                  Generate report
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Plus className="size-3.5" />
                  Add team member
                </Button>
              </div>
            }
          >
            <ul
              className={cn(
                "divide-y divide-border overflow-y-auto",
                syncTeamWithTargets ? "min-h-0 flex-1" : TEAM_LIST_MAX_HEIGHT_CLASS
              )}
            >
              {TEAM_MEMBERS.map((member) => (
                <TeamMemberRow key={member.id} member={member} />
              ))}
            </ul>
          </DashboardPanel>
        )
    }
  }

  if (homeView === "manage-targets") {
    return (
      <ScrollResetContainer
        resetKey="manage-targets"
        className="h-full min-h-0 overflow-y-auto"
      >
        <ManageTargetsPage
          onBack={() => {
            setHomeView("dashboard")
            setTargetsRefreshKey((key) => key + 1)
          }}
        />
      </ScrollResetContainer>
    )
  }

  return (
    <TooltipProvider>
    <div className="relative flex min-h-full flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Welcome back, Courtney</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A quick overview across policy admin and insights — pick a snapshot to dive deeper.
          </p>
        </div>

        <FilterContextPill filters={filters} />
      </div>

      <div className="grid grid-cols-2 items-start gap-8">
        {cardOrder.map((cardId, index) => (
          <DraggableDashboardSlot
            key={cardId}
            cardId={cardId}
            index={index}
            enabled={isCustomising}
            onReorder={handleCardReorder}
            slotRef={
              cardId === "intelligence"
                ? intelligenceRef
                : cardId === "targets"
                  ? targetsRef
                  : undefined
            }
            className={cn(
              cardId === "intelligence" && syncOpsWithIntel && "self-start",
              cardId === "operations" && syncOpsWithIntel && "w-full",
              cardId === "team" && syncTeamWithTargets && "w-full",
              cardId === "team" && !syncTeamWithTargets && "self-start"
            )}
            style={
              cardId === "operations" &&
              syncOpsWithIntel &&
              intelligenceHeight !== undefined &&
              intelligenceHeight > 0
                ? { height: intelligenceHeight }
                : cardId === "team" &&
                    syncTeamWithTargets &&
                    targetsHeight !== undefined &&
                    targetsHeight > 0
                  ? { height: targetsHeight }
                  : undefined
            }
          >
            {(dragHandleProps) => renderDashboardCard(cardId, dragHandleProps)}
          </DraggableDashboardSlot>
        ))}
      </div>

      <div className="grid grid-cols-8 items-stretch gap-3">
        <DashboardPanel
          className="col-span-8"
          label="Admin"
          subtitle="Backend administration, users & platform configuration"
          headerAccentColors={["bg-amber-500"]}
          linkLabel="Open admin"
          onLinkClick={() => onNavigate({ section: "admin" })}
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ADMIN_ACTIVITIES.map((activity) => (
              <li
                key={activity.id}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3"
              >
                <p className="text-sm font-medium text-foreground">{activity.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      </div>
    </div>

    {isCustomising && showCustomiseToast ? (
      <CustomiseDashboardToast onDismiss={() => setShowCustomiseToast(false)} />
    ) : null}
    </TooltipProvider>
  )
}
