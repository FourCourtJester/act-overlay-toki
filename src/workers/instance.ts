// Import components
// ...

// Import our components
import Worker from '@workers/worker?worker'

// Import interfaces
// ...

const urlParams = new URLSearchParams(window.location.search)
const wsURL = urlParams.get('WS') ?? import.meta.env.VITE_DEFAULT_WS

const ourWorker = new Worker()

ourWorker.postMessage({ type: 'connect', url: wsURL })

export default ourWorker
