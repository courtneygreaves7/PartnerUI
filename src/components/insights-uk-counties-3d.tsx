import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import {
  getMetricValue,
  type MapMetricId,
  type MapRegion,
} from "@/lib/insights-map-data"
import { cn } from "@/lib/utils"

const ALL_COUNTIES = "all-counties"

/** Soft earth greens — reads like land on a globe, metric shifts tone within the range. */
const LAND = {
  low: { r: 0.22, g: 0.4, b: 0.26 },
  high: { r: 0.42, g: 0.72, b: 0.38 },
  hover: { r: 0.55, g: 0.86, b: 0.48 },
  selected: { r: 0.62, g: 0.9, b: 0.52 },
  side: { r: 0.14, g: 0.26, b: 0.16 },
}

const HOVER_LIFT = 10
/**
 * Lay the SVG map on the XZ “table” (extrusion = up), then tip slightly
 * toward the camera so county thickness reads without skewing the outline.
 */
const TABLE_PITCH = -Math.PI / 2 + 0.32

type InsightsUkCounties3dProps = {
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

function metricDepth(value: number, min: number, max: number) {
  const t = metricT(value, min, max)
  return 10 + t * 12
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
  const sideTone = mix(tone, LAND.side, selected || hovered ? 0.25 : 0.4)
  const dim = dimmed ? 0.38 : 1

  const mats = meshMaterials(mesh)
  mats.forEach((material, index) => {
    const c = index === 0 ? sideTone : tone
    material.color.setRGB(c.r * dim, c.g * dim, c.b * dim)
    material.emissive.setRGB(c.r * 0.05 * dim, c.g * 0.07 * dim, c.b * 0.04 * dim)
    material.transparent = false
    material.opacity = 1
    material.depthWrite = true
    material.needsUpdate = true
  })
}

function makeCountyMaterial(isSide: boolean) {
  return new THREE.MeshStandardMaterial({
    color: isSide ? 0x2a4530 : 0x4a8552,
    emissive: 0x07120a,
    roughness: isSide ? 0.92 : 0.78,
    metalness: 0.02,
    flatShading: false,
    transparent: false,
    side: THREE.FrontSide,
    // Reduce z-fighting where neighbouring counties share an edge
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
}

export function InsightsUkCounties3d({
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

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0a1620")

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000)
    // Above + slightly south — classic 3D map framing (north stays up on screen)
    camera.position.set(0, 125, 88)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xfff6e8, 1.15)
    sun.position.set(-30, 180, 70)
    scene.add(sun)
    const skyFill = new THREE.DirectionalLight(0xa8c8e8, 0.4)
    skyFill.position.set(90, 60, -20)
    scene.add(skyFill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.2)
    rim.position.set(0, 40, -120)
    scene.add(rim)

    const root = new THREE.Group()
    // Added to scene via pitched `stage` after centering

    const loader = new SVGLoader()
    const counties: CountyEntry[] = []
    const meshList: any[] = []

    for (const region of regions) {
      const value = getMetricValue(region, metric)
      const depth = metricDepth(value, range.min, range.max)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${region.path}"/></svg>`
      let parsed
      try {
        parsed = loader.parse(svg)
      } catch {
        continue
      }

      const group = new THREE.Group()
      group.userData = { id: region.id, name: region.name } satisfies CountyUserData
      const meshes: any[] = []

      for (const svgPath of parsed.paths) {
        const shapes = SVGLoader.createShapes(svgPath)
        for (const shape of shapes) {
          // No bevel — coastlines + bevel = bristled/slatted side walls
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false,
            curveSegments: 3,
            steps: 1,
          })
          geometry.computeVertexNormals()

          const sideMat = makeCountyMaterial(true)
          const capMat = makeCountyMaterial(false)
          const mesh = new THREE.Mesh(geometry, [sideMat, capMat])
          mesh.userData = { id: region.id, name: region.name } satisfies CountyUserData
          group.add(mesh)
          meshes.push(mesh)
          meshList.push(mesh)
        }
      }

      if (!meshes.length) continue
      root.add(group)
      counties.push({
        id: region.id,
        group,
        meshes,
        baseZ: 0,
        targetZ: 0,
      })
    }

    // Flip SVG Y (north up); keep XYZ scale close so sides stay solid, not stretched shards
    root.scale.set(0.09, -0.09, 0.09)
    // Center in local space before pitching so orbit/yaw stays on the UK
    const box = new THREE.Box3().setFromObject(root)
    const center = box.getCenter(new THREE.Vector3())
    root.position.set(-center.x, -center.y, -center.z)

    const stage = new THREE.Group()
    stage.add(root)
    stage.rotation.x = TABLE_PITCH
    scene.add(stage)
    // Re-center after pitch so the UK sits in the middle of the frame
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

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = false
    controls.enablePan = false
    controls.minDistance = 110
    controls.maxDistance = 220
    // Keep framing near the default — slight yaw/pitch only
    controls.minAzimuthAngle = -0.35
    controls.maxAzimuthAngle = 0.35
    controls.minPolarAngle = 0.55
    controls.maxPolarAngle = 1.15
    controls.target.set(0, 0, 0)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let frame = 0
    let disposed = false
    const started = performance.now()

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
        entry.targetZ = isHovered || isSelected ? HOVER_LIFT : 0
        for (const mesh of entry.meshes) {
          paintMesh(mesh, value, r, isSelected, isHovered, dimmed)
        }
      }
    }

    function tick() {
      if (disposed) return
      frame = requestAnimationFrame(tick)

      // Subtle yaw only — outline stays north-up
      const t = (performance.now() - started) * 0.00022
      stage.rotation.y = Math.sin(t) * 0.03
      stage.rotation.x = TABLE_PITCH

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
  }, [regions])

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
