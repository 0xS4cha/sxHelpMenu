import type { RowData } from '../types/menu'

export const ROW_HEIGHT = 46
export const SLIDER_HEIGHT = 66
export const FOOTER_HEIGHT = 46

export function rowHeight(row: RowData): number {
  return row.type === 'slider' ? SLIDER_HEIGHT : ROW_HEIGHT
}
