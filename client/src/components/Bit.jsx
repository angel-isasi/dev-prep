// Bit: el compañero de estudio de la app (diseño propio). Una pequeña terminal con cara que
// reacciona a lo que haces: feliz cuando aciertas, triste cuando fallas, de fiesta al terminar.
import { motion } from "motion/react";

const BOCAS = {
  feliz: "M22 37 Q30 44 38 37",
  fiesta: "M21 35 Q30 47 39 35 Z",
  triste: "M23 41 Q30 35 37 41",
  pensando: "M24 39 L36 39",
  sorpresa: "M27 39 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
};

const ANIMACION = {
  feliz: { y: [0, -6, 0], transition: { duration: 0.45 } },
  fiesta: { y: [0, -10, 0, -6, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.9 } },
  triste: { x: [0, -3, 3, -2, 0], transition: { duration: 0.4 } },
  pensando: { rotate: [0, -3, 0], transition: { duration: 1.6, repeat: Infinity } },
  sorpresa: { scale: [1, 1.08, 1], transition: { duration: 0.35 } },
};

/**
 * @param {{ animo?: "feliz"|"fiesta"|"triste"|"pensando"|"sorpresa", tamano?: number, dice?: string }} props
 */
export function Bit({ animo = "feliz", tamano = 64, dice }) {
  const ojosCerrados = animo === "fiesta";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <motion.svg key={animo} width={tamano} height={tamano} viewBox="0 0 60 60" animate={ANIMACION[animo]} aria-hidden style={{ flexShrink: 0 }}>
        {/* antena */}
        <line x1="30" y1="4" x2="30" y2="11" stroke="var(--acento)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="4" r="3" fill={animo === "triste" ? "var(--texto-tenue)" : "var(--exito)"} />
        {/* cuerpo: una pantalla */}
        <rect x="6" y="11" width="48" height="40" rx="11" fill="var(--superficie-2)" stroke="var(--acento)" strokeWidth="2.5" />
        <rect x="11" y="16" width="38" height="30" rx="7" fill="var(--fondo-solido)" />
        {/* ojos */}
        {ojosCerrados ? (
          <>
            <path d="M18 27 Q21 23 24 27" stroke="var(--acento)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M36 27 Q39 23 42 27" stroke="var(--acento)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="18" y={animo === "triste" ? 25 : 23} width="5" height={animo === "sorpresa" ? 8 : 6} rx="2.5" fill="var(--acento)" />
            <rect x="37" y={animo === "triste" ? 25 : 23} width="5" height={animo === "sorpresa" ? 8 : 6} rx="2.5" fill="var(--acento)" />
          </>
        )}
        {/* mejillas */}
        {(animo === "feliz" || animo === "fiesta") && (
          <>
            <circle cx="16" cy="35" r="2.5" fill="var(--error)" opacity="0.35" />
            <circle cx="44" cy="35" r="2.5" fill="var(--error)" opacity="0.35" />
          </>
        )}
        <path d={BOCAS[animo]} stroke="var(--acento)" strokeWidth="2.5" fill={animo === "fiesta" ? "var(--acento)" : "none"} strokeLinecap="round" />
        {/* patitas */}
        <rect x="18" y="51" width="6" height="5" rx="2" fill="var(--acento)" />
        <rect x="36" y="51" width="6" height="5" rx="2" fill="var(--acento)" />
      </motion.svg>
      {dice && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: "var(--superficie-2)",
            border: "1px solid var(--borde)",
            borderRadius: "14px",
            padding: "0.55rem 0.8rem",
            fontSize: "0.92rem",
            lineHeight: 1.35,
          }}
        >
          {dice}
        </motion.div>
      )}
    </div>
  );
}

const FRASES = {
  acierto: ["¡Eso!", "Bien dicho.", "Perfecto.", "Así se hace.", "Nice!", "¡Vas volando!"],
  fallo: ["Casi. Mira la correcta.", "Tranquilo, vuelve al final.", "Errar es aprender.", "Ojo con esta."],
  combo: ["¡Combo!", "¡Imparable!", "¡En racha!"],
};

/** Una frase corta de Bit (estable para la misma semilla). */
export function fraseDeBit(tipo, n = 0) {
  const lista = FRASES[tipo] ?? FRASES.acierto;
  return lista[Math.abs(n) % lista.length];
}
