import { useCountdown } from '../../hooks/useCountdown'
import type { CountdownRowData } from '../../types/menu'
import { formatDuration } from '../../utils/time'
import { toneText } from '../../utils/tone'
import { Icon } from '../Icon'
import { Label, RowShell } from './RowShell'

interface CountdownRowProps {
  row: CountdownRowData
  index: number
  last?: boolean
}

export function CountdownRow({ row, index, last }: CountdownRowProps) {
  const left = useCountdown(row.deadline ?? 0)
  const finished = left === 0
  const tone = finished ? (row.doneTone ?? row.tone) : row.tone
  const text = finished && row.done ? row.done : formatDuration(left)

  return (
    <RowShell index={index} last={last} className="flex items-center justify-between gap-4">
      <Label>{row.label}</Label>
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="truncate text-[21px] font-semibold uppercase leading-none tracking-wide tabular-nums"
          style={toneText(tone)}
        >
          {text}
        </span>
        <span
          className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-help-panel ring-1 ring-white/20"
          style={toneText(tone)}
        >
          <Icon name={row.icon ?? 'timer'} size={15} strokeWidth={2.6} />
        </span>
      </span>
    </RowShell>
  )
}
