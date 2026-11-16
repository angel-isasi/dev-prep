// Niveles e insignias por lo que DEMUESTRAS (no por puntos ni por tiempo). Funciones puras.
// `estado` lo arma la versión web con tu progreso combinado (ver api-movil.js → logros).
//
// Una insignia, una vez ganada, queda guardada en "logrosVistos" (no se pierde si luego baja tu racha).

/**
 * @typedef {object} EstadoLogros
 * @property {number} resueltos  @property {number} limpios  @property {number} retos  @property {number} depurados
 * @property {number} preparacion  @property {number} verdes  @property {number} lecciones  @property {number} racha
 * @property {number} tarjetasDominadas  @property {number} simulacros  @property {boolean} pitch  @property {number} historias
 * @property {number} postulaciones  @property {number} inglesDominadas  @property {number} inglesLecciones
 * @property {number} predice  @property {number} revisionesPerfectas  @property {number} jefes  @property {number} examenes
 * @property {number} mejorExamen  @property {boolean} semanaPerfecta  @property {number} inmersionMinutos  @property {number} enfoques
 */

const req = (texto, campo, meta) => ({ texto, campo, meta });

/** Seis niveles. Para subir, cumples TODOS los requisitos del nivel. */
export const NIVELES = [
  { id: 1, titulo: "Curioso", descripcion: "Empezaste. Lo difícil ya pasó.", requisitos: [] },
  {
    id: 2,
    titulo: "Aprendiz",
    descripcion: "Ya practicas de verdad.",
    requisitos: [req("ejercicios resueltos", "resueltos", 10), req("lecciones completas", "lecciones", 5), req("días de racha", "racha", 3)],
  },
  {
    id: 3,
    titulo: "Practicante",
    descripcion: "Dominas lo básico de JavaScript.",
    requisitos: [req("ejercicios resueltos", "resueltos", 40), req("% de preparación", "preparacion", 20), req("temas en verde", "verdes", 5), req("unidades de inglés dominadas", "inglesDominadas", 3)],
  },
  {
    id: 4,
    titulo: "Junior en formación",
    descripcion: "Ya podrías resolver una prueba técnica sencilla.",
    requisitos: [
      req("ejercicios resueltos", "resueltos", 100),
      req("% de preparación", "preparacion", 40),
      req("retos de entrevista", "retos", 5),
      req("tarjetas de entrevista dominadas", "tarjetasDominadas", 30),
      req("unidades de inglés dominadas", "inglesDominadas", 8),
    ],
  },
  {
    id: 5,
    titulo: "Candidato",
    descripcion: "Es hora de empezar a postular.",
    requisitos: [
      req("% de preparación", "preparacion", 60),
      req("retos de entrevista", "retos", 15),
      req("simulacros completos", "simulacros", 3),
      req("historias STAR escritas", "historias", 3),
      req("temas en verde", "verdes", 15),
      req("unidades de inglés dominadas", "inglesDominadas", 15),
    ],
  },
  {
    id: 6,
    titulo: "Listo para entrevistar",
    descripcion: "Preparado para tu primer trabajo.",
    requisitos: [
      req("% de preparación", "preparacion", 75),
      req("retos de entrevista", "retos", 30),
      req("simulacros completos", "simulacros", 8),
      req("tarjetas de entrevista dominadas", "tarjetasDominadas", 60),
      req("unidades de inglés dominadas", "inglesDominadas", 21),
      req("postulaciones enviadas", "postulaciones", 1),
    ],
  },
];

const ins = (id, titulo, descripcion, campo, meta, icono) => ({ id, titulo, descripcion, campo, meta, icono });

/** Insignias por logros concretos. `campo` y `meta`: se gana cuando estado[campo] >= meta. */
export const INSIGNIAS = [
  ins("primer-paso", "Primer paso", "Resolviste tu primer ejercicio", "resueltos", 1, "👣"),
  ins("diez", "Diez", "10 ejercicios resueltos", "resueltos", 10, "🔟"),
  ins("cincuenta", "Cincuenta", "50 ejercicios resueltos", "resueltos", 50, "🏅"),
  ins("cien", "Cien", "100 ejercicios resueltos", "resueltos", 100, "💯"),
  ins("sin-pistas", "Sin ayuda", "10 ejercicios resueltos sin pistas", "limpios", 10, "🎯"),
  ins("sin-pistas-50", "Cabeza fría", "50 ejercicios resueltos sin pistas", "limpios", 50, "🧊"),
  ins("racha-7", "Una semana", "7 días de racha", "racha", 7, "🔥"),
  ins("racha-30", "Un mes", "30 días de racha", "racha", 30, "🌋"),
  ins("semana-perfecta", "Semana perfecta", "Cumpliste la meta de lunes a viernes", "semanaPerfecta", 1, "📅"),
  ins("primer-reto", "Primer reto", "Tu primer reto de entrevista", "retos", 1, "⚔️"),
  ins("diez-retos", "Retador", "10 retos de entrevista", "retos", 10, "🛡️"),
  ins("jefe", "Cazajefes", "Venciste a un jefe de la semana", "jefes", 1, "👑"),
  ins("bug", "Primer bug cazado", "Resolviste un ejercicio de depurar", "depurados", 1, "🐛"),
  ins("predice", "Ojo de compilador", "20 preguntas de Lee y predice dominadas", "predice", 20, "👁️"),
  ins("revisor", "Revisor", "Una revisión de código perfecta", "revisionesPerfectas", 1, "🔍"),
  ins("verde-5", "Cinco en verde", "5 temas dominados en el mapa", "verdes", 5, "🟩"),
  ins("verde-15", "Mapa en verde", "15 temas dominados en el mapa", "verdes", 15, "🗺️"),
  ins("lecciones-25", "Constante", "25 lecciones completas", "lecciones", 25, "📚"),
  ins("tarjetas-30", "Buena memoria", "30 tarjetas de entrevista dominadas", "tarjetasDominadas", 30, "🧠"),
  ins("simulacro", "Primer simulacro", "Completaste un simulacro de entrevista", "simulacros", 1, "🎤"),
  ins("pitch", "Tu pitch", "Escribiste tu presentación de 1 minuto", "pitch", 1, "🗣️"),
  ins("star", "Historias STAR", "3 historias STAR escritas", "historias", 3, "⭐"),
  ins("ingles-1", "Hello!", "Tu primera lección de inglés", "inglesLecciones", 1, "👋"),
  ins("ingles-5", "Base sólida", "5 unidades de inglés dominadas", "inglesDominadas", 5, "🇺🇸"),
  ins("inmersion", "Oído entrenado", "10 horas de inglés real", "inmersionMinutos", 600, "🎧"),
  ins("examen-17", "Sobresaliente", "17 o más en un examen semanal", "mejorExamen", 17, "📝"),
  ins("enfoque-10", "Enfocado", "10 sesiones de enfoque de 25 minutos", "enfoques", 10, "⏱️"),
  ins("postula", "Al ruedo", "Tu primera postulación", "postulaciones", 1, "🚀"),
];

const valor = (estado, campo) => Number(estado[campo] === true ? 1 : estado[campo] === false ? 0 : (estado[campo] ?? 0));

/**
 * Nivel actual, requisitos del siguiente e insignias.
 * @param {EstadoLogros} estado
 * @param {Record<string, object>} vistos  logros ya ganados (de "logrosVistos")
 */
export function calcularLogros(estado, vistos = {}) {
  const cumple = (n) => n.requisitos.every((r) => valor(estado, r.campo) >= r.meta);
  // Los niveles no se pierden: el más alto ganado alguna vez (o el que cumples ahora)
  let nivel = NIVELES[0];
  for (const n of NIVELES) if (cumple(n) || vistos[`nivel-${n.id}`]) nivel = n;
  const siguiente = NIVELES.find((n) => n.id === nivel.id + 1) ?? null;

  const insignias = INSIGNIAS.map((i) => {
    const actual = valor(estado, i.campo);
    const ganada = actual >= i.meta || !!vistos[i.id];
    return { ...i, actual: Math.min(actual, i.meta), ganada };
  });

  const nuevos = [
    ...(nivel.id > 1 && !vistos[`nivel-${nivel.id}`] ? [{ id: `nivel-${nivel.id}`, titulo: `Nivel ${nivel.id}: ${nivel.titulo}`, icono: "⬆️" }] : []),
    ...insignias.filter((i) => i.ganada && !vistos[i.id]).map((i) => ({ id: i.id, titulo: i.titulo, icono: i.icono })),
  ];

  return {
    nivel: { id: nivel.id, titulo: nivel.titulo, descripcion: nivel.descripcion },
    siguiente: siguiente && {
      id: siguiente.id,
      titulo: siguiente.titulo,
      requisitos: siguiente.requisitos.map((r) => ({ ...r, actual: Math.min(valor(estado, r.campo), r.meta), listo: valor(estado, r.campo) >= r.meta })),
    },
    insignias,
    ganadas: insignias.filter((i) => i.ganada).length,
    nuevos,
  };
}

/**
 * ¿Ya conviene postular? Semáforo con lo que piden las empresas para un junior.
 * @returns {{ color: "verde"|"amarillo"|"rojo", puntos: { texto: string, listo: boolean }[] }}
 */
export function semaforoPostular(estado, nivelId) {
  const puntos = [
    { texto: "Nivel Junior en formación o más", listo: nivelId >= 4 },
    { texto: "Preparación de 50% o más", listo: (estado.preparacion ?? 0) >= 50 },
    { texto: "3 simulacros de entrevista", listo: (estado.simulacros ?? 0) >= 3 },
    { texto: "Tu pitch y 3 historias STAR", listo: !!estado.pitch && (estado.historias ?? 0) >= 3 },
    { texto: "Inglés básico terminado (unidades de base dominadas)", listo: (estado.inglesDominadas ?? 0) >= 21 },
    { texto: "2 proyectos en tu portafolio", listo: (estado.portafolio ?? 0) >= 2 },
  ];
  const listos = puntos.filter((p) => p.listo).length;
  return { color: listos === puntos.length ? "verde" : listos >= 3 ? "amarillo" : "rojo", puntos };
}
