// Import components
import { useAtomInstance, useAtomSelector } from '@zedux/react'

// Import our components
import { activeCooldownsSelector, overlayAtom } from './atoms/overlay'

// Import interfaces
// ...

// Import style
// ...

function App() {
  const overlay = useAtomInstance(overlayAtom)
  const cooldowns = useAtomSelector(activeCooldownsSelector)

  return cooldowns.map((cd) => (
    <div key={cd.id}>
      <img src={cd.icon} />
      {cd.name} ({cd.remaining}s)
    </div>
  ))
}

export default App
