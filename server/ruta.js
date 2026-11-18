// La ruta hasta tu fecha meta: un plan semana a semana con las unidades que tocan y los hitos
// del final (proyecto y postular). Sirve para saber si vas al día sin hacer cuentas.
//
// Antes "vas atrasado" salía de dividir todos los ejercicios entre los días que faltaban: con
// 390 ejercicios pedía casi 4 al día y siempre daba atrasado. Ahora se mide en unidades: una
// unidad cuenta como "lista" cuando llega a amarillo o verde en tu mapa de dominio (lecciones,
// quiz y ejercicios). Ponerla en verde es el refuerzo de las últimas semanas.
//
// Función pura: recibe el mapa y las fechas, devuelve la ruta. No lee ni guarda nada, y se
// reacomoda sola: cada vez reparte lo que falta entre las semanas que quedan.
import { sumarDias } from "./progreso-reglas.js";
import { diaSemana, diasEntre, enPausa, lunesDe } from "./metricas.js";

/** Una unidad está lista para la ruta cuando ya no está en rojo ni sin empezar. */
export const unidadLista = (u) => u.estado === "amarillo" || u.estado === "verde";

/** Más de esto por semana es demasiado: conviene mover la fecha o estudiar más horas. */
export const MAXIMO_POR_SEMANA = 5;

/** Las últimas semanas no llevan unidades nuevas: se reservan para el proyecto y para postular. */
const HITOS = [
  { id: "postular", titulo: "Postular", detalle: "CV, portafolio, simulacros completos y tus primeras postulaciones" },
  { id: "proyecto", titulo: "Proyecto y repaso general", detalle: "Termina tu proyecto y pon en verde lo que quedó en amarillo" },
];
const reservadas = (semanas) => (semanas >= 6 ? 2 : semanas >= 3 ? 1 : 0);

// Días de estudio de una semana: desde `desde` (o desde hoy), sin contar las pausas ni lo que pasa de la fecha meta
function diasUtiles(lunes, hoy, fechaMeta, pausas) {
  let dias = 0;
  for (let i = 0; i < 7; i++) {
    const f = sumarDias(lunes, i);
    if (f >= hoy && f <= fechaMeta && !enPausa(f, pausas)) dias++;
  }
  return dias;
}

/**
 * @param {object} p
 * @param {string} p.hoy
 * @param {string} p.fechaMeta
 * @param {string} [p.inicio]  tu primer día de estudio (para saber cuánto deberías llevar)
 * @param {{ id: string, titulo: string, area: string, valor: number, estado: string }[]} p.unidades  el mapa de dominio, en orden
 * @param {{ desde: string, hasta: string }[]} [p.pausas]
 */
export function armarRuta({ hoy, fechaMeta, inicio = hoy, unidades, pausas = [] }) {
  const total = unidades.length;
  const listas = unidades.filter(unidadLista);
  const pendientes = unidades.filter((u) => !unidadLista(u));
  const diasRestantes = diasEntre(hoy, fechaMeta);

  // Las semanas que quedan, de lunes a domingo, desde esta hasta la de la fecha meta
  const primerLunes = lunesDe(hoy);
  const cuantas = diasRestantes < 0 ? 0 : Math.floor(diasEntre(primerLunes, fechaMeta) / 7) + 1;
  const deHitos = reservadas(cuantas);
  const deEstudio = cuantas - deHitos;

  const semanas = Array.from({ length: cuantas }, (_, i) => {
    const desde = sumarDias(primerLunes, i * 7);
    const hito = i >= deEstudio ? HITOS[cuantas - 1 - i] : null;
    return { numero: i + 1, desde, hasta: sumarDias(desde, 6), actual: i === 0, dias: diasUtiles(desde, hoy, fechaMeta, pausas), unidades: [], hito: hito ?? null };
  });

  // Reparte lo pendiente entre las semanas de estudio según sus días útiles (esta semana ya
  // empezó y una semana de exámenes no cuenta). Va por acumulado para que no sobre ni falte.
  const deReparto = semanas.slice(0, deEstudio);
  const diasTotales = deReparto.reduce((s, x) => s + x.dias, 0);
  let acumulados = 0;
  let entregadas = 0;
  for (const semana of deReparto) {
    acumulados += semana.dias;
    const hasta = diasTotales ? Math.round((pendientes.length * acumulados) / diasTotales) : 0;
    semana.unidades = pendientes.slice(entregadas, hasta).map((u) => ({ id: u.id, titulo: u.titulo, area: u.area, estado: u.estado, valor: u.valor }));
    entregadas = hasta;
  }
  // Sin semanas de estudio (falta muy poco o la fecha pasó): lo pendiente queda como "sin lugar"
  const sinLugar = pendientes.slice(entregadas).map((u) => ({ id: u.id, titulo: u.titulo, area: u.area, estado: u.estado, valor: u.valor }));

  // ¿Vas al día? Compara las unidades listas con las que tocaría llevar a ritmo parejo,
  // desde tu primer día hasta el final de las semanas de estudio.
  const finEstudio = deEstudio > 0 ? sumarDias(primerLunes, deEstudio * 7 - 1) : fechaMeta;
  const duracion = Math.max(1, diasEntre(inicio, finEstudio) + 1);
  const transcurridos = Math.max(0, Math.min(duracion, diasEntre(inicio, hoy)));
  const esperadas = Math.min(total, (total * transcurridos) / duracion);

  let estado;
  if (total > 0 && pendientes.length === 0) estado = "terminada";
  else if (diasRestantes < 0) estado = "vencida";
  else if (diasEntre(inicio, hoy) < 3) estado = "empezando";
  else if (listas.length < Math.floor(esperadas)) estado = "atrasado";
  else if (listas.length >= Math.ceil(esperadas) + 1) estado = "adelantado";
  else estado = "al-dia";

  const semanasConUnidades = deReparto.filter((x) => x.dias > 0).length;
  const porSemana = semanasConUnidades ? Math.round((pendientes.length / semanasConUnidades) * 10) / 10 : pendientes.length;

  return {
    hoy,
    fechaMeta,
    diasRestantes,
    total,
    listas: listas.length,
    dominadas: unidades.filter((u) => u.estado === "verde").length,
    // Cuánto dominas en total: el promedio del mapa (ejercicios, lecciones y quiz de cada unidad), de 0 a 100
    dominio: total ? Math.round((unidades.reduce((s, u) => s + (u.valor ?? 0), 0) / total) * 100) : 0,
    pendientes: pendientes.length,
    esperadas: Math.floor(esperadas),
    estado,
    porSemana,
    apretada: porSemana > MAXIMO_POR_SEMANA || sinLugar.length > 0,
    semanas,
    sinLugar,
    // Lo que toca esta semana (la primera con unidades, por si esta es de exámenes)
    estaSemana: semanas.find((x) => x.unidades.length > 0)?.unidades ?? [],
    diaDeSemana: diaSemana(hoy),
  };
}
