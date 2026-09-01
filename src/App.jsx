import { useEffect, useRef } from 'react'
import './App.css'
import Inicio from './sections/Inicio/Inicio.jsx'
import NosCasamos from './sections/NosCasamos/NosCasamos.jsx'

const ANCHO_MOVIL = 430

function App() {
  const contenedorRef = useRef(null)

  // Escala la página completa (zoom) para que siempre se vea completa,
  // sin deformación, en pantallas menores al ancho móvil definido.
  useEffect(() => {
    const ajustarEscala = () => {
      const cont = contenedorRef.current
      if (!cont) return
      const escala = Math.min(1, window.innerWidth / ANCHO_MOVIL)

      if (escala < 1) {
        cont.style.transform = `scale(${escala})`
        cont.style.transformOrigin = 'top left'
        // El scroll debe abarcar la altura visual ya escalada
        document.body.style.height = cont.getBoundingClientRect().height + 'px'
      } else {
        cont.style.transform = 'none'
        document.body.style.height = ''
      }
    }

    ajustarEscala()
    window.addEventListener('resize', ajustarEscala)
    return () => window.removeEventListener('resize', ajustarEscala)
  }, [])

  return (
    <div className="app-container" ref={contenedorRef}>
      <main>
        <Inicio zIndex={2} marginTop="0" marginBottom="0" />
        <NosCasamos
          zIndex={1}
          marginTop="-30px"
          marginBottom="0"
          imagenTop="50%"
          imagenLeft="49.5%"
          contenidoTop="50%"
          contenidoLeft="50%"
          tituloSize="62px"
          textoSize="16px"
          fechaSize="18px"
        />

        {/* Aquí se agregarán las demás secciones */}
      </main>
    </div>
  )
}

export default App
