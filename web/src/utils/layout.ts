import type { RowData } from '../types/menu'

export const ROW_HEIGHT = 46
export const SLIDER_HEIGHT = 66
export const FOOTER_HEIGHT = 46

export function rowHeight(row: RowData): number {
  if (row.type === 'slider') return SLIDER_HEIGHT
  if (row.type === 'image') return row.height
  return ROW_HEIGHT
}
