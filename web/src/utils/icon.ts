import { icons, type LucideIcon } from 'lucide-react'

const cache = new Map<string, LucideIcon | null>()

function toPascal(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

export function resolveIcon(name: string): LucideIcon | null {
  if (!cache.has(name)) {
    const map = icons as Record<string, LucideIcon>
    cache.set(name, map[name] ?? map[toPascal(name)] ?? null)
  }
  return cache.get(name) ?? null
}

export function isImage(name: string): boolean {
  return /^(https?:|nui:|data:|\.{0,2}\/)/.test(name) || /\.(png|jpe?g|webp|svg|gif)$/i.test(name)
}
