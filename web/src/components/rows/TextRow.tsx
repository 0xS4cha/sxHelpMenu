import { useScramble } from '../../hooks/useScramble'
import type { TextRowData } from '../../types/menu'
import { toneText } from '../../utils/tone'
import { Icon } from '../Icon'
import { Label, RowShell } from './RowShell'

interface TextRowProps {
  row: TextRowData
  index: number
  last?: boolean
}

export function TextRow({ row, index, last }: TextRowProps) {
  const text = row.value.toUpperCase()
  const scrambled = useScramble(text, 120 + index * 90)
  const value = row.scramble === false ? text : scrambled

  return (
    <RowShell index={index} last={last} className="flex items-center justify-between gap-4">
      <Label>{row.label}</Label>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[21px] font-semibold uppercase leading-none tracking-wide text-white">
          {value}
        </span>
        {row.icon && (
          <span
            className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-help-panel ring-1 ring-white/20"
            style={toneText(row.tone)}
          >
            <Icon name={row.icon} size={15} strokeWidth={2.6} />
          </span>
        )}
      </span>
    </RowShell>
  )
}
