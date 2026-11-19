import { useEffect, type RefObject } from 'react'
import { registerGlass } from '../glass'

export function useGlass(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const element = ref.current
    if (!active || !element) return
    return registerGlass(element)
  }, [ref, active])
}
