/* Subcomponente: texto de invitación */
export function TextoInvitacion({ fontSize }) {
  return (
    <p className="nos-casamos-invitacion" style={{ fontSize }}>
      Queremos compartir contigo<br />la alegría de celebrar nuestro amor.
    </p>
  )
}

/* Subcomponente: fecha */
export function FechaInvitacion({ fontSize }) {
  return (
    <p className="nos-casamos-fecha" style={{ fontSize }}>
      Octubre 24, 2026
    </p>
  )
}

/* Subcomponente contenedor: título + textos, todo centrado */
function NosCasamosContenido({ top, left, tituloSize, textoSize, fechaSize }) {
  const interroganteStyle = {
    position: 'absolute',
    left: '-7px',
    top: '20px',
  };
  return (
    <div className="nos-casamos-contenido" style={{ top, left }}>
      <h2 className="nos-casamos-titulo" style={{ fontSize: tituloSize }}>
        <span style={interroganteStyle}>¡</span>Nos casamos!
      </h2>
      <TextoInvitacion fontSize={textoSize} />
      <FechaInvitacion fontSize={fechaSize} />
    </div>
  )
}

export default NosCasamosContenido
