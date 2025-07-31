
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { DarkModeProvider } from './components/DarkModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <BrowserRouter>
  <DarkModeProvider>
  <App />
  </DarkModeProvider>
  </BrowserRouter>
</React.StrictMode>,
)
