import { useState } from "react";
import { Markdown } from "./Markdown.jsx";
import estilos from "./Secciones.module.css";

/**
 * Solución oficial con su explicación. Si aún no lo resolviste, pide confirmación
 * porque verla tiene penalidad: el ejercicio queda "para repasar".
 * @param {{ solucion: { codigo: string, lenguaje: string, explicacion: string } | null, resuelto: boolean, alVer: () => void, ocupado: boolean }} props
 */
export function SeccionSolucion({ solucion, resuelto, alVer, ocupado }) {
  const [confirmando, setConfirmando] = useState(false);

  if (!solucion) {
    return (
      <div className={estilos.seccion}>
        <div className={estilos.bloqueada}>
          {resuelto ? (
            <>
              <p>Ya lo resolviste. Compara tu código con la solución oficial y lee por qué funciona.</p>
              <button type="button" className="boton boton-primario" onClick={alVer} disabled={ocupado}>
                Ver solución y explicación
              </button>
            </>
          ) : confirmando ? (
            <>
              <p className={estilos.advertencia}>
                ¿Seguro? Si la ves antes de resolverlo, el ejercicio queda <strong>para repasar</strong> y no cuenta
                como resuelto. Volverá en tus repasos.
              </p>
              <div className={estilos.fila}>
                <button type="button" className="boton boton-peligro-lleno" onClick={alVer} disabled={ocupado}>
                  Sí, ver la solución
                </button>
                <button type="button" className="boton" onClick={() => setConfirmando(false)}>
                  Mejor sigo intentando
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                La solución está bloqueada hasta que lo resuelvas. Antes de verla, prueba con las pistas: aprendes
                mucho más destrabándote tú.
              </p>
              <button type="button" className="boton" onClick={() => setConfirmando(true)}>
                Ver solución
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const bloque = "```" + solucion.lenguaje + "\n" + solucion.codigo.trim() + "\n```";

  return (
    <div className={estilos.seccion}>
      <div className={estilos.tarjeta}>
        <span className={estilos.etiqueta}>Solución oficial</span>
        <Markdown>{bloque}</Markdown>
      </div>
      <Markdown>{solucion.explicacion}</Markdown>
    </div>
  );
}
