import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TableProvider } from "./App";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TableProvider>
      <App />
    </TableProvider>
  </StrictMode>,
)
