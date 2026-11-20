// El plan junior con TUS datos: junta lo que la app ya sabe (ejercicios resueltos, lecciones hechas,
// teoría leída, preguntas de entrevista vistas, controles y simulacros) y se lo pasa al cálculo
// de server/plan-junior.js. Aquí no hay reglas: solo se leen datos y se arman los enlaces.
import { api } from "./api.js";
import { almacen } from "./visita.js";
import { planUnidad, pruebaAprobada, clavePrueba } from "../movil/leccion/plan.js";
import { armarCatalogo, armarPlan, DIAS_PLAN, esEsencial, planEnTexto, TEMAS } from "../../../server/plan-junior.js";

const CLAVE_DIA = "devprep.plan15.dia";

/** ¿Esta versión de la app tiene plan? (necesita las lecciones de la web) */
export const hayPlan = () => typeof api.plan15 === "function";

/** La configuración guardada: { inicio, dias } o null si todavía no empiezas. */
export const configPlan = async () => (hayPlan() ? ((await api.plan15()) ?? null) : null);

export async function empezarPlan(inicio, dias = DIAS_PLAN) {
  almacen.removeItem(CLAVE_DIA);
  await api.guardarPlan15({ inicio, dias });
}
export async function quitarPlan() {
  almacen.removeItem(CLAVE_DIA);
  await api.guardarPlan15(null);
}

/** Conceptos de la teoría que marcaste como leídos (los guarda TeoriaTema en este navegador). */
function leidosDe(id) {
  try {
    return (JSON.parse(almacen.getItem("devprep.teoriaLeidos")) ?? {})[id]?.length ?? 0;
  } catch {
    return 0;
  }
}

/** A dónde lleva cada tarea. */
function destinoDe(t, siguienteLeccion) {
  if (t.tipo === "teoria") return `/aprender/${t.id}`;
  if (t.tipo === "lecciones") return siguienteLeccion[t.id] ? `/leccion?unidad=${encodeURIComponent(t.id)}&parte=${siguienteLeccion[t.id]}` : `/aprender/${t.id}?pestana=lecciones`;
  if (t.tipo === "ejercicio") return `/practicar/${t.id}`;
  if (t.tipo === "pregunta") return `/entrevistas?pregunta=${t.id}`;
  if (t.tipo === "control") return `/leccion?modo=control&etapa=${t.id}`;
  if (t.tipo === "repaso") return t.id === "lecciones" ? "/leccion?modo=errores" : "/practicar/lista?estado=repasar";
  return "/entrevistas?pestana=simular";
}

/**
 * Carga todo y arma el plan.
 * @returns {Promise<null | { activo: false, total: object } | (ReturnType<typeof armarPlan> & { activo: true, texto: string })>}
 *   null si esta versión no tiene plan; `activo: false` si todavía no lo empezaste.
 */
export async function cargarPlan() {
  if (!hayPlan()) return null;
  const [config, ejercicios, lecc, simulacros, ingles] = await Promise.all([
    api.plan15(),
    api.ejercicios(),
    api.lecciones("programacion"),
    api.simulacros?.().catch(() => []) ?? [],
    api.inglesHoy?.().catch(() => null) ?? null,
  ]);

  // Lecciones de "Lo esencial" de cada unidad del plan
  const lecciones = {};
  const leccionesHechas = {};
  const siguienteLeccion = {};
  let errores = 0;
  for (const tema of TEMAS) {
    if (!tema.unidad) continue;
    const plan = planUnidad(lecc.items, lecc.registros, tema.unidad, lecc.reportados, lecc.bloqueadas?.[tema.unidad]);
    const esencial = plan.grupos.find((g) => g.id === "esencial");
    lecciones[tema.unidad] = esencial?.lecciones.length ?? 0;
    leccionesHechas[tema.unidad] = esencial?.hechas ?? 0;
    siguienteLeccion[tema.unidad] = esencial?.lecciones.find((l) => !l.hecha)?.id ?? null;
    errores += esencial?.lecciones.reduce((s, l) => s + (l.errores ?? 0), 0) ?? 0;
  }

  const titulos = Object.fromEntries((lecc.unidades ?? []).map((u) => [u.id, u.titulo]));
  const preguntas = Object.fromEntries((lecc.preguntas ?? []).map((p) => [p.id, p.pregunta]));
  const catalogo = armarCatalogo({ ejercicios, titulos, lecciones, preguntas }).map((t) => ({ ...t, destino: destinoDe(t, siguienteLeccion) }));

  const esenciales = ejercicios.filter((e) => esEsencial(e.id));
  const resumen = { ejercicios: esenciales.length, temas: TEMAS.filter((t) => t.unidad).length, preguntas: catalogo.filter((t) => t.tipo === "pregunta").length, minutos: catalogo.reduce((s, t) => s + t.minutos, 0) };
  if (!config?.inicio) return { activo: false, resumen };

  // Cuánto llevas de cada tarea, de 0 a 1
  const estado = new Map(ejercicios.map((e) => [e.id, e.estado]));
  const paraRepasar = esenciales.filter((e) => e.estado === "repasar");
  const progreso = {};
  for (const t of catalogo) {
    let v = 0;
    if (t.tipo === "ejercicio") v = estado.get(t.id) === "resuelto" ? 1 : 0;
    else if (t.tipo === "lecciones") v = lecciones[t.id] ? leccionesHechas[t.id] / lecciones[t.id] : 1;
    else if (t.tipo === "teoria") {
      // Leída si marcaste sus conceptos, o si ya hiciste sus lecciones (señal de que la conoces)
      const conceptos = lecc.teoria?.[t.id] ?? 0;
      const leida = conceptos ? Math.min(1, leidosDe(t.id) / conceptos) : 0;
      v = lecciones[t.id] && leccionesHechas[t.id] >= lecciones[t.id] ? 1 : leida;
    } else if (t.tipo === "pregunta") v = lecc.registrosPreguntas?.[t.id] ? 1 : 0;
    else if (t.tipo === "control") v = pruebaAprobada(lecc.quizzes?.[clavePrueba(`control-${t.id}`)]) ? 1 : 0;
    else if (t.tipo === "repaso") v = t.id === "lecciones" ? (errores === 0 ? 1 : 0) : paraRepasar.length === 0 ? 1 : 0;
    else if (t.tipo === "simulacro") v = (simulacros ?? []).some((s) => (s.fecha ?? "") >= config.inicio) ? 1 : 0;
    if (v > 0) progreso[t.clave] = v;
  }

  // Foto de cómo estabas al empezar el día: con ella la lista de hoy se queda fija y se va marcando
  const hoy = lecc.hoy;
  let foto = null;
  try {
    foto = JSON.parse(almacen.getItem(CLAVE_DIA) ?? "null");
  } catch {
    foto = null;
  }
  if (foto?.fecha !== hoy || foto?.inicio !== config.inicio || foto?.dias !== config.dias) {
    foto = { fecha: hoy, inicio: config.inicio, dias: config.dias, progreso };
    try {
      almacen.setItem(CLAVE_DIA, JSON.stringify(foto));
    } catch {
      // sin espacio: hoy la lista se recalcula al avanzar, nada más
    }
  }

  const plan = armarPlan({ tareas: catalogo, progreso, alEmpezar: foto.progreso, inicio: config.inicio, hoy, dias: config.dias ?? DIAS_PLAN, minutosIngles: ingles?.minutosHoy ?? 0 });
  // La tarea de inglés lleva a tu lección de inglés del día
  for (const t of plan.hoy.tareas) if (t.tipo === "ingles") t.destino = "/leccion?ambito=ingles";
  const texto = planEnTexto(plan, {
    repasar: paraRepasar.map((e) => e.titulo),
    enProgreso: esenciales.filter((e) => e.estado === "en-progreso").map((e) => e.titulo),
    errores,
  });
  return { ...plan, activo: true, hoyFecha: hoy, resumen, texto, tareas: catalogo };
}
