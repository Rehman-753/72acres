import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth.jsx'
import { UiProvider } from './context.jsx'
import './styles.css' // copied verbatim from the reference index.html
import './pages.css' // extras for detail page, forms and lister portal

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UiProvider>
          <App />
        </UiProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
