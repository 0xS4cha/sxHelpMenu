import { useScramble } from '../hooks/useScramble'
import type { HeaderData } from '../types/menu'

export function Header({ header }: { header: HeaderData }) {
  const title = useScramble((header.title ?? '').toUpperCase(), 60, 360)

  return (
    <div className="relative overflow-hidden bg-help-panel/92 px-4 pb-2.5 pt-2">
      {header.image && (
        <img
          src={header.image}
          alt=""
          className="absolute -right-2 -top-3 h-[88px] max-w-[60%] object-contain opacity-[0.08]"
        />
      )}
      {header.watermark && !header.image && (
        <span
          className="absolute -right-1 top-1/2 -translate-y-1/2 whitespace-nowrap text-[54px] font-bold uppercase leading-none tracking-wide text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.12)]"
          aria-hidden
        >
          {header.watermark}
        </span>
      )}
      {header.subtitle && (
        <div className="relative truncate text-[17px] font-semibold uppercase leading-tight tracking-wide text-white/55">
          {header.subtitle}
        </div>
      )}
      {header.title && (
        <div className="relative truncate text-[22px] font-bold uppercase leading-tight tracking-wide text-white">
          {title || ' '}
        </div>
      )}
    </div>
  )
}
