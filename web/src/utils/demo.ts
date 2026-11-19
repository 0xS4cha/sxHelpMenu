import { POSITIONS, type MenuData, type Position } from '../types/menu'
import { debugData } from './debugData'

const base = { offset: { x: 2.5, y: 6 }, width: 360, scale: 1, key: true, page: 0, glass: true }

function vehicleMenu(position: Position): MenuData {
  return {
    ...base,
    id: 'vehicle',
    position,
    order: 1,
    header: { subtitle: 'Progen', title: 'T20', watermark: 'Progen' },
    pages: [
      {
        id: 'stats',
        title: 'Statistics',
        icon: 'gauge',
        rows: [
          { type: 'slider', label: 'Speed', value: 0.48, display: '4.8' },
          { type: 'slider', label: 'Acceleration', value: 0.5, display: '5.0' },
          { type: 'slider', label: 'Asphalt handling', value: 0.73, display: '7.3' },
          { type: 'slider', label: 'Off-road handling', value: 0.52, display: '5.2' },
          { type: 'slider', label: 'Strength', value: 0.51, display: '5.1' },
        ],
        footer: {
          label: 'Rating',
          items: [
            { value: '548', icon: 'mountain' },
            { value: '219 km/h', icon: 'route' },
          ],
        },
      },
      {
        id: 'perf',
        title: 'Performance',
        icon: 'gauge',
        rows: [
          { type: 'bar', label: 'Top speed', value: 0.8, display: '163 km/h' },
          { type: 'bar', label: 'Acceleration', value: 0.52 },
          { type: 'bar', label: 'Braking', value: 0.25 },
          { type: 'bar', label: 'Traction', value: 0.67 },
        ],
      },
      {
        id: 'info',
        title: 'Info',
        icon: 'user-round',
        rows: [
          { type: 'text', label: 'Owner', value: 'Lucas Martin', icon: 'user-round' },
          { type: 'text', label: 'Access', value: 'Locked', icon: 'key-round', tone: 'danger' },
          { type: 'text', label: 'Plate', value: '46EEK572' },
          { type: 'bar', label: 'Fuel', value: 0.14, tone: 'danger' },
        ],
      },
    ],
  }
}

function hintMenu(position: Position): MenuData {
  return {
    ...base,
    id: 'hint',
    position,
    order: 0,
    pages: [
      {
        id: 'controls',
        title: 'Controls',
        icon: 'keyboard',
        rows: [
          { type: 'text', label: 'Scan', value: 'Left click', icon: 'mouse-pointer-click' },
          { type: 'text', label: 'Next page', value: 'R', icon: 'arrow-right', tone: 'accent' },
        ],
      },
    ],
  }
}

export function runDemo(): void {
  const params = new URLSearchParams(window.location.search)
  const requested = params.get('position') as Position | null
  const position: Position = requested && POSITIONS.includes(requested) ? requested : 'bottom-right'
  const page = Number(params.get('page') ?? 0)

  const vehicle = vehicleMenu(position)
  vehicle.page = Math.min(Math.max(page, 0), vehicle.pages.length - 1)

  const messages = [{ action: 'setMenu', data: vehicle }]
  if (params.has('stack') || params.has('split')) {
    const hint = hintMenu(position)
    if (params.has('split')) hint.offset = { x: 32, y: 6 }
    messages.push({ action: 'setMenu', data: hint })
  }
  messages.push({ action: 'setFocus', data: { id: 'vehicle' } } as never)
  const key = params.get('key')
  if (key) messages.push({ action: 'setKeyLabel', data: { label: key } } as never)

  debugData(messages)
}
