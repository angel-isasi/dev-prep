// Aksu: CUÁNDO interviene. Funciones puras (reglas.test.js), sin IA: decidir el momento es gratis;
// la IA solo se usa después, para decir algo que valga la pena.
//
// Dos estados chicos:
// - la sesión de un ejercicio: cuándo lo abriste y cómo salieron los tests en cada guardada;
// - el día: qué resolviste, cuánto llevas seguido y qué avisos ya te dio (para no repetirse).

export const NIVELES = ["callado", "normal", "encima"];
export const NOMBRE_NIVEL = { callado: "Callado", normal: "Normal", encima: "Encima de mí" };

/** Minutos razonables por nivel del ejercicio antes de sugerir una pista o pasar al siguiente. */
export const LIMITE_MIN = { 1: 20, 2: 35, 3: 50 };
export const PAUSA_MIN = 50;
export const INACTIVO_MIN = 20;
export const CADA_EJERCICIOS = 3;
export const GUARDADAS_TRABADO = 3;
export const HORA_CIERRE = 21;
const MIN = 60_000;

/**
 * Qué puede hacer por su cuenta en cada nivel. "Callado" solo responde cuando le hablas.
 * "Encima de mí" además comenta cada test que falla, revisa lo que guardas y te hace preguntas sorpresa.
 */
const SOLO = {
  callado: [],
  normal: ["arranque", "trabado", "tiempo", "resuelto", "pausa", "inactivo", "frena", "pregunta", "cierre", "informe", "entrevista", "relampago", "teoria", "distraccion", "recibe", "comenta"],
  encima: ["arranque", "trabado", "tiempo", "resuelto", "pausa", "inactivo", "frena", "pregunta", "cierre", "informe", "entrevista", "relampago", "teoria", "distraccion", "recibe", "comenta", "test", "guardar", "sorpresa", "ingles"],
};
export const puede = (nivel, que) => (SOLO[nivel] ?? SOLO.normal).includes(que);

// ---------- Sesión de un ejercicio ----------
export const sesionNueva = (id, nivel, ahora) => ({ id, nivel: nivel ?? 2, inicio: ahora, guardadas: [], avisos: {} });

/** Anota cómo salieron los tests en una guardada. @param {{ casos?: { nombre: string, ok: boolean }[], error?: string }} resultado */
export function anotarGuardada(sesion, resultado, ahora) {
  const fallan = (resultado?.casos ?? []).filter((c) => !c.ok).map((c) => c.nombre).sort();
  if (resultado?.error) fallan.unshift("error al correr");
  return { ...sesion, guardadas: [...sesion.guardadas, { en: ahora, fallan }].slice(-12) };
}

const firma = (g) => g.fallan.join("|");

/** Trabado: las últimas guardadas fallan exactamente en lo mismo, y todavía no se lo dijo para ese fallo. */
export function estaTrabado(sesion) {
  const ultimas = sesion.guardadas.slice(-GUARDADAS_TRABADO);
  if (ultimas.length < GUARDADAS_TRABADO || ultimas[0].fallan.length === 0) return false;
  const f = firma(ultimas[0]);
  return ultimas.every((g) => firma(g) === f) && sesion.avisos.trabado !== f;
}
export const marcarTrabado = (sesion) => ({ ...sesion, avisos: { ...sesion.avisos, trabado: firma(sesion.guardadas.at(-1)) } });

export const minutosEn = (sesion, ahora) => Math.floor((ahora - sesion.inicio) / MIN);
/** Ya pasó el tiempo razonable para su nivel (se avisa una sola vez). */
export const pasoElTiempo = (sesion, ahora) => !sesion.avisos.tiempo && minutosEn(sesion, ahora) >= (LIMITE_MIN[sesion.nivel] ?? LIMITE_MIN[2]);
export const marcar = (sesion, clave) => ({ ...sesion, avisos: { ...sesion.avisos, [clave]: true } });

// ---------- El día ----------
export const diaNuevo = (fecha, ahora) => ({ fecha, activoDesde: ahora, ultimaActividad: ahora, pausaEn: null, resueltos: [], preguntas: 0, frenadoEn: 0, hechos: {} });

/** Hubo actividad (un clic, una tecla, una guardada). Si venías de un rato largo sin nada, el reloj de la pausa vuelve a empezar. */
export function actividad(dia, ahora) {
  const descanso = ahora - dia.ultimaActividad >= 10 * MIN;
  return { ...dia, ultimaActividad: ahora, ...(descanso ? { activoDesde: ahora, pausaEn: null } : {}) };
}

export const anotarResuelto = (dia, { id, pistas = 0, solucion = false }, ahora) => ({ ...dia, resueltos: [...dia.resueltos.filter((r) => r.id !== id), { id, pistas, solucion, en: ahora }] });

/** Va corriendo: de los últimos 4 resueltos, 3 o más salieron con 2+ pistas o mirando la solución. */
export function vaCorriendo(dia) {
  if (dia.resueltos.length < 4 || dia.resueltos.length - dia.frenadoEn < 4) return false;
  return dia.resueltos.slice(-4).filter((r) => r.solucion || r.pistas >= 2).length >= 3;
}
export const marcarFrenado = (dia) => ({ ...dia, frenadoEn: dia.resueltos.length });

/** Cada 3 ejercicios resueltos toca una pregunta de entrevista. */
export const tocaPregunta = (dia) => dia.resueltos.length > 0 && Math.floor(dia.resueltos.length / CADA_EJERCICIOS) > dia.preguntas;
export const marcarPregunta = (dia) => ({ ...dia, preguntas: Math.floor(dia.resueltos.length / CADA_EJERCICIOS) });

/** 50 minutos seguidos con actividad reciente: toca una pausa. */
export const tocaPausa = (dia, ahora) => ahora - (dia.pausaEn ?? dia.activoDesde) >= PAUSA_MIN * MIN && ahora - dia.ultimaActividad < 5 * MIN;
export const marcarPausa = (dia, ahora) => ({ ...dia, pausaEn: ahora });

/** 20 minutos sin actividad con un ejercicio abierto (se pregunta una vez por ejercicio). */
export const sigueAhi = (sesion, dia, ahora) => !!sesion && !sesion.avisos.inactivo && ahora - Math.max(dia.ultimaActividad, sesion.guardadas.at(-1)?.en ?? 0) >= INACTIVO_MIN * MIN;

/** Cosas que pasan una vez al día (arranque, cierre, pregunta sorpresa). */
export const yaHizo = (dia, que) => !!dia.hechos[que];
export const marcarHecho = (dia, que) => ({ ...dia, hechos: { ...dia.hechos, [que]: true } });
export const tocaCierre = (dia, hora) => hora >= HORA_CIERRE && !yaHizo(dia, "cierre") && dia.resueltos.length > 0;
/** Pregunta sorpresa: a la media hora de empezar, una vez. */
export const tocaSorpresa = (dia, ahora) => !yaHizo(dia, "sorpresa") && ahora - dia.activoDesde >= 30 * MIN;

/** Lunes de la semana de una fecha "AAAA-MM-DD". */
export function lunesDe(fecha) {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
/** El informe semanal toca una vez por semana, desde el domingo (o el lunes si el domingo no abriste la app). */
export function tocaInforme(fecha, ultimoInforme) {
  const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  const semana = dia === 0 ? lunesDe(fecha) : dia === 1 ? lunesDe(new Date(new Date(`${fecha}T12:00:00Z`).getTime() - 86_400_000).toISOString().slice(0, 10)) : null;
  return semana && ultimoInforme !== semana ? semana : null;
}

// ---------- Cuaderno: lo que Aksu observa de ti ----------
export const MAX_NOTAS = 40;
/** Agrega una nota sin repetir la misma dos veces seguidas. */
export function anotar(cuaderno, texto, fecha) {
  const limpio = String(texto ?? "").trim().slice(0, 240);
  if (!limpio || cuaderno.some((n) => n.texto.toLowerCase() === limpio.toLowerCase())) return cuaderno;
  return [...cuaderno, { fecha, texto: limpio }].slice(-MAX_NOTAS);
}

// ---------- Textos fijos (sin IA) ----------
export const TEXTOS = {
  tiempo: (sesion, ahora) => `Llevas ${minutosEn(sesion, ahora)} minutos en este ejercicio. Pide una pista o déjalo y vuelve mañana: trabarse más tiempo ya no enseña.`,
  pausa: () => `Llevas ${PAUSA_MIN} minutos seguidos. Párate 5 minutos, toma agua y vuelve.`,
  inactivo: () => "¿Sigues ahí? Si te trabaste, dime dónde y lo vemos juntos.",
  sinIa: () => "Para conversar necesito la IA: pon tu contraseña de IA en Ajustes.",
};

// ---------- Silencio y bloque de concentración ----------
/** ¿Puede hablar por su cuenta ahora? En silencio o en un bloque de concentración, no. */
export const enSilencio = (e, ahora) => (e.silencioHasta ?? 0) > ahora;
export const bloqueActivo = (bloque, ahora) => !!bloque && ahora < bloque.inicio + bloque.minutos * MIN;
export const restanteBloque = (bloque, ahora) => Math.max(0, bloque.inicio + bloque.minutos * MIN - ahora);
export const BLOQUE_MIN = 50;
/** Minutos seguidos en una distracción para decirlo: en un bloque, 2; fuera de él, 30. */
export const DISTRACCION_MIN = { bloque: 2, normal: 30 };
/**
 * ¿Toca avisar que está distraído? Una vez por cada vez que se va a esa cosa.
 * @param {{ nombre: string, tipo: string, minutos: number }|null} actual lo que tiene delante en la laptop
 * @param {string|null} yaAvisado nombre de la distracción que ya se le dijo
 */
export function tocaDistraccion(actual, enBloque, yaAvisado) {
  if (!actual || actual.tipo !== "distraccion" || yaAvisado === actual.nombre) return false;
  return actual.minutos >= (enBloque ? DISTRACCION_MIN.bloque : DISTRACCION_MIN.normal);
}

// ---------- Entrevista sorpresa y reto relámpago ----------
export const PREGUNTAS_ENTREVISTA = 3;
export const SEGUNDOS_RESPUESTA = 120;
/** Una vez al día, pasados 45 minutos de estudio, y nunca en medio de un ejercicio abierto sin resolver. */
export const tocaEntrevista = (dia, ahora, ocupado) => !ocupado && !yaHizo(dia, "entrevista") && ahora - dia.activoDesde >= 45 * MIN && ahora - dia.ultimaActividad < 2 * MIN;
/** Paseando sin hacer nada: 2 minutos en pantallas de paso, con actividad, y no más de un reto cada 40 minutos. */
export const OCIO_MIN = 2;
export const tocaRelampago = (dia, ahora, ocioDesde) => !!ocioDesde && ahora - ocioDesde >= OCIO_MIN * MIN && ahora - dia.ultimaActividad < MIN && (dia.relampagoEn == null || ahora - dia.relampagoEn >= 40 * MIN);
/** Pantallas de paso: listas y portadas, donde no se estudia nada todavía. */
export const esDePaso = (ruta) => /^\/($|aprender$|practicar$|practicar\/lista|progreso|entrevistas$|ingles$|trabajo$|plan$|camino$)/.test(ruta);

// ---------- Veredicto del día ----------
/**
 * Nota del día de A a F, con datos y sin IA.
 * @param {object} p
 * @param {number} p.hechas    tareas de hoy terminadas
 * @param {number} p.tocaban   tareas que tocaban hoy
 * @param {number} p.resueltos ejercicios resueltos hoy
 * @param {number} p.limpios   de esos, cuántos sin 2+ pistas ni solución
 * @param {number} [p.atraso]  días de atraso en el plan
 */
export function notaDelDia({ hechas = 0, tocaban = 0, resueltos = 0, limpios = 0, atraso = 0 }) {
  const cumplido = tocaban > 0 ? Math.min(1, hechas / tocaban) : resueltos > 0 ? Math.min(1, resueltos / 2) : 0;
  const limpieza = resueltos > 0 ? limpios / resueltos : cumplido > 0 ? 1 : 0;
  const puntos = Math.max(0, Math.round(cumplido * 70 + limpieza * 30 - Math.min(3, atraso) * 5));
  const nota = puntos >= 90 ? "A" : puntos >= 75 ? "B" : puntos >= 60 ? "C" : puntos >= 40 ? "D" : "F";
  return { nota, puntos };
}
export const MAX_VEREDICTOS = 60;
export const guardarVeredicto = (lista, v) => [...(lista ?? []).filter((x) => x.fecha !== v.fecha), v].slice(-MAX_VEREDICTOS);

// ---------- Inglés por franja ----------
/** ¿La hora cae en la franja de inglés? (desde incluida, hasta excluida; "apagada" si son iguales) */
export const enFranjaIngles = (hora, franja) => !!franja && franja.desde !== franja.hasta && (franja.desde < franja.hasta ? hora >= franja.desde && hora < franja.hasta : hora >= franja.desde || hora < franja.hasta);

// ---------- Elegir modelo ----------
export const MODELOS = ["haiku", "sonnet", "opus"];
/** Si el que respondió pide un modelo más alto que el suyo, cuál toca (o null). Solo se sube, nunca se baja. */
export const subirA = (pedido, actual) => (MODELOS.indexOf(pedido) > MODELOS.indexOf(actual) ? pedido : null);

// ---------- Moverse por la pantalla ----------
// margen: lo que se separa de los bordes; el dibujo desborda su caja unos 30 px por lado y no debe cortarse
export const FIGURA = { ancho: 96, alto: 108, margen: 52 };
/**
 * Paradas posibles: puntos sobre los bordes derecho e inferior y la esquina de arriba (nunca sobre el
 * menú de la izquierda ni en el centro, donde está lo que lees).
 */
export function paradas(ancho, alto, izquierda = 0) {
  const x1 = ancho - FIGURA.ancho - FIGURA.margen;
  const y1 = alto - FIGURA.alto - FIGURA.margen;
  const x0 = izquierda + FIGURA.margen;
  const lista = [
    { x: x1, y: y1 },
    { x: x1, y: alto * 0.55 },
    { x: x1, y: alto * 0.22 },
    { x: x1, y: 84 },
    { x: x0 + (x1 - x0) * 0.72, y: y1 },
    { x: x0 + (x1 - x0) * 0.45, y: y1 },
    { x: x0 + (x1 - x0) * 0.15, y: y1 },
  ];
  return lista.map((p) => encajar(p, ancho, alto));
}
/** Mantiene un punto dentro de la ventana. */
export const encajar = (p, ancho, alto) => ({
  x: Math.round(Math.min(Math.max(FIGURA.margen, p.x), Math.max(FIGURA.margen, ancho - FIGURA.ancho - FIGURA.margen))),
  y: Math.round(Math.min(Math.max(FIGURA.margen, p.y), Math.max(FIGURA.margen, alto - FIGURA.alto - FIGURA.margen))),
});
/** La siguiente parada: una distinta de la actual, elegida con `azar` (0 a 1). */
export function siguienteParada(lista, actual, azar) {
  const otras = lista.filter((p) => !actual || Math.abs(p.x - actual.x) + Math.abs(p.y - actual.y) > 40);
  return otras[Math.min(otras.length - 1, Math.floor(azar * otras.length))] ?? lista[0];
}
/** Junto a un elemento (su esquina de arriba a la derecha, por fuera si cabe). */
export function juntoA(rect, ancho, alto) {
  const fuera = rect.right + FIGURA.ancho + FIGURA.margen <= ancho;
  return encajar({ x: fuera ? rect.right + 8 : rect.right - FIGURA.ancho - 8, y: rect.top - 10 }, ancho, alto);
}
/** La parada más lejana a un punto (para apartarse de donde escribes). */
export const masLejana = (lista, punto) => lista.reduce((mejor, p) => (Math.hypot(p.x - punto.x, p.y - punto.y) > Math.hypot(mejor.x - punto.x, mejor.y - punto.y) ? p : mejor), lista[0]);

Object.assign(TEXTOS, {
  bloqueInicio: (min) => `Bloque de ${min} minutos. Me quedo en la esquina y no te interrumpo. Empieza.`,
  bloqueFin: (min) => `Terminó el bloque de ${min} minutos. Párate 5 minutos y vuelve.`,
  silencio: (min) => `Silencio ${min} minutos. Si me necesitas, háblame.`,
  sinIa: () => "Para conversar necesito la IA: pon tu contraseña de IA en Ajustes.",
});

// ---------- Recibirte en cada pantalla ----------
/**
 * Una línea sobre qué hacer en esta pantalla según tu plan de hoy (o null). Sin IA.
 * @param {string} ruta
 * @param {{ activo?: boolean, dia?: number, dias?: number, estado?: { tipo: string, dias: number }, hoy?: { tareas: { tipo: string, titulo: string, hecha: boolean }[] } }|null} plan
 */
export function recibimiento(ruta, plan) {
  if (!plan?.activo) return null;
  const pendientes = (tipos) => plan.hoy.tareas.filter((t) => tipos.includes(t.tipo) && !t.hecha);
  const lista = (tipos, uno, varios) => {
    const p = pendientes(tipos);
    return p.length ? `Hoy aquí: ${p.length} ${p.length === 1 ? uno : varios}. Empieza por "${p[0].titulo}".` : "Lo de hoy en esta parte ya está hecho.";
  };
  if (/^\/practicar($|\/lista)/.test(ruta)) return lista(["ejercicio"], "ejercicio", "ejercicios");
  if (/^\/(aprender|camino)$/.test(ruta)) return lista(["teoria", "lecciones", "control"], "tarea", "tareas");
  if (/^\/entrevistas$/.test(ruta)) return lista(["pregunta", "simulacro"], "pregunta", "preguntas");
  if (/^\/ingles$/.test(ruta)) return pendientes(["ingles"]).length ? "Inglés de hoy: 20 minutos. Todavía no los completas." : "Tu inglés de hoy ya está.";
  if (/^\/progreso/.test(ruta)) {
    const e = plan.estado?.tipo;
    return `Día ${plan.dia} de ${plan.dias}. ${e === "atrasado" ? `Vas atrasado ${plan.estado.dias} ${plan.estado.dias === 1 ? "día" : "días"}.` : e === "adelantado" ? "Vas adelantado." : "Vas al día."}`;
  }
  return null;
}

// ---------- Comentarios por su cuenta ----------
/** Cada cuántos minutos comenta algo si no ha dicho nada: más seguido en "encima de mí". */
export const COMENTA_MIN = { normal: 12, encima: 6 };
/** Toca un comentario: estás activo, y hace rato que no dice nada (ni comentario ni otro mensaje). */
export const tocaComentario = (nivel, dia, ahora, ultimoDicho = 0) =>
  ahora - dia.ultimaActividad < 2 * MIN && ahora - Math.max(dia.comentarioEn ?? dia.activoDesde, ultimoDicho) >= (COMENTA_MIN[nivel] ?? COMENTA_MIN.normal) * MIN;
