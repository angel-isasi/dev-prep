// Voz en inglés del propio dispositivo (speechSynthesis): funciona sin internet si el sistema
// tiene una voz en inglés instalada. Si no hay ninguna, los botones de audio no aparecen.
import { useEffect, useState } from "react";
// Las preferencias de voz se guardan en `almacen`: en modo visita vive en memoria y no toca el navegador real
import { almacen } from "./visita.js";

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

/** hayVoz() que se vuelve a evaluar cuando llegan las voces (si no, la pantalla puede decir que no hay voz). */
export function useHayVoz() {
  const [conVoz, setConVoz] = useState(hayVoz);
  useEffect(() => {
    const sintesis = globalThis.speechSynthesis;
    if (!sintesis?.addEventListener) return;
    const alCambiar = () => setConVoz(hayVoz());
    sintesis.addEventListener("voiceschanged", alCambiar);
    alCambiar();
    return () => sintesis.removeEventListener("voiceschanged", alCambiar);
  }, []);
  return conVoz;
}

let yaEspero = false;
/**
 * Espera a que el navegador entregue sus voces (Chrome las carga tarde, sobre todo al abrir la app
 * directo en una pantalla). Como mucho `tope` ms y una sola vez: en un dispositivo sin voces no
 * se vuelve a esperar. Sirve para decidir algo una sola vez, por ejemplo armar una lección.
 * @param {number} [tope]
 * @returns {Promise<void>}
 */
export function vocesListas(tope = 1000) {
  const sintesis = globalThis.speechSynthesis;
  if (yaEspero || !sintesis?.addEventListener || voces().length) return Promise.resolve();
  yaEspero = true;
  return new Promise((resolver) => {
    const listo = () => {
      clearTimeout(reloj);
      sintesis.removeEventListener("voiceschanged", listo);
      voces();
      resolver();
    };
    const reloj = setTimeout(listo, tope);
    sintesis.addEventListener("voiceschanged", listo);
  });
}

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

export const velocidad = () => (almacen.getItem(CLAVE_VELOCIDAD) === "lento" ? "lento" : "normal");
export const cambiarVelocidad = (valor) => almacen.setItem(CLAVE_VELOCIDAD, valor);

/**
 * Lee un texto en inglés. Corta lo que se estaba leyendo.
 * @param {string} texto
 * @param {{ lento?: boolean, alTerminar?: () => void }} [opciones]
 */
export function hablar(texto, opciones = {}) {
  serie++; // cualquier lectura nueva corta el diálogo que estuviera sonando
  leer(texto, opciones);
}

// Cada diálogo (varias frases seguidas) tiene su número: si empieza otra lectura o se calla la voz,
// el número cambia y el diálogo viejo no sigue con su siguiente frase.
let serie = 0;

function leer(texto, { lento, alTerminar } = {}) {
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

/** La mejor voz en español de América que tenga el dispositivo (para el entrevistador). */
function vozEspanol() {
  const lista = voces().filter((v) => /^es[-_]/i.test(v.lang));
  const america = lista.filter((v) => /es[-_](PE|MX|US|419|CO|CL|AR)/i.test(v.lang));
  return america.find((v) => /google|natural|neural|dalia|paulina|sabina/i.test(v.name)) ?? america[0] ?? lista[0] ?? null;
}

/** ¿Hay una voz para leer en ese idioma? ("es" o "en") */
export const hayVozEn = (idioma) => !!globalThis.speechSynthesis && !!(idioma === "en" ? vozIngles() : vozEspanol());

/**
 * Dice un texto en español o en inglés y avisa al terminar (el entrevistador por voz). Avisa una
 * sola vez, también si no hay voz o si el navegador nunca dispara el final (pasa con textos largos).
 * @param {string} texto
 * @param {{ idioma?: "es"|"en", alTerminar?: () => void }} [opciones]
 * @returns {() => void} cancelar: calla y no avisa
 */
export function decir(texto, { idioma = "es", alTerminar } = {}) {
  const sintesis = globalThis.speechSynthesis;
  const voz = idioma === "en" ? vozIngles() : vozEspanol();
  let pendiente = true;
  let reloj = null;
  const terminar = () => {
    if (!pendiente) return;
    pendiente = false;
    clearTimeout(reloj);
    alTerminar?.();
  };
  if (!sintesis || !voz || !texto) {
    reloj = setTimeout(terminar, 0);
    return () => (pendiente = false);
  }
  sintesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.voice = voz;
  frase.lang = voz.lang;
  frase.rate = 1;
  frase.onend = terminar;
  frase.onerror = terminar;
  // Tope por si el final nunca llega: unas 2,5 palabras por segundo, más un margen
  reloj = setTimeout(terminar, 4000 + texto.split(/\s+/).length * 600);
  sintesis.speak(frase);
  return () => {
    pendiente = false;
    clearTimeout(reloj);
    sintesis.cancel();
  };
}

/** Lee varias frases seguidas (un diálogo). */
export function hablarVarias(textos) {
  const mia = ++serie;
  const seguir = ([primero, ...resto]) => {
    if (!primero || mia !== serie) return;
    leer(primero, { alTerminar: () => setTimeout(() => seguir(resto), 250) });
  };
  seguir(textos);
}

/** Calla la voz y corta el diálogo que estuviera en curso. */
export const callar = () => {
  serie++;
  globalThis.speechSynthesis?.cancel();
};

// --- Reconocimiento de voz (ejercicios de hablar) ---
// Usa el reconocimiento del navegador (Chrome y Edge). Ojo: en Chrome necesita internet, porque
// la voz se procesa en los servidores de Google. Sin internet el ejercicio se puede saltar.
const Reconocedor = () => globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition ?? null;
const CLAVE_MICRO = "devprep-hablar";

/** ¿Este navegador puede escucharte? (y no lo apagaste en Inglés) */
export const hayMicrofono = () => !!Reconocedor() && almacen.getItem(CLAVE_MICRO) !== "no";
export const microApagado = () => almacen.getItem(CLAVE_MICRO) === "no";
export const cambiarMicro = (activo) => almacen.setItem(CLAVE_MICRO, activo ? "si" : "no");
export const microDisponible = () => !!Reconocedor();

/**
 * Escucha una frase en inglés.
 * @returns {{ promesa: Promise<string[]>, detener: () => void }} las transcripciones posibles
 */
export function escucharVoz() {
  const Clase = Reconocedor();
  if (!Clase) return { promesa: Promise.reject(new Error("Este navegador no reconoce voz")), detener: () => {} };
  const r = new Clase();
  r.lang = "en-US";
  r.interimResults = false;
  r.maxAlternatives = 5;
  const promesa = new Promise((resolver, rechazar) => {
    let listo = false;
    r.onresult = (e) => {
      listo = true;
      resolver(Array.from(e.results[0] ?? []).map((a) => a.transcript));
    };
    r.onerror = (e) => {
      listo = true;
      rechazar(new Error(e.error === "network" ? "Hablar necesita internet en este navegador" : e.error === "not-allowed" ? "Permite el micrófono para hablar" : "No te escuché bien"));
    };
    r.onend = () => {
      if (!listo) rechazar(new Error("No te escuché: habla un poco más fuerte"));
    };
  });
  r.start();
  return { promesa, detener: () => r.stop() };
}

/**
 * Dictado largo (respuestas de entrevista): escucha sin cortarse en las pausas hasta que llames a
 * detener(), y va entregando el texto reconocido.
 * @param {{ lang?: string, alTexto: (texto: string) => void, alTerminar?: (error?: Error) => void }} opciones
 * @returns {{ detener: () => void } | null}  null si el navegador no reconoce voz
 */
export function dictar({ lang = "es-PE", alTexto, alTerminar }) {
  const Clase = Reconocedor();
  if (!Clase) return null;
  const r = new Clase();
  r.lang = lang;
  r.continuous = true;
  r.interimResults = false;
  r.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) alTexto(e.results[i][0].transcript.trim());
  };
  r.onerror = (e) =>
    alTerminar?.(new Error(e.error === "network" ? "Dictar necesita internet en este navegador" : e.error === "not-allowed" ? "Permite el micrófono para dictar" : "No te escuché bien"));
  r.onend = () => alTerminar?.();
  r.start();
  return { detener: () => r.stop() };
}
