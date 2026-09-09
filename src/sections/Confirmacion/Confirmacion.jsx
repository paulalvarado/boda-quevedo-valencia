import { useState } from 'react';
import cuadro from '../../assets/8_reservacion/ELEMENTS.png';

export default function Confirmacion({
	zIndex,
	marginTop,
	marginBottom,
	invitacion,
	codigo,
	onConfirmSuccess,
}) {
	const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
	const [modalSinCodigoOpen, setModalSinCodigoOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorServidor, setErrorServidor] = useState(null);

	const handleBotonConfirmar = () => {
		setErrorServidor(null);

		// REGLA: Si en la URL no incluye el código al tratar de confirmar,
		// o la invitación no fue enviada por el administrador:
		if (!codigo || !codigo.trim() || !invitacion) {
			setModalSinCodigoOpen(true);
			return;
		}

		// Si incluye el código: mostrar mensaje de advertencia indicando la familia y sus asientos
		setModalConfirmacionOpen(true);
	};

	const handleEjecutarConfirmacion = async () => {
		if (!invitacion || !codigo) return;
		setLoading(true);
		setErrorServidor(null);

		try {
			const res = await fetch(`/api/invitaciones/public/${invitacion.token_id}/confirmar`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ codigo: codigo.trim() }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Ocurrió un error al procesar la confirmación.');
			}

			setModalConfirmacionOpen(false);
			if (onConfirmSuccess) {
				onConfirmSuccess(data.invitacion);
			}
			alert('¡Muchas gracias! Tu confirmación de asistencia ha sido registrada.');
		} catch (err) {
			setErrorServidor(err.message);
		} finally {
			setLoading(false);
		}
	};

	const styleSection = {
		zIndex: zIndex,
		marginTop: marginTop,
		marginBottom: marginBottom,
		position: 'relative',
	};

	const styleCuadro = {
		width: '100%',
		height: 'auto',
	};

	const styleCuadroContainer = {
		width: '100%',
		height: 'auto',
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		textAlign: 'center',
		fontFamily: 'NewYork, serif',
	};

	const styleTitulo = {
		fontSize: '36px',
		fontWeight: '400',
		marginTop: '30px',
	};

	const styleParrafo = {
		fontSize: '16px',
		lineHeight: '1',
		margin: '10px 0',
		display: 'block',
	};

	const styleLink = {
		display: 'inline-block',
		marginTop: '10px',
		padding: '10px 20px',
		backgroundColor: '#0e2035',
		color: '#fff',
		textDecoration: 'none',
		fontWeight: '400',
		textTransform: 'uppercase',
		border: 'none',
		cursor: 'pointer',
		fontFamily: 'inherit',
	};

	const modalOverlayStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		backdropFilter: 'blur(4px)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 9999,
		padding: '20px',
		fontFamily: 'system-ui, -apple-system, sans-serif',
	};

	const modalBoxStyle = {
		backgroundColor: '#ffffff',
		borderRadius: '12px',
		padding: '24px',
		maxWidth: '380px',
		width: '100%',
		textAlign: 'center',
		boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
		color: '#1a1a1a',
	};

	const nombreFamiliaTexto = invitacion?.nombre_familia || 'tu familia';
	const asientosNumero = invitacion ? parseInt(invitacion.numero_asientos, 10) : 1;
	const asientosTexto = asientosNumero === 1 ? '1 asiento' : `${asientosNumero} asientos`;

	return (
		<section style={styleSection}>
			<img src={cuadro} alt="Cuadro" style={styleCuadro} />
			<div style={styleCuadroContainer}>
				<h2 style={styleTitulo}>RSVP</h2>
				<p style={styleParrafo}>
					Nos encantaría contar contigo.
					<br />
					Por favor, confirmanos antes del
					<br />
					<u>
						<i>1 de Octubre</i>
					</u>{' '}
					si nos acompañarás en
					<br />
					este día tan especial.
				</p>
				<button
					type="button"
					style={styleLink}
					onClick={handleBotonConfirmar}
				>
					Confirma aquí
				</button>
			</div>

			{/* ── Advertencia cuando la URL NO incluye el código ── */}
			{modalSinCodigoOpen && (
				<div style={modalOverlayStyle} onClick={() => setModalSinCodigoOpen(false)}>
					<div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
						<p style={{ fontSize: '15px', lineHeight: '1.4', color: '#1a1a1a', margin: '15px 0 20px' }}>
							No se puede confirmar si la invitación no fue enviada por el administrador
						</p>
						<button
							type="button"
							onClick={() => setModalSinCodigoOpen(false)}
							style={{
								width: '100%',
								padding: '10px',
								backgroundColor: '#0e2035',
								color: '#fff',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontWeight: '500',
							}}
						>
							Cerrar
						</button>
					</div>
				</div>
			)}

			{/* ── Mensaje de Advertencia para Confirmar la Familia X con N Asientos ── */}
			{modalConfirmacionOpen && (
				<div style={modalOverlayStyle} onClick={() => !loading && setModalConfirmacionOpen(false)}>
					<div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
						<h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#0e2035' }}>
							Confirmar Asistencia
						</h3>
						<p style={{ fontSize: '14.5px', lineHeight: '1.4', color: '#374151', marginBottom: '20px' }}>
							Esta acción confirmará la asistencia de la <strong>{nombreFamiliaTexto}</strong> con{' '}
							<strong>{asientosTexto}</strong>.
						</p>

						{errorServidor && (
							<div
								style={{
									backgroundColor: '#fee2e2',
									color: '#b91c1c',
									padding: '8px',
									borderRadius: '4px',
									fontSize: '13px',
									marginBottom: '14px',
								}}
							>
								{errorServidor}
							</div>
						)}

						<div style={{ display: 'flex', gap: '10px' }}>
							<button
								type="button"
								onClick={() => setModalConfirmacionOpen(false)}
								disabled={loading}
								style={{
									flex: 1,
									padding: '10px',
									backgroundColor: '#f3f4f6',
									color: '#374151',
									border: '1px solid #d1d5db',
									borderRadius: '4px',
									cursor: 'pointer',
								}}
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleEjecutarConfirmacion}
								disabled={loading}
								style={{
									flex: 1,
									padding: '10px',
									backgroundColor: '#0e2035',
									color: '#fff',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
								}}
							>
								{loading ? 'Confirmando...' : 'Aceptar'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
