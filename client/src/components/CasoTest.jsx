import { compactar } from "../lib/compactar.js";
import { TextoConCodigo } from "./TextoConCodigo.jsx";
import estilos from "./PanelTests.module.css";

/**
 * Un caso de test: ✓ o ✕, y si falla, qué se esperaba y qué recibió.
 * `pista` es la explicación en español del error (o null).
 */
export function CasoTest({ caso, pista }) {
  if (caso.ok) {
    return (
      <li className={estilos.caso}>
        <span className={estilos.icono} data-ok="true" aria-label="pasa">
          ✓
        </span>
        <span>{caso.nombre}</span>
      </li>
    );
  }

  const hayComparacion = caso.esperado != null || caso.recibido != null;

  return (
    <li className={estilos.caso}>
      <span className={estilos.icono} data-ok="false" aria-label="falla">
        ✕
      </span>
      <div className={estilos.detalle}>
        <span>{caso.nombre}</span>
        {pista && (
          <p className={estilos.pista}>
            <TextoConCodigo>{pista}</TextoConCodigo>
          </p>
        )}
        {hayComparacion ? (
          <dl className={estilos.comparacion}>
            <dt>Esperado</dt>
            <dd>
              <pre>{compactar(caso.esperado)}</pre>
            </dd>
            <dt>Recibido</dt>
            <dd>
              <pre>{compactar(caso.recibido)}</pre>
            </dd>
          </dl>
        ) : (
          caso.mensaje && <pre className={estilos.mensaje}>{caso.mensaje}</pre>
        )}
      </div>
    </li>
  );
}
