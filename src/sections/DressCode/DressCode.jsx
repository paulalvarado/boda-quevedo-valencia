import forestImg from '../../assets/6_dress_code/footpath-amidst-trees-forest.png';
import papelImg from '../../assets/6_dress_code/Layer 5.png';
import blancoImg from '../../assets/6_dress_code/Vector Smart Object copy 2.png';
import beigeImg from '../../assets/6_dress_code/Vector Smart Object copy 3.png';
import cremaImg from '../../assets/6_dress_code/Vector Smart Object copy 4.png';
import sugerido1Img from '../../assets/6_dress_code/Vector Smart Object copy 4-3.png';
import sugerido2Img from '../../assets/6_dress_code/Vector Smart Object copy 4-1.png';
import sugerido3Img from '../../assets/6_dress_code/Vector Smart Object copy 4-2.png';
import sugerido4Img from '../../assets/6_dress_code/Vector Smart Object copy 4.png';

function DressCode({ zIndex, marginTop, marginBottom }) {
	return (
		<section
			id="dress-code"
			className="section-dress-code"
			style={{ zIndex, marginTop, marginBottom }}>
			<img
				className="dress-code-imagen"
				src={forestImg}
				alt="Camino entre árboles del bosque"
			/>
            <div className="dress-code-content">
                <img src={papelImg} alt="Papel" className="dress-code-papel" />
                <div className="dress-code-text">
                    <span>DRESS<br />CODE</span>
                    <p>Una celebración de elegancia rústica<br />merece su mejor versión: Etiqueta Formal.</p>
                    <p>Para mantener la armonía de nuestra<br />celebración, <u>les pedimos evitar los<br />siguientes colores:</u></p>
                    <div className="dress-code-colors">
                        <div className="dress-code-color">
                            <img src={blancoImg} alt="Color blanco" />
                        </div>
                        <div className="dress-code-color">
                            <img src={beigeImg} alt="Color beige" />
                        </div>
                        <div className="dress-code-color">
                            <img src={cremaImg} alt="Color crema" />
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: '500', lineHeight: '1', margin: '10px 0' }}>BLANCO ● BEIGE ● CREMA<br />CUALQUIER TONO DE AZUL</p>
                    <p style={{ textAlign: 'center', fontSize: '20px', margin: '20px 0 0px' }}>COLORES<br />SUGERIDOS:</p>
                    <div className="dress-code-colors" style={{ marginTop: '20px' }}>
                        <div className="dress-code-color">
                            <img src={sugerido1Img} alt="Color blanco" />
                        </div>
                        <div className="dress-code-color">
                            <img src={sugerido2Img} alt="Color beige" />
                        </div>
                        <div className="dress-code-color">
                            <img src={sugerido3Img} alt="Color crema" />
                        </div>
                        <div className="dress-code-color">
                            <img src={sugerido4Img} alt="Color crema" />
                        </div>
                    </div>
                    <p style={{ fontSize: '18px', marginTop: '30px'}}><i>El blanco queda reservado<br />exclusivamente para la novia.</i></p>
                </div>
            </div>
		</section>
	);
}

export default DressCode;
