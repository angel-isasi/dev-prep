import { motion } from "motion/react";
import { compactar } from "../lib/compactar.js";
import { TextoConCodigo } from "./TextoConCodigo.jsx";
import { PorQueFalla } from "./ia/PracticaIa.jsx";
import estilos from "./PanelTests.module.css";

/**
 * Un caso de test: ✓ o ✕, y si falla, qué se esperaba y qué recibió.
 * `pista` es la explicación en español del error (o null).
 */
export function CasoTest({ caso, pista, indice = 0, conIa }) {
  // Cada caso entra un poco después del anterior
  const entrada = {
    initial: { opacity: 0, x: -6 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: indice * 0.035, duration: 0.2 },
  };

  if (caso.ok) {
    return (
      <motion.li className={estilos.caso} {...entrada}>
        <span className={estilos.icono} data-ok="true" aria-label="pasa">
          ✓
        </span>
        <span>{caso.nombre}</span>
      </motion.li>
    );
  }

  const hayComparacion = caso.esperado != null || caso.recibido != null;

  return (
    <motion.li className={estilos.caso} {...entrada}>
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
        {conIa && <PorQueFalla key={JSON.stringify(caso)} id={conIa.id} enunciado={conIa.enunciado} caso={caso} />}
      </div>
    </motion.li>
  );
}
