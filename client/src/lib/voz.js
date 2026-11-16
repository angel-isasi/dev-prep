// Voz en inglés del propio dispositivo (speechSynthesis): funciona sin internet si el sistema
// tiene una voz en inglés instalada. Si no hay ninguna, los botones de audio no aparecen.
const CLAVE_VELOCIDAD = "devprep-voz-velocidad";
export const VELOCIDADES = { lento: 0.72, normal: 0.95 };

let vocesCargadas = null;
function voces() {
  const sintesis = globalThis.speechSynthesis;
  if (!sintesis) return [];
  const lista = sintesis.getVoices();
  if (lista.length) vocesCargadas = lista;
  return vocesCargadas ?? lista;
}
// Chrome carga las voces tarde: las pide de nuevo cuando avisa.
globalThis.speechSynthesis?.addEventListener?.("voiceschanged", () => voces());

/** La mejor voz en inglés de Estados Unidos que tenga el dispositivo. */
function vozIngles() {
  const lista = voces().filter((v) => /^en[-_]/i.test(v.lang));
  return (
    lista.find((v) => /en[-_]US/i.test(v.lang) && /google|natural|neural|aria|jenny|samantha/i.test(v.name)) ??
    lista.find((v) => /en[-_]US/i.test(v.lang)) ??
    lista[0] ??
    null
  );
}

export const hayVoz = () => !!globalThis.speechSynthesis && voces().some((v) => /^en[-_]/i.test(v.lang));

export const velocidad = () => (localStorage.getItem(CLAVE_VELOCIDAD) === "lento" ? "lento" : "normal");
export const cambiarVelocidad = (valor) => localStorage.setItem(CLAVE_VELOCIDAD, valor);

/**
 * Lee un texto en inglés. Corta lo que se estaba leyendo.
 * @param {string} texto
 * @param {{ lento?: boolean, alTerminar?: () => void }} [opciones]
 */
export function hablar(texto, { lento, alTerminar } = {}) {
  const sintesis = globalThis.speechSynthesis;
  if (!sintesis || !texto) return;
  sintesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  const voz = vozIngles();
  if (voz) frase.voice = voz;
  frase.lang = voz?.lang ?? "en-US";
  frase.rate = VELOCIDADES[lento ? "lento" : velocidad()];
  if (alTerminar) frase.onend = alTerminar;
  sintesis.speak(frase);
}

/** Lee varias frases seguidas (un diálogo). */
export function hablarVarias(textos) {
  const [primero, ...resto] = textos;
  if (!primero) return;
  hablar(primero, { alTerminar: () => setTimeout(() => hablarVarias(resto), 250) });
}

export const callar = () => globalThis.speechSynthesis?.cancel();
