import { useId } from "react";
import { motion } from "motion/react";
import estilos from "./Pestanas.module.css";

/**
 * Pestañas accesibles (role="tab").
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
          {p.texto}
          {p.extra && <span className={estilos.extra}>{p.extra}</span>}
          {p.id === activa && (
            <motion.span
              layoutId={`subrayado-${id}`}
              className={estilos.subrayado}
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
