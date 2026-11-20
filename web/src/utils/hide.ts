import type { HideRule, HideRules } from '../types/menu'

export interface HideState {
  requested: boolean
  conditions: Partial<Record<HideRule, boolean>>
}

export function isMenuHidden(rules: HideRules | undefined, state: HideState): boolean {
  if (state.requested) return true
  if (!rules) return false
  return (Object.keys(rules) as HideRule[]).some((rule) => rules[rule] && state.conditions[rule] === true)
}
