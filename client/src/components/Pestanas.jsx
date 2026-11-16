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
  return (
    <div className={estilos.pestanas} role="tablist">
      {pestanas.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={p.id === activa}
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
