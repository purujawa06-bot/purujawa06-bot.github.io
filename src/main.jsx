import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const el = document.getElementById('root')

if (el && el.hasChildNodes()) {
  // Hasil prerender (static HTML) -> hydrate, bukan render ulang
  ReactDOM.hydrateRoot(el, (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ))
} else {
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
