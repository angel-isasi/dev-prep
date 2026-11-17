// Voz en inglés del propio dispositivo (speechSynthesis): funciona sin internet si el sistema
// tiene una voz en inglés instalada. Si no hay ninguna, los botones de audio no aparecen.
import { useEffect, useState } from "react";

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

// --- Reconocimiento de voz (ejercicios de hablar) ---
// Usa el reconocimiento del navegador (Chrome y Edge). Ojo: en Chrome necesita internet, porque
// la voz se procesa en los servidores de Google. Sin internet el ejercicio se puede saltar.
const Reconocedor = () => globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition ?? null;
const CLAVE_MICRO = "devprep-hablar";

/** ¿Este navegador puede escucharte? (y no lo apagaste en Inglés) */
export const hayMicrofono = () => !!Reconocedor() && localStorage.getItem(CLAVE_MICRO) !== "no";
export const microApagado = () => localStorage.getItem(CLAVE_MICRO) === "no";
export const cambiarMicro = (activo) => localStorage.setItem(CLAVE_MICRO, activo ? "si" : "no");
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
