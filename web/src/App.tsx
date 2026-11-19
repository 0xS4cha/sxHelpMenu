import { useCallback, useEffect, useState } from 'react'
import { Anchor, type MenuState } from './components/Anchor'
import { configureGlass } from './glass'
import type { GlassSettings } from './glass/types'
import { useNuiEvent } from './hooks/useNuiEvent'
import { type MenuData, type RemoveMenuData, type SetFocusData, type SetPageData } from './types/menu'
import { groupOf, type AnchorGroup } from './utils/anchor'
import { fetchNui } from './utils/fetchNui'
import { isEnvBrowser } from './utils/nui'

interface SettingsData {
  gap?: number
  glass?: GlassSettings
  key?: string
}

interface KeyLabelData {
  label: string
}

export default function App() {
  const [menus, setMenus] = useState<Record<string, MenuState>>({})
  const [groups, setGroups] = useState<Record<string, AnchorGroup>>({})
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [gap, setGap] = useState(1.2)
  const [glass, setGlass] = useState(false)
  const [keyLabel, setKeyLabel] = useState('R')

  useNuiEvent<MenuData>('setMenu', (menu) => {
    const group = groupOf(menu)
    setGroups((current) => (current[group.key] ? current : { ...current, [group.key]: group }))
    setMenus((current) => {
      const previous = current[menu.id]
      const direction = previous && menu.page < previous.menu.page ? -1 : 1
      return { ...current, [menu.id]: { menu, direction: previous ? direction : 1 } }
    })
  })

  useNuiEvent<RemoveMenuData>('removeMenu', ({ id }) => {
    setMenus((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  })

  const setPage = useCallback(({ id, page, direction }: SetPageData) => {
    setMenus((current) => {
      const entry = current[id]
      if (!entry) return current
      return { ...current, [id]: { menu: { ...entry.menu, page }, direction } }
    })
  }, [])

  useNuiEvent<SetPageData>('setPage', setPage)
  useNuiEvent<SetFocusData>('setFocus', ({ id }) => setFocusedId(id ?? null))
  useNuiEvent<SettingsData>('setSettings', (data) => {
    if (typeof data.gap === 'number') setGap(data.gap)
    if (data.key) setKeyLabel(data.key)
    if (data.glass) {
      configureGlass(data.glass)
      setGlass(data.glass.enabled && !isEnvBrowser())
    }
  })

  useNuiEvent<KeyLabelData>('setKeyLabel', ({ label }) => setKeyLabel(label))

  useEffect(() => {
    void fetchNui('nuiReady', { ok: true })
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV || !isEnvBrowser()) return
    document.body.style.background = 'linear-gradient(180deg,#6d7a86 0%,#3d4651 55%,#2a2f36 100%)'
    void import('./utils/demo').then(({ runDemo }) => runDemo())
  }, [])

  useEffect(() => {
    if (!isEnvBrowser() || !focusedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'r') return
      const entry = menus[focusedId]
      if (!entry) return
      const count = entry.menu.pages.length
      setPage({ id: focusedId, page: (entry.menu.page + 1) % count, direction: 1 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedId, menus, setPage])

  const entries = Object.values(menus)

  return (
    <>
      {Object.values(groups).map((group) => (
        <Anchor
          key={group.key}
          group={group}
          entries={entries.filter((entry) => groupOf(entry.menu).key === group.key)}
          focusedId={focusedId}
          gap={gap}
          glass={glass}
          keyLabel={keyLabel}
        />
      ))}
    </>
  )
}
