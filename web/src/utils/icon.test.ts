import { describe, expect, it } from 'vitest'
import { isImage, resolveIcon } from './icon'

describe('resolveIcon', () => {
  it('finds Lucide icons in kebab and Pascal case', () => {
    expect(resolveIcon('car-front')).not.toBeNull()
    expect(resolveIcon('CarFront')).toBe(resolveIcon('car-front'))
  })

  it('returns null for unknown icons', () => {
    expect(resolveIcon('not-an-icon')).toBeNull()
  })
})

describe('isImage', () => {
  it('detects URLs and image files', () => {
    expect(isImage('nui://res/logo.svg')).toBe(true)
    expect(isImage('https://cdn.example/a')).toBe(true)
    expect(isImage('./logo.png')).toBe(true)
    expect(isImage('data:image/png;base64,AAA')).toBe(true)
  })

  it('keeps icon names as icons', () => {
    expect(isImage('gauge')).toBe(false)
  })
})
