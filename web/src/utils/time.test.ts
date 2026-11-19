import { describe, expect, it } from 'vitest'
import { formatDuration } from './time'

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(95)).toBe('01:35')
    expect(formatDuration(599.9)).toBe('09:59')
  })

  it('adds the hours when needed', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
    expect(formatDuration(3725)).toBe('1:02:05')
  })

  it('never goes below zero', () => {
    expect(formatDuration(-12)).toBe('00:00')
  })
})
