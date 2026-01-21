import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'    // ADICIONE ESTA LINHA - Aqui está o nosso design premium
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)