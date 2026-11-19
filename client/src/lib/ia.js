// Evaluación con IA desde la app: habla con la función de Vercel (/api/ia), nunca con la IA directo.
// La API key vive solo en Vercel; aquí solo se guarda tu contraseña de la función, en este navegador.
// También lleva la cuenta de lo que gastaste este mes (en este navegador) y frena al llegar a tu tope.
import { costoUsd } from "../../../server/ia-precios.js";

const CLAVE = "devprep.iaClave";
const CLAVE_USO = "devprep.iaUso";
const CLAVE_TOPE = "devprep.iaTope";
/** Tope mensual por defecto, en dólares. Se cambia desde el panel de la IA. */
export const TOPE_POR_DEFECTO = 20;

export const claveIa = () => localStorage.getItem(CLAVE) ?? "";
export const guardarClaveIa = (clave) => (clave ? localStorage.setItem(CLAVE, clave) : localStorage.removeItem(CLAVE));

const mesActual = () => new Date().toISOString().slice(0, 7);

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

export function topeIa() {
  const valor = Number(localStorage.getItem(CLAVE_TOPE));
  return valor > 0 ? valor : TOPE_POR_DEFECTO;
}
export const guardarTopeIa = (usd) => (usd > 0 ? localStorage.setItem(CLAVE_TOPE, String(usd)) : localStorage.removeItem(CLAVE_TOPE));

let estado = null;
/** ¿La IA está lista en el servidor? (en la laptop sin internet, o sin configurar, es false) */
export function estadoIa() {
  estado ??= fetch("/api/ia", { headers: { accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : { configurada: false }))
    .then((d) => ({ configurada: d?.configurada === true }))
    .catch(() => ({ configurada: false }));
  return estado;
}

/**
 * Pide una evaluación.
 * @param {object} pedido  { tarea: "entrevista"|"informe"|"ingles", ... } (ver server/ia.js)
 * @returns {Promise<object>} el resultado de la IA
 */
export async function pedirIa(pedido) {
  if (usoIa().usd >= topeIa()) throw new Error(`Llegaste a tu tope de IA de este mes (${topeIa()} USD). Puedes subirlo en "Uso de IA".`);
  const r = await fetch("/api/ia", {
    method: "POST",
    headers: { "content-type": "application/json", "x-clave": claveIa() },
    body: JSON.stringify(pedido),
  });
  const datos = await r.json().catch(() => ({}));
  if (r.status === 401) {
    guardarClaveIa("");
    throw Object.assign(new Error("La contraseña de IA no es correcta"), { clave: true });
  }
  if (r.status === 503) throw new Error("La IA todavía no está configurada en Vercel");
  if (!r.ok) throw new Error(datos.error ?? "No se pudo evaluar. Inténtalo otra vez.");
  if (datos.uso) registrarUso(datos.uso);
  return datos.resultado;
}
