import type { KeysRowData } from '../../types/menu'
import { KeyBadge } from '../KeyBadge'
import { Label, RowShell } from './RowShell'

interface KeysRowProps {
  row: KeysRowData
  index: number
  last?: boolean
}

export function KeysRow({ row, index, last }: KeysRowProps) {
  return (
    <RowShell index={index} last={last} className="flex items-center justify-between gap-4">
      {row.label && <Label>{row.label}</Label>}
      <span className={`flex min-w-0 items-center gap-3.5 overflow-hidden ${row.label ? '' : 'flex-1'}`}>
        {row.keys.map((hint, i) => (
          <span key={`${hint.key}-${i}`} className="flex min-w-0 items-center gap-1.5">
            <KeyBadge label={hint.key} size={24} />
            {hint.label && (
              <span className="truncate text-[18px] font-semibold uppercase leading-none tracking-wide text-white">
                {hint.label}
              </span>
            )}
          </span>
        ))}
      </span>
    </RowShell>
  )
}
