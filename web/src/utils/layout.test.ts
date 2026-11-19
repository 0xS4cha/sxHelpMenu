import { describe, expect, it } from 'vitest'
import { ROW_HEIGHT, SLIDER_HEIGHT, STATS_HEIGHT, rowHeight } from './layout'

describe('rowHeight', () => {
  it('uses the height of each row type', () => {
    expect(rowHeight({ type: 'text', label: '', value: '' })).toBe(ROW_HEIGHT)
    expect(rowHeight({ type: 'bar', label: '', value: 0 })).toBe(ROW_HEIGHT)
    expect(rowHeight({ type: 'slider', label: '', value: 0 })).toBe(SLIDER_HEIGHT)
    expect(rowHeight({ type: 'stats', label: '', items: [] })).toBe(STATS_HEIGHT)
    expect(rowHeight({ type: 'keys', label: '', keys: [] })).toBe(ROW_HEIGHT)
    expect(rowHeight({ type: 'countdown', label: '', remaining: 0 })).toBe(ROW_HEIGHT)
  })

  it('uses the height of image rows', () => {
    expect(rowHeight({ type: 'image', label: '', src: '', height: 140, fit: 'cover' })).toBe(140)
  })
})
