// Revisión de código: tipos de hallazgo y puntaje (funciones puras, las usa también la web).

export const TIPOS_HALLAZGO = {
  error: "Error",
  "caso-borde": "Caso borde",
  rendimiento: "Rendimiento",
  legibilidad: "Legibilidad",
  accesibilidad: "Accesibilidad",
  seguridad: "Seguridad",
};

/**
 * Puntaje de una revisión: cuántos hallazgos marcaste y cuántas líneas marcaste sin problema.
 * @param {{ hallazgos: { linea: number }[] }} caso
 * @param {number[]} marcadas  líneas que marcaste (empiezan en 1)
 */
export function puntuarRevision(caso, marcadas) {
  const conProblema = new Set(caso.hallazgos.map((h) => h.linea));
  const elegidas = new Set(marcadas);
  const encontrados = [...conProblema].filter((l) => elegidas.has(l)).length;
  // Una línea pegada a un hallazgo no cuenta como falsa alarma (algunos errores abarcan dos líneas)
  const falsasAlarmas = [...elegidas].filter((l) => !conProblema.has(l) && !conProblema.has(l - 1) && !conProblema.has(l + 1)).length;
  const total = conProblema.size;
  return { encontrados, total, falsasAlarmas, puntaje: Math.max(0, encontrados - falsasAlarmas), porcentaje: total ? Math.max(0, encontrados - falsasAlarmas) / total : 0 };
}
