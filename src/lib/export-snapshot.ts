import type { ActiveFilters } from "@/lib/chart-data"

export function buildSnapshotFilename(slug: string, filters?: ActiveFilters) {
  const period = filters
    ? `${filters.month}-${filters.year}`.toLowerCase().replace(/\s+/g, "-")
    : "snapshot"
  return `keystone-${slug}-${period}.png`
}

type StyleReset = {
  el: HTMLElement
  overflow: string
  height: string
  minHeight: string
  maxHeight: string
  flex: string
}

function prepareElementForCapture(root: HTMLElement) {
  const resets: StyleReset[] = []
  const elements = [root, ...root.querySelectorAll<HTMLElement>("*")]

  elements.forEach((el) => {
    const computed = getComputedStyle(el)
    const needsReset =
      computed.overflow !== "visible" ||
      computed.overflowX !== "visible" ||
      computed.overflowY !== "visible" ||
      el.classList.contains("min-h-0") ||
      el.classList.contains("flex-1") ||
      el.classList.contains("overflow-hidden") ||
      el.hasAttribute("data-snapshot-scroll")

    if (!needsReset) return

    resets.push({
      el,
      overflow: el.style.overflow,
      height: el.style.height,
      minHeight: el.style.minHeight,
      maxHeight: el.style.maxHeight,
      flex: el.style.flex,
    })

    el.style.overflow = "visible"
    el.style.maxHeight = "none"

    if (el.classList.contains("flex-1") || el.classList.contains("min-h-0") || el.hasAttribute("data-snapshot-scroll")) {
      el.style.flex = "none"
      el.style.height = "auto"
      el.style.minHeight = "0"
    }
  })

  return resets
}

function restoreElementStyles(resets: StyleReset[]) {
  resets.forEach(({ el, overflow, height, minHeight, maxHeight, flex }) => {
    el.style.overflow = overflow
    el.style.height = height
    el.style.minHeight = minHeight
    el.style.maxHeight = maxHeight
    el.style.flex = flex
  })
}

function fixSnapshotAlignment(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>("[data-snapshot-pill], [data-snapshot-filter-chip]")
    .forEach((pill) => {
    pill.style.display = "inline-block"
    pill.style.boxSizing = "border-box"
    pill.style.height = "32px"
    pill.style.lineHeight = "30px"
    pill.style.paddingTop = "0"
    pill.style.paddingBottom = "0"
    pill.style.paddingLeft = "16px"
    pill.style.paddingRight = "16px"
    pill.style.borderRadius = "9999px"
    pill.style.textAlign = "center"
    pill.style.verticalAlign = "middle"
    pill.style.fontSize = "11px"
    pill.style.fontWeight = "500"
    pill.style.margin = "0"
    pill.style.whiteSpace = "nowrap"

    if (pill.hasAttribute("data-snapshot-filter-chip")) {
      const borderColor =
        getComputedStyle(document.documentElement).getPropertyValue("--border").trim() ||
        "#d5e0ea"
      pill.style.border = `1px solid ${borderColor}`
    } else if (getComputedStyle(pill).borderWidth === "0px") {
      pill.style.border = "1px solid transparent"
    }
  })

  root.querySelectorAll<HTMLElement>(".recharts-legend-item").forEach((item) => {
    item.style.display = "inline-flex"
    item.style.alignItems = "center"
    item.style.gap = "6px"
  })

  root.querySelectorAll<HTMLElement>(".recharts-legend-item-text").forEach((text) => {
    text.style.display = "inline-block"
    text.style.lineHeight = "14px"
    text.style.marginTop = "2px"
  })

  root.querySelectorAll<HTMLElement>(".recharts-tooltip-wrapper").forEach((tooltip) => {
    tooltip.style.visibility = "hidden"
  })
}

export async function exportElementSnapshot(element: HTMLElement, filename: string) {
  const { default: html2canvas } = await import("html2canvas")
  const cardBg =
    getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#ffffff"
  const excluded = element.querySelectorAll<HTMLElement>("[data-snapshot-exclude]")
  const visibilityResets: Array<{ el: HTMLElement; visibility: string }> = []

  excluded.forEach((el) => {
    visibilityResets.push({ el, visibility: el.style.visibility })
    el.style.visibility = "hidden"
  })

  const layoutResets = prepareElementForCapture(element)
  fixSnapshotAlignment(element)

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: cardBg,
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (_doc, clonedElement) => {
        prepareElementForCapture(clonedElement)
        fixSnapshotAlignment(clonedElement)
      },
    })

    const link = document.createElement("a")
    link.download = filename
    link.href = canvas.toDataURL("image/png")
    link.click()
  } finally {
    restoreElementStyles(layoutResets)
    visibilityResets.forEach(({ el, visibility }) => {
      el.style.visibility = visibility
    })
  }
}
