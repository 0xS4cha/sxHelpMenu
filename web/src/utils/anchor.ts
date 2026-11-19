import type { CSSProperties } from 'react'
import type { MenuData, Position } from '../types/menu'

export interface AnchorGroup {
  key: string
  position: Position
  offset: { x: number; y: number }
}

export function groupOf(menu: Pick<MenuData, 'position' | 'offset'>): AnchorGroup {
  return {
    key: `${menu.position}:${menu.offset.x}:${menu.offset.y}`,
    position: menu.position,
    offset: menu.offset,
  }
}

export function anchorStyle(position: Position, offset: { x: number; y: number }, gap: number): CSSProperties {
  const [vertical, horizontal] = position.includes('-')
    ? (position.split('-') as [string, string])
    : position === 'left' || position === 'right'
      ? ['middle', position]
      : position === 'center'
        ? ['middle', 'center']
        : [position, 'center']

  const style: CSSProperties = { position: 'fixed', display: 'flex', gap: `${gap}vh` }
  const transforms: string[] = []

  if (vertical === 'top') style.top = `${offset.y}vh`
  else if (vertical === 'bottom') style.bottom = `${offset.y}vh`
  else {
    style.top = `calc(50% + ${offset.y}vh)`
    transforms.push('translateY(-50%)')
  }

  if (horizontal === 'left') {
    style.left = `${offset.x}vw`
    style.alignItems = 'flex-start'
  } else if (horizontal === 'right') {
    style.right = `${offset.x}vw`
    style.alignItems = 'flex-end'
  } else {
    style.left = `calc(50% + ${offset.x}vw)`
    style.alignItems = 'center'
    transforms.push('translateX(-50%)')
  }

  style.flexDirection = vertical === 'bottom' ? 'column-reverse' : 'column'
  if (transforms.length) style.transform = transforms.join(' ')
  return style
}
