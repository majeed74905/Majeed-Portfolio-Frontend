import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

/**
 * Activate the web fonts.
 *
 * `index.html` ships the Google Fonts stylesheet as `media="print"` so it never
 * blocks first paint. Flipping it to `all` here — rather than with an inline
 * `onload` attribute — is what lets the Content-Security-Policy forbid inline
 * script entirely. The site is fully legible in the fallback stack, so nothing
 * breaks if this never runs.
 */
const webfonts = document.getElementById('webfonts')
if (webfonts instanceof HTMLLinkElement) webfonts.media = 'all'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found in index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
