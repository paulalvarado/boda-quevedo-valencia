import { Fragment, useEffect, useState } from 'react';
import fotoImg from '../../assets/4_conteo/DSC06991.JPG.png';

/* Fecha de la boda: 24 de octubre de 2026 */
const FECHA_BODA = new Date('2026-10-24T00:00:00');

function calcularRestante() {
  const diff = FECHA_BODA.getTime() - Date.now();
  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
  };
}

const dosDigitos = (n) => String(n).padStart(2, '0');

function Conteo({
  zIndex,
  marginTop,
  marginBottom,
  tituloSize = '34px',
  numeroSize = '38px',
  etiquetaSize = '14px',
}) {
  const [restante, setRestante] = useState(calcularRestante);

  useEffect(() => {
    const intervalo = setInterval(() => setRestante(calcularRestante()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const unidades = [
    { valor: restante.dias, etiqueta: 'DÍAS' },
    { valor: dosDigitos(restante.horas), etiqueta: 'HORAS' },
    { valor: dosDigitos(restante.minutos), etiqueta: 'MIN' },
    { valor: dosDigitos(restante.segundos), etiqueta: 'SEG' },
  ];

  return (
    <section
      id="conteo"
      className="section-conteo"
      style={{ zIndex, marginTop, marginBottom }}
    >
      <div className="conteo-contenido">
        <h2 className="conteo-titulo" style={{ fontSize: tituloSize }}>
          ¡NUESTRO GRAN DÍA
          <br />
          ESTÁ POR LLEGAR!
        </h2>

        <div className="conteo-temporizador">
          {unidades.map((unidad, i) => (
            <Fragment key={unidad.etiqueta}>
              {i > 0 && (
                <span className="conteo-separador" style={{ fontSize: numeroSize }}>
                  :
                </span>
              )}
              <div className="conteo-unidad">
                <span className="conteo-numero" style={{ fontSize: numeroSize }}>
                  {unidad.valor}
                </span>
                <span
                  className="conteo-etiqueta"
                  style={{ fontSize: etiquetaSize }}
                >
                  {unidad.etiqueta}
                </span>
              </div>
            </Fragment>
          ))}
        </div>

        <img
          className="conteo-fotos"
          src={fotoImg}
          alt="Foto de nuestra historia"
        />
      </div>
    </section>
  );
}

export default Conteo;
