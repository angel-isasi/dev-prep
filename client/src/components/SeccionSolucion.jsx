import { Markdown } from "./Markdown.jsx";
import { EnunciadoOrganizado } from "./EnunciadoOrganizado.jsx";
import { Confirmar } from "./Confirmar.jsx";
import estilos from "./Secciones.module.css";

/**
 * Solución oficial con su explicación. Si aún no lo resolviste, pide confirmación
 * porque verla tiene penalidad: el ejercicio queda "para repasar".
 * @param {{ solucion: { codigo: string, lenguaje: string, explicacion: string } | null, resuelto: boolean, alVer: () => void, ocupado: boolean }} props
 */
export function SeccionSolucion({ solucion, resuelto, alVer, ocupado }) {

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
          ) : (
            <>
              <p>
                La solución está bloqueada hasta que lo resuelvas. Antes de verla, prueba con las pistas: aprendes
                mucho más destrabándote tú.
              </p>
              <Confirmar
                titulo="¿Ver la solución?"
                descripcion="Si la ves antes de resolverlo, el ejercicio queda para repasar y no cuenta como resuelto. Volverá en tus repasos."
                textoConfirmar="Sí, ver la solución"
                textoCancelar="Mejor sigo intentando"
                peligro
                alConfirmar={alVer}
                disparador={
                  <button type="button" className="boton" disabled={ocupado}>
                    Ver solución
                  </button>
                }
              />
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
      <EnunciadoOrganizado markdown={solucion.explicacion} etiqueta="Por qué funciona" />
    </div>
  );
}
