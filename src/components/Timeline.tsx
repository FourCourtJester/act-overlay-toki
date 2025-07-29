// Import components
import { useEffect, useState } from 'react'
import { useAtomSelector } from '@zedux/react'

// Import our components
import { activeCooldownsSelector } from '../atoms/overlay'
import { Icon } from './Icon'

// Import interfaces
// ...

export const Timeline = () => {
  const cds = useAtomSelector(activeCooldownsSelector)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let raf: number
    const loop = () => {
      setNow(Date.now())
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="inset-0 relative h-16 flex items-center w-full">
      <div className="absolute h-0.5 top-1/2 left-0 w-full bg-white/20 -translate-y-1/2 rounded-full pointer-events-none" />

      {Object.values(cds).map((cd) => (
        <Icon key={cd.id} cd={cd} now={now} />
      ))}
    </div>
  )
}
