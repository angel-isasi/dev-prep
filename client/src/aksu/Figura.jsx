// La figura de Aksu: un encapuchado casi negro que se pierde en la oscuridad, con máscara de calavera
// (cuencas grandes, vetas que bajan de los ojos, dientes) y un libro viejo, abierto y ancho, con algo
// que brilla en el centro. Detrás, humo gris y estrellas. Dibujo propio en SVG, en blanco y negro,
// sin contornos: todo son sombras y degradados.
// La cara no hace gestos: solo cambia la luz de sus ojos (data-estado: atento, pensando, hablando,
// frena, guardia, silencio, escuchando) y los ojos siguen al cursor (variables --mx y --my del contenedor).
import { useId } from "react";
import estilos from "./Aksu.module.css";

// Estrellas del fondo: [x, y, radio, grupo de parpadeo]
const ESTRELLAS = [
  [6, 12, 0.55, 1], [19, 2, 0.4, 2], [30, -6, 0.6, 3], [67, -5, 0.45, 1], [82, 5, 0.7, 2], [93, 20, 0.4, 3],
  [103, 40, 0.55, 1], [-6, 34, 0.45, 2], [1, 60, 0.4, 3], [97, 62, 0.6, 2], [13, 28, 0.3, 1], [86, 31, 0.3, 3],
  [48, -11, 0.4, 2], [-9, 78, 0.4, 1], [106, 82, 0.4, 3], [75, 14, 0.3, 1], [23, 16, 0.3, 2], [-13, 14, 0.35, 3], [111, 8, 0.35, 1],
];
// Dientes: [x, y, ancho, alto]
const DIENTES = [
  [43.7, 45.7, 1.25, 1.9], [45.15, 45.9, 1.3, 2.1], [46.65, 46, 1.3, 2.2], [48.15, 46, 1.3, 2.2], [49.65, 45.9, 1.3, 2.1], [51.15, 45.7, 1.25, 1.9],
  [44.6, 48.5, 1.2, 1.5], [46, 48.7, 1.25, 1.6], [47.45, 48.8, 1.25, 1.6], [48.9, 48.7, 1.25, 1.6], [50.3, 48.5, 1.2, 1.5],
];

/**
 * @param {object} p
 * @param {number} [p.tamano]  ancho en píxeles (el alto sale de la proporción 96 × 108)
 * @param {string} [p.estado]
 * @param {boolean} [p.fondo]  con humo y estrellas alrededor (la figura suelta); sin ellos, para el avatar chico
 */
export function Figura({ tamano = 96, estado = "atento", fondo = true }) {
  const id = useId().replace(/:/g, "");
  const u = (n) => `url(#${id}${n})`;
  const alto = (tamano * 108) / 96;
  const dibujo = (
    <svg className={estilos.figura} data-estado={estado} width={tamano} height={alto} viewBox="0 0 96 108" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}manto`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060607" />
          <stop offset="0.5" stopColor="#0d0d0f" />
          <stop offset="1" stopColor="#020203" />
        </linearGradient>
        <linearGradient id={`${id}hueso`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d4d4a" />
          <stop offset="0.24" stopColor="#a9a9a3" />
          <stop offset="0.5" stopColor="#d2d2cb" />
          <stop offset="0.8" stopColor="#a3a39d" />
          <stop offset="1" stopColor="#6c6c68" />
        </linearGradient>
        <linearGradient id={`${id}lado`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`${id}capucha`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.9" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}hojaIzq`} x1="1" y1="0" x2="0" y2="0.4">
          <stop offset="0" stopColor="#e4e2d8" />
          <stop offset="0.45" stopColor="#a7a59b" />
          <stop offset="1" stopColor="#55534d" />
        </linearGradient>
        <linearGradient id={`${id}hojaDer`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#efede3" />
          <stop offset="0.45" stopColor="#b3b1a7" />
          <stop offset="1" stopColor="#5d5b55" />
        </linearGradient>
        <radialGradient id={`${id}luz`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}humo`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.7" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {fondo && (
        <g className={estilos.cielo}>
          {ESTRELLAS.map(([x, y, r, g], i) => (
            <circle key={i} className={estilos.estrella} data-g={g} cx={x} cy={y} r={r} />
          ))}
        </g>
      )}

      <g className={estilos.cuerpoFigura}>
        {/* Manto: una sola mancha oscura, de la capucha a los hombros, que se abre hacia abajo */}
        <path
          d="M48 6 C36.5 6 29.5 14.5 28.6 27 C27.8 38 25.5 47.5 18.5 55.5 C12.5 62 8.5 71 7 82 L5 100 L91 100 L89 82 C87.5 71 83.5 62 77.5 55.5 C70.5 47.5 68.2 38 67.4 27 C66.5 14.5 59.5 6 48 6 Z"
          fill={u("manto")}
        />
        {/* Pliegues del manto y mechones que caen: apenas más claros que el negro */}
        <path d="M31.5 24 C30.5 38 28 50 22 60 M34.5 30 C34 42 32 54 28.5 66 M64.5 24 C65.5 38 68 50 74 60 M61.5 30 C62 42 64 54 67.5 66 M40 56 C39 66 38.5 76 38.8 88 M56 56 C57 66 57.5 76 57.2 88 M24 64 C21 74 19.5 84 19 96 M72 64 C75 74 76.5 84 77 96" stroke="#1c1c20" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M30 16 C28.6 22 28.2 27 28.4 31 M66 16 C67.4 22 67.8 27 67.6 31 M48 6.6 C40 7 34 11 31.2 17 M48 6.6 C56 7 62 11 64.8 17" stroke="#26262b" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        {/* El hueco de la capucha, más negro que el manto */}
        <path d="M48 12 C39 12 33.6 19 33.4 29 C33.2 39 35.5 49 40 57 L56 57 C60.5 49 62.8 39 62.6 29 C62.4 19 57 12 48 12 Z" fill="#000" />

        {/* Máscara: una calavera, ancha arriba y de mandíbula estrecha */}
        <path id={`${id}cara`} d="M48 16.5 C55.6 16.5 60.2 21.6 60.4 29.4 C60.5 33.8 60 37.4 58.9 40.6 C57.9 43.4 56.4 45.6 55.5 48.3 C54.4 51.8 52.2 54 48 54 C43.8 54 41.6 51.8 40.5 48.3 C39.6 45.6 38.1 43.4 37.1 40.6 C36 37.4 35.5 33.8 35.6 29.4 C35.8 21.6 40.4 16.5 48 16.5 Z" fill={u("hueso")} />
        <use href={`#${id}cara`} fill={u("lado")} />
        {/* Arcos de las cejas: hueso que sobresale sobre las cuencas */}
        <path d="M37 30.4 C39 27.6 43.6 27.4 46.6 30 M59 30.4 C57 27.6 52.4 27.4 49.4 30" stroke="#e9e9e2" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* Sombra alrededor de las cuencas */}
        <ellipse cx="42.1" cy="33.2" rx="5.6" ry="5" fill="#000" opacity="0.32" />
        <ellipse cx="53.9" cy="33.2" rx="5.6" ry="5" fill="#000" opacity="0.32" />
        {/* Cuencas: grandes, hondas, algo caídas hacia afuera */}
        <path d="M38 30.6 C39.8 28.9 44 29.3 46.3 31.5 C46.9 33.9 46 36.6 43.7 37.3 C41.2 38 38.6 36.9 37.7 34.4 C37.2 33 37.4 31.6 38 30.6 Z" fill="#030303" />
        <path d="M58 30.6 C56.2 28.9 52 29.3 49.7 31.5 C49.1 33.9 50 36.6 52.3 37.3 C54.8 38 57.4 36.9 58.3 34.4 C58.8 33 58.6 31.6 58 30.6 Z" fill="#030303" />
        {/* Las vetas negras que chorrean de los ojos hasta la mandíbula */}
        <path d="M38.5 36.2 L40.1 37 L39.7 47.4 Z M40.9 37.2 L42.7 37.4 L42.1 50 Z M43.5 37.3 L45 36.4 L44.5 44.4 Z M57.5 36.2 L55.9 37 L56.3 47.4 Z M55.1 37.2 L53.3 37.4 L53.9 50 Z M52.5 37.3 L51 36.4 L51.5 44.4 Z" fill="#050505" />
        {/* Vetas en la frente, bajo la sombra de la capucha */}
        <path d="M44.6 20 L45.2 27.5 M48 18.5 L48 26 M51.4 20 L50.8 27.5" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
        {/* Pómulos hundidos */}
        <path d="M37.3 40.4 C39 42.2 40.2 45 41 48.6 C39.4 46.6 37.9 43.6 37.3 40.4 Z M58.7 40.4 C57 42.2 55.8 45 55 48.6 C56.6 46.6 58.1 43.6 58.7 40.4 Z" fill="#000" opacity="0.45" />
        {/* Nariz hueca */}
        <path d="M48 37.6 C47 39.6 46.3 41.2 46.5 42.6 L48 41.7 L49.5 42.6 C49.7 41.2 49 39.6 48 37.6 Z" fill="#040404" />
        {/* Boca: un hueco negro con dos filas de dientes */}
        <path d="M42.6 45 C45 46 51 46 53.4 45 C53.6 48.6 51.6 51 48 51 C44.4 51 42.4 48.6 42.6 45 Z" fill="#050505" />
        {DIENTES.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="0.35" fill={i < 6 ? "#c9c9c2" : "#a2a29c"} />
        ))}
        {/* La luz de los ojos: lo único que se mueve en la cara */}
        <g className={estilos.ojos}>
          <circle className={estilos.luz} cx="42.2" cy="33.4" r="0.7" />
          <circle className={estilos.luz} cx="53.8" cy="33.4" r="0.7" />
        </g>

        {/* La capucha cae sobre la frente y le deja la parte de arriba de la máscara en sombra */}
        <path d="M35 20 H61 V31 H35 Z" fill={u("capucha")} />
        <path d="M32.6 32 C32.8 19 39 11.4 48 11.4 C57 11.4 63.2 19 63.4 32 C61.6 25.4 56.4 21.2 48 21.2 C39.6 21.2 34.4 25.4 32.6 32 Z" fill="#020202" />
        {/* Mechones a los lados, por delante de los bordes de la máscara */}
        <path d="M33.4 27 C35.4 26 36.6 27 36.8 29.6 C37 34 36.4 38 37.6 42.6 C38.4 46 39.6 49 39.4 54.5 C37 50 35.2 45 34.2 40 C33.4 36 33 31.5 33.4 27 Z M62.6 27 C60.6 26 59.4 27 59.2 29.6 C59 34 59.6 38 58.4 42.6 C57.6 46 56.4 49 56.6 54.5 C59 50 60.8 45 61.8 40 C62.6 36 63 31.5 62.6 27 Z" fill="#020202" />

        {/* La luz que sube del libro */}
        <ellipse className={estilos.resplandor} cx="48" cy="80" rx="27" ry="15" fill={u("luz")} />

        {/* El libro: viejo, ancho, abierto en perspectiva. Se toca para abrir lo que ha anotado */}
        <g data-libro className={estilos.libro}>
          {/* Tapa */}
          <path d="M2.5 95.6 L48 102.8 L93.5 95.6 L93.5 98.4 L48 105.6 L2.5 98.4 Z" fill="#0b0b0d" />
          <path d="M2.5 95.6 L48 102.8 L93.5 95.6" stroke="#34343a" strokeWidth="0.5" fill="none" />
          {/* Canto de las hojas */}
          <path d="M4.6 92.4 L48 99 L91.4 92.4 L91.8 95.6 L48 102.4 L4.2 95.6 Z" fill="#4a4842" />
          <path d="M4.4 93.6 L48 100.2 L91.6 93.6 M4.3 94.7 L48 101.3 L91.7 94.7" stroke="#26251f" strokeWidth="0.4" fill="none" />
          {/* Las dos hojas: curvadas, con el borde comido */}
          <path d="M48 77.5 C40 72.6 26 70.4 13.6 72.6 L12.4 75.4 L13.2 76.2 L10.6 80 L11.4 81 L8.6 85.4 L9.4 86.4 L6.6 90 L4.6 92.4 L48 99 Z" fill={u("hojaIzq")} />
          <path d="M48 77.5 C56 72.6 70 70.4 82.4 72.6 L83.6 75.2 L82.8 76.4 L85.4 80.2 L84.6 81.2 L87.4 85.6 L86.6 86.6 L89.2 89.6 L91.4 92.4 L48 99 Z" fill={u("hojaDer")} />
          {/* El pliegue del centro */}
          <path d="M48 77.5 L46.4 88 L48 99 L49.6 88 Z" fill="#1c1b18" opacity="0.8" />
          {/* Renglones medio borrados */}
          <path d="M17 75.6 C25 74.4 34 75.2 42 78.4 M15.4 78.8 C22 77.8 29 78.2 35 79.8 M13.6 82.2 C22 81 33 82 43 85.2 M12 85.6 C18 84.8 25 85.2 31 86.6 M10 89.2 C20 88.4 32 89.6 43 92.6" stroke="#3f3d37" strokeWidth="0.5" fill="none" opacity="0.75" />
          <path d="M79 75.6 C71 74.4 62 75.2 54 78.4 M80.6 78.8 C74 77.8 67 78.2 61 79.8 M82.4 82.2 C74 81 63 82 53 85.2 M84 85.6 C78 84.8 71 85.2 65 86.6 M86 89.2 C76 88.4 64 89.6 53 92.6" stroke="#3f3d37" strokeWidth="0.5" fill="none" opacity="0.7" />
          {/* Lo que brilla en el centro: un montón de piedras talladas */}
          <path d="M40.5 84.5 L43.2 79.4 L47 77.6 L50.6 78.2 L54.4 80 L56.2 84.4 L52.6 87.6 L45 87.8 Z" fill="#1d1d1f" />
          <path d="M43.2 79.4 L47 77.6 L46.2 81.4 L42.6 82.6 Z" fill="#f4f4ee" />
          <path d="M47 77.6 L50.6 78.2 L50 81.8 L46.2 81.4 Z" fill="#bdbdb6" />
          <path d="M50.6 78.2 L54.4 80 L53 83 L50 81.8 Z" fill="#e2e2dc" />
          <path d="M42.6 82.6 L46.2 81.4 L46.8 84.8 L43.4 86.2 L40.5 84.5 Z" fill="#9b9b95" />
          <path d="M46.2 81.4 L50 81.8 L49.8 85.2 L46.8 84.8 Z" fill="#fbfbf6" />
          <path d="M50 81.8 L53 83 L56.2 84.4 L52.6 87.6 L49.8 85.2 Z" fill="#aeaea8" />
          <path d="M43.4 86.2 L46.8 84.8 L49.8 85.2 L52.6 87.6 L45 87.8 Z" fill="#d6d6cf" />
          <circle className={estilos.brasa} data-g="1" cx="44.6" cy="80.4" r="0.9" />
          <circle className={estilos.brasa} data-g="2" cx="51.6" cy="80.4" r="1" />
          <circle className={estilos.brasa} data-g="3" cx="48.2" cy="83.4" r="1.1" />
          <circle className={estilos.brasa} data-g="2" cx="37" cy="81.6" r="0.5" />
          <circle className={estilos.brasa} data-g="1" cx="59.4" cy="82.4" r="0.5" />
        </g>
        {/* Las mangas, que bajan hasta las manos */}
        <path d="M14 62 C19 60 25 62 28.8 66.6 L33.4 79 L27 84.6 C21.5 81 16.5 75 13 67 Z" fill="#070708" />
        <path d="M82 62 C77 60 71 62 67.2 66.6 L62.6 79 L69 84.6 C74.5 81 79.5 75 83 67 Z" fill="#070708" />
        <path d="M17 64 C22 66 26 71 29.4 78 M79 64 C74 66 70 71 66.6 78" stroke="#1c1c20" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Manos huesudas a los lados de lo que brilla */}
        <path d="M27.6 80.6 L35.6 79.2 L41.4 80.4 L37 81.6 L42.4 82.8 L37.2 83.6 L41.2 85.2 L35.4 85.8 L28.4 85 Z" fill="#d9d9d2" stroke="#1e1e1e" strokeWidth="0.45" strokeLinejoin="round" />
        <path d="M68.4 80.6 L60.4 79.2 L54.6 80.4 L59 81.6 L53.6 82.8 L58.8 83.6 L54.8 85.2 L60.6 85.8 L67.6 85 Z" fill="#e6e6df" stroke="#1e1e1e" strokeWidth="0.45" strokeLinejoin="round" />
      </g>

      {/* Humo negro que se arrastra a sus pies */}
      {fondo && (
        <g className={estilos.humo}>
          <ellipse data-g="1" cx="12" cy="104" rx="26" ry="8" fill={u("humo")} />
          <ellipse data-g="2" cx="84" cy="105" rx="28" ry="8.5" fill={u("humo")} />
          <ellipse data-g="3" cx="48" cy="110" rx="34" ry="7.5" fill={u("humo")} />
          <ellipse data-g="2" cx="-8" cy="96" rx="16" ry="7" fill={u("humo")} />
          <ellipse data-g="1" cx="104" cy="95" rx="16" ry="7" fill={u("humo")} />
        </g>
      )}
    </svg>
  );
  if (!fondo) return dibujo;

  // Con fondo: detrás va otro dibujo aparte con el humo gris (una textura de ruido que se calcula una
  // sola vez y no se vuelve a pintar aunque la figura se mueva).
  return (
    <span className={estilos.marco} style={{ width: tamano, height: alto }}>
      <svg className={estilos.nebulosa} viewBox="0 0 200 200" aria-hidden focusable="false">
        <defs>
          <radialGradient id={`${id}negro`}>
            <stop offset="0" stopColor="#000" stopOpacity="0.96" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0.85" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}borde`}>
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}ruido`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.016 0.026" numOctaves="4" seed="11" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.72  0 0 0 0 0.72  0 0 0 0 0.74  1.9 0 0 0 -0.7" result="humo" />
            <feComposite in="humo" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="100" fill={u("negro")} />
        <circle cx="100" cy="100" r="100" fill={u("borde")} filter={u("ruido")} />
      </svg>
      {dibujo}
    </span>
  );
}
