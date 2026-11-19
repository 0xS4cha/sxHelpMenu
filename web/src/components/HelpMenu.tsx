import { AnimatePresence, motion } from 'motion/react'
import type { MenuData, Position } from '../types/menu'
import { Footer } from './Footer'
import { Header } from './Header'
import { Icon } from './Icon'
import { FOOTER_HEIGHT, rowHeight } from '../utils/layout'
import { Row } from './rows'

const EASE = [0.22, 1, 0.36, 1] as const

interface HelpMenuProps {
  menu: MenuData
  direction: number
  focused: boolean
}

function enterOffset(position: Position): { x: number; y: number; scale: number } {
  if (position.endsWith('right')) return { x: 40, y: 0, scale: 1 }
  if (position.endsWith('left')) return { x: -40, y: 0, scale: 1 }
  if (position === 'top') return { x: 0, y: -30, scale: 1 }
  if (position === 'bottom') return { x: 0, y: 30, scale: 1 }
  return { x: 0, y: 0, scale: 0.94 }
}

export function HelpMenu({ menu, direction, focused }: HelpMenuProps) {
  const page = menu.pages[Math.min(menu.page, menu.pages.length - 1)]
  if (!page) return null

  const header = page.header ?? menu.header
  const headerKey = page.header ? `page-${page.id}` : 'menu'
  const bodyHeight = page.rows.reduce((total, row) => total + rowHeight(row), 0)
  const multi = menu.pages.length > 1
  const enter = enterOffset(menu.position)
  const showTop = Boolean(page.title || page.icon || multi)

  return (
    <motion.div
      layout="position"
      className="font-help pointer-events-none select-none"
      style={{ width: menu.width, zoom: menu.scale }}
      initial={{ opacity: 0, ...enter }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, ...enter }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {showTop && (
        <div className="mb-1.5 flex h-[24px] items-center justify-end gap-2.5 pr-0.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={page.id}
              className="mr-auto flex min-w-0 items-center gap-1.5 pl-0.5 text-[16px] font-semibold uppercase tracking-[0.14em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <Icon name={page.icon} size={13} strokeWidth={2.6} />
              <span className="truncate">{page.title}</span>
            </motion.span>
          </AnimatePresence>

          {multi && (
            <span className="flex items-center gap-1.5">
              {menu.pages.map((p, i) => (
                <motion.span
                  key={p.id}
                  className="rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                  animate={{
                    width: i === menu.page ? 9 : 7,
                    height: i === menu.page ? 9 : 7,
                    opacity: i === menu.page ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </span>
          )}

          <AnimatePresence initial={false}>
            {multi && focused && menu.key && (
              <motion.span
                key="key"
                className="flex h-[24px] min-w-[24px] items-center justify-center rounded-[4px] bg-white px-1 text-[17px] font-bold uppercase leading-none text-help-panel shadow-[0_2px_0_rgba(0,0,0,0.35)]"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
              >
                {menu.key}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {header && (
            <motion.div
              key={headerKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Header header={header} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative overflow-hidden bg-gradient-to-b from-[#5b5f6c]/55 to-[#3f4250]/60 backdrop-blur-md"
          initial={false}
          animate={{ height: bodyHeight }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={page.id}
              className="absolute inset-x-0 top-0 px-4"
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d * 60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -60, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: EASE }}
            >
              {page.rows.map((row, i) => (
                <Row key={row.id ?? i} row={row} index={i} last={i === page.rows.length - 1} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: page.footer ? FOOTER_HEIGHT : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {page.footer && (
              <motion.div
                key={page.id}
                className="absolute inset-x-0 top-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Footer footer={page.footer} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
