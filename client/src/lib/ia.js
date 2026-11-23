// Evaluación con IA desde la app: habla con la función de Vercel (/api/ia), nunca con la IA directo.
// La API key vive solo en Vercel; aquí solo se guarda tu contraseña de la función, en este navegador.
// También lleva la cuenta de lo que gastaste este mes (en este navegador) y frena al llegar a tu tope.
import { costoUsd } from "../../../server/ia-precios.js";

const CLAVE = "devprep.iaClave";
const CLAVE_USO = "devprep.iaUso";
const CLAVE_TOPE = "devprep.iaTope";
/** Tope mensual por defecto, en dólares. Se cambia desde el panel de la IA. */
export const TOPE_POR_DEFECTO = 40;

export const claveIa = () => localStorage.getItem(CLAVE) ?? "";
export const guardarClaveIa = (clave) => (clave ? localStorage.setItem(CLAVE, clave) : localStorage.removeItem(CLAVE));

// Mes en hora local: con toISOString (UTC) la cuenta se reiniciaba el último día del mes a las 7 p. m. de Perú
const mesActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

/** Lo gastado este mes en este navegador: { mes, pedidos, usd }. Al cambiar el mes vuelve a cero. */
export function usoIa() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_USO) ?? "null");
    if (guardado?.mes === mesActual()) return { mes: guardado.mes, pedidos: Number(guardado.pedidos) || 0, usd: Number(guardado.usd) || 0 };
  } catch {
    // un valor dañado se trata como "sin uso"
  }
  return { mes: mesActual(), pedidos: 0, usd: 0 };
}

/** Suma un pedido a la cuenta del mes. @param {{ modelo?: string, entrada?: number, salida?: number }} uso */
export function registrarUso(uso) {
  const actual = usoIa();
  const nuevo = { mes: actual.mes, pedidos: actual.pedidos + 1, usd: actual.usd + costoUsd(uso) };
  localStorage.setItem(CLAVE_USO, JSON.stringify(nuevo));
  return nuevo;
}

const CLAVE_REGISTRO = "devprep.iaRegistro";
const MAX_REGISTRO = 60;

/** Los últimos pedidos, del más nuevo al más viejo: { fecha, tarea, modelo, usd }. Así se sabe en qué se gastó. */
export function registroIa() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_REGISTRO) ?? "[]");
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

/** Anota un pedido en el registro (solo los últimos 60). */
export function anotarPedido(tarea, uso, fecha = new Date()) {
  const fila = { fecha: fecha.toISOString(), tarea: String(tarea ?? ""), modelo: (uso?.modelo ?? "").replace(/^claude-|-\d.*$/g, ""), usd: costoUsd(uso) };
  localStorage.setItem(CLAVE_REGISTRO, JSON.stringify([fila, ...registroIa()].slice(0, MAX_REGISTRO)));
  return fila;
}

export function topeIa() {
  const valor = Number(localStorage.getItem(CLAVE_TOPE));
  return valor > 0 ? valor : TOPE_POR_DEFECTO;
}
export const guardarTopeIa = (usd) => (usd > 0 ? localStorage.setItem(CLAVE_TOPE, String(usd)) : localStorage.removeItem(CLAVE_TOPE));

/** El modelo que respondió el último pedido (lo muestra Aksu). */
let ultimo = null;
export const ultimoModeloIa = () => ultimo;

let estado = null;
/** ¿La IA está lista en el servidor? (en la laptop sin internet, o sin configurar, es false) */
export function estadoIa() {
  estado ??= fetch("/api/ia", { headers: { accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : { configurada: false }))
    .then((d) => ({ configurada: d?.configurada === true }))
    .catch(() => {
      // Sin red no se guarda la respuesta: al volver la conexión se pregunta otra vez
      estado = null;
      return { configurada: false };
    });
  return estado;
}

/**
 * ¿Quién eres para la IA? Con tu contraseña: { rol: "dueno", invitado: { codigo } | null }; con el
 * código de invitado: { rol: "invitado" }. Sin contraseña guardada o sin internet: { rol: null }.
 */
let quien = null; // { clave, promesa }: se pregunta una vez por contraseña, no en cada pantalla
export function quienSoyIa() {
  const clave = claveIa();
  if (!clave) return Promise.resolve({ rol: null });
  if (quien?.clave === clave) return quien.promesa;
  const promesa = fetch("/api/ia", { headers: { accept: "application/json", "x-clave": clave } })
    .then(async (r) => {
      const d = r.ok ? await r.json() : {};
      return { rol: d.rol ?? null, invitado: d.invitado ?? null };
    })
    .catch(() => ({ rol: null }))
    .then((res) => {
      if (!res.rol) quien = null; // sin red o rechazada: se vuelve a preguntar la próxima vez
      return res;
    });
  quien = { clave, promesa };
  return promesa;
}

/**
 * Pide una evaluación.
 * @param {object} pedido  { tarea: "entrevista"|"informe"|"ingles", ... } (ver server/ia.js)
 * @returns {Promise<object>} el resultado de la IA
 */
export async function pedirIa(pedido) {
  // Lo mismo dos veces no se cobra dos veces: una evaluación igual a una reciente se devuelve guardada
  const huella = SIN_GUARDAR.test(pedido.tarea) ? null : JSON.stringify(pedido);
  const repetido = huella && leerGuardadas()[huella];
  if (repetido) return repetido;
  if (usoIa().usd >= topeIa()) throw new Error(`Llegaste a tu tope de IA de este mes (${topeIa()} USD). Puedes subirlo en "Uso de IA".`);
  // Memoria del tutor: lo que la app sabe de ti viaja con el pedido
  const perfil = await import("./perfil-tutor.js").then((m) => m.perfilTutor()).catch(() => "");
  const r = await fetch("/api/ia", {
    method: "POST",
    headers: { "content-type": "application/json", "x-clave": claveIa() },
    body: JSON.stringify(perfil ? { ...pedido, perfil } : pedido),
    // El CV de una oferta escribe mucho: se le da más tiempo (la función de Vercel espera hasta 120 s)
    signal: AbortSignal.timeout(pedido.tarea === "cv-oferta" ? 118_000 : 65_000),
  }).catch((e) => {
    throw new Error(e?.name === "TimeoutError" ? "La IA tardó demasiado. Inténtalo otra vez." : "Sin conexión: la IA necesita internet.");
  });
  const datos = await r.json().catch(() => ({}));
  if (r.status === 401) {
    guardarClaveIa("");
    throw Object.assign(new Error("La contraseña de IA no es correcta"), { clave: true });
  }
  if (r.status === 503) throw new Error("La IA todavía no está configurada en Vercel");
  // El gasto se anota también cuando la respuesta no sirvió (cortada o mal formada): ese pedido igual se cobró
  if (datos.uso) {
    registrarUso(datos.uso);
    anotarPedido(pedido.tarea, datos.uso);
    ultimo = datos.uso.modelo ?? null;
  }
  if (!r.ok) throw new Error(datos.error ?? "No se pudo evaluar. Inténtalo otra vez.");
  if (huella) guardarRespuesta(huella, datos.resultado);
  anotarHerramienta();
  return datos.resultado;
}

// Tareas que deben salir distintas cada vez (crean algo nuevo o siguen una charla): nunca se guardan
const SIN_GUARDAR = /crear$|^jarvis|^aksu|^mentor$|^variante$|^conversacion$|^plan-semana$|^tarjeta-|^defensa$|^negociacion$|^reunion$|^entrevista-en$|^cv-oferta$/;
const CLAVE_GUARDADAS = "devprep.iaGuardadas";
const MAX_GUARDADAS = 40;

function leerGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_GUARDADAS) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function guardarRespuesta(huella, resultado) {
  const todas = Object.entries(leerGuardadas()).slice(-(MAX_GUARDADAS - 1));
  try {
    localStorage.setItem(CLAVE_GUARDADAS, JSON.stringify(Object.fromEntries([...todas, [huella, resultado]])));
  } catch {
    // sin espacio: se borra la memoria de respuestas y se sigue
    localStorage.removeItem(CLAVE_GUARDADAS);
  }
}

// --- Uso por herramienta: qué días la usaste y cuántos pedidos (lo muestran los tableros de IA) ---
const CLAVE_HERRAMIENTAS = "devprep.iaHerramientas";
let herramientaActual = null;
/** La pantalla dice qué herramienta está abierta; los pedidos que salgan se anotan a su nombre. */
export const abrirHerramientaIa = (id) => {
  herramientaActual = id;
};
const leerHerramientas = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_HERRAMIENTAS) ?? "{}") ?? {};
  } catch {
    return {};
  }
};
function anotarHerramienta() {
  if (!herramientaActual) return;
  const hoy = new Date();
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  const todas = leerHerramientas();
  const h = todas[herramientaActual] ?? { pedidos: 0, dias: [] };
  todas[herramientaActual] = { pedidos: h.pedidos + 1, dias: [...new Set([...h.dias, fecha])].slice(-400), ultima: fecha };
  try {
    localStorage.setItem(CLAVE_HERRAMIENTAS, JSON.stringify(todas));
  } catch {
    // sin espacio: es solo un dato informativo
  }
}
/** @returns {{ pedidos: number, dias: number, ultima: string|null }} */
export function usoHerramienta(id) {
  const h = leerHerramientas()[id];
  return { pedidos: h?.pedidos ?? 0, dias: h?.dias?.length ?? 0, ultima: h?.ultima ?? null };
}
