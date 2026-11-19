// Función de Vercel (POST /api/ia): evalúa respuestas con IA. Toda la lógica está en server/ia.js.
// Necesita dos variables secretas en Vercel: ANTHROPIC_API_KEY y DEVPREP_IA_CLAVE (ver docs/ia.md).
import Anthropic from "@anthropic-ai/sdk";
import { manejarGet, manejarPost } from "../server/ia.js";

export function GET() {
  return manejarGet(process.env);
}

// 45 s y un solo reintento: la función de Vercel se corta a los 60 s y un pedido colgado igual se cobra
const crearCliente = () => new Anthropic({ timeout: 45_000, maxRetries: 1 });

export function POST(request) {
  return manejarPost(request, { env: process.env, crearCliente });
}
