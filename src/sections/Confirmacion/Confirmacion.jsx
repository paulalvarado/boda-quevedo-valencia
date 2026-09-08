import cuadro from '../../assets/8_reservacion/ELEMENTS.png';

export default function Confirmacion({ zIndex, marginTop, marginBottom }) {
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
    };
	return (
		<section style={styleSection}>
			<img src={cuadro} alt="Cuadro" style={styleCuadro} />
            <div style={styleCuadroContainer}>
                <h2 style={styleTitulo}>RSVP</h2>
                <p style={styleParrafo}>Nos encantaría contar contigo.<br />Por favor, confirmanos antes del<br /><u><i>1 de Octubre</i></u> si nos acompañarás en<br />este día tan especial.</p>
                <a style={styleLink} href="https://forms.gle/your-form-link" target="_blank" rel="noopener noreferrer">Confirma aquí</a>
            </div>
		</section>
	);
}
