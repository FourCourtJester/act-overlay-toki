// Import components
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import our components
import App from './App.tsx'

// Import interfaces
// ...

// Import style
import './tailwind/base.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
