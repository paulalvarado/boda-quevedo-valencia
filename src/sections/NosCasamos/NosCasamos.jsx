import videoFlores from '../../assets/2_nos_casamos/flores_blanco_negro.mp4';
import overlayImg from '../../assets/2_nos_casamos/Rectangle 1.png';
import centralImg from '../../assets/2_nos_casamos/ChatGPT Image Aug 16, 2026, 01_17_40 AM.png';
import ramaImg from '../../assets/2_nos_casamos/rama-hojas.png';
import NosCasamosContenido from './components/NosCasamosContenido.jsx';

function NosCasamos({ zIndex, marginTop, marginBottom, imagenTop = '50%', imagenLeft = '50%', contenidoTop = '50%', contenidoLeft = '50%', tituloSize, textoSize, fechaSize, ramaTop = '50%', ramaLeft = '25%' }) {
	imagenTop = '40%';
	imagenLeft = '50%';
	contenidoTop = "53%";
	contenidoLeft = "60%";
	tituloSize = "38px";
	textoSize;
	fechaSize;
	ramaTop = "70%";
	ramaLeft = "25%";
	return (
		<section
			id="nos-casamos"
			className="section-nos-casamos"
			style={{ zIndex, marginTop, marginBottom }}>
			<video
				className="nos-casamos-video"
				src={videoFlores}
				autoPlay
				muted
				loop
				playsInline
			/>
			<img
				className="nos-casamos-overlay"
				src={overlayImg}
				alt=""
			/>
			<img
				className="nos-casamos-central"
				src={centralImg}
				alt=""
				style={{ top: imagenTop, left: imagenLeft }}
			/>
			<NosCasamosContenido
				top={contenidoTop}
				left={contenidoLeft}
				tituloSize={tituloSize}
				textoSize={textoSize}
				fechaSize={fechaSize}
			/>
			<img
				className="nos-casamos-rama"
				src={ramaImg}
				alt=""
				style={{ top: ramaTop, left: ramaLeft }}
			/>
		</section>
	);
}

export default NosCasamos;
