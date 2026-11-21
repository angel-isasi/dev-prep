// La voz neuronal de Aksu: el motor de la laptop genera el audio (server/voz.js) y aquí se
// reproduce. Reproducirlo un poco más lento lo vuelve más grave de forma natural (como una cinta
// a menos velocidad), y dos filtros le dan cuerpo y le quitan brillo.
import { api } from "../lib/api.js";

let contexto = null;
let fuente = null;
let turno = 0;

/** Corta lo que esté sonando. */
export function callarLocal() {
  turno++;
  try {
    fuente?.stop();
  } catch {
    // ya había terminado
  }
  fuente = null;
}

/** Del tono elegido en el panel (1, 0.7, 0.4, 0.1) a la velocidad de reproducción. */
export const velocidadDe = (tono) => (tono >= 1 ? 1 : tono >= 0.7 ? 0.9 : tono >= 0.4 ? 0.82 : 0.74);

/**
 * Dice un texto con la voz neuronal. Rechaza si el motor no está o no tiene voces (quien llama
 * usa entonces la voz del navegador).
 * @param {string} texto
 * @param {{ voz?: string, tono?: number }} [opciones]
 */
export async function decirLocal(texto, { voz = "", tono = 0.7 } = {}) {
  if (!api.audioDeVoz) throw new Error("Sin motor");
  const mio = ++turno;
  const datos = await api.audioDeVoz(texto, voz);
  contexto ??= new AudioContext();
  if (contexto.state === "suspended") await contexto.resume();
  const audio = await contexto.decodeAudioData(datos);
  if (mio !== turno) return; // mientras se generaba, llegó otra frase o lo callaron
  try {
    fuente?.stop();
  } catch {
    // nada sonando
  }
  const velocidad = velocidadDe(tono);
  const f = contexto.createBufferSource();
  f.buffer = audio;
  f.playbackRate.value = velocidad;
  const graves = contexto.createBiquadFilter();
  graves.type = "lowshelf";
  graves.frequency.value = 220;
  graves.gain.value = velocidad < 1 ? 5 : 0;
  const agudos = contexto.createBiquadFilter();
  agudos.type = "lowpass";
  agudos.frequency.value = velocidad < 0.85 ? 5200 : 9000;
  f.connect(graves).connect(agudos).connect(contexto.destination);
  f.start();
  fuente = f;
}
