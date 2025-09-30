import React from 'react'
import ReactDOM from 'react-dom/client'
import { NuqsAdapter } from 'nuqs/adapters/react'
import App from './App.tsx'
import './styles/globals.css'
import { initializeEnvironment } from './utils/environment'

// Initialize environment configuration
initializeEnvironment()

// For embeddable deployment
function initializeConfigurator(containerId: string = 'product-configurator') {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`Container with id "${containerId}" not found`)
    return
  }

  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <NuqsAdapter>
        <App />
      </NuqsAdapter>
    </React.StrictMode>,
  )
}

// Auto-initialize if container exists
if (typeof window !== 'undefined') {
  // For development mode
  if (import.meta.env.DEV) {
    const container = document.getElementById('root')
    if (container) {
      const root = ReactDOM.createRoot(container)
      root.render(
        <React.StrictMode>
          <NuqsAdapter>
            <App />
          </NuqsAdapter>
        </React.StrictMode>,
      )
    }
  } else {
    // For production/embedded mode
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initializeConfigurator())
    } else {
      initializeConfigurator()
    }
  }
}

// Export for manual initialization
export { initializeConfigurator }
export default App
