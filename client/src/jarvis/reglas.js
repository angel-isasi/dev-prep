// Jarvis: CUÁNDO interviene. Funciones puras (reglas.test.js), sin IA: decidir el momento es gratis;
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
  normal: ["arranque", "trabado", "tiempo", "resuelto", "pausa", "inactivo", "frena", "pregunta", "cierre", "informe"],
  encima: ["arranque", "trabado", "tiempo", "resuelto", "pausa", "inactivo", "frena", "pregunta", "cierre", "informe", "test", "guardar", "sorpresa", "ingles"],
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

// ---------- Cuaderno: lo que Jarvis observa de ti ----------
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
