import sobre from '../../assets/7_muestras_de_carino/SOBRE.png';
import hojas1 from '../../assets/7_muestras_de_carino/Layer 8.png';
import hojas2 from '../../assets/7_muestras_de_carino/Layer 8 copy.png';
import carta from '../../assets/7_muestras_de_carino/Rectangle 6.png';

function MuestrasDeCarino({ zIndex, marginTop, marginBottom }) {
	return (
		<section
			id="muestras-de-carino"
			className="section-muestras-de-carino"
			style={{ zIndex, marginTop, marginBottom }}>
			<div style={{ height: '600px' }}>
				<img
					className="muestras-de-carino-hojas-1"
					src={hojas1}
					alt="Hojas"
				/>
				<img
					className="muestras-de-carino-hojas-2"
					src={hojas2}
					alt="Hojas"
				/>
				<img
					className="muestras-de-carino-sobre"
					src={sobre}
					alt="Carta"
				/>
				<div className="muestras-de-carino-carta-container">
					<img
						className="muestras-de-carino-carta-img"
						src={carta}
						alt="Carta"
					/>
					<div className="muestras-de-carino-contenido">
						<span className="muestras-de-carino-titulo-1">Muestras</span>
						<span className="muestras-de-carino-titulo-2">de cariño</span>
						<span className="muestras-de-carino-texto">
							Tu presencia hará nuestro día aún más
							<br />
							especial. Agradecemos de tus muestras de
							<br />
							cariño con regalo de sobre.
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

export default MuestrasDeCarino;
