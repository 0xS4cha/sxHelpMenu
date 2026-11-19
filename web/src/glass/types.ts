export interface GlassSettings {
  enabled: boolean
  fps: number
  downscale: number
  strength: number
}

export type GlassMessage =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; settings: GlassSettings }
  | { type: 'resize'; width: number; height: number }
  | { type: 'settings'; settings: GlassSettings }
  | { type: 'regions'; regions: Float32Array }

export const REGION_STRIDE = 5
