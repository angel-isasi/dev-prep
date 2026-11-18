import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import estilos from "./Pestanas.module.css";

/**
 * Pestañas accesibles (role="tab"). La activa lleva una burbuja que se desliza de una pestaña
 * a otra (estilo Direction Aware Tabs de Cult UI).
 * @param {{ pestanas: { id: string, texto: string, extra?: string, deshabilitada?: boolean }[], activa: string, alCambiar: (id: string) => void }} props
 */
export function Pestanas({ pestanas, activa, alCambiar }) {
  const id = useId();
  const lista = useRef(null);

  // Con el teclado: flechas para moverse entre pestañas, Inicio y Fin para ir a los extremos.
  // Solo la pestaña activa entra en el orden del tabulador (tabIndex 0), como pide el patrón de pestañas.
  const alTeclear = (evento) => {
    const disponibles = pestanas.filter((p) => !p.deshabilitada);
    const actual = disponibles.findIndex((p) => p.id === activa);
    const destino = {
      ArrowRight: disponibles[(actual + 1) % disponibles.length],
      ArrowLeft: disponibles[(actual - 1 + disponibles.length) % disponibles.length],
      Home: disponibles[0],
      End: disponibles.at(-1),
    }[evento.key];
    if (!destino) return;
    evento.preventDefault();
    alCambiar(destino.id);
    lista.current?.querySelector(`[data-pestana="${CSS.escape(destino.id)}"]`)?.focus();
  };

  return (
    <div className={estilos.pestanas} role="tablist" ref={lista} onKeyDown={alTeclear}>
      {pestanas.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          data-pestana={p.id}
          aria-selected={p.id === activa}
          tabIndex={p.id === activa ? 0 : -1}
          disabled={p.deshabilitada}
          className={estilos.pestana}
          onClick={() => alCambiar(p.id)}
        >
          {p.id === activa && (
            <motion.span layoutId={`burbuja-${id}`} className={estilos.burbuja} transition={{ type: "spring", bounce: 0.19, duration: 0.4 }} />
          )}
          <span className={estilos.textoPestana}>{p.texto}</span>
          {p.extra && <span className={estilos.extra}>{p.extra}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * El contenido de las pestañas: al cambiar, el nuevo entra desde el lado hacia donde te moviste
 * (hacia la derecha si elegiste una pestaña de más a la derecha) y el anterior sale por el otro.
 * @param {{ activa: string, orden: string[], children: React.ReactNode, className?: string }} props
 */
export function ContenidoPestanas({ activa, orden, children, className }) {
  const previa = useRef(activa);
  const reducido = useReducedMotion();
  const direccion = orden.indexOf(activa) >= orden.indexOf(previa.current) ? 1 : -1;
  useEffect(() => {
    previa.current = activa;
  }, [activa]);

  const variantes = {
    entrar: (d) => ({ x: reducido ? 0 : 28 * d, opacity: 0 }),
    quieto: { x: 0, opacity: 1 },
    salir: (d) => ({ x: reducido ? 0 : -28 * d, opacity: 0 }),
  };
  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false} custom={direccion}>
        <motion.div
          key={activa}
          role="tabpanel"
          custom={direccion}
          variants={variantes}
          initial="entrar"
          animate="quieto"
          exit="salir"
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
