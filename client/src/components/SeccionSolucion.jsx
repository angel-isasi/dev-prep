import { Markdown } from "./Markdown.jsx";
import { EnunciadoOrganizado } from "./EnunciadoOrganizado.jsx";
import { Confirmar } from "./Confirmar.jsx";
import { IconoCandado } from "./Iconos.jsx";
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
          <IconoCandado tamano={22} />
          {resuelto ? (
            <>
              <strong>Ya lo resolviste</strong>
              <p>Compara tu código con la solución oficial.</p>
              <button type="button" className="boton boton-primario" onClick={alVer} disabled={ocupado}>
                Ver solución y explicación
              </button>
            </>
          ) : (
            <>
              <strong>Solución bloqueada</strong>
              <p>Prueba primero con las pistas. Si la ves ahora, el ejercicio queda para repasar.</p>
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
      <EnunciadoOrganizado
        markdown={solucion.explicacion}
        etiqueta="Por qué funciona"
        parejo
        junto={
          <div className={`${estilos.tarjeta} ${estilos.codigoSolucion}`}>
            <span className={estilos.etiqueta}>Solución oficial</span>
            <Markdown>{bloque}</Markdown>
          </div>
        }
      />
    </div>
  );
}
