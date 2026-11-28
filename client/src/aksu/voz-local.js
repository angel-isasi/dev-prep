// La voz neuronal de Aksu: el motor de la laptop genera el audio (server/voz.js) y aquí se
// reproduce. Reproducirlo un poco más lento lo vuelve más grave de forma natural (como una cinta
// a menos velocidad), y dos filtros le dan cuerpo y le quitan brillo.
import { api } from "../lib/api.js";
import { audioWeb } from "./voz-web.js";

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
 * Genera el audio de un texto con la voz neuronal, sin reproducirlo (así se prepara la frase siguiente
 * mientras suena la actual). Rechaza si el motor no está o no tiene voces.
 * @param {string} texto
 * @param {{ voz?: string, enWeb?: boolean }} [opciones]  enWeb: la voz está guardada en este dispositivo y
 *   el audio se calcula aquí mismo (voz-web.js), sin la laptop
 * @returns {Promise<AudioBuffer>}
 */
export async function generarLocal(texto, { voz = "", enWeb = false } = {}) {
  if (!enWeb && !api.audioDeVoz) throw new Error("Sin motor");
  contexto ??= new AudioContext();
  if (contexto.state === "suspended") contexto.resume().catch(() => {});
  if (enWeb) {
    const { pcm, frecuencia } = await audioWeb(texto, voz);
    const audio = contexto.createBuffer(1, pcm.length, frecuencia);
    audio.copyToChannel(pcm, 0);
    return audio;
  }
  return contexto.decodeAudioData(await api.audioDeVoz(texto, voz));
}

/**
 * Reproduce un audio ya generado (corta lo que esté sonando). Termina cuando acaba de sonar o lo callan.
 * @param {AudioBuffer} audio
 * @param {number} [tono]
 * @returns {Promise<void>}
 */
export function reproducirLocal(audio, tono = 0.7) {
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
  const termina = new Promise((listo) => {
    f.onended = () => listo();
  });
  f.start();
  fuente = f;
  return termina;
}

/**
 * Dice un texto con la voz neuronal. Rechaza si el motor no está o no tiene voces (quien llama
 * usa entonces la voz del navegador).
 * @param {string} texto
 * @param {{ voz?: string, tono?: number, enWeb?: boolean }} [opciones]
 */
export async function decirLocal(texto, { voz = "", tono = 0.7, enWeb = false } = {}) {
  const mio = ++turno;
  const audio = await generarLocal(texto, { voz, enWeb });
  if (mio !== turno) return; // mientras se generaba, llegó otra frase o lo callaron
  reproducirLocal(audio, tono);
}
