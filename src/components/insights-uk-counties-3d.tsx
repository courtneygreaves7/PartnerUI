import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import {
  getMetricValue,
  COUNTRY_3D_VIEW,
  type MapCountryCode,
  type MapMetricId,
  type MapRegion,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"

const ALL_COUNTIES = "all-counties"

/** Plaster relief — same whites / soft sides as the globe Relief style. */
const LAND = {
  low: { r: 0.94, g: 0.93, b: 0.9 },
  high: { r: 0.99, g: 0.98, b: 0.97 },
  hover: { r: 0.12, g: 0.34, b: 0.23 },
  selected: { r: 0.09, g: 0.28, b: 0.19 },
  side: { r: 0.84, g: 0.82, b: 0.78 },
  sideHover: { r: 0.08, g: 0.24, b: 0.16 },
}

const HOVER_LIFT_WORLD = 1.4
const STAGE_BG = "#f5f5f3"
/** Target max XY size in world units after scale — keeps UK / FR / ES similarly framed. */
const TARGET_SPAN = 88
/**
 * World-space relief height range (after scale). Kept independent of SVG units so
 * fit-to-span never flattens the extrusion to a 2D plate.
 */
const RELIEF_HEIGHT_MIN = 2.8
const RELIEF_HEIGHT_MAX = 5.6

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
  group: any
  meshes: any[]
  baseZ: number
  targetZ: number
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

function meshMaterials(mesh: any): any[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material]
}

function paintMesh(
  mesh: any,
  value: number,
  range: { min: number; max: number },
  selected: boolean,
  hovered: boolean,
  dimmed: boolean
) {
  const t = metricT(value, range.min, range.max)
  const tone = selected ? LAND.selected : hovered ? LAND.hover : mix(LAND.low, LAND.high, t)
  const sideTone =
    selected || hovered
      ? mix(tone, LAND.sideHover, 0.35)
      : mix(tone, LAND.side, 0.55)
    const dim = dimmed ? 0.78 : 1

  const mats = meshMaterials(mesh)
  mats.forEach((material, index) => {
    const c = index === 0 ? sideTone : tone
    material.color.setRGB(c.r * dim, c.g * dim, c.b * dim)
    material.emissive.setRGB(c.r * 0.08 * dim, c.g * 0.08 * dim, c.b * 0.07 * dim)
    material.emissiveIntensity = hovered || selected ? 0.22 : 0.12
    material.transparent = false
    material.opacity = 1
    material.depthWrite = true
    material.needsUpdate = true
  })
}

function makeCountyMaterial(isSide: boolean) {
  return new THREE.MeshStandardMaterial({
    color: isSide ? 0xd6d0c6 : 0xfcfaf6,
    emissive: isSide ? 0xcfc9bf : 0xf2f0eb,
    emissiveIntensity: isSide ? 0.08 : 0.18,
    roughness: isSide ? 0.9 : 0.78,
    metalness: 0,
    flatShading: false,
    transparent: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
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

    // Soft plaster lighting — bright key so white caps read like the relief globe
    const ambient = new THREE.AmbientLight(0xffffff, 0.88)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffffff, 0.95)
    sun.position.set(-50, 180, 110)
    scene.add(sun)
    const skyFill = new THREE.DirectionalLight(0xeef2f8, 0.4)
    skyFill.position.set(110, 70, -40)
    scene.add(skyFill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.28)
    rim.position.set(20, 40, -120)
    scene.add(rim)

    const root = new THREE.Group()
    const loader = new SVGLoader()
    const counties: CountyEntry[] = []
    const meshList: any[] = []

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

    // Oblique SE frame so extrusion sides read clearly (not top-down flat)
    stage.updateMatrixWorld(true)
    const frameBox = new THREE.Box3().setFromObject(stage)
    const frameSize = frameBox.getSize(new THREE.Vector3())
    const frameSpan = Math.max(frameSize.x, frameSize.y, frameSize.z, 40)
    const distance = frameSpan * 1.7
    camera.position.set(distance * 0.52, distance * 0.58, distance * 0.82)
    camera.near = Math.max(0.1, distance / 100)
    camera.far = distance * 20
    camera.updateProjectionMatrix()

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = false
    controls.enablePan = false
    controls.minDistance = distance * 0.8
    controls.maxDistance = distance * 2.2
    controls.minAzimuthAngle = -0.5
    controls.maxAzimuthAngle = 0.5
    controls.minPolarAngle = 0.65
    controls.maxPolarAngle = 1.2
    controls.target.set(0, 0, 0)
    controls.update()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, country])

  useEffect(() => {
    const container = containerRef.current as
      | (HTMLDivElement & { __uk3dSync?: { apply: () => void } })
      | null
    container?.__uk3dSync?.apply()
  }, [metric, range, selectedCountyId, hoveredCountyId, regions])

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-[360px] w-full overflow-hidden", className)}
    />
  )
}
