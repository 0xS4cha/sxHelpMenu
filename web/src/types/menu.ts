export type Position =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'

export const POSITIONS: Position[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
]

export type Tone = 'neutral' | 'danger' | 'safe' | 'warning' | 'accent' | (string & {})

interface BaseRow {
  id?: string
  label: string
  icon?: string
  tone?: Tone
  scramble?: boolean
}

export interface TextRowData extends BaseRow {
  type: 'text'
  value: string
}

export interface BarRowData extends BaseRow {
  type: 'bar'
  value: number
  display?: string
  segments?: number
}

export interface SliderRowData extends BaseRow {
  type: 'slider'
  value: number
  display?: string
}

export interface CountdownRowData extends BaseRow {
  type: 'countdown'
  remaining: number
  deadline?: number
  done?: string
  doneTone?: Tone
}

export interface KeyHint {
  key: string
  label?: string
}

export interface KeysRowData extends BaseRow {
  type: 'keys'
  keys: KeyHint[]
}

export type RowData = TextRowData | BarRowData | SliderRowData | CountdownRowData | KeysRowData

export interface FooterItem {
  value: string
  icon?: string
  tone?: Tone
}

export interface FooterData {
  label?: string
  items: FooterItem[]
}

export interface HeaderData {
  title?: string
  subtitle?: string
  image?: string
  watermark?: string
}

export interface PageData {
  id: string
  title?: string
  icon?: string
  header?: HeaderData
  rows: RowData[]
  footer?: FooterData
}

export interface MenuData {
  id: string
  position: Position
  offset: { x: number; y: number }
  width: number
  scale: number
  header?: HeaderData
  pages: PageData[]
  key?: string | boolean
  page: number
  order: number
  glass: boolean
}

export interface SetPageData {
  id: string
  page: number
  direction: number
}

export interface RemoveMenuData {
  id: string
}

export interface SetFocusData {
  id?: string | null
}
