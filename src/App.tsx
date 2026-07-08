import { useEffect, useRef, useState } from "react"
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  MoonStar,
  Sun,
} from "lucide-react"

import { FilterContextPill } from "@/components/filter-context-pill"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LoginPage } from "@/components/login-page"
import { PartnerLogo } from "@/components/partner-logo"
import { SykesPartnerDashboardPage } from "@/components/sykes-partner-dashboard-page"
import { SectionNav } from "@/components/section-nav"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { APP_MAIN_SCROLL_ID, scrollAppMainToTop, scrollToTop } from "@/lib/scroll-to-top"
import { type ActiveFilters, DEFAULT_FILTERS } from "@/lib/chart-data"
import { PARTNER_BRANDING } from "@/lib/partner-branding"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const mainScrollRef = useRef<HTMLElement>(null)

  function handleLogout() {
    setIsAuthenticated(false)
  }

  useEffect(() => {
    scrollAppMainToTop()
    scrollToTop(mainScrollRef.current)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "relative z-10 grid h-full",
          leftSidebarOpen ? "grid-cols-[230px_1fr]" : "grid-cols-[52px_1fr]"
        )}
      >
        <aside className="relative flex h-full min-h-0 flex-col overflow-visible">
          <TooltipProvider>
            {leftSidebarOpen ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-visible">
                <div className="shrink-0 px-5">
                  <div className="flex h-16 shrink-0 items-center justify-between gap-2">
                    <PartnerLogo />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => setLeftSidebarOpen(false)}
                          aria-label="Hide navigation"
                        >
                          <ChevronsLeft className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hide navigation</TooltipContent>
                    </Tooltip>
                  </div>

                  <nav className="mt-3">
                    <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Overview
                    </p>
                    <button
                      type="button"
                      aria-current="page"
                      className="flex w-full items-center gap-2.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-colors"
                    >
                      <LayoutDashboard className="size-4 shrink-0" />
                      Dashboard
                    </button>
                  </nav>
                </div>

                <div className="relative z-30 mt-6 shrink-0 space-y-3 overflow-visible px-5 pb-6">
                  <SectionNav />
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 bg-card"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4 shrink-0" />
                    Log out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center overflow-visible px-2">
                <div className="flex h-16 w-full shrink-0 items-center justify-center border-b border-border/50">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-9"
                        onClick={() => setLeftSidebarOpen(true)}
                        aria-label="Show navigation"
                      >
                        <ChevronsRight className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show navigation</TooltipContent>
                  </Tooltip>
                </div>

                <nav className="mt-4 flex w-full flex-col items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-current="page"
                        aria-label="Dashboard"
                        className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground"
                      >
                        <LayoutDashboard className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Dashboard</TooltipContent>
                  </Tooltip>
                </nav>

                <div className="relative z-30 mt-6 flex w-full shrink-0 flex-col items-center gap-2 overflow-visible px-2 pb-4">
                  <SectionNav collapsed />
                  <button
                    type="button"
                    title="Log out"
                    aria-label="Log out"
                    onClick={handleLogout}
                    className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </TooltipProvider>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-col p-3 pl-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset] backdrop-blur-md dark:shadow-none">
            <header className="relative flex h-14 shrink-0 items-center justify-between px-5">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">{PARTNER_BRANDING.shortName}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  onClick={() => setIsDark((value) => !value)}
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 gap-2 rounded-full px-3"
                      aria-label="User menu"
                    >
                      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[10px] font-semibold text-white">
                        SH
                        <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background bg-[var(--brand-accent)]" />
                      </span>
                      <span className="text-sm font-medium">Partner</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{PARTNER_BRANDING.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDark((v) => !v)}>
                      {isDark ? <Sun className="size-4" /> : <MoonStar className="size-4" />}
                      {isDark ? "Light mode" : "Dark mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="size-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/50"
              />
            </header>

            <div className="relative grid min-h-0 flex-1 grid-cols-[1fr_300px] overflow-hidden">
              <div className="min-h-0 min-w-0 overflow-hidden">
                <section
                  id={APP_MAIN_SCROLL_ID}
                  ref={mainScrollRef}
                  className="relative h-full min-h-0 overflow-y-auto px-8 py-8 xl:px-12 xl:py-10"
                >
                  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-[22px] font-semibold tracking-tight">
                        Partner dashboard
                      </h1>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pikl&apos;d Stays performance for {PARTNER_BRANDING.name}
                      </p>
                    </div>

                    <FilterContextPill filters={activeFilters} />
                  </div>

                  <SykesPartnerDashboardPage filters={activeFilters} />
                </section>
              </div>

              <FilterSidebar filters={activeFilters} onRun={setActiveFilters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
