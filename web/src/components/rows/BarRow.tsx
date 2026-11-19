import { motion } from 'motion/react'
import type { BarRowData } from '../../types/menu'
import { toneBg, toneText } from '../../utils/tone'
import { Label, RowShell } from './RowShell'

interface BarRowProps {
  row: BarRowData
  index: number
  last?: boolean
}

export function BarRow({ row, index, last }: BarRowProps) {
  const segments = row.segments ?? 10
  const filled = Math.round(row.value * segments)
  const text = row.display ?? `${Math.round(row.value * 100)}%`

  return (
    <RowShell index={index} last={last} className="flex items-center justify-between gap-4">
      <Label>{row.label}</Label>
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="flex gap-[3px]">
          {Array.from({ length: segments }, (_, i) => (
            <motion.span
              key={i}
              className="h-[12px] w-[7px] -skew-x-12"
              initial={{ opacity: 0, scaleY: 0.3 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.1 + index * 0.06 + i * 0.025, duration: 0.15 }}
              style={i < filled ? toneBg(row.tone) : { backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </span>
        <span
          className="min-w-[60px] whitespace-nowrap text-right text-[19px] font-semibold uppercase leading-none tracking-wide tabular-nums"
          style={toneText(row.tone)}
        >
          {text}
        </span>
      </span>
    </RowShell>
  )
}
