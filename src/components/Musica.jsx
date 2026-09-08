import { useEffect, useRef, useState } from 'react';
import musica from '../assets/music/Ed Sheeran - Thinking out Loud (Lyrics).mp3';
import logoImg from '../assets/1_inicio_sobre/Vector Smart Object.png';
import ySvg from '../assets/&.svg';

function Musica() {
	const audioRef = useRef(null);
	// entrado: el usuario ya tocó la pantalla de entrada
	// salida: animación de desvanecido en curso
	const [entrado, setEntrado] = useState(false);
	const [salida, setSalida] = useState(false);
	const [sonando, setSonando] = useState(false);
	const [volumen, setVolumen] = useState(0.7);
	const [mostrarVolumen, setMostrarVolumen] = useState(false);

	// Aplica el volumen inicial al elemento de audio al montar el componente.
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volumen;
		}
	}, [volumen]);

	// Al tocar la pantalla de entrada: activa la música (gesto del usuario)
	// y desvanece el overlay hacia la bienvenida.
	const empezar = async () => {
		const audio = audioRef.current;
		if (audio) {
			try {
				await audio.play();
				setSonando(true);
			} catch (e) {
				console.warn('No se pudo reproducir la música', e);
			}
		}
		setSalida(true);
		setTimeout(() => setEntrado(true), 900);
	};

	// Botón flotante para pausar / reanudar una vez dentro.
	const alternar = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (sonando) {
			audio.pause();
			setSonando(false);
		} else {
			try {
				await audio.play();
				setSonando(true);
			} catch (e) {
				console.warn('No se pudo reproducir la música', e);
			}
		}
	};

	// Subir / bajar volumen.
	const cambiarVolumen = (e) => {
		const valor = Number(e.target.value);
		setVolumen(valor);
		if (audioRef.current) {
			audioRef.current.volume = valor;
		}
	};

	return (
		<>
			<audio ref={audioRef} src={musica} loop preload="auto" />

			{/* Pantalla de entrada: obliga a tocar para activar el audio */}
			{!entrado && (
				<div
					className={`intro-overlay ${salida ? 'intro-salida' : ''}`}
					onClick={empezar}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							empezar();
						}
					}}
				>
					<div className="intro-contenido">
						<p className="intro-bienvenida">Tenemos el placer de invitarte a</p>
						<img className="intro-logo" src={logoImg} alt="Monograma Andrea & Daniel" />
						<h1 className="intro-nombres">
							<span>ANDREA</span>
							<img className="intro-ampersand" src={ySvg} alt="Y" />
							<span>DANIEL</span>
						</h1>
						<p className="intro-fecha">24 . 10 . 26</p>

						<p className="intro-pista">
							<span className="intro-nota" aria-hidden="true">♪</span>
							Toca para abrir la invitación
							<span className="intro-nota" aria-hidden="true">♪</span>
						</p>
					</div>
				</div>
			)}

			{/* Controles flotantes: agrupados en un solo panel */}
			{entrado && (
				<div className="controles-musica">
					<div className="controles-musica-grupo">
					{/* Slider de volumen */}
					{mostrarVolumen && (
						<div className="control-volumen">
							<input
								type="range"
								className="control-volumen-slider"
								min="0"
								max="1"
								step="0.01"
								value={volumen}
								onChange={cambiarVolumen}
								style={{ '--p': `${Math.round(volumen * 100)}%` }}
								aria-label="Volumen"
							/>
						</div>
					)}

					{/* Botón de volumen */}
					<button
						type="button"
						className={`boton-volumen ${volumen === 0 ? 'silenciado' : ''}`}
						onClick={() => setMostrarVolumen((v) => !v)}
						aria-label="Ajustar volumen"
						title="Ajustar volumen"
					>
						<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
							<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z" />
							{volumen === 0 ? (
								<path
									d="M16 9l5 6M21 9l-5 6"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinecap="round"
								/>
							) : (
								<>
									<path
										d="M15.5 8.5a4.5 4.5 0 0 1 0 7"
										stroke="currentColor"
										strokeWidth="1.6"
										fill="none"
										strokeLinecap="round"
									/>
									{volumen > 0.5 && (
										<path
											d="M18.5 6a8 8 0 0 1 0 12"
											stroke="currentColor"
											strokeWidth="1.6"
											fill="none"
											strokeLinecap="round"
										/>
									)}
								</>
							)}
						</svg>
					</button>

					{/* Botón flotante para pausar / reanudar */}
					<button
						type="button"
						className={`boton-musica ${sonando ? 'sonando' : ''}`}
						onClick={alternar}
						aria-label={sonando ? 'Pausar música de fondo' : 'Reproducir música de fondo'}
						title={sonando ? 'Pausar música' : 'Reproducir música'}
					>
						<svg
							className="boton-musica-icono"
							viewBox="0 0 24 24"
							width="22"
							height="22"
							aria-hidden="true"
						>
							{sonando ? (
								/* Nota musical (sonando) */
								<path fill="currentColor" d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9z" />
							) : (
								/* Nota musical con barra (pausado) */
								<path
									fill="currentColor"
									d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9zm8 0h-2v14h2V3z"
									opacity="0.55"
								/>
							)}
						</svg>
					</button>
					</div>
				</div>
			)}
		</>
	);
}

export default Musica;
