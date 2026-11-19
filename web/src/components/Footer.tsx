import type { FooterData } from '../types/menu'
import { toneText } from '../utils/tone'
import { Icon } from './Icon'

export function Footer({ footer }: { footer: FooterData }) {
  return (
    <div className="flex h-[46px] items-center justify-between gap-4 bg-help-panel/92 px-4">
      {footer.label && (
        <span className="min-w-0 truncate text-[21px] font-semibold uppercase leading-none tracking-wide text-white">
          {footer.label}
        </span>
      )}
      <span className="ml-auto flex shrink-0 items-center gap-3.5">
        {footer.items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className="whitespace-nowrap text-[21px] font-semibold uppercase leading-none tracking-wide tabular-nums"
              style={toneText(item.tone)}
            >
              {item.value}
            </span>
            {item.icon && (
              <span className="flex size-[26px] items-center justify-center bg-white text-help-panel">
                <Icon name={item.icon} size={17} strokeWidth={2.4} />
              </span>
            )}
          </span>
        ))}
      </span>
    </div>
  )
}
