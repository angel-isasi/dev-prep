import estilos from "./Esqueleto.module.css";

/**
 * Esqueleto de carga: la forma de la página en gris animado mientras llegan los datos.
 * @param {{ variante?: "lista" | "tarjetas" | "ejercicio" | "texto" }} props
 */
export function Esqueleto({ variante = "lista" }) {
  return (
    <div className={estilos.pagina} aria-busy="true" aria-label="Cargando">
      <div className={`${estilos.bloque} ${estilos.titulo}`} />
      <div className={`${estilos.bloque} ${estilos.subtitulo}`} />

      {variante === "tarjetas" && (
        <div className={estilos.rejilla}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`${estilos.bloque} ${estilos.tarjeta}`} />
          ))}
        </div>
      )}

      {variante === "lista" &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={`${estilos.bloque} ${estilos.fila}`} />)}

      {variante === "ejercicio" && (
        <div className={estilos.dosColumnas}>
          <div>
            {[90, 100, 75, 95, 60, 85].map((ancho, i) => (
              <div key={i} className={`${estilos.bloque} ${estilos.linea}`} style={{ width: `${ancho}%` }} />
            ))}
          </div>
          <div className={`${estilos.bloque} ${estilos.panel}`} />
        </div>
      )}

      {variante === "texto" &&
        [100, 95, 88, 100, 70, 92, 80, 60].map((ancho, i) => (
          <div key={i} className={`${estilos.bloque} ${estilos.linea}`} style={{ width: `${ancho}%` }} />
        ))}
    </div>
  );
}
