// Puntos de estudio: la única medida de "cuánto hice hoy" en toda la app.
//
// Antes cada parte contaba a su manera: la meta diaria solo veía ejercicios con tests, el tiempo
// libre tenía su propia tabla, y el celular llevaba otra racha. Ahora todo sale de esta tabla:
//   - la meta diaria, la deuda y la racha (server/metricas.js),
//   - el tiempo libre: 1 punto = 1 minuto (server/juego.js),
//   - el calendario y el resumen de la semana.
//
// Los puntos siguen el esfuerzo real: un ejercicio con tests vale más que una lección de 3 minutos,
// y lo fácil de repetir tiene un máximo al día para que la meta no se cumpla solo con eso.
// Se calculan al leer, a partir de los contadores de dias[fecha]: no se guarda nada nuevo.

/** Puntos que da cada cosa, con su máximo de veces por día (null = sin máximo). */
export const PUNTOS = [
  { campo: "resueltos", puntos: 25, max: null, texto: "Ejercicio resuelto (los tests pasan)" },
  { campo: "limpios", puntos: 10, max: null, texto: "Bono: resuelto sin pistas" },
  { campo: "repasos", puntos: 10, max: null, texto: "Repaso completado" },
  { campo: "lecciones", puntos: 8, max: 3, texto: "Lección completa (máximo 3 al día)" },
  { campo: "ingles", puntos: 8, max: 3, texto: "Lección de inglés (máximo 3 al día)" },
  { campo: "lecturas", puntos: 5, max: 4, texto: "Ejercicio estudiado sin tests (máximo 4 al día)" },
  { campo: "quizzes", puntos: 5, max: 2, texto: "Quiz de un tema (máximo 2 al día)" },
  { campo: "tandasTarjetas", puntos: 5, max: 2, texto: "10 tarjetas de entrevista (máximo 2 tandas)" },
  { campo: "enfoques", puntos: 5, max: 4, texto: "Sesión de enfoque de 25 min (máximo 4)" },
  { campo: "simulacros", puntos: 20, max: null, texto: "Simulacro completo" },
  { campo: "jefes", puntos: 45, max: null, texto: "Jefe de la semana" },
];

/** Una unidad de la meta diaria (el número que eliges en Ajustes) son 25 puntos: un ejercicio resuelto. */
export const PUNTOS_POR_META = 25;

// Cuántas veces hiciste eso en el día. Las tarjetas se cuentan por tandas de 10.
const cantidadDe = (dia, campo) => (campo === "tandasTarjetas" ? Math.floor((dia.preguntas ?? 0) / 10) : (dia[campo] ?? 0));

/** De dónde salieron los puntos de un día: solo las filas con algo hecho. */
export function desglosePuntos(dia) {
  if (!dia) return [];
  return PUNTOS.map((p) => {
    const cantidad = cantidadDe(dia, p.campo);
    const cuenta = p.max == null ? cantidad : Math.min(cantidad, p.max);
    return { campo: p.campo, texto: p.texto, cantidad, puntos: p.puntos * cuenta };
  }).filter((fila) => fila.puntos > 0);
}

/** Puntos de estudio de un día. */
export const puntosDe = (dia) => desglosePuntos(dia).reduce((total, fila) => total + fila.puntos, 0);

/**
 * Segundos de estudio de un día, de todas las fuentes: la laptop mide `segundos` (tiempo activo
 * en ejercicios) y la web mide por separado las lecciones y el inglés.
 */
export const segundosDe = (dia) => (dia?.segundos ?? 0) + (dia?.leccionesSegundos ?? 0) + (dia?.inglesSegundos ?? 0);

/** ¿Ese día hubo algún estudio, aunque no diera puntos (una tarjeta suelta, unos minutos)? */
export const huboEstudio = (dia) => !!dia && (puntosDe(dia) > 0 || segundosDe(dia) > 0 || (dia.preguntas ?? 0) > 0 || (dia.mapache ?? 0) > 0);
