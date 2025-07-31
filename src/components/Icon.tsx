// Import components
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAtomContext } from '@zedux/react'

// Import our components
import abilitiesAtom from '@atoms/abilities'

// Import interfaces
import type { IconProps } from '@types'

const defaultShift = [0, 0, 56, 0, -56]

export default function Icon({ ability, now }: IconProps) {
  // Atoms
  const abilitiesInstance = useAtomContext(abilitiesAtom, true)
  // States
  const [iconWidth, setIconWidth] = useState(NaN)
  // Refs
  const $ref = useRef<HTMLDivElement>(null)

  // Time & Progress
  const elapsed = now - ability.timestamp
  const recastMs = ability.recast * 1000
  const progress = Math.min(elapsed / recastMs, 1)
  const remaining = ability.recast - elapsed / 1000

  const ready = progress >= 1
  const readySoon = remaining <= 2.5 && remaining > 0

  // Distance
  const maxTravel = window.innerWidth - iconWidth
  const distance = maxTravel * (1 - progress)

  // Visuals
  const grayscale =
    remaining > 2.5 ? Math.round(Math.min((remaining / ability.recast) * 100, 100)) : 0
  const opacity = 0.5 + 0.5 * progress

  // Interpolated glow (gray → yellow)
  const shadowProgress = Math.max(0, Math.min(1, 1 - remaining / 3))
  const r = Math.round(128 + (255 - 128) * shadowProgress)
  const g = Math.round(128 + (255 - 128) * shadowProgress)
  const b = Math.round(128 * (1 - shadowProgress))

  useLayoutEffect(() => {
    const style = document.documentElement.style

    // Determine glow color
    const glowColor = ready
      ? 'rgba(0, 255, 0, 0.9)'
      : readySoon
        ? 'rgba(255, 255, 0, 0.9)'
        : `rgba(${r},${g},${b},0.6)`

    style.setProperty('--toki-glow-color', glowColor)
  }, [ready, readySoon, r, g, b])

  // Set icon width once
  useLayoutEffect(() => {
    if (Number.isNaN(iconWidth) && $ref.current)
      setIconWidth($ref.current.getBoundingClientRect().width)
  }, [iconWidth])

  // Remove after ready
  useEffect(() => {
    if (!ready) return

    const timeout = setTimeout(
      () => {
        abilitiesInstance.dispatch({
          type: 'AbilityRemove',
          payload: { id: ability.id },
        })
      },
      Number(import.meta.env.VITE_ICON_SECONDS_TTL) * 1000
    )

    return () => clearTimeout(timeout)
  }, [ready])

  return (
    <div
      ref={$ref}
      className="icon absolute aspect-square p-1 will-change-transform"
      style={{
        transform: `translate(${distance}px, ${defaultShift[ability.category] ?? 0}%)`,
      }}
    >
      <img
        src={ability.icon}
        className="w-full h-full object-cover rounded persistent-glow transition-[filter,opacity] duration-200"
        style={{
          filter: `grayscale(${grayscale}%)`,
          opacity,
        }}
      />
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold shadow-text">
          {String(Math.ceil(remaining))}
        </span>
      )}
    </div>
  )
}
