// Función de Vercel (POST /api/ia): evalúa respuestas con IA. Toda la lógica está en server/ia.js.
// Necesita dos variables secretas en Vercel: ANTHROPIC_API_KEY y DEVPREP_IA_CLAVE (ver docs/ia.md).
// Opcionales, para un invitado: DEVPREP_IA_INVITADO (su código) y ANTHROPIC_API_KEY_INVITADO (su key,
// de un espacio de trabajo con límite de gasto propio).
import Anthropic from "@anthropic-ai/sdk";
import { manejarGet, manejarPost } from "../server/ia.js";

export function GET(request) {
  return manejarGet(process.env, request);
}

// 45 s y un solo reintento: un pedido colgado igual se cobra. Aksu en vivo tiene más margen (la función dura hasta 120 s)
// El invitado usa su propia API key: su gasto tiene el tope de su espacio de trabajo, no toca el tuyo
const crearCliente = (rol, { vivo = false } = {}) =>
  new Anthropic({
    apiKey: rol === "invitado" ? process.env.ANTHROPIC_API_KEY_INVITADO : process.env.ANTHROPIC_API_KEY,
    timeout: vivo ? 100_000 : 45_000,
    maxRetries: 1,
  });

export function POST(request) {
  return manejarPost(request, { env: process.env, crearCliente });
}
