import { AnimatePresence } from 'motion/react'
import { useState, type CSSProperties } from 'react'
import type { MenuData, Position } from '../types/menu'
import { HelpMenu } from './HelpMenu'

export interface MenuState {
  menu: MenuData
  direction: number
}

interface AnchorProps {
  position: Position
  entries: MenuState[]
  focusedId: string | null
  gap: number
  glass: boolean
}

function anchorStyle(position: Position, offset: { x: number; y: number }, gap: number): CSSProperties {
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

export function Anchor({ position, entries, focusedId, gap, glass }: AnchorProps) {
  const sorted = [...entries].sort((a, b) => a.menu.order - b.menu.order)
  const [offset, setOffset] = useState({ x: 2.5, y: 6 })
  const first = sorted[0]?.menu.offset
  if (first && (first.x !== offset.x || first.y !== offset.y)) setOffset(first)

  return (
    <div style={anchorStyle(position, offset, gap)}>
      <AnimatePresence>
        {sorted.map(({ menu, direction }) => (
          <HelpMenu
            key={menu.id}
            menu={menu}
            direction={direction}
            focused={menu.id === focusedId}
            glass={glass && menu.glass}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
