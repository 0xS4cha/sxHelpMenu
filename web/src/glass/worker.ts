import { GlassRenderer } from './renderer'
import type { GlassMessage } from './types'

let renderer: GlassRenderer | null = null

self.addEventListener('message', (event: MessageEvent<GlassMessage>) => {
  const message = event.data

  if (message.type === 'init') {
    try {
      renderer = new GlassRenderer(message.canvas, message.width, message.height, message.settings)
    } catch (error) {
      console.error('[sxHelpMenu] glass disabled:', error)
    }
    return
  }

  if (!renderer) return

  switch (message.type) {
    case 'resize':
      renderer.resize(message.width, message.height)
      break
    case 'settings':
      renderer.configure(message.settings)
      break
    case 'regions':
      renderer.setRegions(message.regions)
      break
  }
})
