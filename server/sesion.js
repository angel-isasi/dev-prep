// La sesión de hoy: una sola lista ordenada de lo que conviene hacer, con un único "siguiente".
//
// Antes "qué hago hoy" se armaba en cinco lugares (el mazo de Inicio, la lista del celular, el
// plan de hoy, el entrenamiento y la lección). Ahora sale de aquí. El orden es siempre el mismo:
// primero lo que toca repasar (lo que estás por olvidar), después lo nuevo.
//
// Es una función pura: recibe los números ya contados y devuelve los pasos. No lee ni guarda nada.
import { PUNTOS } from "./puntos.js";

const puntosPor = (campo) => PUNTOS.find((p) => p.campo === campo)?.puntos ?? 0;
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

/**
 * @param {object} p
 * @param {{ cumplioMeta?: boolean, pausa?: boolean }} p.meta  la meta de hoy (server/metricas.js)
 * @param {object} [p.dia]  contadores de hoy (lecciones, resueltos, lecturas, preguntas...)
 * @param {{ preguntas?: number, tarjetas?: number, ejercicios?: { id: string, titulo: string }[] }} [p.repaso]
 *   lo que vence hoy: preguntas de lección, tarjetas de entrevista y ejercicios
 * @param {{ leccion?: { titulo: string, unidad: string, a: string } | null, ejercicio?: { id: string, titulo: string } | null, continuar?: boolean }} [p.nuevo]
 * @param {{ meta: number, minutosHoy: number } | null} [p.ingles]
 * @param {boolean} [p.conMotor]  ¿aquí se pueden resolver ejercicios con tests (laptop)?
 * @param {boolean} [p.conDiario]  ¿hay pantalla de diario? (la app local de la laptop no la tiene)
 * @returns {{ pasos: object[], siguiente: object | null, hechos: number, minutos: number, completa: boolean, pausa: boolean }}
 */
export function armarSesion({ meta = {}, dia = {}, repaso = {}, nuevo = {}, ingles = null, finDeSemana = false, examenHecho = false, diarioHecho = false, conMotor = false, conDiario = true }) {
  const { preguntas = 0, tarjetas = 0, ejercicios = [] } = repaso;
  const pasos = [];

  // 1. La lección: si hay preguntas vencidas se anuncia como repaso (la lección las pone primero)
  if (nuevo.leccion || preguntas > 0) {
    pasos.push({
      id: "leccion",
      tipo: preguntas > 0 ? "repaso" : "nuevo",
      titulo: preguntas > 0 ? `Repasa ${preguntas} ${plural(preguntas, "pregunta que te toca hoy", "preguntas que te tocan hoy")}` : `Lección: ${nuevo.leccion.titulo}`,
      detalle: preguntas > 0 ? (nuevo.leccion ? `Y avanza en ${nuevo.leccion.unidad}` : "Lo que estás por olvidar va primero") : nuevo.leccion.unidad,
      minutos: 3,
      puntos: puntosPor("lecciones"),
      // Con preguntas vencidas va al repaso del día (las pone primero); si no, a tu siguiente lección
      a: preguntas > 0 ? "/leccion" : nuevo.leccion.a,
      hecho: (dia.lecciones ?? 0) > 0,
    });
  }

  // 2. Tarjetas de entrevista que vencen hoy (se queda marcado cuando ya no queda ninguna)
  if (tarjetas > 0 || (dia.preguntas ?? 0) > 0) {
    pasos.push({
      id: "tarjetas",
      tipo: "repaso",
      titulo: tarjetas > 0 ? `${tarjetas} ${plural(tarjetas, "tarjeta de entrevista", "tarjetas de entrevista")}` : "Tarjetas de entrevista al día",
      detalle: "Di la respuesta en voz alta y luego revela",
      minutos: Math.min(10, tarjetas),
      puntos: tarjetas >= 10 ? puntosPor("tandasTarjetas") : 0,
      a: "/entrevistas?pestana=tarjetas",
      hecho: tarjetas === 0,
    });
  }

  // 3. Ejercicios para repasar: se muestra el primero y cuántos más quedan
  if (ejercicios.length > 0) {
    pasos.push({
      id: "repaso",
      tipo: "repaso",
      titulo: `Repasa: ${ejercicios[0].titulo}`,
      detalle: ejercicios.length > 1 ? `Y ${ejercicios.length - 1} más para repasar` : "Resolverlo de nuevo es lo que hace que no se olvide",
      minutos: 10,
      puntos: conMotor ? puntosPor("repasos") : puntosPor("lecturas"),
      a: `/practicar/${ejercicios[0].id}`,
      hecho: false,
    });
  }

  // 4. Inglés del día
  if (ingles) {
    const falta = Math.max(0, Math.ceil(ingles.meta - ingles.minutosHoy));
    pasos.push({
      id: "ingles",
      tipo: "nuevo",
      titulo: `Inglés: ${ingles.meta} minutos`,
      detalle: `${Math.floor(ingles.minutosHoy)} de ${ingles.meta} min`,
      minutos: falta,
      puntos: puntosPor("ingles"),
      a: "/leccion?ambito=ingles",
      hecho: falta === 0,
    });
  }

  // 5. Un ejercicio: el que dejaste a medias o el siguiente. Es lo que más puntos da.
  if (nuevo.ejercicio) {
    pasos.push({
      id: "ejercicio",
      tipo: "nuevo",
      titulo: `${nuevo.continuar ? "Continúa" : "Ejercicio nuevo"}: ${nuevo.ejercicio.titulo}`,
      detalle: conMotor ? "En VS Code, con tests en vivo" : "Estúdialo aquí; resuelto con tests en tu laptop vale 25",
      minutos: 20,
      puntos: conMotor ? puntosPor("resueltos") : puntosPor("lecturas"),
      a: `/practicar/${nuevo.ejercicio.id}`,
      hecho: (dia.resueltos ?? 0) > 0 || (!conMotor && (dia.lecturas ?? 0) > 0),
    });
  }

  // 6. Cierre: examen el fin de semana y, con la meta cumplida, el diario de una línea
  if (finDeSemana) {
    pasos.push({ id: "examen", tipo: "cierre", titulo: "Examen semanal", detalle: "20 preguntas de lo que viste esta semana", minutos: 7, puntos: 0, a: "/leccion?modo=examen", hecho: examenHecho });
  }
  if (meta.cumplioMeta && conDiario) {
    pasos.push({ id: "diario", tipo: "cierre", titulo: "Tu diario de una línea", detalle: "¿Qué aprendiste hoy? ¿Qué te trabó?", minutos: 1, puntos: 0, a: "/diario", hecho: diarioHecho });
  }

  const pendientes = pasos.filter((p) => !p.hecho);
  return {
    pasos,
    siguiente: pendientes[0] ?? null,
    hechos: pasos.length - pendientes.length,
    minutos: pendientes.reduce((total, p) => total + p.minutos, 0),
    completa: pasos.length > 0 && pendientes.length === 0,
    pausa: !!meta.pausa,
  };
}
