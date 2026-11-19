import { describe, expect, it } from 'vitest'
import { toneColor } from './tone'

describe('toneColor', () => {
  it('maps the named tones to the theme', () => {
    expect(toneColor()).toBe('#ffffff')
    expect(toneColor('neutral')).toBe('#ffffff')
    expect(toneColor('danger')).toBe('var(--color-help-danger)')
    expect(toneColor('accent')).toBe('var(--color-help-accent)')
  })

  it('keeps hex colors', () => {
    expect(toneColor('#3ee6ff')).toBe('#3ee6ff')
  })
})
