import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './styles/utilities.css'
import './styles/statsTable.css'
import './styles/tabs.css'
import './styles/card.css'
import './styles/form.css'
import './styles/console.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
