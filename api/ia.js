// Función de Vercel (POST /api/ia): evalúa respuestas con IA. Toda la lógica está en server/ia.js.
// Necesita dos variables secretas en Vercel: ANTHROPIC_API_KEY y DEVPREP_IA_CLAVE (ver docs/ia.md).
// Opcionales, para un invitado: DEVPREP_IA_INVITADO (su código) y ANTHROPIC_API_KEY_INVITADO (su key,
// de un espacio de trabajo con límite de gasto propio).
import Anthropic from "@anthropic-ai/sdk";
import { manejarGet, manejarPost } from "../server/ia.js";

export function GET(request) {
  return manejarGet(process.env, request);
}

// Sin reintentos escondidos: un segundo intento se cobraba aunque la app ya se hubiera rendido y no lo anotara.
// Tiempos: 55 s normal (la app espera 65), 110 s para el CV de una oferta y Aksu en vivo (la función dura hasta 120 s)
// El invitado usa su propia API key: su gasto tiene el tope de su espacio de trabajo, no toca el tuyo
const crearCliente = (rol, { vivo = false, largo = false } = {}) =>
  new Anthropic({
    apiKey: rol === "invitado" ? process.env.ANTHROPIC_API_KEY_INVITADO : process.env.ANTHROPIC_API_KEY,
    timeout: vivo || largo ? 110_000 : 55_000,
    maxRetries: 0,
  });

export function POST(request) {
  return manejarPost(request, { env: process.env, crearCliente });
}
