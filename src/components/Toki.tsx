// Import components
import { useEffect, useState } from 'react'
import { AtomProvider, useAtomInstance } from '@zedux/react'
import classNames from 'classnames'

// Import our components
import abilitiesAtom from '@atoms/abilities'
import characterAtom from '@atoms/character'
import xivAPIAtom from '@atoms/xivapi'
import Timeline from '@components/Timeline'

// Import interfaces
// ...

// Import style
// ...

export default function Toki() {
  // Atoms
  const abilitiesInstance = useAtomInstance(abilitiesAtom)
  const characterInstance = useAtomInstance(characterAtom)
  const xivapiInstance = useAtomInstance(xivAPIAtom)
  // States
  const [isLocked, setLocked] = useState(true)

  useEffect(() => {
    const handler = (e: CustomEvent<{ isLocked: boolean }>) => setLocked(e.detail.isLocked)

    document.addEventListener('onOverlayStateUpdate', handler as EventListener)

    return () => {
      document.removeEventListener('onOverlayStateUpdate', handler as EventListener)
    }
  }, [])

  return (
    <AtomProvider instances={[abilitiesInstance, characterInstance, xivapiInstance]}>
      <div
        className={classNames(
          'box-border flex items-center justify-center w-full h-full p-[3vh]',
          !isLocked ? 'bg-black/50' : false
        )}
      >
        <Timeline />
      </div>
    </AtomProvider>
  )
}
