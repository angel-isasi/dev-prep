// La figura de Aksu: una figura de pelo largo y túnica, con máscara pálida y un libro viejo abierto, en blanco y negro.
// Dibujo propio hecho en SVG. No tiene gestos: lo único que cambia es la luz de sus ojos
// (data-estado en el contenedor: atento, pensando, hablando, frena, guardia, silencio).
import estilos from "./Aksu.module.css";

/**
 * @param {object} p
 * @param {number} [p.tamano]  ancho en píxeles (el alto sale de la proporción 68 × 76)
 * @param {string} [p.estado]
 */
export function Figura({ tamano = 96, estado = "atento" }) {
  return (
    <svg className={estilos.figura} data-estado={estado} width={tamano} height={(tamano * 76) / 68} viewBox="0 16 68 76" aria-hidden focusable="false">
      {/* Túnica: hombros rectos y caída en líneas, sin curvas */}
      <path d="M11 86 L6.5 61 L15.5 51 L27 46.5 L34 53 L41 46.5 L52.5 51 L61.5 61 L57 86 Z" fill="#141417" stroke="#565660" strokeWidth="1" strokeLinejoin="miter" />
      <path d="M27 46.5 L34 60 L41 46.5" fill="#09090b" stroke="#3a3a42" strokeWidth="0.8" />
      <path d="M19.5 53 L16.5 86 M24 56 L23 86 M48.5 53 L51.5 86 M44 56 L45 86 M15.5 51 L11.5 64 M52.5 51 L56.5 64" stroke="#2b2b31" strokeWidth="0.8" fill="none" />
      {/* Cabeza (pelo y máscara), en proporción con los hombros */}
      <g transform="translate(34 46) scale(0.8 0.68) translate(-34 -46)">
      {/* Pelo largo, lacio y oscuro, que cae sobre los hombros */}
      <path d="M34 6 C26.5 6 21.5 11 21.2 18.5 L18.5 51 L22 56.5 L24.5 50 L26.5 55 L28.6 45.5 L39.4 45.5 L41.5 55 L43.5 50 L46 56.5 L49.5 51 L46.8 18.5 C46.5 11 41.5 6 34 6 Z" fill="#0c0c0f" stroke="#4d4d57" strokeWidth="0.9" strokeLinejoin="miter" />
      <path d="M24 17 L21.5 49 M26.2 22 L24.8 47 M44 17 L46.5 49 M41.8 22 L43.2 47 M30 8 L27.5 13 M38 8 L40.5 13 M34 6.5 V10" stroke="#2f2f36" strokeWidth="0.7" fill="none" />
      {/* Máscara: larga, angulosa, de mentón estrecho */}
      <path d="M34 10.5 C39.6 10.5 43.5 14 43.5 20 C43.5 24 42.6 27.5 41.5 31 C40.4 35.2 39 40 36.6 44.5 L31.4 44.5 C29 40 27.6 35.2 26.5 31 C25.4 27.5 24.5 24 24.5 20 C24.5 14 28.4 10.5 34 10.5 Z" fill="#d8d8d2" />
      <path d="M34 10.5 C28.4 10.5 24.5 14 24.5 20 C24.5 24 25.4 27.5 26.5 31 C27.6 35.2 29 40 31.4 44.5 L34 44.5 Z" fill="#c2c2bc" />
      <path d="M34 11.5 V18.5" stroke="#9c9c97" strokeWidth="0.6" />
      {/* Sombra alrededor de los ojos */}
      <path d="M24.9 19.6 L32.8 22.6 L32.4 28.2 C29.6 29.6 26.6 28.4 25.3 25.6 Z" fill="#000" opacity="0.38" />
      <path d="M43.1 19.6 L35.2 22.6 L35.6 28.2 C38.4 29.6 41.4 28.4 42.7 25.6 Z" fill="#000" opacity="0.38" />
      {/* Ojos: rasgados y severos */}
      <path d="M26.2 21.2 L32 23.7 L31.6 26.5 C29.5 27.3 27.4 26.5 26.4 24.7 Z" fill="#050506" />
      <path d="M41.8 21.2 L36 23.7 L36.4 26.5 C38.5 27.3 40.6 26.5 41.6 24.7 Z" fill="#050506" />
      {/* Las marcas negras que bajan de los ojos hasta la mandíbula */}
      <path d="M27.9 26.6 L27.5 38 M30.1 26.9 L29.9 34.5 M40.1 26.6 L40.5 38 M37.9 26.9 L38.1 34.5" stroke="#08080a" strokeWidth="0.9" strokeLinecap="round" />
      {/* Pómulos hundidos */}
      <path d="M26.9 31.5 C28.2 34 28.8 37 30.6 41 M41.1 31.5 C39.8 34 39.2 37 37.4 41" stroke="#8f8f8a" strokeWidth="0.7" fill="none" />
      {/* La luz de los ojos: lo único que se mueve en la cara */}
      <circle className={estilos.luz} cx="29.7" cy="24.7" r="0.85" />
      <circle className={estilos.luz} cx="38.3" cy="24.7" r="0.85" />
      {/* Nariz: dos rendijas */}
      <path d="M33.1 30 L32.7 32.8 M34.9 30 L35.3 32.8" stroke="#08080a" strokeWidth="0.8" strokeLinecap="round" />
      {/* Boca cerrada y cosida */}
      <path d="M29.8 38.1 C32 37.2 36 37.2 38.2 38.1" stroke="#08080a" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M31.2 36.6 V39.3 M33.1 36.3 V39.1 M34.9 36.3 V39.1 M36.8 36.6 V39.3" stroke="#08080a" strokeWidth="0.6" />
      </g>
      {/* El libro: viejo y gastado, abierto en perspectiva. Se toca para abrir lo que ha anotado */}
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
        {/* Manchas de humedad y una rajadura */}
        <path d="M14.5 70 C16 68.5 19 69 19.5 71 C20 73 17 74.5 15 73.5 C13.6 72.8 13.5 71 14.5 70 Z M47 74.5 C49 73.5 52.5 74.5 52 76.6 C51.5 78.4 47.5 78.4 46.4 77 C45.8 76 46 75 47 74.5 Z M25.5 78.5 C27 77.8 29 78.6 28.6 80 C28.2 81.2 25.6 81 25 80 C24.7 79.4 24.9 78.8 25.5 78.5 Z" fill="#5d594d" opacity="0.35" />
        <path d="M52 64.5 L50.8 67.5 L52 69.4 L50.6 72" stroke="#4a473f" strokeWidth="0.5" fill="none" />
        {/* Texto: renglones desiguales, medio borrados */}
        <path d="M15.5 66.6 L30.5 68.6 M14.2 69.2 L24 70.5 M26 70.8 L30.4 71.4 M12.8 72.6 L29.5 75 M11.8 75.6 L21 77 M23.5 77.4 L30 78.4 M10.6 78.6 L26 81" stroke="#5b584f" strokeWidth="0.55" fill="none" opacity="0.8" />
        <path d="M37.5 68.6 L52.5 66.6 M37.6 71.4 L45 70.4 M47.5 70 L54 69.2 M38.5 75 L55.2 72.6 M38 78.4 L49 76.8 M42 81 L57.4 78.6" stroke="#5b584f" strokeWidth="0.55" fill="none" opacity="0.7" />
      </g>
      {/* Manos huesudas apoyadas en las hojas */}
      <path d="M8 69.5 L16.5 67.6 L20.5 69.2 L16.8 70.3 L21.5 71.3 L17 72.4 L20.5 73.6 L15.5 74.4 L9.5 73.8 Z" fill="#bcbcb6" stroke="#6f6f6b" strokeWidth="0.4" />
      <path d="M60 69.5 L51.5 67.6 L47.5 69.2 L51.2 70.3 L46.5 71.3 L51 72.4 L47.5 73.6 L52.5 74.4 L58.5 73.8 Z" fill="#cdcdc7" stroke="#6f6f6b" strokeWidth="0.4" />
      <path d="M16.5 67.6 L15 51.5 L10.5 60 L8 69.5 Z" fill="#101013" stroke="#3a3a42" strokeWidth="0.6" />
      <path d="M51.5 67.6 L53 51.5 L57.5 60 L60 69.5 Z" fill="#101013" stroke="#3a3a42" strokeWidth="0.6" />
    </svg>
  );
}
