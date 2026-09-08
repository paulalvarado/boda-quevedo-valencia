import { useMemo } from 'react';
import petalo01 from '../assets/petalos/petalo01.svg';
import petalo02 from '../assets/petalos/petalo02.svg';
import petalo03 from '../assets/petalos/petalo03.svg';
import petalo04 from '../assets/petalos/petalo04.svg';

const PETALOS = [petalo01, petalo02, petalo03, petalo04];

/* Lluvia de pétalos cayendo por toda la pantalla.
   Cada pétalo usa uno de los SVGs y recibe posición, tamaño,
   duración y retraso aleatorios para que caigan de forma natural. */
function Petalos({ cantidad = 20 }) {
  const petalos = useMemo(
    () =>
      Array.from({ length: cantidad }, (_, i) => {
        const src = PETALOS[i % PETALOS.length];
        return {
          src,
          left: Math.random() * 100,
          size: 14 + Math.random() * 34,
          caida: 8 + Math.random() * 8, // duración de la caída (s)
          giro: 2 + Math.random() * 4, // duración del vaivén + giro (s)
          tambaleo: 2.5 + Math.random() * 2, // duración del giro 3D (s)
          retraso: -Math.random() * 16, // negativo => ya están cayendo
          opacidad: 0.35 + Math.random() * 0.45,
        };
      }),
    [cantidad]
  );

  return (
    <div className="petalos" aria-hidden="true">
      {petalos.map((p, i) => (
        <div
          key={i}
          className="petalo"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            animationDuration: `${p.caida}s`,
            animationDelay: `${p.retraso}s`,
          }}
        >
          <div
            className="petalo-giro"
            style={{
              animationDuration: `${p.giro}s`,
              animationDelay: `${p.retraso}s`,
            }}
          >
            <img
              className="petalo-img"
              src={p.src}
              alt=""
              style={{
                animationDuration: `${p.tambaleo}s`,
                animationDelay: `${p.retraso}s`,
                opacity: p.opacidad,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Petalos;
