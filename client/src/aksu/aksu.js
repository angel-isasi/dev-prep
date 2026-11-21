// Aksu: su memoria y su voz. Aquí vive el estado (conversación del día, ajustes, libro con lo que
// observa, notas de cada día y los contadores que usan las reglas) y la función que le pide a la IA
// qué decir. La pantalla está en Aksu.jsx y las reglas de cuándo interviene en reglas.js.
import { api } from "../lib/api.js";
import { claveIa, estadoIa, pedirIa, topeIa, ultimoModeloIa, usoIa } from "../lib/ia.js";
import { almacen } from "../lib/visita.js";
import { callarLocal, decirLocal } from "./voz-local.js";
import { callar, decir, dictar, hayVozEn, microDisponible, vocesListas } from "../lib/voz.js";
import { cargarPlan } from "../lib/plan-junior.js";
import {
  anotar, bloqueActivo, BLOQUE_MIN, diaNuevo, enFranjaIngles, enSilencio, guardarVeredicto, marcarHecho, NIVELES, notaDelDia, PREGUNTAS_ENTREVISTA, restanteBloque, subirA, TEXTOS,
} from "./reglas.js";

export const NOMBRE = "Aksu";
const CLAVE = "devprep.aksu";
const CLAVE_VIEJA = "devprep.jarvis";
const MAX_MENSAJES = 60;

const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function leer() {
  let g = null;
  try {
    g = JSON.parse(almacen.getItem(CLAVE) ?? almacen.getItem(CLAVE_VIEJA) ?? "null");
  } catch {
    g = null;
  }
  const fecha = hoyLocal();
  const base = {
    nivel: "normal", voz: false, avisos: false, cuaderno: [], veredictos: [], informe: null, mensajes: [], franjaIngles: null, silencioHasta: 0, bloque: null, vozNombre: "", vozTono: 0.7,
    dia: diaNuevo(fecha, Date.now()),
    ...(g ?? {}),
  };
  if (!NIVELES.includes(base.nivel)) base.nivel = "normal";
  if (!Array.isArray(base.veredictos)) base.veredictos = [];
  // Día nuevo: la conversación y los contadores empiezan de cero; el libro y los ajustes se quedan
  if (base.dia?.fecha !== fecha) {
    base.ayer = { fecha: base.dia?.fecha ?? null, resueltos: base.dia?.resueltos?.length ?? 0, cierre: base.mensajes.findLast?.((m) => m.tipo === "cierre")?.texto ?? null };
    base.dia = diaNuevo(fecha, Date.now());
    base.mensajes = [];
    base.bloque = null;
  }
  return base;
}

// Lo que no se guarda: vive solo mientras la pestaña está abierta
const PASAJERO = { abierto: false, vista: "charla", pensando: false, sinLeer: 0, sesion: null, pantalla: "", ejercicio: null, entrevista: null, oyendo: null, vocesLocales: [], reto: null, marca: null, frente: false, ir: null, uso: null, distraidoCon: null };
let estado = { ...leer(), ...PASAJERO };
const oyentes = new Set();

function guardar() {
  const persistente = Object.fromEntries(Object.entries(estado).filter(([k]) => !(k in PASAJERO)));
  try {
    almacen.setItem(CLAVE, JSON.stringify(persistente));
  } catch {
    // sin espacio: Aksu sigue funcionando, solo no recuerda al recargar
  }
}

/** Cambia el estado y avisa a la pantalla. @param {object | ((e: object) => object)} cambio */
export function cambiar(cambio) {
  const nuevo = typeof cambio === "function" ? cambio(estado) : cambio;
  const tocaGuardar = Object.keys(nuevo).some((k) => !(k in PASAJERO));
  estado = { ...estado, ...nuevo };
  if (tocaGuardar) guardar();
  for (const o of oyentes) o();
}
export const verEstado = () => estado;
export const suscribir = (o) => {
  oyentes.add(o);
  return () => oyentes.delete(o);
};

/** Abre el panel. @param {"charla"|"libro"} [vista] */
export const abrir = (vista = "charla") => cambiar({ abierto: true, vista, sinLeer: 0, frente: false });
export const cerrar = () => cambiar({ abierto: false });

// ---------- ¿Hay IA? ----------
let iaLista = null;
export async function hayIa() {
  if (!claveIa()) return false;
  iaLista ??= estadoIa().then((e) => !!e.configurada, () => false);
  return iaLista;
}

/** Lo gastado este mes, el tope y el modelo que respondió lo último. */
export const gasto = () => ({ usd: usoIa().usd, tope: topeIa(), modelo: (ultimoModeloIa() ?? "").replace(/^claude-|-\d.*$/g, "") });

// ---------- Decir algo ----------
/** Avisos del sistema: sirven cuando la app está en otra pestaña (por ejemplo, estás en VS Code). */
export async function pedirAvisos() {
  if (!("Notification" in globalThis)) return false;
  const permiso = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return permiso === "granted";
}

/** ¿Puede intervenir por su cuenta? En silencio o cuidando un bloque de concentración, no. */
export const puedeSolo = () => !enSilencio(estado, Date.now()) && !bloqueActivo(estado.bloque, Date.now()) && !estado.entrevista;

/**
 * Aksu dice algo: queda en la conversación, suena si la voz está encendida y, si no estás mirando
 * la app, llega como aviso del sistema.
 * @param {{ texto: string, pregunta?: string, destino?: string, tipo?: string, ingles?: boolean, frente?: boolean, ir?: string }} m
 *   frente: se pone delante para que respondas; ir: se acerca a esa parte de la pantalla ("tests"...)
 */
export function hablar(m) {
  const texto = String(m.texto ?? "").trim();
  if (!texto) return;
  const mensaje = { de: "aksu", texto, pregunta: m.pregunta?.trim() || "", destino: m.destino || "", tipo: m.tipo ?? "", en: Date.now() };
  cambiar((e) => ({
    mensajes: [...e.mensajes, mensaje].slice(-MAX_MENSAJES),
    sinLeer: e.abierto ? 0 : e.sinLeer + 1,
    frente: !e.abierto && (m.frente ?? !!mensaje.pregunta),
    ir: m.ir ?? null,
  }));
  const completo = [texto, mensaje.pregunta].filter(Boolean).join(" ");
  const idioma = m.ingles ? "en" : "es";
  // "decir": lo que suena en voz alta cuando no conviene leer el texto entero (una palabra en inglés con su traducción)
  if (estado.voz) enVozAlta(m.decir ?? completo, idioma);
  if (estado.avisos && document.visibilityState !== "visible" && globalThis.Notification?.permission === "granted") {
    try {
      new Notification(NOMBRE, { body: completo.slice(0, 220), tag: "aksu" });
    } catch {
      // algunos navegadores solo permiten avisos desde el service worker: se queda en la app
    }
  }
}
/**
 * Una palabra de inglés con su ejemplo, sacada de las unidades de la app (de intermedio hacia arriba y
 * de inglés para el trabajo). Sin IA. No repite hasta haberlas dicho todas.
 */
const ETAPAS_PALABRA = ["intermedio", "superior", "avanzado", "trabajo"];
export async function palabraDeIngles() {
  const unidades = (await api.inglesUnidades?.().catch(() => null)) ?? [];
  const todas = unidades.filter((u) => ETAPAS_PALABRA.includes(u.etapa)).flatMap((u) => u.palabras ?? []).filter((p) => p.en && p.es && p.ejemplo?.en);
  if (!todas.length) return false;
  const dichas = new Set(estado.palabrasDichas ?? []);
  const nuevas = todas.filter((p) => !dichas.has(p.id));
  const lista = nuevas.length ? nuevas : todas;
  const p = lista[Math.floor(Math.random() * lista.length)];
  cambiar({ palabrasDichas: nuevas.length ? [...dichas, p.id] : [p.id] });
  hablar({
    texto: `"${p.en}"${p.pron ? ` (${p.pron})` : ""}: ${p.es}.`,
    pregunta: `${p.ejemplo.en}${p.ejemplo.es ? ` · ${p.ejemplo.es}` : ""}`,
    tipo: "palabra",
    frente: false,
    ingles: true,
    decir: `${p.en}. ${p.ejemplo.en}`,
  });
  return true;
}

export const silencio = () => {
  callar();
  callarLocal();
};

/** Marca de las voces neuronales en el ajuste vozNombre ("local:es_MX-ald-medium"). */
export const LOCAL = "local:";
/** Carga las voces neuronales de la laptop (si el motor está y las tiene). */
export const cargarVocesLocales = () => api.vocesLocales?.().then((r) => cambiar({ vocesLocales: r?.voces ?? [] }), () => {});
/**
 * Dice algo en voz alta. En español, con la laptop conectada y una voz neuronal instalada, usa esa
 * (salvo que hayas elegido una del navegador); si falla o no hay, la voz del navegador.
 */
function enVozAlta(texto, idioma) {
  const { vozNombre, vozTono, vocesLocales } = estado;
  const delNavegador = () => hayVozEn(idioma) && decir(texto, { idioma, grave: true, voz: vozNombre.startsWith(LOCAL) ? "" : vozNombre, tono: vozTono });
  const quiereLocal = vozNombre.startsWith(LOCAL) || vozNombre === "";
  if (idioma !== "es" || !vocesLocales.length || !quiereLocal) return delNavegador();
  const pedida = vozNombre.slice(LOCAL.length);
  const voz = vocesLocales.includes(pedida) ? pedida : (vocesLocales.find((v) => /davefx/.test(v)) ?? vocesLocales[0]);
  callar();
  decirLocal(texto, { voz, tono: vozTono }).catch(delNavegador);
}
/** Dice una frase de muestra con la voz y el tono elegidos (el botón Probar). */
export const probarVoz = () => vocesListas().then(() => enVozAlta("Soy Aksu. Llevas tres ejercicios hoy y dos los resolviste mirando. Así no vale.", "es"));

// ---------- Hablarle por voz (Ctrl + Espacio) ----------
let sesionVoz = null;
/**
 * Empieza a escucharte; al volver a llamarla (o al callarte) manda lo que dijiste. Sirve con el chat
 * cerrado: lo que vas diciendo se ve junto a la figura y él responde en voz alta.
 */
export function escuchar() {
  if (sesionVoz) return sesionVoz.detener();
  if (!microDisponible()) return hablar({ texto: "Este navegador no permite dictado por voz. Usa Chrome o Edge.", frente: false });
  silencio();
  let dicho = "";
  // Si le hablas, te responde hablando: la voz queda encendida
  cambiar({ oyendo: "", voz: true });
  const ingles = enFranjaIngles(new Date().getHours(), estado.franjaIngles);
  sesionVoz = dictar({
    lang: ingles ? "en-US" : "es-PE",
    alTexto: (t) => {
      dicho = `${dicho} ${t}`.trim();
      cambiar({ oyendo: dicho });
    },
    alTerminar: () => {
      sesionVoz = null;
      cambiar({ oyendo: null });
      if (dicho) decirle(dicho);
    },
  });
}

// ---------- Silencio y bloque de concentración ----------
export function silenciar(minutos = 30) {
  callar();
  cambiar({ silencioHasta: Date.now() + minutos * 60_000 });
  hablar({ texto: TEXTOS.silencio(minutos), frente: false });
}
export const quitarSilencio = () => cambiar({ silencioHasta: 0 });
export function iniciarBloque(minutos = BLOQUE_MIN) {
  cambiar({ bloque: { inicio: Date.now(), minutos }, distraidoCon: null, abierto: false });
  hablar({ texto: TEXTOS.bloqueInicio(minutos), frente: false });
}
export function terminarBloque(cumplido = false) {
  const b = estado.bloque;
  if (!b) return;
  cambiar({ bloque: null });
  if (cumplido) hablar({ texto: TEXTOS.bloqueFin(b.minutos), tipo: "bloque", frente: false });
}

// ---------- Lo que Aksu sabe de ti ahora ----------
let planGuardado = { en: 0, plan: null };
export async function planActual() {
  if (Date.now() - planGuardado.en < 60_000) return planGuardado.plan;
  const plan = await cargarPlan().catch(() => null);
  planGuardado = { en: Date.now(), plan };
  return plan;
}
/** Tras resolver algo, el plan se vuelve a leer en el siguiente pedido. */
export const olvidarPlan = () => {
  planGuardado = { en: 0, plan: null };
};

const PANTALLAS = [
  [/^\/$/, "Hoy (inicio)"],
  [/^\/plan/, "Su plan junior"],
  [/^\/aprender\/.+/, "La teoría de un tema"],
  [/^\/aprender/, "Aprender (lista de temas)"],
  [/^\/leccion/, "Una lección de preguntas"],
  [/^\/practicar\/ia/, "Entrena con IA"],
  [/^\/practicar\/lista/, "Lista de ejercicios"],
  [/^\/practicar\/.+/, "Un ejercicio"],
  [/^\/practicar/, "Practicar"],
  [/^\/entrevistas/, "Entrevistas"],
  [/^\/ingles/, "Inglés"],
  [/^\/trabajo/, "Buscar trabajo"],
  [/^\/progreso/, "Progreso"],
];
export const nombrePantalla = (ruta) => PANTALLAS.find(([re]) => re.test(ruta))?.[1] ?? ruta;

/** "2 h 10 min", "40 min". */
export const duracion = (segundos) => {
  const m = Math.round(segundos / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
};

/** Días que faltan para tu fecha meta (null si no hay). */
export async function diasParaMeta() {
  const config = await api.config?.().catch(() => null);
  if (!config?.fechaMeta) return null;
  return Math.ceil((new Date(`${config.fechaMeta}T12:00:00`).getTime() - Date.now()) / 86_400_000);
}

function usoEnTexto(uso) {
  if (!uso?.activo) return "";
  const lineas = [];
  if (uso.actual) lineas.push(`En su laptop tiene delante ahora: ${uso.actual.nombre} (${uso.actual.minutos} min seguidos).`);
  if (uso.hoy?.lista?.length) {
    lineas.push(`Su tiempo de hoy en la laptop: ${uso.hoy.lista.slice(0, 6).map((x) => `${x.nombre} ${duracion(x.segundos)}`).join(", ")}. Estudio: ${duracion(uso.hoy.estudio)}. Distracciones: ${duracion(uso.hoy.distraccion)}.`);
  }
  if (uso.mejoresHoras?.length) lineas.push(`Las horas en que más estudia: ${uso.mejoresHoras.map((h) => `${h}:00`).join(", ")}.`);
  return lineas.join("\n");
}

async function contexto() {
  const e = estado;
  const [plan, meta] = await Promise.all([planActual(), diasParaMeta()]);
  const ahora = new Date();
  const ej = e.ejercicio;
  const s = e.sesion;
  const ultima = s?.guardadas.at(-1);
  const g = gasto();
  const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate() - ahora.getDate() + 1;
  return [
    `Hora: ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, "0")}. Pantalla abierta: ${nombrePantalla(e.pantalla)}.`,
    `Presupuesto de IA: van ${g.usd.toFixed(2)} de ${g.tope} USD este mes y quedan ${diasMes} días del mes.`,
    meta !== null ? (meta >= 0 ? `Faltan ${meta} días para su fecha meta de postular.` : `Su fecha meta de postular pasó hace ${-meta} días.`) : "",
    plan?.activo ? plan.texto : "Todavía no empezó su plan junior de 15 días (puede empezarlo en Hoy).",
    ej
      ? [
          `Ejercicio abierto: "${ej.titulo}" (nivel ${ej.nivel} de 3, estado: ${ej.estado}).`,
          `Enunciado: ${String(ej.enunciado ?? "").replace(/\s+/g, " ").slice(0, 700)}`,
          s ? `Lleva ${Math.floor((Date.now() - s.inicio) / 60_000)} min en él y ${s.guardadas.length} guardadas.` : "",
          ultima ? (ultima.fallan.length ? `En la última guardada fallan: ${ultima.fallan.slice(0, 6).join("; ")}.` : "En la última guardada pasan todos los tests.") : "",
          `Pistas vistas: ${ej.pistas?.length ?? 0} de ${ej.totalPistas ?? 0}.`,
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    usoEnTexto(e.uso),
    bloqueActivo(e.bloque, Date.now()) ? `Está en un bloque de concentración: le quedan ${Math.ceil(restanteBloque(e.bloque, Date.now()) / 60_000)} min.` : "",
    `Hoy resolvió ${e.dia.resueltos.length} ejercicios.`,
    e.ayer?.fecha ? `Ayer (${e.ayer.fecha}) resolvió ${e.ayer.resueltos}.${e.ayer.cierre ? ` Tu cierre de ayer: ${e.ayer.cierre}` : ""}` : "",
    e.veredictos.length ? `Las notas que le pusiste a sus últimos días: ${e.veredictos.slice(-7).map((v) => `${v.fecha.slice(5)} ${v.nota}`).join(", ")}.` : "",
    e.cuaderno.length ? `Tu libro (lo que has observado de él):\n${e.cuaderno.slice(-12).map((n) => `- ${n.texto}`).join("\n")}` : "Tu libro está vacío: recién lo conoces.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

const historial = () =>
  estado.mensajes
    .slice(-8)
    .map((m) => ({ de: m.de === "yo" ? "yo" : "jarvis", texto: [m.texto, m.pregunta].filter(Boolean).join(" ") }));

/** Tu archivo del ejercicio abierto (solo con la laptop conectada). */
async function codigoActual() {
  const id = estado.ejercicio?.id;
  if (!id || !api.miCodigo) return "";
  return (await api.miCodigo(id).catch(() => null))?.codigo ?? "";
}

let enCurso = false;
/**
 * Le pide a la IA qué decir y lo dice. Siempre lee primero el modelo rápido, con todo el contexto y el
 * presupuesto, y él decide si responde o si lo pasa a uno de más criterio (reglas.js: subirA).
 * @param {object} p
 * @param {string} [p.momento]   qué acaba de pasar (lo escriben las reglas)
 * @param {string} [p.pregunta]  lo que tú le dijiste
 * @param {string} [p.tipo]      etiqueta del mensaje ("cierre", "arranque"...)
 * @param {boolean} [p.ingles]
 * @param {boolean} [p.solo]     interviene por su cuenta: se calla si pediste silencio o estás en un bloque
 * @param {string} [p.ir]        parte de la pantalla a la que se acerca al decirlo
 * @param {boolean} [p.frente]   se pone delante
 * @returns {Promise<object|null>}
 */
export async function pensar({ momento = "", pregunta = "", tipo = "", ingles = false, solo = false, ir, frente } = {}) {
  if (solo && !puedeSolo()) return null;
  if (enCurso && !pregunta) return null; // no se pisa a sí mismo; lo que tú preguntas siempre pasa
  if (!(await hayIa())) {
    if (pregunta) hablar({ texto: TEXTOS.sinIa(), destino: "ajustes" });
    return null;
  }
  enCurso = true;
  cambiar({ pensando: true });
  const enIngles = ingles || enFranjaIngles(new Date().getHours(), estado.franjaIngles);
  try {
    const [datos, codigo] = await Promise.all([contexto(), codigoActual()]);
    const pedido = { datos, momento, pregunta, historial: historial(), ...(codigo ? { codigo } : {}), ...(enIngles ? { ingles: true } : {}) };
    let r = await pedirIa({ tarea: "aksu", ...pedido });
    // Él eligió: si pidió un modelo de más criterio, responde ese (como mucho dos saltos: sonnet y opus)
    let nivel = "haiku";
    for (let salto = 0; salto < 2; salto++) {
      const sube = subirA(r?.modelo, nivel);
      if (!sube) break;
      nivel = sube;
      r = (await pedirIa({ tarea: `aksu-${sube}`, ...pedido, elegido: true }).catch(() => null)) ?? r;
    }
    if (!r?.mensaje) return null;
    if (r.nota) cambiar((e) => ({ cuaderno: anotar(e.cuaderno, r.nota, e.dia.fecha) }));
    hablar({ texto: r.mensaje, pregunta: r.pregunta, destino: r.destino, tipo, ingles: enIngles, ir, frente });
    return r;
  } catch (e) {
    if (pregunta) hablar({ texto: e.message ?? "No pude responder. Inténtalo otra vez." });
    return null;
  } finally {
    enCurso = false;
    cambiar({ pensando: false });
  }
}

// ---------- Entrevista sorpresa: 3 preguntas con reloj ----------
export function iniciarEntrevista() {
  cambiar((e) => ({ dia: marcarHecho(e.dia, "entrevista"), entrevista: { n: 1, turno: Date.now(), lista: false }, abierto: true, vista: "charla", sinLeer: 0 }));
  return pensar({
    tipo: "entrevista",
    momento: `Entrevista sorpresa: pregunta 1 de ${PREGUNTAS_ENTREVISTA}. Avísale en una frase que es una entrevista sorpresa de ${PREGUNTAS_ENTREVISTA} preguntas con 2 minutos cada una, y haz la primera en "pregunta".`,
  }).then((r) => {
    if (!r) return cambiar({ entrevista: null });
    cambiar((e) => (e.entrevista ? { entrevista: { ...e.entrevista, turno: Date.now(), lista: true } } : {}));
  });
}
function responderEntrevista(texto) {
  const { n, turno } = estado.entrevista;
  const segundos = Math.round((Date.now() - turno) / 1000);
  const ultima = n >= PREGUNTAS_ENTREVISTA;
  cambiar({ entrevista: ultima ? null : { n: n + 1, turno: Date.now(), lista: false } });
  return pensar({
    pregunta: texto,
    tipo: "entrevista",
    momento: ultima
      ? `Entrevista sorpresa: respondió la última pregunta (${n} de ${PREGUNTAS_ENTREVISTA}) en ${segundos} segundos. Evalúa en una frase y da el veredicto de la entrevista completa. No hagas más preguntas.`
      : `Entrevista sorpresa: respondió la pregunta ${n} de ${PREGUNTAS_ENTREVISTA} en ${segundos} segundos. Evalúa en una frase seca y haz la pregunta ${n + 1} de ${PREGUNTAS_ENTREVISTA} en "pregunta".`,
  }).then(() => cambiar((e) => (e.entrevista ? { entrevista: { ...e.entrevista, turno: Date.now(), lista: true } } : {})));
}

// ---------- Veredicto del día ----------
/** Calcula la nota de hoy (sin IA), la guarda y le pide a la IA que la explique. */
export async function cerrarDia() {
  const plan = await planActual();
  const d = estado.dia;
  const limpios = d.resueltos.filter((r) => !r.solucion && r.pistas < 2).length;
  const v = notaDelDia({
    hechas: plan?.activo ? plan.hoy.hechas : 0,
    tocaban: plan?.activo ? plan.hoy.total : 0,
    resueltos: d.resueltos.length,
    limpios,
    atraso: plan?.activo && plan.estado?.tipo === "atrasado" ? plan.estado.dias : 0,
  });
  cambiar((e) => ({ veredictos: guardarVeredicto(e.veredictos, { fecha: d.fecha, ...v }), dia: marcarHecho(e.dia, "cierre") }));
  return pensar({
    tipo: "cierre",
    momento: `Cierre y veredicto del día. Su nota de hoy es ${v.nota} (${v.puntos} de 100): ${plan?.activo ? `hizo ${plan.hoy.hechas} de ${plan.hoy.total} tareas del plan, ` : ""}resolvió ${d.resueltos.length} ejercicios y ${limpios} fueron limpios (sin 2 o más pistas ni solución). Dile la nota tal cual, por qué, qué toca mañana y déjale una pregunta para pensar.`,
  });
}

/** Tú le dices algo. Entiende dos órdenes sin gastar IA: "silencio 30" y "bloque 50". */
export function decirle(texto) {
  const limpio = String(texto ?? "").trim();
  if (!limpio) return;
  cambiar((e) => ({ mensajes: [...e.mensajes, { de: "yo", texto: limpio, en: Date.now() }].slice(-MAX_MENSAJES) }));
  const orden = limpio.toLowerCase().match(/^(silencio|c[aá]llate|bloque|conc[eé]ntrame|modo guardia)\D*(\d{1,3})?/);
  if (orden && limpio.length < 40) {
    const minutos = Math.min(180, Number(orden[2]) || 0);
    return /^(silencio|c[aá]llate)/.test(orden[1]) ? silenciar(minutos || 30) : iniciarBloque(minutos || BLOQUE_MIN);
  }
  if (estado.entrevista) return responderEntrevista(limpio);
  const ultimo = estado.mensajes.findLast?.((m) => m.de !== "yo");
  return pensar({ pregunta: limpio, momento: ultimo?.pregunta ? "Está respondiendo a la pregunta que le hiciste: evalúa su respuesta." : "" });
}

/** A dónde lleva cada destino que puede elegir la IA. */
export function rutaDe(destino) {
  const id = estado.ejercicio?.id;
  return (
    {
      plan: "/plan",
      hoy: "/",
      aprender: "/aprender",
      lecciones: "/camino",
      practicar: "/practicar",
      pistas: id ? `/practicar/${id}` : "/practicar",
      entrevistas: "/entrevistas",
      simulacro: "/entrevistas?pestana=simular",
      "entrevista-voz": "/entrevistas?pestana=simular&practica=voz",
      examen: "/entrevistas?pestana=simular&practica=examen",
      defensa: "/entrevistas?pestana=simular&practica=proyecto",
      sueldo: "/entrevistas?pestana=simular&practica=sueldo",
      pitch: "/entrevistas?pestana=estudiar&ver=pitch",
      ingles: "/ingles",
      conversa: "/ingles/conversa",
      "ingles-ia": "/ingles/ia",
      "entrena-ia": "/practicar/ia",
      tarjetas: "/tarjetas",
      referencia: "/referencia",
      glosario: "/glosario",
      trabajo: "/trabajo",
      ajustes: "/ajustes",
    }[destino] ?? null
  );
}
export const NOMBRE_DESTINO = {
  plan: "Ver mi plan", hoy: "Ir a Hoy", aprender: "Ir a Aprender", lecciones: "Ir a Lecciones", practicar: "Ir a Practicar", pistas: "Ver las pistas",
  entrevistas: "Ir a Entrevistas", simulacro: "Abrir el simulacro", "entrevista-voz": "Abrir la entrevista por voz", examen: "Abrir el examen", defensa: "Defender mi proyecto",
  sueldo: "Negociar el sueldo", pitch: "Abrir Pitch y STAR", ingles: "Ir a Inglés", conversa: "Abrir Conversa", "ingles-ia": "Abrir Inglés con IA", "entrena-ia": "Abrir Entrena con IA",
  tarjetas: "Ir a Tarjetas", referencia: "Abrir la Referencia", glosario: "Abrir el Glosario", trabajo: "Ir a Buscar trabajo", ajustes: "Ir a Ajustes",
};
