import cuadro from '../../assets/9_espacios/Color Fill 1 copy.png';
import florTopLeft from '../../assets/9_espacios/florTopLeft.png';
import florButtomRight from '../../assets/9_espacios/florButtonRight.png';

export function FloresTopLeft() {
	return (
		<div className="espacios-flor-tl">
			<img
				src={florTopLeft}
				alt="Flor azul"
			/>
		</div>
	);
}

export function FloresButtomRight() {
	return (
		<div className="espacios-flor-br">
			<img
				src={florButtomRight}
				alt="Flor azul"
			/>
		</div>
	);
}

export default function Espacios({ zIndex, marginTop, marginBottom, invitacion }) {
	const asientos = invitacion ? parseInt(invitacion.numero_asientos, 10) : 1;

	return (
		<section
			id="espacios"
			className="section-espacios"
			style={{ zIndex, marginTop, marginBottom }}>
			<FloresTopLeft />
			<img
				className="espacios-cuadro"
				src={cuadro}
				alt="Cuadro"
			/>
			<div className="espacios-contenido">
				<span className="espacios-titulo-1">Tenemos</span>
				<span className="espacios-titulo-2">RESERVADO</span>
				<div className="espacios-numero-row">
					<span className="espacios-numero">{asientos}</span>
					<div className="espacios-numero-etiquetas">
						<span>{asientos === 1 ? 'ESPACIO' : 'ESPACIOS'}</span>
						<span>PARATI</span>
					</div>
				</div>
			</div>
			<FloresButtomRight />
		</section>
	);
}
