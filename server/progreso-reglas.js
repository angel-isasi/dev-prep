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
    ultimaActividad: null,
    comparoSolucion: false,
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

/** Suma a un contador del día (resueltos, repasos, segundos...). */
export function sumarAlDia(dias, fecha, campo, cantidad = 1) {
  const dia = dias[fecha] ?? { resueltos: 0, repasos: 0, preguntas: 0, segundos: 0 };
  return { ...dias, [fecha]: { ...dia, [campo]: (dia[campo] ?? 0) + cantidad } };
}

const TOPE_INTERVALO_S = 5 * 60; // si pasan más de 5 min sin guardar, asumimos que te fuiste

/**
 * Suma el tiempo desde tu última actividad (con tope de 5 min) y la actualiza.
 * @returns {{ registro: RegistroEjercicio, segundos: number }}
 */
export function sumarTiempo(registro, ahora) {
  const nuevo = { ...registro, ultimaActividad: ahora };
  if (!registro.ultimaActividad) return { registro: nuevo, segundos: 0 };
  const transcurrido = (Date.parse(ahora) - Date.parse(registro.ultimaActividad)) / 1000;
  const segundos = Math.round(Math.min(Math.max(transcurrido, 0), TOPE_INTERVALO_S));
  nuevo.segundosActivos = (registro.segundosActivos ?? 0) + segundos;
  return { registro: nuevo, segundos };
}

/**
 * Registra que viste la pista `n` (1, 2 o 3). Solo se puede ver en orden.
 * @returns {RegistroEjercicio|null} null si intentas saltarte una pista
 */
export function verPista(registro, n, ahora) {
  if (n < 1 || n > registro.pistasVistas + 1) return null;
  const nuevo = marcarAbierto(registro, ahora);
  return { ...nuevo, pistasVistas: Math.max(registro.pistasVistas, n) };
}

/**
 * Ver la solución antes de resolverlo tiene penalidad: queda "para repasar"
 * y no cuenta como resuelto aunque luego pasen los tests.
 * Si ya lo habías resuelto, verla para comparar no penaliza.
 */
export function verSolucion(registro, ahora) {
  if (registro.estado === "resuelto") return { ...registro, comparoSolucion: true };
  const nuevo = marcarAbierto(registro, ahora);
  return { ...nuevo, vioSolucion: true, estado: "repasar" };
}

/** ¿Se puede mostrar la solución sin preguntar? (ya resuelto o ya la viste) */
export function solucionDesbloqueada(registro) {
  return registro.estado === "resuelto" || registro.vioSolucion;
}
