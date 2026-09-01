import fondoImg from '../../assets/3_nuestra_historia/fondo.png';
import fotosImg from '../../assets/3_nuestra_historia/FOTOS.png';

function NuestraHistoria({ zIndex, marginTop, marginBottom, tituloScriptSize, tituloSerifSize, textoSize }) {
	tituloScriptSize = '56px';
	tituloSerifSize = '62px';
	return (
		<section
			id="nuestra-historia"
			className="section-nuestra-historia"
			style={{
				backgroundImage: `url(${fondoImg})`,
				zIndex,
				marginTop,
				marginBottom,
			}}>
			<div className="nuestra-historia-contenido">
				<h2 className="nuestra-historia-titulo">
					<span
						className="nuestra-historia-script"
						style={{ fontSize: tituloScriptSize }}>
						Nuestra
					</span>
					<span
						className="nuestra-historia-serif"
						style={{ fontSize: tituloSerifSize }}>
						HISTORIA
					</span>
				</h2>

				<div
					className="nuestra-historia-parrafo"
					style={{ fontSize: textoSize }}>
					<p>Hay historias que comienzan sin saber a dónde nos llevarán.</p>
					<p>La nuestra comenzó con dos personas que se encontraron, compartieron sueños, construyeron recuerdos y descubrieron que querían caminar juntos hacia el mismo lugar.</p>
					<p>Hoy comienza un nuevo capítulo.</p>
					<p>Nuestro para siempre...</p>
				</div>

				<img
					className="nuestra-historia-fotos"
					src={fotosImg}
					alt="Fotos de nuestra historia"
				/>
			</div>
		</section>
	);
}

export default NuestraHistoria;
