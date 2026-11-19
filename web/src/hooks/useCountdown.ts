import { useEffect, useState } from 'react'

const TICK = 250

const secondsLeft = (deadline: number) => Math.max(0, Math.ceil((deadline - performance.now()) / 1000))

export function useCountdown(deadline: number): number {
  const [left, setLeft] = useState(() => secondsLeft(deadline))

  useEffect(() => {
    let timer = 0

    const update = () => {
      const next = secondsLeft(deadline)
      setLeft(next)
      if (next === 0) window.clearInterval(timer)
    }

    update()
    timer = window.setInterval(update, TICK)
    return () => window.clearInterval(timer)
  }, [deadline])

  return left
}
