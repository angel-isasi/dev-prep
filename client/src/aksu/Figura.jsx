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
      {/* Máscara */}
      <path d="M23.5 25 C23.5 16 28 12 34 12 C40 12 44.5 16 44.5 25 C44.5 31.5 42.5 35 40 37.5 L40 42 L28 42 L28 37.5 C25.5 35 23.5 31.5 23.5 25 Z" fill="#dcdcd6" />
      <path d="M23.5 25 C23.5 16 28 12 34 12 L34 42 L28 42 L28 37.5 C25.5 35 23.5 31.5 23.5 25 Z" fill="#c9c9c3" />
      {/* Cuencas, con las marcas que bajan de los ojos */}
      <ellipse cx="29.3" cy="25.5" rx="3.3" ry="3.9" fill="#070708" />
      <ellipse cx="38.7" cy="25.5" rx="3.3" ry="3.9" fill="#070708" />
      <path d="M29.3 29 V35.5 M38.7 29 V35.5" stroke="#070708" strokeWidth="1" strokeLinecap="round" />
      {/* La luz de los ojos: lo único que se mueve en la cara */}
      <circle className={estilos.luz} cx="29.3" cy="25.7" r="1.15" />
      <circle className={estilos.luz} cx="38.7" cy="25.7" r="1.15" />
      {/* Nariz y dientes */}
      <path d="M34 29.5 L32.6 33.4 H35.4 Z" fill="#070708" />
      <path d="M28.6 38 H39.4 M31 38 V42 M34 38 V42 M37 38 V42" stroke="#070708" strokeWidth="0.9" />
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
