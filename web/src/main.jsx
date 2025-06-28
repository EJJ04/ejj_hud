import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const isDev = process.env.NODE_ENV === 'development';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div data-mode={isDev ? 'development' : 'production'} style={{backgroundColor: 'transparent', height: '100%', width: '100%'}}>
      <App />
    </div>
  </React.StrictMode>,
)
