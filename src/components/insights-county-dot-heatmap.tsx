import { useEffect, useMemo, useRef, useState } from "react"

import {
  formatMapMetric,
  formatMetricRank,
  getMetricValue,
  heatmapColor,
  MAP_HEATMAP_METRICS,
  metricRankBand,
  rankRegionByMetric,
  type MapMetricId,
  type MapRegion,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"

const ALL_COUNTIES = "all-counties"
const PAD = 28
/** Map-space gap between land dots. */
const DOT_STEP = 7.2
const DOT_RADIUS = 2.55
/** Background micro-grid step (map space). */
const MICRO_STEP = 10

type InsightsCountyDotHeatmapProps = {
  regions: MapRegion[]
  metric: MapMetricId
  range: { min: number; max: number }
  selectedCountyId: string
  hoveredCountyId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  className?: string
}

type PreparedRegion = {
  id: string
  name: string
  path: Path2D
  cx: number
  cy: number
  value: number
  t: number
}

type LandDot = {
  x: number
  y: number
  regionId: string
  r: number
  g: number
  b: number
}

type HoverCard = {
  id: string
  name: string
  x: number
  y: number
}

type Transform = {
  scale: number
  ox: number
  oy: number
  mapMinX: number
  mapMinY: number
  mapW: number
  mapH: number
}

function metricT(value: number, min: number, max: number) {
  if (max <= min) return 0.55
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

function boundsFromRegions(regions: MapRegion[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const region of regions) {
    minX = Math.min(minX, region.labelX)
    maxX = Math.max(maxX, region.labelX)
    minY = Math.min(minY, region.labelY)
    maxY = Math.max(maxY, region.labelY)
  }
  const padX = Math.max(40, (maxX - minX) * 0.12)
  const padY = Math.max(48, (maxY - minY) * 0.1)
  return {
    minX: minX - padX,
    minY: minY - padY,
    maxX: maxX + padX,
    maxY: maxY + padY,
  }
}

/** Encode region index 1..n as unique RGB (0 = empty). */
function encodeIndex(index: number) {
  const i = index + 1
  return {
    r: i & 255,
    g: (i >> 8) & 255,
    b: (i >> 16) & 255,
  }
}

function decodeIndex(r: number, g: number, b: number) {
  const i = r + (g << 8) + (b << 16)
  return i === 0 ? -1 : i - 1
}

export function InsightsCountyDotHeatmap({
  regions,
  metric,
  range,
  selectedCountyId,
  hoveredCountyId,
  onHover,
  onSelect,
  className,
}: InsightsCountyDotHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const preparedRef = useRef<PreparedRegion[]>([])
  const dotsRef = useRef<LandDot[]>([])
  const transformRef = useRef<Transform>({
    scale: 1,
    ox: 0,
    oy: 0,
    mapMinX: 0,
    mapMinY: 0,
    mapW: 1,
    mapH: 1,
  })
  const idMaskRef = useRef<HTMLCanvasElement | null>(null)
  const selectionRef = useRef({ selectedCountyId, hoveredCountyId })
  selectionRef.current = { selectedCountyId, hoveredCountyId }

  const onHoverRef = useRef(onHover)
  const onSelectRef = useRef(onSelect)
  onHoverRef.current = onHover
  onSelectRef.current = onSelect

  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null)
  const drawRef = useRef<(() => void) | null>(null)

  const prepared = useMemo(() => {
    return regions
      .map((region) => {
        try {
          const path = new Path2D(region.path)
          const value = getMetricValue(region, metric)
          return {
            id: region.id,
            name: region.name,
            path,
            cx: region.labelX,
            cy: region.labelY,
            value,
            t: metricT(value, range.min, range.max),
          } satisfies PreparedRegion
        } catch {
          return null
        }
      })
      .filter((item): item is PreparedRegion => Boolean(item))
  }, [regions, metric, range.min, range.max])

  preparedRef.current = prepared

  const hoveredRegion = hoverCard
    ? (regions.find((region) => region.id === hoverCard.id) ?? null)
    : null
  const hoverRank = hoveredRegion
    ? rankRegionByMetric(regions, hoveredRegion.id, metric)
    : null
  const hoverBand = hoverRank
    ? metricRankBand(hoverRank.rank, hoverRank.total)
    : null

  // Build dots + heat colors when geography / metric changes
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || prepared.length === 0) return

    const bounds = boundsFromRegions(regions)
    const mapW = Math.max(1, bounds.maxX - bounds.minX)
    const mapH = Math.max(1, bounds.maxY - bounds.minY)

    // Identity mask — fill each region with unique RGB for fast hit tests & dots
    const maskScale = 2
    const maskW = Math.round(mapW * maskScale)
    const maskH = Math.round(mapH * maskScale)
    const idMask = document.createElement("canvas")
    idMask.width = maskW
    idMask.height = maskH
    idMaskRef.current = idMask
    const mctx = idMask.getContext("2d", { willReadFrequently: true })
    if (!mctx) return

    mctx.setTransform(maskScale, 0, 0, maskScale, -bounds.minX * maskScale, -bounds.minY * maskScale)
    mctx.clearRect(bounds.minX, bounds.minY, mapW, mapH)
    mctx.fillStyle = "#000000"
    mctx.fillRect(bounds.minX, bounds.minY, mapW, mapH)
    prepared.forEach((region, index) => {
      const { r, g, b } = encodeIndex(index)
      mctx.fillStyle = `rgb(${r},${g},${b})`
      mctx.fill(region.path)
    })

    // Soft heat field
    const heatW = 420
    const heatH = Math.max(1, Math.round((mapH / mapW) * heatW))
    const heat = document.createElement("canvas")
    heat.width = heatW
    heat.height = heatH
    const hctx = heat.getContext("2d", { willReadFrequently: true })
    if (!hctx) return

    hctx.fillStyle = "#ffffff"
    hctx.fillRect(0, 0, heatW, heatH)
    const blobR = Math.max(heatW, heatH) * 0.16
    for (const region of prepared) {
      const hx = ((region.cx - bounds.minX) / mapW) * heatW
      const hy = ((region.cy - bounds.minY) / mapH) * heatH
      const color = heatmapColor(region.t)
      const gradient = hctx.createRadialGradient(hx, hy, 0, hx, hy, blobR)
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.95)`)
      gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`)
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)
      hctx.fillStyle = gradient
      hctx.beginPath()
      hctx.arc(hx, hy, blobR, 0, Math.PI * 2)
      hctx.fill()
    }
    hctx.filter = "blur(12px)"
    hctx.drawImage(heat, 0, 0)
    hctx.filter = "none"

    const heatData = hctx.getImageData(0, 0, heatW, heatH).data
    const maskData = mctx.getImageData(0, 0, maskW, maskH).data

    function regionAtMap(x: number, y: number): PreparedRegion | null {
      const mx = Math.round((x - bounds.minX) * maskScale)
      const my = Math.round((y - bounds.minY) * maskScale)
      if (mx < 0 || my < 0 || mx >= maskW || my >= maskH) return null
      const i = (my * maskW + mx) * 4
      const idx = decodeIndex(maskData[i] ?? 0, maskData[i + 1] ?? 0, maskData[i + 2] ?? 0)
      return idx >= 0 ? (prepared[idx] ?? null) : null
    }

    function sampleHeat(x: number, y: number) {
      const hx = Math.min(
        heatW - 1,
        Math.max(0, Math.round(((x - bounds.minX) / mapW) * (heatW - 1)))
      )
      const hy = Math.min(
        heatH - 1,
        Math.max(0, Math.round(((y - bounds.minY) / mapH) * (heatH - 1)))
      )
      const i = (hy * heatW + hx) * 4
      return {
        r: heatData[i] ?? 255,
        g: heatData[i + 1] ?? 230,
        b: heatData[i + 2] ?? 102,
      }
    }

    const dots: LandDot[] = []
    const startX = Math.ceil(bounds.minX / DOT_STEP) * DOT_STEP
    const startY = Math.ceil(bounds.minY / DOT_STEP) * DOT_STEP
    for (let y = startY; y <= bounds.maxY; y += DOT_STEP) {
      for (let x = startX; x <= bounds.maxX; x += DOT_STEP) {
        const hit = regionAtMap(x, y)
        if (!hit) continue
        const color = sampleHeat(x, y)
        dots.push({ x, y, regionId: hit.id, ...color })
      }
    }
    dotsRef.current = dots

    function draw() {
      if (!container || !canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const tw = Math.max(1, container.clientWidth)
      const th = Math.max(1, container.clientHeight)
      if (canvas.width !== Math.round(tw * dpr) || canvas.height !== Math.round(th * dpr)) {
        canvas.width = Math.round(tw * dpr)
        canvas.height = Math.round(th * dpr)
        canvas.style.width = `${tw}px`
        canvas.style.height = `${th}px`
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = "#f7f6f3"
      ctx.fillRect(0, 0, tw, th)

      const availW = tw - PAD * 2
      const availH = th - PAD * 2
      const scale = Math.min(availW / mapW, availH / mapH)
      const ox = (tw - mapW * scale) / 2
      const oy = (th - mapH * scale) / 2
      transformRef.current = {
        scale,
        ox,
        oy,
        mapMinX: bounds.minX,
        mapMinY: bounds.minY,
        mapW,
        mapH,
      }

      ctx.fillStyle = "rgba(170, 168, 162, 0.28)"
      const microStartX = Math.ceil(bounds.minX / MICRO_STEP) * MICRO_STEP
      const microStartY = Math.ceil(bounds.minY / MICRO_STEP) * MICRO_STEP
      for (let y = microStartY; y <= bounds.maxY; y += MICRO_STEP) {
        for (let x = microStartX; x <= bounds.maxX; x += MICRO_STEP) {
          ctx.beginPath()
          ctx.arc(
            ox + (x - bounds.minX) * scale,
            oy + (y - bounds.minY) * scale,
            0.7,
            0,
            Math.PI * 2
          )
          ctx.fill()
        }
      }

      const { selectedCountyId: selected, hoveredCountyId: hovered } = selectionRef.current
      const dimOthers = selected !== ALL_COUNTIES
      const r = DOT_RADIUS * Math.max(0.85, Math.min(1.35, scale / 1.1))

      for (const dot of dots) {
        const isSelected = selected === dot.regionId
        const isHovered = hovered === dot.regionId
        const dim = dimOthers && !isSelected ? 0.42 : 1
        const boost = isHovered || isSelected ? 1.1 : 1
        const fr = Math.round(dot.r * dim + (1 - dim) * 247)
        const fg = Math.round(dot.g * dim + (1 - dim) * 246)
        const fb = Math.round(dot.b * dim + (1 - dim) * 243)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${fr}, ${fg}, ${fb}, ${dimOthers && !isSelected ? 0.5 : 0.95})`
        ctx.arc(
          ox + (dot.x - bounds.minX) * scale,
          oy + (dot.y - bounds.minY) * scale,
          r * boost,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }

      const focusId = hovered || (selected !== ALL_COUNTIES ? selected : null)
      if (focusId) {
        const focus = prepared.find((item) => item.id === focusId)
        if (focus) {
          const sx = ox + (focus.cx - bounds.minX) * scale
          const sy = oy + (focus.cy - bounds.minY) * scale
          ctx.beginPath()
          ctx.fillStyle = "#1a1a1a"
          ctx.arc(sx, sy, Math.max(2.5, 3.2 * (scale / 1.2)), 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.strokeStyle = "rgba(26,26,26,0.35)"
          ctx.lineWidth = 1.5
          ctx.arc(sx, sy, Math.max(5, 7 * (scale / 1.2)), 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    drawRef.current = draw

    function pickRegion(clientX: number, clientY: number): PreparedRegion | null {
      const { scale, ox, oy, mapMinX, mapMinY } = transformRef.current
      if (scale <= 0 || !container) return null
      const rect = container.getBoundingClientRect()
      const mx = mapMinX + (clientX - rect.left - ox) / scale
      const my = mapMinY + (clientY - rect.top - oy) / scale
      return regionAtMap(mx, my)
    }

    function onPointerMove(event: PointerEvent) {
      const hit = pickRegion(event.clientX, event.clientY)
      onHoverRef.current(hit?.id ?? null)
      if (!hit || !container) {
        setHoverCard(null)
        return
      }
      const rect = container.getBoundingClientRect()
      setHoverCard({
        id: hit.id,
        name: hit.name,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }

    function onPointerLeave() {
      onHoverRef.current(null)
      setHoverCard(null)
    }

    function onClick(event: MouseEvent) {
      const hit = pickRegion(event.clientX, event.clientY)
      if (hit) onSelectRef.current(hit.id)
    }

    draw()
    const observer = new ResizeObserver(() => draw())
    observer.observe(container)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerleave", onPointerLeave)
    canvas.addEventListener("click", onClick)

    return () => {
      observer.disconnect()
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("click", onClick)
      drawRef.current = null
      dotsRef.current = []
      idMaskRef.current = null
    }
  }, [prepared, regions, metric, range.min, range.max])

  // Redraw when hover / selection changes
  useEffect(() => {
    drawRef.current?.()
  }, [selectedCountyId, hoveredCountyId])

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-pointer" />

      {hoverCard && hoveredRegion ? (
        <div
          className="pointer-events-none absolute z-20 w-[13.5rem] -translate-y-1/2 rounded-xl border border-border/70 bg-background/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
          style={{
            left: Math.min(
              (containerRef.current?.clientWidth ?? 400) - 230,
              Math.max(12, hoverCard.x + 18)
            ),
            top: Math.min(
              (containerRef.current?.clientHeight ?? 400) - 24,
              Math.max(24, hoverCard.y)
            ),
          }}
        >
          <p className="text-[11px] font-semibold text-foreground">{hoverCard.name}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {MAP_HEATMAP_METRICS.find((item) => item.id === metric)?.label ?? metric}
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {formatMapMetric(getMetricValue(hoveredRegion, metric), metric)}
          </p>
          {hoverRank ? (
            <p
              className={cn(
                "mt-1 text-[10px] font-medium",
                hoverBand === "top"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : hoverBand === "lower"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-muted-foreground"
              )}
            >
              {formatMetricRank(hoverRank.rank, hoverRank.total)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
