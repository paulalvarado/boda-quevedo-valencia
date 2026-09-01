import sobreImg from '../../assets/1_inicio_sobre/SOBRE.png'
import logoImg from '../../assets/1_inicio_sobre/Vector Smart Object.png'

function Inicio({ zIndex, marginTop, marginBottom }) {
  return (
    <section
      id="inicio"
      className="section-inicio"
      style={{
        backgroundImage: `url(${sobreImg})`,
        zIndex,
        marginTop,
        marginBottom,
      }}
    >
      <header className="inicio-header">
        <img src={logoImg} alt="Monograma Andrea & Daniel" className="inicio-logo" />
        <h1 className="inicio-nombres">
          <span>ANDREA</span>
          <span className="inicio-ampersand">&</span>
          <span>DANIEL</span>
        </h1>
        <h2 className="inicio-fecha">24.10.26</h2>
      </header>
    </section>
  )
}

export default Inicio
