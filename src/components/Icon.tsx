// Import components
// ...

import classNames from 'classnames'

// Import our components
// ...

// Import interfaces
// ...

export const Icon = ({ cd, now }) => {
  const elapsed = now - cd.ts
  const progress = Math.min(elapsed / (cd.recast * 1000), 1)
  const remaining = cd.recast - elapsed / 1000

  const iconWidth = 64
  const maxTravel = window.outerWidth - iconWidth
  const distance = maxTravel * (1 - progress)

  const readySoon = remaining <= 2.5
  const ready = progress >= 1

  return (
    <div
      className="w-16 h-16 absolute p-1 will-change-transform"
      style={{
        transform: `translateX(${distance}px)`,
      }}
    >
      <img
        src={cd.icon}
        className={classNames(
          'w-full h-full object-cover rounded',
          ready
            ? 'ring ring-green-400 animate-pulse'
            : readySoon
              ? 'ring ring-yellow-400 animate-pulse'
              : 'grayscale opacity-70'
        )}
      />
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold shadow-text ">
          {Math.ceil(remaining)}
        </span>
      )}
    </div>
  )
}
