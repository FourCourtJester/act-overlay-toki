// Import components
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAtomContext } from '@zedux/react'
import classNames from 'classnames'

// Import our components
import abilitiesAtom from '@atoms/abilities'

// Import interfaces
import type { IconProps } from '@types'

const defaultShift = [0, 0, 53, 0, -53]

export default function Icon({ ability, now }: IconProps) {
  // Atoms
  const abilitiesInstance = useAtomContext(abilitiesAtom, true)
  // States
  const [iconWidth, setIconWidth] = useState(NaN)
  // Variables: Time
  const elapsed = now - ability.timestamp
  const progress = Math.min(elapsed / (ability.recast * 1000), 1)
  const remaining = ability.recast - elapsed / 1000
  // Variables: Distance
  const maxTravel = window.innerWidth - iconWidth
  const distance = maxTravel * (1 - progress)
  // Variables: Visuals
  const grayscale =
    remaining > 2.5 ? Math.round(Math.min((remaining / ability.recast) * 100, 100)) : 0
  const readySoon = remaining <= 2.5
  const ready = progress >= 1
  // Refs
  const $ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!Number.isNaN(iconWidth)) return () => {}

    // Record the icon width for use in calculations so that
    // the icon stops at 0, but starts at (window - width)
    // instead of off-screen
    setIconWidth($ref.current!.getBoundingClientRect().width)
  }, [iconWidth])

  useEffect(() => {
    // Remove this ability after it's lifecycle has expired
    if (remaining < -Number(import.meta.env.VITE_ICON_TTL))
      abilitiesInstance.dispatch({ type: 'AbilityRemove', payload: { id: ability.id } })
  }, [remaining])

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
        className={classNames(
          'w-full h-full object-cover rounded',
          ready ? 'ring ring-green-400 animate-pulse' : false,
          !ready && readySoon ? 'ring ring-yellow-400 animate-pulse' : false,
          !ready && !readySoon ? 'opacity-70' : 'opacity-100'
        )}
        style={{
          filter: `grayscale(${grayscale}%)`,
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
