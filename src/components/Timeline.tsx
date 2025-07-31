// Import components
import { useEffect, useState } from 'react'
import { useAtomContext, useAtomValue } from '@zedux/react'

// Import our components
import abilitiesAtom from '@atoms/abilities'
import Icon from '@components/Icon'

// Import interfaces
// ...

export default function Timeline() {
  // Atoms
  const abilitiesInstance = useAtomContext(abilitiesAtom, true)
  const abilities = useAtomValue(abilitiesInstance).abilities
  // States
  const [now, setNow] = useState(Date.now())
  // Variables
  const isActive = abilities.length > 0

  // As long as there are cooldowns, set a RAF loop
  // that will update the Date and trigger re-renders
  // of the icons
  useEffect(() => {
    if (!isActive) return () => {}

    function loop() {
      setNow(Date.now())
      raf = requestAnimationFrame(loop)
    }

    let raf = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(raf)
  }, [isActive])

  // If there are no cooldowns, do not display
  if (!isActive) return null

  return (
    <div id="timeline" className="inset-0 relative w-full h-full flex items-center">
      <div
        id="line"
        className="absolute top-1/2 left-0 w-full bg-white/60 -translate-y-1/2 rounded-full pointer-events-none"
      />
      {Object.values(abilities).map(
        (ability) =>
          !Number.isNaN(ability.recast) && <Icon key={ability.id} ability={ability} now={now} />
      )}
    </div>
  )
}
