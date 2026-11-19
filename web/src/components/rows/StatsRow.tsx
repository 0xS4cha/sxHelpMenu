import type { StatsRowData } from '../../types/menu'
import { STATS_HEIGHT } from '../../utils/layout'
import { toneText } from '../../utils/tone'
import { Icon } from '../Icon'
import { RowShell } from './RowShell'

interface StatsRowProps {
  row: StatsRowData
  index: number
  last?: boolean
}

export function StatsRow({ row, index, last }: StatsRowProps) {
  return (
    <RowShell index={index} last={last} height={STATS_HEIGHT} className="flex items-stretch divide-x divide-white/20">
      {row.items.map((item, i) => (
        <span key={i} className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 first:pl-0 last:pr-0">
          {item.label && (
            <span className="truncate text-[14px] font-semibold uppercase leading-none tracking-[0.08em] text-white/60">
              {item.label}
            </span>
          )}
          <span
            className="flex min-w-0 items-center gap-1.5 text-[21px] font-semibold uppercase leading-none tracking-wide tabular-nums"
            style={toneText(item.tone)}
          >
            {item.icon && <Icon name={item.icon} size={16} strokeWidth={2.6} className="shrink-0" />}
            <span className="truncate">{item.value}</span>
          </span>
        </span>
      ))}
    </RowShell>
  )
}
