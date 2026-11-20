import { describe, expect, it } from 'vitest'
import type { HideRules } from '../types/menu'
import { isMenuHidden } from './hide'

const rules: HideRules = { pauseMenu: true, hudHidden: true, screenFaded: true, cinematic: false }

describe('isMenuHidden', () => {
  it('shows the menu when no condition is active', () => {
    expect(isMenuHidden(rules, { requested: false, conditions: {} })).toBe(false)
  })

  it('hides the menu when an enabled rule is active', () => {
    expect(isMenuHidden(rules, { requested: false, conditions: { pauseMenu: true } })).toBe(true)
  })

  it('keeps the menu when the active rule is disabled for it', () => {
    expect(isMenuHidden({ ...rules, pauseMenu: false }, { requested: false, conditions: { pauseMenu: true } })).toBe(false)
  })

  it('hides the menu on a rule enabled only for it', () => {
    expect(isMenuHidden(rules, { requested: false, conditions: { cinematic: true } })).toBe(false)
    expect(isMenuHidden({ ...rules, cinematic: true }, { requested: false, conditions: { cinematic: true } })).toBe(true)
  })

  it('always hides on a SetHidden request', () => {
    expect(isMenuHidden({ pauseMenu: false, hudHidden: false, screenFaded: false, cinematic: false }, { requested: true, conditions: {} })).toBe(true)
  })
})
