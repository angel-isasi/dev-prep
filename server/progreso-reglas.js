// Reglas del progreso como funciones puras: reciben datos y devuelven datos
// nuevos, sin leer ni escribir archivos. Por eso se pueden probar fácil.

/**
 * @typedef {"pendiente"|"en-progreso"|"resuelto"|"repasar"} Estado
 *
 * @typedef {object} RegistroEjercicio
 * @property {Estado} estado
 * @property {string|null} iniciadoEn
 * @property {string|null} resueltoEn
 * @property {number} intentos          corridas provocadas por un guardado tuyo
 * @property {{ pasan: number, total: number, en: string }|null} ultimoResultado
 * @property {number} pistasVistas
 * @property {boolean} vioSolucion
 * @property {number} segundosActivos
 * @property {string} explicacion       "Explícalo con tus palabras"
 * @property {{ caja: number, proximo: string }|null} repaso
 */

/** @returns {RegistroEjercicio} */
export function registroVacio() {
  return {
    estado: "pendiente",
    iniciadoEn: null,
    resueltoEn: null,
    intentos: 0,
    ultimoResultado: null,
    pistasVistas: 0,
    vioSolucion: false,
    segundosActivos: 0,
    explicacion: "",
    repaso: null,
  };
}

export function progresoVacio() {
  return {
    version: 1,
    config: { metaDiaria: 2, topeDeuda: 6, fechaMeta: "2027-03-01", objetivo: "", tema: "oscuro" },
    ejercicios: {},
    preguntas: {},
    quizzes: {},
    dias: {},
  };
}

/** Al abrir un ejercicio por primera vez pasa de "pendiente" a "en-progreso". */
export function marcarAbierto(registro, ahora) {
  if (registro.estado !== "pendiente") return registro;
  return { ...registro, estado: "en-progreso", iniciadoEn: registro.iniciadoEn ?? ahora };
}

/**
 * Aplica el resultado de una corrida de tests.
 * - Si la corrida vino de un guardado tuyo, suma un intento.
 * - Si pasan todos y no viste la solución, queda "resuelto" (una vez resuelto, se queda así).
 * - Si pasan todos pero viste la solución, queda "repasar".
 * @param {RegistroEjercicio} registro
 * @param {{ pasan: number, total: number, error: string|null }} resultado
 * @param {{ esIntento: boolean, ahora: string }} info
 * @returns {{ registro: RegistroEjercicio, resueltoAhora: boolean }}
 */
export function aplicarResultado(registro, resultado, { esIntento, ahora }) {
  // Copia: marcarAbierto puede devolver el mismo objeto, y no queremos modificar el original.
  const nuevo = { ...marcarAbierto(registro, ahora) };
  nuevo.intentos = registro.intentos + (esIntento ? 1 : 0);
  nuevo.ultimoResultado = { pasan: resultado.pasan, total: resultado.total, en: ahora };

  const todosPasan = !resultado.error && resultado.total > 0 && resultado.pasan === resultado.total;
  let resueltoAhora = false;

  if (todosPasan && nuevo.vioSolucion) {
    nuevo.estado = "repasar";
  } else if (todosPasan && nuevo.estado !== "resuelto") {
    nuevo.estado = "resuelto";
    nuevo.resueltoEn = ahora;
    resueltoAhora = true;
  }

  return { registro: nuevo, resueltoAhora };
}

/** Suma 1 a un contador del día (resueltos, repasos...). */
export function sumarAlDia(dias, fecha, campo) {
  const dia = dias[fecha] ?? { resueltos: 0, repasos: 0, preguntas: 0, segundos: 0 };
  return { ...dias, [fecha]: { ...dia, [campo]: (dia[campo] ?? 0) + 1 } };
}
