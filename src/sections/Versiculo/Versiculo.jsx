import left from '../../assets/11_te_esperamos/teEsperamosLeft.png';
import right from '../../assets/11_te_esperamos/teEsperamosRight.png';

export default function Versiculo({ zIndex, marginTop, marginBottom }) {
    const styleSection = {
        zIndex: zIndex,
        marginTop: marginTop,
        marginBottom: marginBottom,
        position: 'relative',
    };

    const styleTexto = {
        fontSize: '18px',
        lineHeight: '1.2',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: '600px',
        fontFamily: 'NewYork, serif',
        margin: '100px 0',
    };

    const styleTeEsperamos = {
        fontFamily: 'Bacalisties, serif',
        fontSize: '44px',
        textAlign: 'center',
        display: 'block',
        marginTop: '20px',
    };

    const styleFirma = {
        fontFamily: 'NewYork, serif',
        fontSize: '18px',
        textAlign: 'center',
        display: 'block',
        marginTop: '10px',
    };

    const imgLeftStyle = {
        position: 'absolute',
        bottom: '0',
        left: '0',
    };

    const imgRightStyle = {
        position: 'absolute',
        bottom: '0',
        right: '0',
    };

    return (
        <section style={styleSection}>
            <p style={styleTexto}>
                <i>
                Mejor son dos que uno solo, por que tienen<br />
                un mayor beneficio. Y es que, si uno de<br />
                ellos cae, el otro puede ayudar a su<br />
                compañero a levantarse. Y una cuerda<br />
                triple no se rompe fácilmente.<br /><br />
                (Eclesiastés 4:9-12)
                </i>
            </p>

            <span style={styleTeEsperamos}>¡Te esperamos!</span>
            <span style={styleFirma}>ANDREA & DANIEL</span>
        </section>
    );
}