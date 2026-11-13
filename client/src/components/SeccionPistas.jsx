import { Markdown } from "./Markdown.jsx";
import estilos from "./Secciones.module.css";

const NOMBRES = ["Hacia dónde mirar", "Qué herramienta usar", "Esqueleto de la solución"];

/**
 * Pistas progresivas: se ven en orden, una a la vez.
 * @param {{ pistas: string[], total: number, alVer: (n: number) => void, ocupado: boolean }} props
 */
export function SeccionPistas({ pistas, total, alVer, ocupado }) {
  const siguiente = pistas.length + 1;

  if (total === 0) {
    return (
      <div className={estilos.seccion}>
        <p className={estilos.intro}>Este ejercicio no tiene pistas.</p>
      </div>
    );
  }

  return (
    <div className={estilos.seccion}>
      <p className={estilos.intro}>
        Intenta un rato antes de abrir una pista. Cada una ayuda un poco más que la anterior; la última es casi la
        respuesta.
      </p>

      {pistas.map((pista, i) => (
        <div key={i} className={estilos.tarjeta}>
          <span className={estilos.etiqueta}>
            Pista {i + 1} · {NOMBRES[i] ?? ""}
          </span>
          <Markdown>{pista}</Markdown>
        </div>
      ))}

      {siguiente <= total ? (
        <div className={estilos.fila}>
          <button type="button" className="boton" onClick={() => alVer(siguiente)} disabled={ocupado}>
            Ver pista {siguiente} de {total}
            {NOMBRES[siguiente - 1] && ` · ${NOMBRES[siguiente - 1].toLowerCase()}`}
          </button>
        </div>
      ) : (
        <p className={estilos.intro}>Ya viste todas las pistas. Si sigues trabado, revisa la solución.</p>
      )}
    </div>
  );
}
