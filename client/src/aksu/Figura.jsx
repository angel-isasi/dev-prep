// La figura de Aksu: el avatar de Angel pasado a vectores (figura-trazo.js), tal cual: el encapuchado
// con máscara, la mano sobre el libro abierto y el cielo de humo y estrellas de fondo. Los bordes se
// funden con la app. Encima van solo las cosas que se mueven: la luz de los ojos (data-estado: atento,
// pensando, hablando, frena, guardia, silencio, escuchando; siguen al cursor con --mx y --my), estrellas
// que titilan y el brillo del libro.
import { useId } from "react";
import { ALTO, ANCHO, CAPAS } from "./figura-trazo.js";
import estilos from "./Aksu.module.css";

// Las capas se apilan: cada una es blanco con un poco de opacidad, de la más tenue a la más clara
const capas = CAPAS.map((c, i) => <path key={i} d={c.d} fill="#fff" fillOpacity={Math.min(1, c.o * 1.12)} />);

// Estrellas que titilan sobre el cielo del dibujo: [x, y, radio, grupo]
const ESTRELLAS = [
  [38, 40, 1.3, 1], [92, 22, 1, 2], [128, 58, 1.2, 3], [232, 30, 1, 1], [286, 64, 1.4, 2], [322, 26, 1, 3],
  [24, 118, 1.1, 2], [334, 150, 1.2, 1], [60, 86, 0.9, 3], [262, 108, 0.9, 2], [310, 208, 1, 3], [34, 214, 1, 1],
];
// Lo que brilla sobre el libro: [x, y, radio, grupo]
const BRASAS = [
  [168, 268, 2.2, 1], [188, 282, 2.6, 2], [201, 268, 2, 3], [191, 300, 2.2, 1], [214, 301, 2.4, 2],
];

/**
 * @param {object} p
 * @param {number} [p.tamano]  ancho en píxeles de la caja de la figura (el dibujo con su cielo la desborda)
 * @param {string} [p.estado]
 * @param {boolean} [p.fondo]  la figura entera con su cielo (la que anda suelta); sin él, solo la cara, para el avatar chico
 */
export function Figura({ tamano = 96, estado = "atento", fondo = true }) {
  const id = useId().replace(/:/g, "");
  if (!fondo) {
    return (
      <svg className={estilos.figura} data-estado={estado} width={tamano} height={tamano} viewBox="92 68 140 140" aria-hidden focusable="false">
        <rect x="92" y="68" width="140" height="140" rx="70" fill="#000" />
        {capas}
      </svg>
    );
  }
  return (
    <span className={estilos.marco} data-estado={estado} style={{ width: tamano, height: (tamano * 108) / 96 }}>
      <span className={estilos.lienzo}>
        <span className={estilos.flotante}>
          {/* El dibujo: no cambia nunca, así que el navegador lo pinta una sola vez */}
          <svg className={`${estilos.trazo} ${estilos.fundido}`} viewBox={`0 0 ${ANCHO} ${ALTO}`} aria-hidden focusable="false">
            <rect width={ANCHO} height={ALTO} fill="#000" />
            {capas}
          </svg>
          {/* Lo que se mueve, en una hoja aparte */}
          <svg className={estilos.trazo} viewBox={`0 0 ${ANCHO} ${ALTO}`} aria-hidden focusable="false">
            <defs>
              <radialGradient id={`${id}luz`}>
                <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            {ESTRELLAS.map(([x, y, r, g], i) => (
              <circle key={i} className={estilos.estrella} data-g={g} cx={x} cy={y} r={r} />
            ))}
            <ellipse className={estilos.resplandor} cx="182" cy="296" rx="86" ry="44" fill={`url(#${id}luz)`} />
            {BRASAS.map(([x, y, r, g], i) => (
              <circle key={i} className={estilos.brasa} data-g={g} cx={x} cy={y} r={r} />
            ))}
            <g className={estilos.ojos}>
              <circle className={estilos.luz} cx="151" cy="118.5" r="2.2" />
              <circle className={estilos.luz} cx="183.5" cy="118.5" r="2.2" />
            </g>
            {/* El libro se toca para abrir lo que ha anotado */}
            <rect data-libro className={estilos.libro} x="40" y="282" width="244" height="76" fill="transparent" />
          </svg>
        </span>
      </span>
    </span>
  );
}
