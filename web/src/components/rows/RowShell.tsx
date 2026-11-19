import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ROW_HEIGHT } from '../../utils/layout'

interface RowShellProps {
  index: number
  last?: boolean
  height?: number
  className?: string
  children: ReactNode
}

export function RowShell({ index, last, height = ROW_HEIGHT, className = '', children }: RowShellProps) {
  return (
    <motion.div
      className={`${className} ${last ? '' : 'border-b border-white/25'}`}
      style={{ height }}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 + index * 0.06, duration: 0.22 }}
    >
      {children}
    </motion.div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="min-w-0 shrink truncate text-[21px] font-semibold uppercase leading-none tracking-wide text-white">
      {children}
    </span>
  )
}
