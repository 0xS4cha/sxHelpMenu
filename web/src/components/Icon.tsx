import { createElement } from 'react'
import { isImage, resolveIcon } from '../utils/icon'

interface IconProps {
  name?: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 15, strokeWidth = 2.5, className }: IconProps) {
  if (!name) return null

  if (isImage(name)) {
    return <img src={name} alt="" className={className} style={{ width: size, height: size, objectFit: 'contain' }} />
  }

  const component = resolveIcon(name)
  return component ? createElement(component, { size, strokeWidth, className }) : null
}
