import fondoImg from '../../assets/5_detalles_del_evento/FONDO.png';
import tarjetaImg from '../../assets/5_detalles_del_evento/Rectangle 6.png';
import rosaImg from '../../assets/5_detalles_del_evento/BLUE ROSE.png';
import ubicacionImg from '../../assets/5_detalles_del_evento/Vector Smart Object.png';
import rosaBLImg1 from '../../assets/5_detalles_del_evento/BLUE ROSE1.png';
import rosaBLImg2 from '../../assets/5_detalles_del_evento/BLUEROSE 3.png';

function DetallesDelEvento({ zIndex, marginTop, marginBottom }) {
    const sectionStyle = {
        backgroundImage: `url(${fondoImg})`,
        zIndex,
        marginTop,
        marginBottom,
    };

    const tarjetaStyle = {
        backgroundImage: `url(${tarjetaImg})`,
    };

	return (
		<section id="detalles-del-evento" className="section-detalles" style={sectionStyle}>
			<div className="detalles-tarjeta" style={tarjetaStyle}>
				<img className="detalles-rosa" src={rosaImg} alt="Rosa azul" />
                <div className="detalles-titulo">
                    <span>Detalles</span>
                    <span>del evento</span>
                </div>
                <div className="detalles-ubicacion">
                    <img src={ubicacionImg} alt="Ubicación" />
                    <span>Cielo abierto</span>
                </div>
                <div className="detalles-hora">
                    <span>Ceremonia</span>
                    <span>4:30 pm</span>
                    <div></div>
                </div>
                <div className="detalles-recepcion">
                    <span>Recepción</span>
                    <span>4:30 pm</span>
                </div>
                <div className="detalles-botones">
                    {/* {Google Maps} */}
                    <a href="https://goo.gl/maps/6Z1g5k7Q8y2x3J9F9" target="_blank" rel="noopener noreferrer">Google Maps</a>
                    {/* {Waze} */}
                    <a href="https://www.waze.com/" target="_blank" rel="noopener noreferrer">Waze</a>
                </div>
				<img className="detalles-rosa-bl-1" src={rosaBLImg1} alt="Rosa azul" />
				<img className="detalles-rosa-bl-2" src={rosaBLImg2} alt="Rosa azul" />
			</div>
		</section>
	);
}

export default DetallesDelEvento;
