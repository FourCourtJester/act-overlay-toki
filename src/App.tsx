// Import components
import { useEffect, useState } from 'react'
import classNames from 'classnames'

// Import our components
import { Timeline } from './components/Timeline'

// Import interfaces
// ...

// Import style
// ...

function App() {
  const [isLocked, setLocked] = useState(false)

  useEffect(() => {
    const handler = (e: CustomEvent<{ isLocked: boolean }>) => {
      setLocked(e.detail.isLocked)
    }

    document.addEventListener('onOverlayStateUpdate', handler as EventListener)
    return () => {
      document.removeEventListener('onOverlayStateUpdate', handler as EventListener)
    }
  }, [])

  return (
    <div
      className={classNames(
        'flex items-center justify-center w-full h-full',
        !isLocked ? 'bg-black/50' : false
      )}
    >
      <Timeline />
    </div>
  )
}

export default App
