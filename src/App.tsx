import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { WHATSAPP_SUPPORT_URL } from './services/registration'


function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppRoutes />
      {/* Botão flutuante do WhatsApp */}
      <a
        href={WHATSAPP_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir conversa no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        <i className="ri-whatsapp-line text-2xl" aria-hidden="true"></i>
        <span className="hidden md:inline font-semibold">WhatsApp</span>
      </a>
    </BrowserRouter>
  )
}

export default App
