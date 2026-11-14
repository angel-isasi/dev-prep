import { motion, useReducedMotion } from "motion/react";

/**
 * Llama de la racha, dibujada en SVG y animada con Motion.
 * - Encendida (racha > 0): dos capas de fuego que titilan a distinto ritmo, con brillo.
 * - Apagada (racha 0): gris y "respirando" despacio, como una brasa que espera.
 * @param {{ encendida: boolean, tamano?: number, className?: string }} props
 */
export function Llama({ encendida, tamano = 18, className }) {
  const reducido = useReducedMotion();
  const animar = !reducido;

  // Cada capa cambia de altura y se inclina un poco; desde la base, como un fuego real.
  const titilar = (duracion, retraso = 0) =>
    animar && encendida
      ? {
          animate: { scaleY: [1, 1.12, 0.94, 1.08, 1], scaleX: [1, 0.95, 1.04, 0.97, 1], rotate: [0, -3, 2, -1, 0] },
          transition: { duration: duracion, repeat: Infinity, ease: "easeInOut", delay: retraso },
        }
      : {};

  const respirar =
    animar && !encendida ? { animate: { opacity: [0.45, 0.8, 0.45] }, transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } } : {};

  return (
    <motion.svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      style={{
        overflow: "visible",
        filter: encendida ? "drop-shadow(0 0 6px color-mix(in srgb, var(--aviso) 70%, transparent))" : "none",
      }}
      {...respirar}
    >
      {/* Capa exterior */}
      <motion.path
        d="M12 22c4.4 0 7.5-2.9 7.5-7.2 0-3.8-2.6-6.4-4.6-8.7-.5 2.1-1.6 3.4-3 3.9.3-3.3-1.1-6.2-4-9.2-.4 3.9-5.4 6.8-5.4 12.3C2.5 18.6 6.7 22 12 22z"
        fill={encendida ? "var(--aviso)" : "var(--texto-tenue)"}
        style={{ originX: 0.5, originY: 1 }}
        {...titilar(1.6)}
      />
      {/* Núcleo más claro */}
      <motion.path
        d="M12 21c2.3 0 4-1.6 4-3.9 0-2.1-1.4-3.5-2.5-4.8-.3 1.2-.9 1.9-1.7 2.2.2-1.8-.6-3.4-2.2-5.1-.2 2.2-3 3.8-3 6.9C6.6 19.3 9 21 12 21z"
        fill={encendida ? "#ffe3a3" : "var(--fondo-solido)"}
        opacity={encendida ? 0.95 : 0.6}
        style={{ originX: 0.5, originY: 1 }}
        {...titilar(1.1, 0.2)}
      />
    </motion.svg>
  );
}
