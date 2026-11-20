// Plan junior: lo ESENCIAL para una entrevista de frontend junior, repartido en días.
//
// La app tiene mucho más de lo que pide un puesto junior (algoritmos, TypeScript, Node, retos
// difíciles, métodos a fondo). Aquí está, elegido a mano, lo que sí preguntan y lo que sí piden
// construir: los 10 temas de JavaScript y los 8 de React, con unos 120 ejercicios y 40 preguntas
// de entrevista. Todo lo demás queda "para crecer": no se borra, solo no entra al plan.
//
// Criterio de la selección:
// - Entra lo que un junior debe hacer fluido: strings, arrays, objetos, map/filter/reduce, closures
//   clásicos (contador, once, debounce, var en un bucle), this, promesas y async/await, el event loop
//   y el DOM; y en React: componentes, props, estado, listas, formularios, efectos con datos de una
//   API, Context, useReducer, un hook propio y los componentes típicos de prueba técnica
//   (lista de tareas, buscador, tabs, acordeón, modal, paginación).
// - Queda fuera lo que es de nivel medio: generadores e iteradores, prototipos a mano, currying,
//   LRU, deepEqual, tu propio Promise.all, portales, error boundaries, Suspense, useTransition,
//   useSyncExternalStore, componentes compuestos y escribir pruebas.
//
// La segunda mitad del archivo es el cálculo del plan (funciones puras, plan-junior.test.js): reparte
// lo que falta entre los días que quedan y dice si vas al día. Se reacomoda solo: no guarda un
// calendario, lo recalcula cada vez con tu progreso real.

/** Etapas de estudio y qué parte de los días de estudio se lleva cada una (JavaScript 5 de 13, React 8 de 13). */
export const ETAPAS = [
  { id: "javascript", titulo: "JavaScript", parte: 5 / 13 },
  { id: "react", titulo: "React", parte: 8 / 13 },
];

export const DIAS_PLAN = 15;
export const DIAS_MINIMO = 7;
/** Inglés: una tarea fija cada día, aparte de lo de JavaScript y React (no les quita tiempo ni cuenta para "al día"). */
export const MINUTOS_INGLES = 20;

/** Los temas del plan, en orden. `unidad` es el tema de Aprender (teoría y lecciones); null si es solo práctica. */
export const TEMAS = [
  // ---------- JavaScript ----------
  {
    id: "variables-y-tipos",
    etapa: "javascript",
    unidad: "variables-y-tipos",
    ejercicios: ["js-gu-001", "js-gu-002", "js-gu-003", "js-gu-004", "js-ej-006", "js-ej-007", "js-dep-002"],
    preguntas: ["ent-025", "ent-026", "ent-028", "ent-029", "ent-030"],
  },
  {
    id: "condicionales-y-bucles",
    etapa: "javascript",
    unidad: "condicionales-y-bucles",
    ejercicios: ["js-gu-005", "js-gu-006", "js-gu-007", "js-gu-008", "js-gu-009"],
    preguntas: [],
  },
  {
    id: "funciones",
    etapa: "javascript",
    unidad: "funciones",
    ejercicios: ["js-gu-010", "js-ej-025", "js-ej-028", "js-ej-029", "js-dep-004"],
    preguntas: ["ent-032", "ent-040", "ent-044"],
  },
  {
    id: "arrays",
    etapa: "javascript",
    unidad: "arrays",
    ejercicios: ["js-ej-004", "js-ej-005", "js-ej-012", "js-ej-011", "js-dep-001", "js-dep-006", "js-reto-024", "js-reto-008"],
    preguntas: ["ent-038"],
  },
  {
    id: "objetos",
    etapa: "javascript",
    unidad: "objetos",
    ejercicios: ["js-ej-015", "js-ej-009", "js-ej-013", "js-dep-012", "js-reto-017", "js-reto-025"],
    preguntas: ["ent-039"],
  },
  {
    id: "metodos-de-array",
    etapa: "javascript",
    unidad: "metodos-de-array",
    ejercicios: ["js-ej-001", "js-ej-002", "js-ej-003", "js-ej-016", "js-dep-005"],
    preguntas: ["ent-037"],
  },
  {
    id: "closures-y-scope",
    etapa: "javascript",
    unidad: "closures-y-scope",
    ejercicios: ["js-ej-019", "js-ej-026", "js-ej-023", "js-reto-006", "js-reto-004", "js-reto-001", "js-dep-007"],
    preguntas: ["ent-027", "ent-043"],
  },
  {
    id: "this",
    etapa: "javascript",
    unidad: "this",
    ejercicios: ["js-gu-020", "js-gu-021", "js-reto-014", "js-ej-043"],
    preguntas: ["ent-031"],
  },
  {
    id: "promesas-y-async",
    etapa: "javascript",
    unidad: "promesas-y-async",
    ejercicios: ["js-ej-031", "js-ej-032", "js-ej-036", "js-ej-034", "js-reto-012", "js-reto-011", "js-reto-013", "js-dep-009"],
    preguntas: ["ent-033", "ent-034", "ent-035", "ent-036"],
  },
  {
    id: "dom-y-eventos",
    etapa: "javascript",
    unidad: "dom-y-eventos",
    ejercicios: ["js-gu-023", "js-gu-024", "js-gu-025", "js-gu-026"],
    preguntas: ["ent-041", "ent-042", "ent-047", "ent-048"],
  },

  // ---------- React ----------
  {
    id: "react-jsx-y-componentes",
    etapa: "react",
    unidad: "react-jsx-y-componentes",
    ejercicios: ["react-ej-002", "react-ej-009", "react-ej-008", "mix-003", "mix-008"],
    preguntas: ["ent-049", "ent-050", "ent-052"],
  },
  {
    id: "react-props-y-children",
    etapa: "react",
    unidad: "react-props-y-children",
    ejercicios: ["react-ej-001", "react-ej-005", "react-ej-014", "mix-010"],
    preguntas: ["ent-051", "ent-064"],
  },
  {
    id: "react-estado-y-eventos",
    etapa: "react",
    unidad: "react-estado-y-eventos",
    ejercicios: ["react-ej-006", "react-ej-013", "react-ej-016", "react-ej-017", "mix-023", "react-reto-001", "react-reto-002", "react-dep-002", "react-dep-003"],
    preguntas: ["ent-054", "ent-066"],
  },
  {
    id: "react-listas-y-condicionales",
    etapa: "react",
    unidad: "react-listas-y-condicionales",
    ejercicios: ["react-ej-003", "react-ej-004", "react-ej-010", "react-ej-018", "react-ej-034", "mix-002", "react-dep-001", "react-dep-007", "react-reto-004", "react-reto-003"],
    preguntas: ["ent-053"],
  },
  {
    id: "react-formularios",
    etapa: "react",
    unidad: "react-formularios",
    ejercicios: ["react-ej-007", "react-ej-011", "react-ej-012", "mix-022", "react-reto-027", "react-ej-023", "react-dep-005", "react-reto-005"],
    preguntas: ["ent-063"],
  },
  {
    id: "react-efectos-y-datos",
    etapa: "react",
    unidad: "react-efectos-y-datos",
    ejercicios: ["react-ej-020", "react-ej-022", "react-reto-006", "react-api-001", "react-api-002", "react-dep-008", "react-api-005", "react-api-006", "mix-013", "react-reto-010"],
    preguntas: ["ent-055", "ent-056", "ent-065"],
  },
  {
    id: "react-hooks-avanzados",
    etapa: "react",
    unidad: "react-hooks-avanzados",
    ejercicios: ["react-ej-024", "react-ej-031", "react-ej-030", "mix-036", "react-reto-014"],
    preguntas: ["ent-057", "ent-059", "ent-060", "ent-061", "ent-062"],
  },
  {
    id: "react-hooks-propios-y-patrones",
    etapa: "react",
    unidad: "react-hooks-propios-y-patrones",
    ejercicios: ["react-ej-015", "react-ej-026", "react-ej-027", "react-ej-021", "react-reto-008", "react-reto-009", "react-reto-011"],
    preguntas: ["ent-058"],
  },
  {
    // Sin teoría: aquí se junta todo, como en una prueba técnica
    id: "react-integra-todo",
    etapa: "react",
    unidad: null,
    titulo: "Integra todo: como en una prueba técnica",
    ejercicios: ["mix-045", "react-reto-020", "mix-044", "mix-041"],
    preguntas: [],
  },
];

/** Lo que queda fuera del plan (se muestra como "para crecer", no se oculta en la app). */
export const PARA_CRECER = [
  "Algoritmos",
  "TypeScript",
  "Node y SQL",
  "Métodos a fondo",
  "Retos difíciles",
  "Escribir pruebas",
  "Patrones avanzados de React",
];

const IDS_ESENCIALES = new Set(TEMAS.flatMap((t) => t.ejercicios));
/** ¿Este ejercicio es de lo esencial para junior? */
export const esEsencial = (id) => IDS_ESENCIALES.has(id);
export const totalEsenciales = () => IDS_ESENCIALES.size;
/** Las unidades (temas de Aprender) de una etapa. */
export const unidadesDeEtapa = (etapa) => TEMAS.filter((t) => t.etapa === etapa && t.unidad).map((t) => t.unidad);

// Minutos estimados de cada tarea. React pesa más porque es lo que menos se domina al empezar.
const MINUTOS = {
  teoria: 15,
  leccion: 3,
  pregunta: 3,
  control: 15,
  repaso: 45,
  simulacro: 80,
  ejercicio: { javascript: { 1: 12, 2: 25, 3: 45 }, react: { 1: 15, 2: 30, 3: 50 } },
};

/**
 * La lista ordenada de tareas del plan.
 * @param {object} p
 * @param {{ id: string, titulo: string, nivel?: number }[]} p.ejercicios  todos los ejercicios de la app
 * @param {Record<string, string>} [p.titulos]      título de cada unidad de Aprender
 * @param {Record<string, number>} [p.lecciones]    cuántas lecciones de "Lo esencial" tiene cada unidad
 * @param {Record<string, string>} [p.preguntas]    texto de cada pregunta de entrevista
 * @returns {{ clave: string, tipo: string, etapa: string, tema: string, temaTitulo: string, titulo: string, minutos: number, id?: string }[]}
 */
export function armarCatalogo({ ejercicios = [], titulos = {}, lecciones = {}, preguntas = {} } = {}) {
  const porId = new Map(ejercicios.map((e) => [e.id, e]));
  const tareas = [];
  for (const tema of TEMAS) {
    const temaTitulo = tema.titulo ?? titulos[tema.unidad] ?? tema.id;
    const base = { etapa: tema.etapa, tema: tema.id, temaTitulo };
    if (tema.unidad) {
      tareas.push({ ...base, clave: `teoria:${tema.unidad}`, tipo: "teoria", id: tema.unidad, titulo: "Teoría", minutos: MINUTOS.teoria });
      const n = lecciones[tema.unidad] ?? 0;
      if (n > 0) tareas.push({ ...base, clave: `lecciones:${tema.unidad}`, tipo: "lecciones", id: tema.unidad, titulo: `Lecciones de lo esencial (${n})`, minutos: n * MINUTOS.leccion });
    }
    for (const id of tema.ejercicios) {
      const e = porId.get(id);
      if (!e) continue; // un ejercicio que ya no existe no rompe el plan
      const nivel = Math.min(3, Math.max(1, e.nivel ?? 2));
      tareas.push({ ...base, clave: `ej:${id}`, tipo: "ejercicio", id, titulo: e.titulo, nivel, minutos: MINUTOS.ejercicio[tema.etapa][nivel] });
    }
    for (const id of tema.preguntas) {
      if (!preguntas[id]) continue;
      tareas.push({ ...base, clave: `preg:${id}`, tipo: "pregunta", id, titulo: preguntas[id], minutos: MINUTOS.pregunta });
    }
    // Al terminar el último tema de la etapa, su control
    const ultimoDeEtapa = TEMAS.filter((t) => t.etapa === tema.etapa).at(-1) === tema;
    if (ultimoDeEtapa) {
      const etapa = ETAPAS.find((e) => e.id === tema.etapa);
      tareas.push({ etapa: tema.etapa, tema: `control-${tema.etapa}`, temaTitulo: `Control de ${etapa.titulo}`, clave: `control:${tema.etapa}`, tipo: "control", id: tema.etapa, titulo: `Control de ${etapa.titulo}: 12 preguntas`, minutos: MINUTOS.control });
    }
  }
  // Los dos días del final
  tareas.push({ etapa: "repaso", tema: "repaso", temaTitulo: "Repaso", clave: "repaso:lecciones", tipo: "repaso", id: "lecciones", titulo: "Corregir los errores de tus lecciones", minutos: MINUTOS.repaso });
  tareas.push({ etapa: "repaso", tema: "repaso", temaTitulo: "Repaso", clave: "repaso:ejercicios", tipo: "repaso", id: "ejercicios", titulo: "Rehacer los ejercicios que quedaron para repasar", minutos: MINUTOS.repaso });
  tareas.push({ etapa: "simulacro", tema: "simulacro", temaTitulo: "Simulacro", clave: "simulacro", tipo: "simulacro", id: "simulacro", titulo: "Simulacro de entrevista completo, en voz alta", minutos: MINUTOS.simulacro });
  return tareas;
}

// ---------- Fechas "AAAA-MM-DD" sin líos de zona horaria ----------
const aDias = (f) => Math.round(Date.UTC(+f.slice(0, 4), +f.slice(5, 7) - 1, +f.slice(8, 10)) / 86_400_000);
export const diasDesde = (desde, hasta) => aDias(hasta) - aDias(desde);
export function sumarDias(fecha, dias) {
  return new Date((aDias(fecha) + dias) * 86_400_000).toISOString().slice(0, 10);
}

const esEstudio = (t) => t.etapa !== "repaso" && t.etapa !== "simulacro";

/**
 * Reparte tareas, en orden, entre n días con cargas parejas (por peso).
 * @returns {number[]} el día (desde 0) de cada tarea
 */
export function repartir(pesos, n) {
  const total = pesos.reduce((a, b) => a + b, 0);
  if (n <= 1 || total <= 0) return pesos.map(() => 0);
  const cuota = total / n;
  let acumulado = 0;
  return pesos.map((p) => {
    const dia = Math.min(n - 1, Math.floor((acumulado + p / 2) / cuota));
    acumulado += p;
    return dia;
  });
}

const medios = (dias) => Math.round(dias * 2) / 2;

/**
 * El plan de hoy: qué te toca, cómo vas y cómo queda cada día.
 * @param {object} p
 * @param {ReturnType<typeof armarCatalogo>} p.tareas
 * @param {Record<string, number>} p.progreso       avance de cada tarea ahora, de 0 a 1
 * @param {Record<string, number>} [p.alEmpezar]    avance al empezar el día (para que la lista de hoy no cambie mientras avanzas)
 * @param {string} p.inicio  primer día del plan
 * @param {string} p.hoy
 * @param {number} [p.dias]  duración (los dos últimos son repaso y simulacro)
 * @param {number | null} [p.minutosIngles]  minutos de inglés que llevas hoy; null si no se lleva la cuenta
 */
export function armarPlan({ tareas, progreso = {}, alEmpezar = null, inicio, hoy, dias = DIAS_PLAN, minutosIngles = null }) {
  const n = Math.max(DIAS_MINIMO, Math.round(dias) || DIAS_PLAN);
  const diasEstudio = n - 2;
  const dia = diasDesde(inicio, hoy) + 1; // 1 = primer día; 0 o menos = todavía no empieza
  const avance = (t) => Math.min(1, Math.max(0, progreso[t.clave] ?? 0));
  const avanceInicio = (t) => Math.min(avance(t), Math.max(0, (alEmpezar ?? progreso)[t.clave] ?? 0));

  // Peso de cada tarea: sus minutos, ajustados para que cada etapa ocupe su parte de los días
  const estudio = tareas.filter(esEstudio);
  const minutosEstudio = estudio.reduce((s, t) => s + t.minutos, 0);
  const factor = Object.fromEntries(
    ETAPAS.map((e) => {
      const suyos = estudio.filter((t) => t.etapa === e.id).reduce((s, t) => s + t.minutos, 0);
      return [e.id, suyos > 0 ? (e.parte * minutosEstudio) / suyos : 1];
    }),
  );
  const peso = (t) => t.minutos * (factor[t.etapa] ?? 1);
  const pesoTotal = estudio.reduce((s, t) => s + peso(t), 0);
  const pesoPorDia = pesoTotal / diasEstudio || 1;

  // El plan ideal (como si empezaras de cero): sirve para saber si vas al día
  const ideal = repartir(estudio.map(peso), diasEstudio);
  const idealHasta = (d) => estudio.reduce((s, t, i) => s + (ideal[i] < d ? peso(t) : 0), 0); // peso que debería estar hecho al terminar el día d
  const hecho = estudio.reduce((s, t) => s + peso(t) * avance(t), 0);
  const diaEstudio = Math.min(Math.max(dia, 1), diasEstudio + 1);
  const debiaAlEmpezar = idealHasta(diaEstudio - 1);
  const debeAlTerminar = idealHasta(diaEstudio);

  let estado;
  if (dia < 1) estado = { tipo: "por-empezar", dias: 1 - dia };
  else if (dia > n) estado = { tipo: "vencido", dias: dia - n };
  else if (debiaAlEmpezar - hecho > pesoPorDia * 0.25) estado = { tipo: "atrasado", dias: Math.max(0.5, medios((debiaAlEmpezar - hecho) / pesoPorDia)) };
  else if (hecho - debeAlTerminar > pesoPorDia * 0.25) estado = { tipo: "adelantado", dias: Math.max(0.5, medios((hecho - debeAlTerminar) / pesoPorDia)) };
  else estado = { tipo: "al-dia", dias: 0 };

  // Lo que falta (según cómo estabas al empezar hoy), repartido entre los días que quedan
  const diaReal = Math.min(Math.max(dia, 1), n);
  const pendientes = estudio.filter((t) => avanceInicio(t) < 1);
  const quedanEstudio = Math.max(1, diasEstudio - (diaReal - 1));
  const reparto = repartir(pendientes.map((t) => peso(t) * (1 - avanceInicio(t))), diaReal > diasEstudio ? 1 : quedanEstudio);
  const diaDe = new Map(pendientes.map((t, i) => [t.clave, diaReal + reparto[i]]));
  for (const t of tareas) {
    if (esEstudio(t) || avanceInicio(t) >= 1) continue;
    diaDe.set(t.clave, Math.max(diaReal, t.etapa === "repaso" ? n - 1 : n));
  }

  const conEstado = (t) => ({ ...t, avance: avance(t), hecha: avance(t) >= 1 });
  const deHoy = dia >= 1 ? tareas.filter((t) => diaDe.get(t.clave) === diaReal).map(conEstado) : [];
  // Inglés del día: va al final de la lista de hoy, cada día del plan
  if (minutosIngles !== null && dia >= 1 && dia <= n) {
    const avanceIngles = Math.min(1, Math.max(0, minutosIngles) / MINUTOS_INGLES);
    deHoy.push({ clave: `ingles:${hoy}`, tipo: "ingles", etapa: "ingles", tema: "ingles", temaTitulo: "Inglés", id: "ingles", titulo: `Inglés: ${MINUTOS_INGLES} minutos`, minutos: MINUTOS_INGLES, avance: avanceIngles, hecha: avanceIngles >= 1 });
  }
  const pendientesAhora = tareas.filter((t) => avance(t) < 1);
  const siguiente = deHoy.find((t) => !t.hecha) ?? null;
  // Si ya terminaste lo de hoy, lo primero que viene es para adelantar
  const adelanta = siguiente ? null : (pendientesAhora.map(conEstado)[0] ?? null);

  // Calendario: cada día con su etapa, sus minutos y si ya lo cubriste
  const etapaIdeal = (d) => {
    const cuenta = {};
    estudio.forEach((t, i) => {
      if (ideal[i] === d - 1) cuenta[t.etapa] = (cuenta[t.etapa] ?? 0) + t.minutos;
    });
    return Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  };
  const calendario = Array.from({ length: n }, (_, i) => {
    const d = i + 1;
    const etapa = d === n ? "simulacro" : d === n - 1 ? "repaso" : etapaIdeal(d);
    const suyas = tareas.filter((t) => diaDe.get(t.clave) === d);
    const minutosIdeal = d > diasEstudio ? tareas.filter((t) => t.etapa === etapa).reduce((s, t) => s + t.minutos, 0) : estudio.reduce((s, t, k) => s + (ideal[k] === i ? t.minutos : 0), 0);
    return {
      dia: d,
      fecha: sumarDias(inicio, i),
      etapa,
      tipo: d < diaReal || dia > n ? "pasado" : d === diaReal ? "hoy" : "futuro",
      // Para hoy y lo que viene, lo que de verdad te toca; para los días pasados, lo que tocaba
      minutos: (minutosIngles !== null ? MINUTOS_INGLES : 0) + Math.round(d > diasEstudio && d > diaReal ? minutosIdeal : d >= diaReal && dia <= n ? suyas.reduce((s, t) => s + t.minutos * (1 - avanceInicio(t)), 0) : minutosIdeal),
      tareas: d >= diaReal ? suyas.length : null,
      cubierto: d <= diasEstudio ? hecho + 1e-6 >= idealHasta(d) : tareas.filter((t) => t.etapa === etapa).every((t) => avance(t) >= 1),
    };
  });

  // Resumen por etapa y por tema
  const resumen = (lista) => ({
    total: lista.length,
    hechas: lista.filter((t) => avance(t) >= 1).length,
    minutosFaltan: Math.round(lista.reduce((s, t) => s + t.minutos * (1 - avance(t)), 0)),
    porcentaje: lista.length ? lista.reduce((s, t) => s + t.minutos * avance(t), 0) / (lista.reduce((s, t) => s + t.minutos, 0) || 1) : 0,
  });
  const etapas = [...ETAPAS, { id: "repaso", titulo: "Repaso" }, { id: "simulacro", titulo: "Simulacro" }].map((e) => {
    const suyas = tareas.filter((t) => t.etapa === e.id);
    const ejercicios = suyas.filter((t) => t.tipo === "ejercicio");
    return { id: e.id, titulo: e.titulo, ...resumen(suyas), ejercicios: { total: ejercicios.length, hechos: ejercicios.filter((t) => avance(t) >= 1).length } };
  });
  const temas = [...new Map(tareas.map((t) => [t.tema, t])).values()].map((t) => {
    const suyas = tareas.filter((x) => x.tema === t.tema);
    const r = resumen(suyas);
    return { id: t.tema, titulo: t.temaTitulo, etapa: t.etapa, ...r, estado: r.hechas === r.total ? "hecho" : r.hechas > 0 || suyas.some((x) => avance(x) > 0) ? "empezado" : "pendiente" };
  });

  const cuenta = (tipo) => {
    const lista = tareas.filter((t) => t.tipo === tipo);
    return { total: lista.length, hechos: lista.filter((t) => avance(t) >= 1).length };
  };
  const minutosHoy = Math.round(deHoy.reduce((s, t) => s + t.minutos * (1 - t.avance), 0));
  const diasQuedan = Math.max(0, n - diaReal + 1);
  return {
    inicio,
    fin: sumarDias(inicio, n - 1),
    dias: n,
    dia,
    diasQuedan,
    estado,
    hoy: { tareas: deHoy, hechas: deHoy.filter((t) => t.hecha).length, total: deHoy.length, minutos: minutosHoy, minutosTotal: Math.round(deHoy.reduce((s, t) => s + t.minutos, 0)) },
    siguiente,
    adelanta,
    calendario,
    etapas,
    temas,
    ejercicios: cuenta("ejercicio"),
    preguntas: cuenta("pregunta"),
    total: resumen(tareas),
    // Minutos por día que hacen falta desde hoy para terminar el estudio a tiempo
    ritmo: Math.round(pendientesAhora.filter(esEstudio).reduce((s, t) => s + t.minutos * (1 - avance(t)), 0) / Math.max(1, diasEstudio - (diaReal - 1))),
    terminado: pendientesAhora.length === 0,
  };
}

const ESTADO_TEXTO = {
  "por-empezar": (e) => `Empieza en ${e.dias} ${e.dias === 1 ? "día" : "días"}`,
  "al-dia": () => "Al día",
  adelantado: (e) => `Adelantado ${e.dias} ${e.dias === 1 ? "día" : "días"}`,
  atrasado: (e) => `Atrasado ${e.dias} ${e.dias === 1 ? "día" : "días"}`,
  vencido: () => "El plan ya terminó",
};
/** "Al día", "Atrasado 1.5 días"... */
export const textoEstado = (estado) => ESTADO_TEXTO[estado?.tipo]?.(estado) ?? "";

/** "45 min", "1 h", "2 h 30" */
export function duracion(minutos) {
  const m = Math.max(0, Math.round(minutos));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = Math.round((m % 60) / 5) * 5;
  return resto === 60 ? `${h + 1} h` : resto ? `${h} h ${String(resto).padStart(2, "0")}` : `${h} h`;
}

/**
 * El plan contado en texto para el mentor de IA: solo datos, sin opinión.
 * @param {ReturnType<typeof armarPlan>} plan
 * @param {{ repasar?: string[], enProgreso?: string[], errores?: number }} [extra]
 */
export function planEnTexto(plan, extra = {}) {
  const e = (id) => plan.etapas.find((x) => x.id === id);
  const temasEn = (estado) => plan.temas.filter((t) => t.estado === estado && t.etapa !== "repaso" && t.etapa !== "simulacro").map((t) => t.titulo);
  return [
    `Plan junior de ${plan.dias} días (del ${plan.inicio} al ${plan.fin}). Hoy es el día ${Math.min(Math.max(plan.dia, 0), plan.dias)}. Estado: ${textoEstado(plan.estado)}.`,
    `Avance total: ${plan.total.hechas} de ${plan.total.total} tareas (${Math.round(plan.total.porcentaje * 100)}%). Ejercicios esenciales: ${plan.ejercicios.hechos} de ${plan.ejercicios.total}. Preguntas de entrevista: ${plan.preguntas.hechos} de ${plan.preguntas.total}.`,
    `JavaScript: ${e("javascript").hechas}/${e("javascript").total} tareas. React: ${e("react").hechas}/${e("react").total} tareas.`,
    `Ritmo que necesita desde hoy: ${duracion(plan.ritmo)} de estudio por día (tiempo estimado, sin contar trabas).`,
    `Hoy le tocan ${plan.hoy.total} tareas (${duracion(plan.hoy.minutosTotal)}), lleva ${plan.hoy.hechas}:`,
    ...plan.hoy.tareas.slice(0, 14).map((t) => `- [${t.hecha ? "hecha" : "pendiente"}] clave=${t.clave} · ${t.temaTitulo} · ${t.tipo}: ${t.titulo} (${t.minutos} min)`),
    plan.hoy.total > 14 ? `- y ${plan.hoy.total - 14} más` : "",
    plan.hoy.tareas.some((t) => t.tipo === "ingles") ? `Además, cada día del plan: ${MINUTOS_INGLES} minutos de inglés (lecciones de la sección Inglés, Conversa o explicar un ejercicio en inglés).` : "",
    plan.adelanta ? `Ya terminó lo de hoy. Para adelantar sigue: clave=${plan.adelanta.clave} · ${plan.adelanta.temaTitulo}: ${plan.adelanta.titulo}` : "",
    temasEn("hecho").length ? `Temas terminados: ${temasEn("hecho").join(", ")}.` : "",
    temasEn("empezado").length ? `Temas a medias: ${temasEn("empezado").join(", ")}.` : "",
    extra.repasar?.length ? `Ejercicios donde vio la solución (quedaron para repasar): ${extra.repasar.slice(0, 8).join(", ")}.` : "",
    extra.enProgreso?.length ? `Ejercicios empezados y sin resolver: ${extra.enProgreso.slice(0, 8).join(", ")}.` : "",
    extra.errores ? `Preguntas de lección falladas sin corregir: ${extra.errores}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
