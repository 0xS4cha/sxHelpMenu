import { AnimatePresence } from 'motion/react'
import type { MenuData } from '../types/menu'
import { anchorStyle, type AnchorGroup } from '../utils/anchor'
import { HelpMenu } from './HelpMenu'

export interface MenuState {
  menu: MenuData
  direction: number
}

interface AnchorProps {
  group: AnchorGroup
  entries: MenuState[]
  focusedId: string | null
  gap: number
  glass: boolean
  keyLabel: string
  hidden: boolean
  pauseOnly: boolean
}

export function Anchor({ group, entries, focusedId, gap, glass, keyLabel, hidden, pauseOnly }: AnchorProps) {
  const sorted = [...entries].sort((a, b) => a.menu.order - b.menu.order)

  return (
    <div style={anchorStyle(group.position, group.offset, gap)}>
      <AnimatePresence>
        {sorted.map(({ menu, direction }) => (
          <HelpMenu
            key={menu.id}
            menu={menu}
            direction={direction}
            focused={menu.id === focusedId}
            glass={glass && menu.glass}
            keyLabel={keyLabel}
            hidden={hidden && !(pauseOnly && menu.pauseMenu)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
