// Jarvis: su memoria y su voz. Aquí vive el estado (conversación del día, ajustes, cuaderno y los
// contadores que usan las reglas) y la función que le pide a la IA qué decir. La pantalla está en
// Jarvis.jsx y las reglas de cuándo interviene en reglas.js.
import { api } from "../lib/api.js";
import { claveIa, estadoIa, pedirIa } from "../lib/ia.js";
import { almacen } from "../lib/visita.js";
import { callar, decir, hayVozEn } from "../lib/voz.js";
import { cargarPlan } from "../lib/plan-junior.js";
import { anotar, diaNuevo, NIVELES, TEXTOS } from "./reglas.js";

const CLAVE = "devprep.jarvis";
const MAX_MENSAJES = 60;

const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function leer() {
  let g = null;
  try {
    g = JSON.parse(almacen.getItem(CLAVE) ?? "null");
  } catch {
    g = null;
  }
  const fecha = hoyLocal();
  const base = { nivel: "normal", voz: false, avisos: false, cuaderno: [], informe: null, mensajes: [], dia: diaNuevo(fecha, Date.now()), ...(g ?? {}) };
  if (!NIVELES.includes(base.nivel)) base.nivel = "normal";
  // Día nuevo: la conversación y los contadores empiezan de cero; el cuaderno y los ajustes se quedan
  if (base.dia?.fecha !== fecha) {
    base.ayer = { fecha: base.dia?.fecha ?? null, resueltos: base.dia?.resueltos?.length ?? 0, cierre: base.mensajes.findLast?.((m) => m.tipo === "cierre")?.texto ?? null };
    base.dia = diaNuevo(fecha, Date.now());
    base.mensajes = [];
  }
  return base;
}

let estado = { ...leer(), abierto: false, pensando: false, sinLeer: 0, sesion: null, pantalla: "", ejercicio: null };
const oyentes = new Set();

function guardar() {
  const { abierto: _a, pensando: _p, sinLeer: _s, sesion: _se, pantalla: _pa, ejercicio: _e, ...persistente } = estado;
  try {
    almacen.setItem(CLAVE, JSON.stringify(persistente));
  } catch {
    // sin espacio: Jarvis sigue funcionando, solo no recuerda al recargar
  }
}

/** Cambia el estado y avisa a la pantalla. @param {object | ((e: object) => object)} cambio */
export function cambiar(cambio) {
  estado = { ...estado, ...(typeof cambio === "function" ? cambio(estado) : cambio) };
  guardar();
  for (const o of oyentes) o();
}
export const verEstado = () => estado;
export const suscribir = (o) => {
  oyentes.add(o);
  return () => oyentes.delete(o);
};

export const abrir = () => cambiar({ abierto: true, sinLeer: 0 });
export const cerrar = () => cambiar({ abierto: false });

// ---------- ¿Hay IA? ----------
let iaLista = null;
export async function hayIa() {
  if (!claveIa()) return false;
  iaLista ??= estadoIa().then((e) => !!e.configurada, () => false);
  return iaLista;
}

// ---------- Decir algo ----------
/** Avisos del sistema: sirven cuando la app está en otra pestaña (por ejemplo, estás en VS Code). */
export async function pedirAvisos() {
  if (!("Notification" in globalThis)) return false;
  const permiso = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return permiso === "granted";
}

/**
 * Jarvis dice algo: queda en la conversación, suena si la voz está encendida y, si no estás mirando
 * la app, llega como aviso del sistema.
 * @param {{ texto: string, pregunta?: string, destino?: string, tipo?: string, ingles?: boolean }} m
 */
export function hablar(m) {
  const texto = String(m.texto ?? "").trim();
  if (!texto) return;
  const mensaje = { de: "jarvis", texto, pregunta: m.pregunta?.trim() || "", destino: m.destino || "", tipo: m.tipo ?? "", en: Date.now() };
  cambiar((e) => ({ mensajes: [...e.mensajes, mensaje].slice(-MAX_MENSAJES), sinLeer: e.abierto ? 0 : e.sinLeer + 1 }));
  const completo = [texto, mensaje.pregunta].filter(Boolean).join(" ");
  const idioma = m.ingles ? "en" : "es";
  if (estado.voz && hayVozEn(idioma)) decir(completo, { idioma });
  if (estado.avisos && document.visibilityState !== "visible" && globalThis.Notification?.permission === "granted") {
    try {
      new Notification("Jarvis", { body: completo.slice(0, 220), tag: "jarvis" });
    } catch {
      // algunos navegadores solo permiten avisos desde el service worker: se queda en la burbuja
    }
  }
}
export const silencio = () => callar();

// ---------- Lo que Jarvis sabe de ti ahora ----------
let planGuardado = { en: 0, plan: null };
async function planActual() {
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

async function contexto() {
  const e = estado;
  const plan = await planActual();
  const ahora = new Date();
  const ej = e.ejercicio;
  const s = e.sesion;
  const ultima = s?.guardadas.at(-1);
  return [
    `Hora: ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, "0")}. Pantalla abierta: ${nombrePantalla(e.pantalla)}.`,
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
    `Hoy resolvió ${e.dia.resueltos.length} ejercicios.`,
    e.ayer?.fecha ? `Ayer (${e.ayer.fecha}) resolvió ${e.ayer.resueltos}.${e.ayer.cierre ? ` Tu cierre de ayer: ${e.ayer.cierre}` : ""}` : "",
    e.cuaderno.length ? `Tu cuaderno (lo que has observado de él):\n${e.cuaderno.slice(-12).map((n) => `- ${n.texto}`).join("\n")}` : "Tu cuaderno está vacío: recién lo conoces.",
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
 * Le pide a la IA qué decir y lo dice.
 * @param {object} p
 * @param {string} [p.momento]   qué acaba de pasar (lo escriben las reglas)
 * @param {string} [p.pregunta]  lo que tú le dijiste
 * @param {boolean} [p.pro]      usar el modelo de más criterio
 * @param {boolean} [p.conCodigo] mandarle tu archivo
 * @param {string} [p.tipo]      etiqueta del mensaje ("cierre", "arranque"...)
 * @param {boolean} [p.ingles]
 * @returns {Promise<object|null>}
 */
export async function pensar({ momento = "", pregunta = "", pro = false, conCodigo = false, tipo = "", ingles = false } = {}) {
  if (enCurso && !pregunta) return null; // no se pisa a sí mismo; lo que tú preguntas siempre pasa
  if (!(await hayIa())) {
    if (pregunta) hablar({ texto: TEXTOS.sinIa(), destino: "ajustes" });
    return null;
  }
  enCurso = true;
  cambiar({ pensando: true });
  try {
    const previo = historial();
    const datos = await contexto();
    const codigo = conCodigo ? await codigoActual() : "";
    const pedido = { datos, momento, pregunta, historial: previo, ...(ingles ? { ingles: true } : {}) };
    let r = await pedirIa({ tarea: pro ? "jarvis-pro" : "jarvis", ...pedido, ...(codigo ? { codigo } : {}) });
    // El modelo barato reconoce cuándo hace falta más criterio: se repite con el otro y con tu código
    if (!pro && r?.profundo) {
      const tuyo = codigo || (await codigoActual());
      r = (await pedirIa({ tarea: "jarvis-pro", ...pedido, ...(tuyo ? { codigo: tuyo } : {}) }).catch(() => null)) ?? r;
    }
    if (!r?.mensaje) return null;
    if (r.nota) cambiar((e) => ({ cuaderno: anotar(e.cuaderno, r.nota, e.dia.fecha) }));
    hablar({ texto: r.mensaje, pregunta: r.pregunta, destino: r.destino, tipo, ingles });
    return r;
  } catch (e) {
    if (pregunta) hablar({ texto: e.message ?? "No pude responder. Inténtalo otra vez." });
    return null;
  } finally {
    enCurso = false;
    cambiar({ pensando: false });
  }
}

/** Tú le dices algo. Si te había hecho una pregunta, tu respuesta la evalúa el modelo de más criterio. */
export function decirle(texto) {
  const limpio = String(texto ?? "").trim();
  if (!limpio) return;
  const ultimo = estado.mensajes.findLast?.((m) => m.de === "jarvis");
  const respondeAPregunta = !!ultimo?.pregunta;
  cambiar((e) => ({ mensajes: [...e.mensajes, { de: "yo", texto: limpio, en: Date.now() }].slice(-MAX_MENSAJES) }));
  return pensar({ pregunta: limpio, pro: respondeAPregunta, conCodigo: respondeAPregunta && !!estado.ejercicio, momento: respondeAPregunta ? "Está respondiendo a la pregunta que le hiciste: evalúa su respuesta." : "" });
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
