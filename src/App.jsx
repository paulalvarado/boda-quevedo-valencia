import { useEffect, useRef } from 'react';
import './App.css';
import Inicio from './sections/Inicio/Inicio.jsx';
import NosCasamos from './sections/NosCasamos/NosCasamos.jsx';
import NuestraHistoria from './sections/NuestraHistoria/NuestraHistoria.jsx';
import Conteo from './sections/Conteo/Conteo.jsx';
import DetallesDelEvento from './sections/DetallesDelEvento/DetallesDelEvento.jsx';
import DressCode from './sections/DressCode/DressCode.jsx';
import MuestrasDeCarino from './sections/MuestrasDeCarino/MuestrasDeCarino.jsx';
import fondoComun from './assets/5_detalles_del_evento/FONDO.png';
import Espacios from './sections/Espacios/Espacios.jsx';

const ANCHO_MOVIL = 430;

function App() {
	const contenedorRef = useRef(null);

	// Escala la página completa (zoom) para que siempre se vea completa,
	// sin deformación, en pantallas menores al ancho móvil definido.
	useEffect(() => {
		const ajustarEscala = () => {
			const cont = contenedorRef.current;
			if (!cont) return;
			const escala = Math.min(1, window.innerWidth / ANCHO_MOVIL);

			if (escala < 1) {
				cont.style.transform = `scale(${escala})`;
				cont.style.transformOrigin = 'top left';
				// El scroll debe abarcar la altura visual ya escalada
				document.body.style.height = cont.getBoundingClientRect().height + 'px';
			} else {
				cont.style.transform = 'none';
				document.body.style.height = '';
			}
		};

		ajustarEscala();
		window.addEventListener('resize', ajustarEscala);
		return () => window.removeEventListener('resize', ajustarEscala);
	}, []);

	return (
		<div
			className="app-container"
			ref={contenedorRef}>
			<main>
				<Inicio
					zIndex={2}
					marginTop="0"
					marginBottom="0"
				/>
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

				<NuestraHistoria
					zIndex={1}
					marginTop="-4rem"
					marginBottom="0"
					tituloScriptSize="56px"
					tituloSerifSize="34px"
					textoSize="15px"
				/>

				<Conteo
					zIndex={1}
					marginTop="0"
					marginBottom="0"
					tituloSize="24px"
					numeroSize="68px"
					etiquetaSize="14px"
				/>

				<DetallesDelEvento
					zIndex={1}
					marginTop="0"
					marginBottom="0"
				/>

				<DressCode
					zIndex={1}
					marginTop="-2.5rem"
					marginBottom="0"
				/>

				{/* Layout común: las secciones de aquí en adelante comparten
				    el fondo FONDO.png (min-height 400px) */}
				<div
					className="layout-fondo"
					style={{ backgroundImage: `url(${fondoComun})` }}>
					<MuestrasDeCarino
						zIndex={1}
						marginTop="-2.5rem"
						marginBottom="0"
					/>
					<Espacios
						zIndex={1}
						marginTop="10px"
						marginBottom="0"
					/>

					{/* Las siguientes secciones irán dentro de este layout */}
				</div>
			</main>
		</div>
	);
}

export default App;
