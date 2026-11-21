// La figura de Aksu: un encapuchado con máscara pálida y un libro abierto, en blanco y negro.
// Dibujo propio hecho en SVG. No tiene gestos: lo único que cambia es la luz de sus ojos
// (data-estado en el contenedor: atento, pensando, hablando, frena, guardia, silencio).
import estilos from "./Aksu.module.css";

/**
 * @param {object} p
 * @param {number} [p.tamano]  ancho en píxeles (el alto sale de la proporción 68 × 92)
 * @param {string} [p.estado]
 */
export function Figura({ tamano = 84, estado = "atento" }) {
  return (
    <svg className={estilos.figura} data-estado={estado} width={tamano} height={(tamano * 92) / 68} viewBox="0 0 68 92" aria-hidden focusable="false">
      {/* Manto */}
      <path d="M6 82 C5 54 12 38 34 36 C56 38 63 54 62 82 Z" fill="#1a1a1f" stroke="#5a5a64" strokeWidth="1.1" />
      <path d="M20 82 C21 62 26 50 34 46 C42 50 47 62 48 82 Z" fill="#0e0e11" />
      <path d="M14 80 C15 60 19 48 25 42 M54 80 C53 60 49 48 43 42" stroke="#3a3a42" strokeWidth="0.8" fill="none" />
      {/* Capucha */}
      <path d="M13 37 C9 16 20 3 34 3 C48 3 59 16 55 37 C52 47 44 51 34 51 C24 51 16 47 13 37 Z" fill="#16161a" stroke="#6b6b76" strokeWidth="1.2" />
      <path d="M19 33 C17 18 24 9 34 9 C44 9 51 18 49 33 C47 42 41 46 34 46 C27 46 21 42 19 33 Z" fill="#040405" />
      {/* Pelo largo y oscuro a los lados de la máscara */}
      <path d="M25 15 C20.5 24 20.5 37 22.5 49 L27.5 49 C25.5 39 25 28 26 19 Z" fill="#17171b" stroke="#303037" strokeWidth="0.5" />
      <path d="M43 15 C47.5 24 47.5 37 45.5 49 L40.5 49 C42.5 39 43 28 42 19 Z" fill="#17171b" stroke="#303037" strokeWidth="0.5" />
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
      {/* El libro: se toca para abrir lo que ha anotado */}
      <g data-libro className={estilos.libro}>
        <path d="M34 62 C27 57 15 57 6 61 L6 82 C15 78 27 78 34 83 C41 78 53 78 62 82 L62 61 C53 57 41 57 34 62 Z" fill="#35353b" />
        <path d="M34 60.5 C27.5 56 16.5 56 8 59.5 L8 79 C16.5 75.5 27.5 75.5 34 80 Z" fill="#d3d3cd" />
        <path d="M34 60.5 C40.5 56 51.5 56 60 59.5 L60 79 C51.5 75.5 40.5 75.5 34 80 Z" fill="#e2e2dc" />
        <path d="M34 60.5 V80" stroke="#6d6d70" strokeWidth="0.8" />
        <path d="M12 63.5 C18 61.5 25 61.8 30.5 64.5 M12 67.5 C18 65.5 25 65.8 30.5 68.5 M12 71.5 C18 69.5 25 69.8 30.5 72.5 M37.5 64.5 C43 61.8 50 61.5 56 63.5 M37.5 68.5 C43 65.8 50 65.5 56 67.5 M37.5 72.5 C43 69.8 50 69.5 56 71.5" stroke="#8a8a88" strokeWidth="0.7" fill="none" />
      </g>
      {/* Manos sobre el libro */}
      <path d="M9 66 C6.5 66 5 68 5.5 70.5 C8 71.5 11 70.5 12 68 Z" fill="#bdbdb7" />
      <path d="M59 66 C61.5 66 63 68 62.5 70.5 C60 71.5 57 70.5 56 68 Z" fill="#cfcfc9" />
    </svg>
  );
}
