import type { RowData } from '../../types/menu'
import { BarRow } from './BarRow'
import { CountdownRow } from './CountdownRow'
import { ImageRow } from './ImageRow'
import { KeysRow } from './KeysRow'
import { SliderRow } from './SliderRow'
import { TextRow } from './TextRow'

export function Row({ row, index, last }: { row: RowData; index: number; last?: boolean }) {
  switch (row.type) {
    case 'bar':
      return <BarRow row={row} index={index} last={last} />
    case 'countdown':
      return <CountdownRow row={row} index={index} last={last} />
    case 'image':
      return <ImageRow row={row} index={index} last={last} />
    case 'keys':
      return <KeysRow row={row} index={index} last={last} />
    case 'slider':
      return <SliderRow row={row} index={index} last={last} />
    default:
      return <TextRow row={row} index={index} last={last} />
  }
}
