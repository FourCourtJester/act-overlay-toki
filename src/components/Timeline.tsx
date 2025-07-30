// Import components
import { useEffect, useState } from 'react'
import { useAtomInstance, useAtomSelector } from '@zedux/react'
import classNames from 'classnames'

// Import our components
import { activeCooldownsSelector, overlayAtom } from '../atoms/overlay'
import { Icon } from './Icon'

// Import interfaces
// ...

export const Timeline = () => {
  const overlay = useAtomInstance(overlayAtom)

  const cds = useAtomSelector(activeCooldownsSelector)

  const [now, setNow] = useState(Date.now())
  const isActive = cds.length > 0

  useEffect(() => {
    if (!isActive) return () => {}

    let raf: number
    const loop = () => {
      setNow(Date.now())
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="inset-0 relative w-full h-full flex items-center">
      <div
        className="absolute top-1/2 left-0 w-full bg-white/60 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          height: '2vh',
        }}
      />
      {Object.values(cds).map(
        (cd) => !Number.isNaN(cd.recast) && <Icon key={cd.id} cd={cd} now={now} atom={overlay} />
      )}
    </div>
  )
}
