import { REGION_STRIDE, type GlassMessage, type GlassSettings } from './types'

const elements = new Set<HTMLElement>()

let settings: GlassSettings = { enabled: true, fps: 60, downscale: 4, strength: 2 }
let worker: Worker | null = null
let failed = false
let frame = 0
let lastMeasure = 0
let sent: Float32Array = new Float32Array(0)

function viewport(): [number, number] {
  const ratio = window.devicePixelRatio || 1
  return [window.innerWidth * ratio, window.innerHeight * ratio]
}

function post(message: GlassMessage, transfer: Transferable[] = []) {
  worker?.postMessage(message, transfer)
}

function boot(): boolean {
  if (worker) return true
  if (failed) return false

  const canvas = document.createElement('canvas')
  if (typeof canvas.transferControlToOffscreen !== 'function' || typeof Worker === 'undefined') {
    failed = true
    return false
  }

  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none'
  document.body.prepend(canvas)

  const offscreen = canvas.transferControlToOffscreen()
  const [width, height] = viewport()
  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  post({ type: 'init', canvas: offscreen, width, height, settings }, [offscreen])

  window.addEventListener('resize', () => {
    const [w, h] = viewport()
    post({ type: 'resize', width: w, height: h })
  })

  return true
}

function opacity(element: HTMLElement): number {
  let value = 1
  for (let node: HTMLElement | null = element; node && value > 0; node = node.parentElement) {
    if (node.style.opacity) value *= Number(node.style.opacity)
  }
  return value
}

function measure(): Float32Array {
  const ratio = window.devicePixelRatio || 1
  const regions = new Float32Array(elements.size * REGION_STRIDE)
  let length = 0

  for (const element of elements) {
    const alpha = opacity(element)
    if (alpha <= 0.01) continue
    const rect = element.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    regions[length++] = rect.left * ratio
    regions[length++] = rect.top * ratio
    regions[length++] = rect.width * ratio
    regions[length++] = rect.height * ratio
    regions[length++] = alpha
  }

  return regions.slice(0, length)
}

function changed(next: Float32Array): boolean {
  if (next.length !== sent.length) return true
  for (let i = 0; i < next.length; i++) {
    if (Math.abs(next[i] - sent[i]) > 0.5 / 255) return true
  }
  return false
}

function tick(now: number) {
  frame = elements.size > 0 ? requestAnimationFrame(tick) : 0
  if (frame && now - lastMeasure < 1000 / settings.fps - 1) return
  lastMeasure = now

  const next = measure()
  if (!changed(next)) return
  sent = next
  post({ type: 'regions', regions: next })
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick)
}

export function configureGlass(next: Partial<GlassSettings>) {
  settings = { ...settings, ...next }
  post({ type: 'settings', settings })
}

export function registerGlass(element: HTMLElement): () => void {
  if (!settings.enabled || !boot()) return () => {}
  elements.add(element)
  schedule()
  return () => {
    elements.delete(element)
    schedule()
  }
}
