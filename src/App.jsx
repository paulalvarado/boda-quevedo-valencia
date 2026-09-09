import { useState, useEffect, useRef } from 'react';
import './App.css';
import AdminApp from './admin/AdminApp.jsx';
import Petalos from './components/Petalos.jsx';
import Musica from './components/Musica.jsx';
import Inicio from './sections/Inicio/Inicio.jsx';
import NosCasamos from './sections/NosCasamos/NosCasamos.jsx';
import NuestraHistoria from './sections/NuestraHistoria/NuestraHistoria.jsx';
import Conteo from './sections/Conteo/Conteo.jsx';
import DetallesDelEvento from './sections/DetallesDelEvento/DetallesDelEvento.jsx';
import DressCode from './sections/DressCode/DressCode.jsx';
import MuestrasDeCarino from './sections/MuestrasDeCarino/MuestrasDeCarino.jsx';
import fondoComun from './assets/5_detalles_del_evento/FONDO.png';
import Espacios from './sections/Espacios/Espacios.jsx';
import Confirmacion from './sections/Confirmacion/Confirmacion.jsx';
import Versiculo from './sections/Versiculo/Versiculo.jsx';
import imgRight from './assets/11_te_esperamos/teEsperamosRight.png';
import imgLeft from './assets/11_te_esperamos/teEsperamosLeft.png';

const ANCHO_MOVIL = 430;

function App() {
	const contenedorRef = useRef(null);
	const [invitacion, setInvitacion] = useState(null);

	// Detectar si estamos en la ruta de administración (/admin o ?admin=1)
	const searchParams = new URLSearchParams(window.location.search);
	const isAdmin =
		window.location.pathname.startsWith('/admin') ||
		searchParams.has('admin');

	// Parámetros de la invitación de boda (soporta ?inv=, ?invitacion=, ?token= o ?codigo=)
	const invToken =
		searchParams.get('inv') ||
		searchParams.get('invitacion') ||
		searchParams.get('token') ||
		searchParams.get('codigo') ||
		sessionStorage.getItem('boda_active_inv');

	const codigoConfirmacion =
		searchParams.get('codigo') ||
		searchParams.get('c');

	// Cargar datos de la invitación pública
	useEffect(() => {
		if (isAdmin) return;

		const cargarInvitacion = async () => {
			try {
				const target = invToken || 'preview-latest';
				const res = await fetch(`/api/invitaciones/public/${target}`);
				if (res.ok) {
					const data = await res.json();
					if (data.invitacion) {
						setInvitacion(data.invitacion);
						if (data.invitacion.token_id) {
							sessionStorage.setItem('boda_active_inv', data.invitacion.token_id);
						}
					}
				}
			} catch (err) {
				console.error('Error al cargar datos de la invitación:', err);
			}
		};

		cargarInvitacion();
	}, [invToken, isAdmin]);

	// Escala la página completa (zoom) para que siempre se vea completa,
	// sin deformación, en pantallas menores al ancho móvil definido.
	useEffect(() => {
		if (isAdmin) return;

		const ajustarEscala = () => {
			const cont = contenedorRef.current;
			if (!cont) return;
			const escala = Math.min(1, window.innerWidth / ANCHO_MOVIL);

			if (escala < 1) {
				cont.style.transform = `scale(${escala})`;
				cont.style.transformOrigin = 'top left';
				document.body.style.height = cont.getBoundingClientRect().height + 'px';
			} else {
				cont.style.transform = 'none';
				document.body.style.height = '';
			}
		};

		ajustarEscala();
		window.addEventListener('resize', ajustarEscala);
		return () => window.removeEventListener('resize', ajustarEscala);
	}, [isAdmin]);

	// Animación de entrada (fade-up): cuando una sección entra en pantalla
	useEffect(() => {
		if (isAdmin) return;

		const secciones = document.querySelectorAll('main section');
		const observador = new IntersectionObserver(
			(entradas) => {
				entradas.forEach((entrada) => {
					if (entrada.isIntersecting) {
						entrada.target.classList.add('animacion-entrada-activa');
						observador.unobserve(entrada.target);
					}
				});
			},
			{ threshold: 0.15 }
		);
		secciones.forEach((seccion) => observador.observe(seccion));
		return () => observador.disconnect();
	}, [isAdmin]);

	// Si es la ruta /admin, renderizamos el panel de administración estilo Vercel / shadcn
	if (isAdmin) {
		return <AdminApp />;
	}

	const imgLeftStyle = {
		position: 'absolute',
		bottom: '0',
		left: '0',
		width: '130px',
	};

	const imgRightStyle = {
		position: 'absolute',
		bottom: '0',
		right: '0',
		width: '100px',
	};

	return (
		<>
			<Petalos />
			<Musica />
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
							invitacion={invitacion}
						/>
						<Confirmacion
							zIndex={1}
							marginTop="10px"
							marginBottom="0"
							invitacion={invitacion}
							codigo={codigoConfirmacion}
							onConfirmSuccess={(invActualizada) => setInvitacion(invActualizada)}
						/>
						<Versiculo
							zIndex={1}
							marginTop="10px"
							marginBottom="0"
						/>

						<img
							style={imgLeftStyle}
							src={imgLeft}
							alt="Flor izquierda"
						/>
						<img
							style={imgRightStyle}
							src={imgRight}
							alt="Flor derecha"
						/>
					</div>
				</main>
			</div>
		</>
	);
}

export default App;
