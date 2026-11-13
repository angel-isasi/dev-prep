import { motion, useReducedMotion } from "motion/react";
import estilos from "./AnilloProgreso.module.css";

/**
 * Anillo de progreso animado (SVG). `valor` va de 0 a 1.
 * @param {{ valor: number, tamano?: number, grosor?: number, children?: React.ReactNode, completo?: boolean }} props
 */
export function AnilloProgreso({ valor, tamano = 88, grosor = 8, children, completo }) {
  const reducido = useReducedMotion();
  const radio = (tamano - grosor) / 2;
  const limitado = Math.max(0, Math.min(1, valor));

  return (
    <div className={estilos.anillo} style={{ width: tamano, height: tamano }} data-completo={!!completo}>
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} aria-hidden>
        <defs>
          <linearGradient id="degradado-anillo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--acento)" />
            <stop offset="100%" stopColor="var(--exito)" />
          </linearGradient>
        </defs>
        <circle cx={tamano / 2} cy={tamano / 2} r={radio} className={estilos.fondo} strokeWidth={grosor} fill="none" />
        <motion.circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke={completo ? "var(--exito)" : "url(#degradado-anillo)"}
          strokeWidth={grosor}
          strokeLinecap="round"
          transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: limitado }}
          transition={reducido ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className={estilos.centro}>{children}</div>
    </div>
  );
}
