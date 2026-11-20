import { motion } from "motion/react";
import { useAhora } from "../hooks/useAhora.js";
import { explicarError } from "../lib/explicarError.js";
import { CasoTest } from "./CasoTest.jsx";
import { TextoConCodigo } from "./TextoConCodigo.jsx";
import { BorderBeam } from "./ui/border-beam.jsx";
import { SlidingNumber } from "./ui/sliding-number.jsx";
import estilos from "./PanelTests.module.css";

function haceCuanto(desde, ahora) {
  const segundos = Math.max(0, Math.round((ahora - desde) / 1000));
  if (segundos < 5) return "recién";
  if (segundos < 60) return `hace ${segundos} s`;
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  return `hace ${Math.round(minutos / 60)} h`;
}

/**
 * Resultado de los tests en vivo: "3/5", la barra, cada caso y tu consola.
 * @param {{ resultado: object|null, corriendo: boolean, preparado: boolean, ultimaCorrida: number|null, conIa?: { id: string, enunciado: string } }} props
 */
export function PanelTests({ resultado, corriendo, preparado, ultimaCorrida, conIa }) {
  const ahora = useAhora();

  if (!resultado) {
    return (
      <aside className={estilos.panel} aria-live="polite">
        <h2 className={estilos.titulo}>Tests en vivo</h2>
        {corriendo ? (
          <p className={estilos.vacio}>
            <span className={estilos.girando} aria-hidden /> Corriendo los tests… La primera vez con React puede tardar
            unos segundos.
          </p>
        ) : (
          <p className={estilos.vacio}>
            {preparado
              ? "Guarda tu archivo en VS Code (Ctrl + S) y aquí verás el resultado."
              : "Abre el ejercicio en VS Code para empezar. Cada vez que guardes, los tests corren solos y el resultado aparece aquí."}
          </p>
        )}
      </aside>
    );
  }

  const { pasan, total, casos, error, consola } = resultado;
  const todoBien = !error && total > 0 && pasan === total;
  const porcentaje = total ? (pasan / total) * 100 : 0;
  const pistaError = explicarError(error);

  // Cada pista se muestra una sola vez (en el primer caso que la necesita).
  const vistas = new Set();
  const pistaDe = (caso) => {
    const pista = caso.ok ? null : explicarError(caso.mensaje);
    if (!pista || vistas.has(pista)) return null;
    vistas.add(pista);
    return pista;
  };

  return (
    <aside className={estilos.panel} data-ok={todoBien} aria-live="polite">
      {/* Cuando todo pasa, un haz verde recorre el borde del panel */}
      {todoBien && <BorderBeam colorFrom="var(--exito)" colorTo="var(--acento)" size={120} duration={5} />}
      <div className={estilos.cabecera}>
        <h2 className={estilos.titulo}>Tests en vivo</h2>
        <motion.span
          key={`${pasan}/${total}`}
          className={estilos.contador}
          data-ok={todoBien}
          initial={{ scale: 1.15, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        >
          <SlidingNumber number={pasan} />
          <small>/{total}</small>
        </motion.span>
      </div>
      {/* Un tramo por test: verde si pasa, rojo si falla */}
      <div className={estilos.tramos} aria-label={`${Math.round(porcentaje)}% de tests pasan`}>
        {total > 0 ? (
          casos.map((caso, i) => (
            <motion.span
              key={caso.nombre}
              data-ok={caso.ok}
              initial={{ scaleY: 0.3, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
            />
          ))
        ) : (
          <span />
        )}
      </div>
      <p className={estilos.estado}>
        {corriendo ? (
          <>
            <span className={estilos.girando} aria-hidden /> Corriendo…
          </>
        ) : (
          <>
            {error ? "No se pudo correr ningún test" : todoBien ? "¡Todos los tests pasan!" : `${pasan} de ${total} tests pasan`}
            {ultimaCorrida && <span className={estilos.tiempo}> · {haceCuanto(ultimaCorrida, ahora)}</span>}
          </>
        )}
      </p>

      {error && (
        <div className={estilos.errorArchivo}>
          <strong>{resultado.bucle ? "Posible bucle infinito" : "Tu archivo no se pudo ejecutar"}</strong>
          {pistaError && (
            <p>
              <TextoConCodigo>{pistaError}</TextoConCodigo>
            </p>
          )}
          <pre>{error}</pre>
        </div>
      )}

      <ul className={`${estilos.casos} ${corriendo ? estilos.atenuado : ""}`}>
        {casos.map((caso, i) => (
          <CasoTest key={caso.nombre} caso={caso} pista={pistaDe(caso)} indice={i} conIa={conIa} />
        ))}
      </ul>

      {consola?.length > 0 && (
        <details className={estilos.consola} open>
          <summary>Tu consola ({consola.length})</summary>
          <pre>{consola.map((l) => l.texto).join("")}</pre>
        </details>
      )}
    </aside>
  );
}
