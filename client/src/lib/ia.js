// Evaluación con IA desde la app: habla con la función de Vercel (/api/ia), nunca con la IA directo.
// La API key vive solo en Vercel; aquí solo se guarda tu contraseña de la función, en este navegador.
const CLAVE = "devprep.iaClave";

export const claveIa = () => localStorage.getItem(CLAVE) ?? "";
export const guardarClaveIa = (clave) => (clave ? localStorage.setItem(CLAVE, clave) : localStorage.removeItem(CLAVE));

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
 * @param {object} pedido  { tarea: "entrevista"|"ingles", pregunta, respuesta, ... } (ver server/ia.js)
 * @returns {Promise<object>} el resultado de la IA
 */
export async function pedirIa(pedido) {
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
  return datos.resultado;
}
