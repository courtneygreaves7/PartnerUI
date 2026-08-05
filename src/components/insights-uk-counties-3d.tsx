import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import {
  formatMapMetric,
  getMetricValue,
  COUNTRY_3D_VIEW,
  MAP_METRICS,
  formatMetricRank,
  metricRankBand,
  rankRegionByMetric,
  type MapCountryCode,
  type MapMetricId,
  type MapRegion,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"

const ALL_COUNTIES = "all-counties"

/** Natural terrain — stronger low→high green contrast so metric banding reads clearly. */
const LAND = {
  low: { r: 0.82, g: 0.86, b: 0.58 },
  high: { r: 0.06, g: 0.38, b: 0.24 },
  hover: { r: 0.04, g: 0.28, b: 0.18 },
  selected: { r: 0.03, g: 0.24, b: 0.16 },
  side: { r: 0.42, g: 0.36, b: 0.26 },
  sideHover: { r: 0.2, g: 0.28, b: 0.16 },
}

const HOVER_LIFT_WORLD = 1.4
const STAGE_BG = "#061428"
/** Target max XY size in world units after scale — keeps UK / FR / ES similarly framed. */
const TARGET_SPAN = 88
/**
 * World-space relief height range (after scale). Kept independent of SVG units so
 * fit-to-span never flattens the extrusion to a 2D plate.
 */
const RELIEF_HEIGHT_MIN = 2.8
const RELIEF_HEIGHT_MAX = 5.6

const ANNOTATION_OFFSET = { x: 108, y: -56 }
const ANNOTATION_CARD_W = 216 // w-[13.5rem]
const ANNOTATION_CARD_H = 188
const ANNOTATION_PAD = 14

type InsightsUkCounties3dProps = {
  country: MapCountryCode
  regions: MapRegion[]
  metric: MapMetricId
  range: { min: number; max: number }
  selectedCountyId: string
  hoveredCountyId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  className?: string
}

type CountyUserData = {
  id: string
  name: string
}

type CountyEntry = {
  id: string
  group: THREE.Group
  meshes: THREE.Mesh[]
  baseZ: number
  targetZ: number
}

type AnnotationState = {
  id: string
  name: string
  ax: number
  ay: number
  bx: number
  by: number
  side: "left" | "right"
}

function metricT(value: number, min: number, max: number) {
  if (max <= min) return 0.55
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

/** Extrusion depth in SVG units — converted later so world height hits RELIEF_HEIGHT_*. */
function metricDepthSvg(value: number, min: number, max: number, mapScale: number) {
  const t = metricT(value, min, max)
  const worldH = RELIEF_HEIGHT_MIN + t * (RELIEF_HEIGHT_MAX - RELIEF_HEIGHT_MIN)
  return worldH / Math.max(mapScale, 0.0001)
}

function mix(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function meshMaterials(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material]
}

function paintMesh(
  mesh: THREE.Mesh,
  value: number,
  range: { min: number; max: number },
  selected: boolean,
  hovered: boolean,
  dimmed: boolean
) {
  const t = Math.pow(metricT(value, range.min, range.max), 0.78)
  const tone = selected ? LAND.selected : hovered ? LAND.hover : mix(LAND.low, LAND.high, t)
  const sideTone =
    selected || hovered
      ? mix(tone, LAND.sideHover, 0.28)
      : mix(tone, LAND.side, 0.4)
  const dim = dimmed ? 0.72 : 1

  const mats = meshMaterials(mesh)
  mats.forEach((material, index) => {
    if (!(material instanceof THREE.MeshStandardMaterial)) return
    const c = index === 0 ? sideTone : tone
    material.color.setRGB(c.r * dim, c.g * dim, c.b * dim)
    material.emissive.setRGB(c.r * 0.12 * dim, c.g * 0.14 * dim, c.b * 0.1 * dim)
    material.emissiveIntensity = hovered || selected ? 0.32 : 0.1
    material.transparent = false
    material.opacity = 1
    material.depthWrite = true
    material.needsUpdate = true
  })
}

function makeCountyMaterial(isSide: boolean) {
  return new THREE.MeshStandardMaterial({
    color: isSide ? 0x73664d : 0x4f854f,
    emissive: isSide ? 0x2a2418 : 0x1a2e1a,
    emissiveIntensity: isSide ? 0.06 : 0.1,
    roughness: isSide ? 0.92 : 0.82,
    metalness: 0,
    flatShading: false,
    transparent: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

function placeAnnotation(
  ax: number,
  ay: number,
  width: number,
  height: number,
  islandCenterX: number
): Pick<AnnotationState, "bx" | "by" | "side"> {
  // Prefer the seaward side — east of the landmass opens right, west opens left
  let side: "left" | "right" = ax >= islandCenterX ? "right" : "left"

  // Flip if that side can't fit the card in-frame
  if (side === "right" && ax + 36 + ANNOTATION_CARD_W > width - ANNOTATION_PAD) {
    side = "left"
  } else if (side === "left" && ax - 36 - ANNOTATION_CARD_W < ANNOTATION_PAD) {
    side = "right"
  }

  let bx =
    side === "right" ? ax + ANNOTATION_OFFSET.x : ax - ANNOTATION_OFFSET.x

  // Card is left-anchored (right side) or right-anchored via translateX(-100%)
  if (side === "right") {
    bx = Math.min(
      width - ANNOTATION_PAD - ANNOTATION_CARD_W,
      Math.max(ANNOTATION_PAD, bx)
    )
  } else {
    bx = Math.min(
      width - ANNOTATION_PAD,
      Math.max(ANNOTATION_PAD + ANNOTATION_CARD_W, bx)
    )
  }

  // by is the vertical centre of the card (translateY -50%)
  const halfH = ANNOTATION_CARD_H / 2
  let by = ay + ANNOTATION_OFFSET.y
  // Near the top: drop the card below the pin instead of clipping
  if (ay < ANNOTATION_PAD + halfH + 24) {
    by = ay + Math.abs(ANNOTATION_OFFSET.y) + 8
  }
  by = Math.min(
    height - ANNOTATION_PAD - halfH,
    Math.max(ANNOTATION_PAD + halfH, by)
  )

  return { bx, by, side }
}

export function InsightsUkCounties3d({
  country,
  regions,
  metric,
  range,
  selectedCountyId,
  hoveredCountyId,
  onHover,
  onSelect,
  className,
}: InsightsUkCounties3dProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onHoverRef = useRef(onHover)
  const onSelectRef = useRef(onSelect)
  onHoverRef.current = onHover
  onSelectRef.current = onSelect

  const stateRef = useRef({
    selectedCountyId,
    hoveredCountyId,
    metric,
    range,
  })
  stateRef.current = { selectedCountyId, hoveredCountyId, metric, range }

  const regionsRef = useRef(regions)
  regionsRef.current = regions

  const [annotation, setAnnotation] = useState<AnnotationState | null>(null)
  const annotationIdRef = useRef<string | null>(null)
  const linePathRef = useRef<SVGPathElement | null>(null)
  const pinRef = useRef<SVGCircleElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const metricLabel =
    MAP_METRICS.find((item) => item.id === metric)?.label ?? metric
  const hoveredRegion = annotation
    ? (regions.find((region) => region.id === annotation.id) ?? null)
    : null
  const hoverRank = hoveredRegion
    ? rankRegionByMetric(regions, hoveredRegion.id, metric)
    : null
  const hoverBand = hoverRank
    ? metricRankBand(hoverRank.rank, hoverRank.total)
    : null
  const cancelRank = hoveredRegion
    ? rankRegionByMetric(regions, hoveredRegion.id, "cancellationRate")
    : null
  const reletRank = hoveredRegion
    ? rankRegionByMetric(regions, hoveredRegion.id, "reletRate")
    : null

  useEffect(() => {
    const container = containerRef.current
    if (!container || regions.length === 0) return

    const view = COUNTRY_3D_VIEW[country]
    const basePitch = view.pitch
    const baseYaw = view.yaw

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(STAGE_BG)

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 4000)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Soft daylight over deep ocean — warm sun + cool fill
    const ambient = new THREE.AmbientLight(0xd8e4f0, 0.62)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.1)
    sun.position.set(-40, 160, 90)
    scene.add(sun)
    const skyFill = new THREE.DirectionalLight(0x7aa0c8, 0.35)
    skyFill.position.set(110, 70, -40)
    scene.add(skyFill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.18)
    rim.position.set(20, 40, -120)
    scene.add(rim)

    const root = new THREE.Group()
    const loader = new SVGLoader()
    const counties: CountyEntry[] = []
    const meshList: THREE.Mesh[] = []

    // Pass 1 — measure SVG XY so we can size extrusion in true world units
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    const parsedRegions: Array<{
      region: MapRegion
      shapes: THREE.Shape[]
    }> = []

    for (const region of regions) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${region.path}"/></svg>`
      let parsed
      try {
        parsed = loader.parse(svg)
      } catch {
        continue
      }
      const shapes: THREE.Shape[] = []
      for (const svgPath of parsed.paths) {
        for (const shape of SVGLoader.createShapes(svgPath)) {
          shapes.push(shape)
          for (const point of shape.getPoints(16)) {
            minX = Math.min(minX, point.x)
            maxX = Math.max(maxX, point.x)
            minY = Math.min(minY, point.y)
            maxY = Math.max(maxY, point.y)
          }
        }
      }
      if (shapes.length) parsedRegions.push({ region, shapes })
    }

    const spanX = Math.max(1, maxX - minX)
    const spanY = Math.max(1, maxY - minY)
    const mapScale = TARGET_SPAN / Math.max(spanX, spanY)
    const hoverLiftSvg = HOVER_LIFT_WORLD / mapScale

    // Pass 2 — extrude with world-correct height, flip Y in geometry (keeps normals lit)
    for (const { region, shapes } of parsedRegions) {
      const value = getMetricValue(region, metric)
      const depth = metricDepthSvg(value, range.min, range.max, mapScale)
      const group = new THREE.Group()
      group.userData = { id: region.id, name: region.name } satisfies CountyUserData
      const meshes: THREE.Mesh[] = []

      for (const shape of shapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: false,
          curveSegments: 4,
          steps: 1,
        })
        // North-up without negative root.scale (which inverted normals → flat grey look)
        geometry.scale(1, -1, 1)
        geometry.computeVertexNormals()

        const sideMat = makeCountyMaterial(true)
        const capMat = makeCountyMaterial(false)
        const mesh = new THREE.Mesh(geometry, [sideMat, capMat])
        mesh.userData = { id: region.id, name: region.name } satisfies CountyUserData
        group.add(mesh)
        meshes.push(mesh)
        meshList.push(mesh)
      }

      root.add(group)
      counties.push({
        id: region.id,
        group,
        meshes,
        baseZ: 0,
        targetZ: 0,
      })
    }

    root.scale.set(mapScale, mapScale, mapScale)
    root.updateMatrixWorld(true)
    const rawBox = new THREE.Box3().setFromObject(root)
    const rawCenter = rawBox.getCenter(new THREE.Vector3())
    root.position.set(-rawCenter.x, -rawCenter.y, -rawCenter.z)

    const stage = new THREE.Group()
    stage.add(root)
    stage.rotation.order = "YXZ"
    stage.rotation.x = basePitch
    stage.rotation.y = baseYaw
    scene.add(stage)
    stage.updateMatrixWorld(true)
    const pitchedBox = new THREE.Box3().setFromObject(stage)
    const pitchedCenter = pitchedBox.getCenter(new THREE.Vector3())
    stage.position.sub(pitchedCenter)

    for (const region of regions) {
      const entry = counties.find((c) => c.id === region.id)
      if (!entry) continue
      const value = getMetricValue(region, metric)
      const selected = selectedCountyId === region.id
      const hovered = hoveredCountyId === region.id
      const dimmed = selectedCountyId !== ALL_COUNTIES && !selected
      for (const mesh of entry.meshes) {
        paintMesh(mesh, value, range, selected, hovered, dimmed)
      }
    }

    // Shared SE isometric frame — pull in close so the country fills the stage
    stage.updateMatrixWorld(true)
    const frameBox = new THREE.Box3().setFromObject(stage)
    const frameSize = frameBox.getSize(new THREE.Vector3())
    const frameSpan = Math.max(frameSize.x, frameSize.y, frameSize.z, 40)
    const distance = frameSpan * 1.38
    camera.position.set(distance * 0.48, distance * 0.72, distance * 0.88)
    camera.near = Math.max(0.1, distance / 100)
    camera.far = distance * 20
    camera.updateProjectionMatrix()

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = false
    controls.enablePan = false
    controls.minDistance = distance * 0.85
    controls.maxDistance = distance * 1.65
    controls.minAzimuthAngle = -0.5
    controls.maxAzimuthAngle = 0.5
    controls.minPolarAngle = 0.65
    controls.maxPolarAngle = 1.2
    controls.target.set(0, 0, 0)
    controls.update()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const worldPoint = new THREE.Vector3()
    const islandCenter = new THREE.Vector3()
    const ndc = new THREE.Vector3()
    let frame = 0
    let disposed = false

    function resize() {
      if (!container) return
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    function pick(clientX: number, clientY: number): CountyUserData | null {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(meshList, false)
      const hit = hits[0]?.object
      if (!hit) return null
      return (hit.userData as CountyUserData) ?? null
    }

    function clearAnnotation() {
      if (annotationIdRef.current !== null) {
        annotationIdRef.current = null
        setAnnotation(null)
      }
    }

    function writeAnnotationDom(
      ax: number,
      ay: number,
      bx: number,
      by: number,
      side: "left" | "right"
    ) {
      const elbowX = side === "right" ? ax + 28 : ax - 28
      const d = `M ${ax} ${ay} L ${elbowX} ${ay} L ${bx} ${by}`
      if (linePathRef.current) linePathRef.current.setAttribute("d", d)
      if (pinRef.current) {
        pinRef.current.setAttribute("cx", String(ax))
        pinRef.current.setAttribute("cy", String(ay))
      }
      if (cardRef.current) {
        cardRef.current.style.left = `${bx}px`
        cardRef.current.style.top = `${by}px`
        cardRef.current.style.transform =
          side === "right" ? "translate(0, -50%)" : "translate(-100%, -50%)"
      }
    }

    function syncAnnotation() {
      const hovered = stateRef.current.hoveredCountyId
      if (!hovered || !container) {
        clearAnnotation()
        return
      }
      const entry = counties.find((item) => item.id === hovered)
      const region = regionsRef.current.find((item) => item.id === hovered)
      if (!entry || !region) {
        clearAnnotation()
        return
      }

      entry.group.updateWorldMatrix(true, false)
      const box = new THREE.Box3().setFromObject(entry.group)
      box.getCenter(worldPoint)
      // Sit the pin on the raised cap, not buried in the extrusion
      worldPoint.y = box.max.y + 0.6

      const width = container.clientWidth
      const height = container.clientHeight

      // Country silhouette centre — decide seaward annotation side from this, not the viewport
      stage.updateWorldMatrix(true, false)
      new THREE.Box3().setFromObject(stage).getCenter(islandCenter)
      ndc.copy(islandCenter).project(camera)
      const islandCenterX = (ndc.x * 0.5 + 0.5) * width

      ndc.copy(worldPoint).project(camera)
      if (ndc.z > 1) {
        clearAnnotation()
        return
      }

      const ax = (ndc.x * 0.5 + 0.5) * width
      const ay = (-ndc.y * 0.5 + 0.5) * height
      const { bx, by, side } = placeAnnotation(ax, ay, width, height, islandCenterX)

      if (annotationIdRef.current === hovered) {
        writeAnnotationDom(ax, ay, bx, by, side)
        return
      }

      annotationIdRef.current = hovered
      setAnnotation({ id: hovered, name: region.name, ax, ay, bx, by, side })
    }

    function onPointerMove(event: PointerEvent) {
      const hit = pick(event.clientX, event.clientY)
      onHoverRef.current(hit?.id ?? null)
    }

    function onPointerLeave() {
      onHoverRef.current(null)
    }

    function onClick(event: MouseEvent) {
      const hit = pick(event.clientX, event.clientY)
      if (hit) onSelectRef.current(hit.id)
    }

    function applyState() {
      const { selectedCountyId: selected, hoveredCountyId: hovered, metric: m, range: r } =
        stateRef.current
      for (const entry of counties) {
        const region = regions.find((item) => item.id === entry.id)
        if (!region) continue
        const value = getMetricValue(region, m)
        const isSelected = selected === entry.id
        const isHovered = hovered === entry.id
        const dimmed = selected !== ALL_COUNTIES && !isSelected
        entry.targetZ = isHovered || isSelected ? hoverLiftSvg : 0
        for (const mesh of entry.meshes) {
          paintMesh(mesh, value, r, isSelected, isHovered, dimmed)
        }
      }
    }

    function tick() {
      if (disposed) return
      frame = requestAnimationFrame(tick)

      // Keep pitch/yaw locked — no sway (it made tall countries look unstable)
      stage.rotation.x = basePitch
      stage.rotation.y = baseYaw

      for (const entry of counties) {
        entry.group.position.z += (entry.targetZ - entry.group.position.z) * 0.18
      }

      controls.update()
      syncAnnotation()
      renderer.render(scene, camera)
    }

    resize()
    applyState()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    renderer.domElement.addEventListener("pointermove", onPointerMove)
    renderer.domElement.addEventListener("pointerleave", onPointerLeave)
    renderer.domElement.addEventListener("click", onClick)
    tick()

    ;(container as HTMLDivElement & { __uk3dSync?: { apply: () => void } }).__uk3dSync = {
      apply: applyState,
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener("pointermove", onPointerMove)
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave)
      renderer.domElement.removeEventListener("click", onClick)
      controls.dispose()
      for (const entry of counties) {
        for (const mesh of entry.meshes) {
          mesh.geometry.dispose()
          for (const material of meshMaterials(mesh)) {
            material.dispose()
          }
        }
      }
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      delete (container as HTMLDivElement & { __uk3dSync?: unknown }).__uk3dSync
      annotationIdRef.current = null
      setAnnotation(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, country])

  useEffect(() => {
    const container = containerRef.current as
      | (HTMLDivElement & { __uk3dSync?: { apply: () => void } })
      | null
    container?.__uk3dSync?.apply()
  }, [metric, range, selectedCountyId, hoveredCountyId, regions])

  useEffect(() => {
    if (!annotation) return
    const elbowX =
      annotation.side === "right" ? annotation.ax + 28 : annotation.ax - 28
    const d = `M ${annotation.ax} ${annotation.ay} L ${elbowX} ${annotation.ay} L ${annotation.bx} ${annotation.by}`
    linePathRef.current?.setAttribute("d", d)
    pinRef.current?.setAttribute("cx", String(annotation.ax))
    pinRef.current?.setAttribute("cy", String(annotation.ay))
    if (cardRef.current) {
      cardRef.current.style.left = `${annotation.bx}px`
      cardRef.current.style.top = `${annotation.by}px`
      cardRef.current.style.transform =
        annotation.side === "right"
          ? "translate(0, -50%)"
          : "translate(-100%, -50%)"
    }
  }, [annotation])

  const elbowX = annotation
    ? annotation.side === "right"
      ? annotation.ax + 28
      : annotation.ax - 28
    : 0
  const pathD = annotation
    ? `M ${annotation.ax} ${annotation.ay} L ${elbowX} ${annotation.ay} L ${annotation.bx} ${annotation.by}`
    : ""

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-[360px] w-full overflow-hidden", className)}
    >
      {annotation && hoveredRegion ? (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <path
              key={`line-${annotation.id}`}
              ref={linePathRef}
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white county-annotation-line"
            />
            <circle
              key={`dot-${annotation.id}`}
              ref={pinRef}
              cx={annotation.ax}
              cy={annotation.ay}
              r="3.5"
              className="fill-[var(--brand-green,#1F5C3D)] county-annotation-dot"
            />
          </svg>

          <div
            key={`card-${annotation.id}`}
            ref={cardRef}
            className="county-annotation-card absolute w-[13.5rem] rounded-xl border border-border/70 bg-card/95 px-3.5 py-3 shadow-md backdrop-blur-sm"
            style={{
              left: annotation.bx,
              top: annotation.by,
              transform:
                annotation.side === "right"
                  ? "translate(0, -50%)"
                  : "translate(-100%, -50%)",
            }}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {hoveredRegion.country || country}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{annotation.name}</p>
            <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
              <p className="text-[22px] font-bold tracking-tight tabular-nums text-foreground">
                {formatMapMetric(getMetricValue(hoveredRegion, metric), metric)}
              </p>
              {hoverRank ? (
                <span
                  className={cn(
                    "mb-0.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.1em] uppercase",
                    hoverBand === "top" &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
                    hoverBand === "mid" &&
                      "border-border/70 bg-muted/60 text-muted-foreground",
                    hoverBand === "lower" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                  )}
                >
                  {formatMetricRank(hoverRank.rank, hoverRank.total)}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground">{metricLabel}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-border/60 pt-2.5">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Cancel
                </p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                  {formatMapMetric(hoveredRegion.cancellationRate, "cancellationRate")}
                </p>
                {cancelRank ? (
                  <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                    {formatMetricRank(cancelRank.rank, cancelRank.total)}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Re-let
                </p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                  {formatMapMetric(hoveredRegion.reletRate, "reletRate")}
                </p>
                {reletRank ? (
                  <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                    {formatMetricRank(reletRank.rank, reletRank.total)}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Click to pin in the side panel</p>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes county-annotation-draw {
          from { stroke-dashoffset: 180; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes county-annotation-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .county-annotation-line {
          stroke-dasharray: 180;
          animation: county-annotation-draw 420ms ease-out forwards;
        }
        .county-annotation-dot {
          opacity: 0;
          animation: county-annotation-in 240ms ease-out 80ms forwards;
        }
        .county-annotation-card {
          opacity: 0;
          animation: county-annotation-in 320ms ease-out 160ms forwards;
        }
      `}</style>
    </div>
  )
}
