import type { ImageRowData } from '../../types/menu'
import { RowShell } from './RowShell'

interface ImageRowProps {
  row: ImageRowData
  index: number
  last?: boolean
}

export function ImageRow({ row, index, last }: ImageRowProps) {
  return (
    <RowShell index={index} last={last} height={row.height} className="relative -mx-4 overflow-hidden">
      {row.src && (
        <img
          src={row.src}
          alt=""
          className="absolute inset-0 size-full"
          style={{ objectFit: row.fit }}
          draggable={false}
        />
      )}
      {row.label && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-2 pt-6 text-[19px] font-semibold uppercase leading-none tracking-wide text-white">
          {row.label}
        </span>
      )}
    </RowShell>
  )
}
