import { motion, useReducedMotion } from "motion/react";
import estilos from "./GraficoSemana.module.css";

const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];
const NOMBRES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/**
 * Barras de lunes a domingo con lo que hiciste cada día. Crecen con un resorte (Motion)
 * y una línea punteada marca tu meta diaria.
 * @param {{ dias: { fecha: string, hecho: number, minutos: number, futuro: boolean }[], meta: number, hoy: string }} props
 */
export function GraficoSemana({ dias, meta, hoy }) {
  const reducido = useReducedMotion();
  // La escala llega al menos un poco más arriba que la meta, para que la línea no quede pegada al techo.
  const tope = Math.max(meta * 1.25, ...dias.map((d) => d.hecho), 1);
  const alturaMeta = (meta / tope) * 100;

  return (
    <div className={estilos.grafico} role="img" aria-label={`Ejercicios por día esta semana. Meta: ${meta} al día.`}>
      <div className={estilos.zona}>
        <div className={estilos.meta} style={{ bottom: `${alturaMeta}%` }}>
          <span>meta {meta}</span>
        </div>
        {dias.map((d, i) => {
          const esHoy = d.fecha === hoy;
          const cumplio = d.hecho >= meta && meta > 0;
          // Un día con solo minutos (sin ejercicios terminados) deja una barra mínima
          const altura = d.hecho > 0 ? (d.hecho / tope) * 100 : d.minutos > 0 ? 4 : 0;
          return (
            <div
              key={d.fecha}
              className={estilos.columna}
              title={`${NOMBRES[i]}: ${d.hecho} ${d.hecho === 1 ? "ejercicio" : "ejercicios"}, ${d.minutos} min`}
            >
              <motion.div
                className={estilos.barra}
                data-hoy={esHoy}
                data-cumplio={cumplio}
                data-futuro={d.futuro}
                initial={reducido ? false : { height: 0 }}
                animate={{ height: d.futuro ? "100%" : `${altura}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 14, delay: reducido ? 0 : 0.35 + i * 0.06 }}
              />
              {esHoy && <span className={estilos.punto} aria-hidden />}
            </div>
          );
        })}
      </div>
      <div className={estilos.letras} aria-hidden>
        {dias.map((d, i) => (
          <span key={d.fecha} data-hoy={d.fecha === hoy}>
            {LETRAS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
