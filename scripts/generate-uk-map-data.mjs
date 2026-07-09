/**
 * Regenerates public/uk-counties-map.json from ONS uk-topojson (UTLA boundaries).
 * Run: node scripts/generate-uk-map-data.mjs
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import simplify from "@turf/simplify"
import { feature } from "topojson-client"
import { geoMercator, geoPath, geoCentroid } from "d3-geo"

const __dirname = dirname(fileURLToPath(import.meta.url))
const topoPath = join(__dirname, "data/uk-topo.json")

let topo
try {
  topo = JSON.parse(readFileSync(topoPath, "utf8"))
} catch {
  const topoUrl =
    "https://raw.githubusercontent.com/ONSvisual/uk-topojson/main/output/topo.json"
  topo = await fetch(topoUrl).then((r) => r.json())
  mkdirSync(dirname(topoPath), { recursive: true })
  writeFileSync(topoPath, JSON.stringify(topo))
}

const rawCollection = feature(topo, topo.objects.utla)
const simplifiedCollection = simplify(rawCollection, {
  tolerance: 0.006,
  highQuality: true,
})

const width = 800
const height = 1000
// Fit projection to full UK bounds — NOT the simplified geometry.
const projection = geoMercator().fitExtent(
  [
    [24, 24],
    [width - 24, height - 24],
  ],
  rawCollection
)
const pathGen = geoPath(projection)

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function seededNoise(seed, index) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  return (
    Math.sin(h + index * 9301 + 49297) * 233280 -
    Math.floor(Math.sin(h + index * 9301 + 49297) * 233280)
  )
}

function roundPath(d) {
  return d.replace(/(\d+\.\d+)/g, (_, n) => String(Math.round(Number(n) * 10) / 10))
}

function pathBounds(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < nums.length - 1; i += 2) {
    minX = Math.min(minX, nums[i])
    maxX = Math.max(maxX, nums[i])
    minY = Math.min(minY, nums[i + 1])
    maxY = Math.max(maxY, nums[i + 1])
  }
  return { minX, maxX, minY, maxY, area: (maxX - minX) * (maxY - minY) }
}

/** Remove spurious full-canvas rectangles from some MultiPolygon paths. */
function cleanPath(d) {
  const subpaths = d.match(/M[^M]+/g) ?? [d]
  const kept = subpaths.filter((sub) => {
    const { area, minX, maxX, minY, maxY } = pathBounds(sub)
    if (area > 200000) return false
    if (maxX - minX > 700 || maxY - minY > 850) return false
    return area >= 0.2
  })
  return kept.join("")
}

const regions = simplifiedCollection.features
  .map((f) => {
    const name = f.properties.areanm
    const code = f.properties.areacd
    const id = slug(name)
    const rawPath = pathGen(f) ?? ""
    const path = cleanPath(roundPath(rawPath))
    if (!path.startsWith("M")) return null

    const rawFeature = rawCollection.features.find((r) => r.properties.areacd === code) ?? f
    const projected = projection(geoCentroid(rawFeature))
    const n = seededNoise(id, 0)
    return {
      id,
      name,
      code,
      country: "United Kingdom",
      path,
      labelX: Math.round(projected[0] * 10) / 10,
      labelY: Math.round(projected[1] * 10) / 10,
      bookings: Math.round(8000 + n * 42000),
      abv: Math.round(650 + seededNoise(id, 1) * 550),
      calTakeUp: Math.round((2 + seededNoise(id, 2) * 3) * 10) / 10,
      gwp: Math.round(18000 + seededNoise(id, 3) * 90000),
      cancellationRate: Math.round((5 + seededNoise(id, 4) * 4) * 10) / 10,
    }
  })
  .filter(Boolean)

const outPath = join(__dirname, "../public/uk-counties-map.json")
writeFileSync(outPath, JSON.stringify(regions))
console.log(`Wrote ${regions.length} regions (${(JSON.stringify(regions).length / 1024).toFixed(0)} KB)`)

const cornwall = regions.find((r) => r.name === "Cornwall")
if (cornwall) console.log("Cornwall bounds:", pathBounds(cornwall.path))
