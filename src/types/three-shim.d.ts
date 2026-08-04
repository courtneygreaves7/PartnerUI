declare module "three" {
  const THREE: any
  export = THREE
}
declare module "three/examples/jsm/controls/OrbitControls.js" {
  export class OrbitControls {
    constructor(camera: any, domElement: HTMLElement)
    enableDamping: boolean
    dampingFactor: number
    autoRotate: boolean
    autoRotateSpeed: number
    enablePan: boolean
    enableRotate: boolean
    enableZoom: boolean
    minDistance: number
    maxDistance: number
    minAzimuthAngle: number
    maxAzimuthAngle: number
    minPolarAngle: number
    maxPolarAngle: number
    target: { set: (x: number, y: number, z: number) => void }
    update: () => void
    dispose: () => void
  }
}
declare module "three/examples/jsm/loaders/SVGLoader.js" {
  export class SVGLoader {
    parse(text: string): { paths: any[] }
    static createShapes(path: any): any[]
  }
}
