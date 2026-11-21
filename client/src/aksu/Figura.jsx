// La figura de Aksu: pelo largo y revuelto que le tapa parte de la máscara, máscara de calavera con
// marcas que bajan de los ojos, túnica y un libro viejo abierto que brilla. Detrás, un trozo de cielo
// con estrellas; abajo, humo negro. Dibujo propio en SVG, todo en blanco y negro.
// La cara no hace gestos: solo cambia la luz de sus ojos (data-estado: atento, pensando, hablando,
// frena, guardia, silencio, escuchando) y los ojos siguen al cursor (variables --mx y --my del contenedor).
import { useId } from "react";
import estilos from "./Aksu.module.css";

// Estrellas del fondo: [x, y, radio, grupo de parpadeo]
const ESTRELLAS = [
  [8, 14, 0.7, 1], [20, 4, 0.5, 2], [31, -3, 0.8, 3], [66, -4, 0.6, 1], [80, 6, 0.9, 2], [92, 18, 0.5, 3],
  [100, 38, 0.7, 1], [-4, 36, 0.6, 2], [3, 58, 0.5, 3], [95, 60, 0.8, 2], [14, 30, 0.4, 1], [84, 30, 0.4, 3],
  [48, -8, 0.5, 2], [-6, 76, 0.5, 1], [103, 80, 0.5, 3], [74, 16, 0.35, 1], [24, 18, 0.35, 2],
];

/**
 * @param {object} p
 * @param {number} [p.tamano]  ancho en píxeles (el alto sale de la proporción 96 × 108)
 * @param {string} [p.estado]
 * @param {boolean} [p.fondo]  con cielo y humo alrededor (la figura suelta); sin ellos, para el avatar chico
 */
export function Figura({ tamano = 96, estado = "atento", fondo = true }) {
  const id = useId().replace(/:/g, "");
  const u = (n) => `url(#${id}${n})`;
  return (
    <svg className={estilos.figura} data-estado={estado} width={tamano} height={(tamano * 108) / 96} viewBox="0 0 96 108" aria-hidden focusable="false">
      <defs>
        <radialGradient id={`${id}cielo`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.95" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0.78" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}niebla`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}humo`}>
          <stop offset="0" stopColor="#000" stopOpacity="1" />
          <stop offset="0.5" stopColor="#111114" stopOpacity="0.95" />
          <stop offset="0.8" stopColor="#2c2c33" stopOpacity="0.5" />
          <stop offset="1" stopColor="#3a3a42" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}luz`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {fondo && (
        <g className={estilos.cielo}>
          <ellipse cx="48" cy="48" rx="64" ry="62" fill={u("cielo")} />
          {/* Nebulosa: dos jirones claros, apenas visibles */}
          <ellipse className={estilos.niebla} cx="22" cy="24" rx="34" ry="13" transform="rotate(-28 22 24)" fill={u("niebla")} />
          <ellipse className={estilos.niebla} cx="78" cy="40" rx="30" ry="11" transform="rotate(32 78 40)" fill={u("niebla")} />
          {ESTRELLAS.map(([x, y, r, g], i) => (
            <circle key={i} className={estilos.estrella} data-g={g} cx={x} cy={y} r={r} />
          ))}
        </g>
      )}

      <g className={estilos.cuerpoFigura}>
        {/* Túnica: ancha, de hombros caídos, casi negra */}
        <path d="M13 100 L9 72 L19 57 L37 50 L59 50 L77 57 L87 72 L83 100 Z" fill="#0b0b0d" stroke="#3a3a42" strokeWidth="0.9" strokeLinejoin="miter" />
        <path d="M39 51 L48 68 L57 51" fill="#050506" stroke="#2b2b31" strokeWidth="0.7" />
        <path d="M26 58 L22 98 M32 60 L30 98 M70 58 L74 98 M64 60 L66 98 M41 66 L40 98 M55 66 L56 98" stroke="#1f1f24" strokeWidth="0.8" fill="none" />

        {/* Pelo: una mata larga y revuelta que cae hasta el pecho */}
        <path
          d="M48 4 L44.5 7 L41 4.5 L39 9 L34.5 8 L33.5 13 L29 14.5 L30 19 L26 22.5 L27.5 27 L23.5 40 L25 46 L20.5 58 L24 66 L26.5 59 L28.5 71 L31.5 61 L33.5 73 L36 60 L38.5 67 L40 54 L56 54 L57.5 67 L60 60 L62.5 73 L64.5 61 L67.5 71 L69.5 59 L72 66 L75.5 58 L71 46 L72.5 40 L68.5 27 L70 22.5 L66 19 L67 14.5 L62.5 13 L61.5 8 L57 9 L55 4.5 L51.5 7 Z"
          fill="#060608"
          stroke="#3d3d45"
          strokeWidth="0.8"
          strokeLinejoin="miter"
        />
        <path d="M29 28 L25.5 56 M32 30 L30 62 M67 28 L70.5 56 M64 30 L66 62 M36 12 L33 20 M60 12 L63 20 M42 8 L40 14 M54 8 L56 14" stroke="#24242a" strokeWidth="0.7" fill="none" />

        {/* Máscara: calavera pálida, de mentón estrecho */}
        <path d="M48 14 C56.5 14 62 19.5 62 28 C62 33 61 37.5 59 42 C57.6 46.5 55.5 51 52.4 54.5 L43.6 54.5 C40.5 51 38.4 46.5 37 42 C35 37.5 34 33 34 28 C34 19.5 39.5 14 48 14 Z" fill="#dcdcd6" />
        <path d="M48 14 C39.5 14 34 19.5 34 28 C34 33 35 37.5 37 42 C38.4 46.5 40.5 51 43.6 54.5 L48 54.5 Z" fill="#c1c1bb" />
        {/* Cuencas: grandes, oscuras y severas */}
        <path d="M35 25.5 L46.4 29.6 L46 36.4 C42.4 38.6 37.6 37.4 35.8 33 Z" fill="#000" opacity="0.4" />
        <path d="M61 25.5 L49.6 29.6 L50 36.4 C53.6 38.6 58.4 37.4 60.2 33 Z" fill="#000" opacity="0.4" />
        <path d="M36.8 27.4 L45.4 30.4 L45 35.2 C42 36.9 38.6 35.9 37.2 32.6 Z" fill="#040405" />
        <path d="M59.2 27.4 L50.6 30.4 L51 35.2 C54 36.9 57.4 35.9 58.8 32.6 Z" fill="#040405" />
        {/* Las marcas negras que bajan de los ojos hasta la mandíbula */}
        <path d="M38.6 35.6 L38.9 47.5 M41.2 36.4 L41.3 45 M43.7 36 L43.6 41.5 M57.4 35.6 L57.1 47.5 M54.8 36.4 L54.7 45 M52.3 36 L52.4 41.5" stroke="#08080a" strokeWidth="1.1" strokeLinecap="round" />
        {/* Pómulos hundidos */}
        <path d="M37.4 41 C39 44.5 40.4 48 43 51.5 M58.6 41 C57 44.5 55.6 48 53 51.5" stroke="#8f8f8a" strokeWidth="0.7" fill="none" />
        {/* Nariz hueca */}
        <path d="M48 37 L46.2 41.6 L48 40.6 L49.8 41.6 Z" fill="#08080a" />
        {/* Dientes: una fila apretada, sin labios */}
        <path d="M42.6 45.2 C45 44.4 51 44.4 53.4 45.2 L52.8 49 C50.5 49.8 45.5 49.8 43.2 49 Z" fill="#b3b3ad" stroke="#08080a" strokeWidth="0.7" />
        <path d="M42.9 47.1 C45.5 46.6 50.5 46.6 53.1 47.1 M44.6 44.8 V49.4 M46.3 44.6 V49.7 M48 44.5 V49.8 M49.7 44.6 V49.7 M51.4 44.8 V49.4" stroke="#08080a" strokeWidth="0.55" fill="none" />
        {/* La luz de los ojos: lo único que se mueve en la cara */}
        <g className={estilos.ojos}>
          <circle className={estilos.luz} cx="41.6" cy="32.4" r="0.85" />
          <circle className={estilos.luz} cx="54.4" cy="32.4" r="0.85" />
        </g>

        {/* El pelo por delante: el flequillo le tapa la frente y los mechones, los lados de la máscara */}
        <path d="M32 31 L34 19 C37 11.5 43 9 48 9 C53 9 59 11.5 62 19 L64 31 L61.2 25.4 L59.6 21 L57.4 25.6 L54.8 19.4 L52.6 24.4 L50.2 18.6 L48 23.4 L45.8 18.6 L43.4 24.4 L41.2 19.4 L38.6 25.6 L36.4 21 L34.8 25.4 Z" fill="#060608" />
        <path d="M33 24 L36.6 25.6 L36.2 33 L37.4 40 L36 47 L35.4 41 L33.6 53 L32.4 40 L31 46 Z M63 24 L59.4 25.6 L59.8 33 L58.6 40 L60 47 L60.6 41 L62.4 53 L63.6 40 L65 46 Z" fill="#060608" />
        <path d="M40 12.5 L38.4 20 M48 10.5 V17.5 M56 12.5 L57.6 20 M44 11 L43.2 18 M52 11 L52.8 18" stroke="#24242a" strokeWidth="0.6" fill="none" />

        {/* Mangas hasta el libro */}
        <path d="M11 73 L19 57 L29 61 L27 83 L14 85 Z" fill="#0e0e11" stroke="#34343b" strokeWidth="0.6" />
        <path d="M85 73 L77 57 L67 61 L69 83 L82 85 Z" fill="#0e0e11" stroke="#34343b" strokeWidth="0.6" />

        {/* La luz que sube del libro */}
        <ellipse className={estilos.resplandor} cx="48" cy="84" rx="30" ry="13" fill={u("luz")} />

        {/* El libro: viejo y gastado, abierto en perspectiva. Se toca para abrir lo que ha anotado */}
        <g transform="translate(3.8 14.5) scale(1.3 1)">
          <g data-libro className={estilos.libro}>
            {/* Tapa y lomo de hojas */}
            <path d="M2.5 82.5 L34 88.5 L65.5 82.5 L65 85.5 L34 91.5 L3 85.5 Z" fill="#1d1d21" stroke="#3f3f47" strokeWidth="0.6" />
            <path d="M4.5 79.5 L34 84.5 L63.5 79.5 L63.8 82.6 L34 88 L4.2 82.6 Z" fill="#6b685f" />
            <path d="M4.4 80.6 L34 85.7 L63.6 80.6 M4.3 81.7 L34 86.9 L63.7 81.7" stroke="#3d3b35" strokeWidth="0.45" fill="none" />
            {/* Hojas: bordes comidos y una esquina rota */}
            <path d="M34 66 L13 63.2 L11.2 66.6 L12.1 67.5 L9.6 70.8 L10.5 71.9 L8 75 L8.9 76 L6.6 78.2 L4.5 79.5 L34 84.5 Z" fill="#b4b0a4" />
            <path d="M34 66 L55 63.2 L56.6 66 L55.7 67.2 L58.4 70.6 L57.5 71.8 L60 75.2 L59.2 76.3 L61 77.6 L60.2 79 L63.5 79.5 L34 84.5 Z" fill="#c6c2b6" />
            {/* El pliegue del centro, hundido */}
            <path d="M34 66 L32.2 75 L34 84.5 L35.8 75 Z" fill="#3b3932" opacity="0.75" />
            {/* Texto: renglones desiguales, medio borrados */}
            <path d="M15.5 66.6 L30.5 68.6 M14.2 69.2 L24 70.5 M26 70.8 L30.4 71.4 M12.8 72.6 L29.5 75 M11.8 75.6 L21 77 M23.5 77.4 L30 78.4 M10.6 78.6 L26 81" stroke="#5b584f" strokeWidth="0.55" fill="none" opacity="0.8" />
            <path d="M37.5 68.6 L52.5 66.6 M37.6 71.4 L45 70.4 M47.5 70 L54 69.2 M38.5 75 L55.2 72.6 M38 78.4 L49 76.8 M42 81 L57.4 78.6" stroke="#5b584f" strokeWidth="0.55" fill="none" opacity="0.7" />
            {/* Brasas sobre las hojas: lo que brilla en el libro */}
            <circle className={estilos.brasa} data-g="1" cx="27" cy="73.4" r="1.5" />
            <circle className={estilos.brasa} data-g="2" cx="40.5" cy="72.6" r="1.8" />
            <circle className={estilos.brasa} data-g="3" cx="33.8" cy="77.6" r="1.2" />
            <circle className={estilos.brasa} data-g="2" cx="22" cy="78" r="0.9" />
            <circle className={estilos.brasa} data-g="1" cx="46.5" cy="77.4" r="1" />
          </g>
          {/* Manos huesudas apoyadas en las hojas */}
          <path d="M8 69.5 L16.5 67.6 L20.5 69.2 L16.8 70.3 L21.5 71.3 L17 72.4 L20.5 73.6 L15.5 74.4 L9.5 73.8 Z" fill="#bcbcb6" stroke="#6f6f6b" strokeWidth="0.4" />
          <path d="M60 69.5 L51.5 67.6 L47.5 69.2 L51.2 70.3 L46.5 71.3 L51 72.4 L47.5 73.6 L52.5 74.4 L58.5 73.8 Z" fill="#cdcdc7" stroke="#6f6f6b" strokeWidth="0.4" />
        </g>
      </g>

      {/* Humo negro, por delante de los pies */}
      {fondo && (
        <g className={estilos.humo}>
          <ellipse data-g="1" cx="16" cy="104" rx="24" ry="9" fill={u("humo")} />
          <ellipse data-g="2" cx="80" cy="105" rx="26" ry="9.5" fill={u("humo")} />
          <ellipse data-g="3" cx="48" cy="109" rx="30" ry="8" fill={u("humo")} />
          <ellipse data-g="2" cx="-4" cy="95" rx="15" ry="7.5" fill={u("humo")} />
          <ellipse data-g="1" cx="100" cy="94" rx="15" ry="7.5" fill={u("humo")} />
          <ellipse data-g="3" cx="30" cy="100" rx="14" ry="6" fill={u("humo")} />
          <ellipse data-g="1" cx="66" cy="101" rx="14" ry="6" fill={u("humo")} />
        </g>
      )}
    </svg>
  );
}
