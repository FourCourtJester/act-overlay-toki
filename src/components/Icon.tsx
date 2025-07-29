// Import components
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'

// Import our components
// ...

// Import interfaces
// ...

export const Icon = ({ atom, cd, now }) => {
  const [iconWidth, setIconWidth] = useState(NaN)

  const elapsed = now - cd.ts
  const progress = Math.min(elapsed / (cd.recast * 1000), 1)
  const remaining = cd.recast - elapsed / 1000

  const maxTravel = window.innerWidth - iconWidth
  const distance = maxTravel * (1 - progress)

  const grayscale = remaining > 2.5 ? Math.round(Math.min((remaining / cd.recast) * 100, 100)) : 0
  const readySoon = remaining <= 2.5
  const ready = progress >= 1

  const $ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!Number.isNaN(iconWidth)) return () => {}

    const { width } = $ref.current!.getBoundingClientRect()
    setIconWidth(width)
  }, [iconWidth])

  useEffect(() => {
    if (remaining < -Number(import.meta.env.VITE_ICON_TTL)) atom.exports.remove(cd.id)
  }, [remaining])

  return (
    <div
      ref={$ref}
      className="absolute aspect-square h-full p-1 will-change-transform"
      style={{
        transform: `translateX(${distance}px)`,
      }}
    >
      <img
        src={cd.icon}
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
        <span
          className="absolute inset-0 flex items-center justify-center text-white font-bold shadow-text"
          style={{
            fontSize: '35vh',
          }}
        >
          {Math.ceil(remaining)}
        </span>
      )}
    </div>
  )
}
