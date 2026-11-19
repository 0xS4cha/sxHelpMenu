import { motion } from 'motion/react'
import type { SliderRowData } from '../../types/menu'
import { toneBg, toneText } from '../../utils/tone'
import { SLIDER_HEIGHT } from '../../utils/layout'
import { Label, RowShell } from './RowShell'

interface SliderRowProps {
  row: SliderRowData
  index: number
  last?: boolean
}

export function SliderRow({ row, index, last }: SliderRowProps) {
  const percent = `${row.value * 100}%`
  const text = row.display ?? `${Math.round(row.value * 100)}%`

  return (
    <RowShell index={index} last={last} height={SLIDER_HEIGHT} className="flex flex-col justify-center gap-[9px]">
      <span className="flex items-center justify-between gap-4">
        <Label>{row.label}</Label>
        <span
          className="shrink-0 bg-help-panel/92 px-1.5 py-[3px] text-[19px] font-bold uppercase leading-none tracking-wide tabular-nums"
          style={toneText(row.tone)}
        >
          {text}
        </span>
      </span>
      <span className="relative block h-[6px] bg-white/25">
        <motion.span
          className="absolute inset-y-0 left-0"
          style={toneBg(row.tone)}
          initial={{ width: 0 }}
          animate={{ width: percent }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="absolute -top-[4px] h-[14px] w-[3px] -translate-x-1/2 shadow-[0_0_4px_rgba(0,0,0,0.45)]"
          style={toneBg(row.tone)}
          initial={{ left: 0 }}
          animate={{ left: percent }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </RowShell>
  )
}
