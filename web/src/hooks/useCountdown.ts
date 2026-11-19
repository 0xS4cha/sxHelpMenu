import { useEffect, useState } from 'react'

const TICK = 250

export function useCountdown(remaining: number): number {
  const [left, setLeft] = useState(() => Math.ceil(remaining / 1000))

  useEffect(() => {
    const deadline = performance.now() + remaining
    let timer = 0

    const update = () => {
      const next = Math.max(0, Math.ceil((deadline - performance.now()) / 1000))
      setLeft(next)
      if (next === 0) window.clearInterval(timer)
    }

    update()
    timer = window.setInterval(update, TICK)
    return () => window.clearInterval(timer)
  }, [remaining])

  return left
}
