// Modo inmersión: la INTERFAZ de la app en inglés (menús, títulos, pestañas, botones), sin IA y
// sin tocar cada componente. El contenido de estudio sigue en español.
//
// Cómo funciona:
//  1. `traducir(texto)` es una función pura: busca el texto exacto en el diccionario
//     (lib/inmersion-diccionario.js) y, si no está, prueba reglas simples (números, "Prefijo: resto",
//     partes separadas por " · ", flechas y signos al final). Si no sabe, devuelve null.
//  2. Con el modo activo, un MutationObserver mira el <body>: cada vez que React pinta o cambia
//     un texto, se reemplaza el nodo de texto por su traducción (y los atributos placeholder,
//     aria-label y title). Solo se cambia el valor del nodo: no se mueven ni se borran nodos,
//     así React no se entera.
//  3. Se guarda el original de cada nodo (WeakMap) para volver al español al apagarlo, sin recargar.
//
// No se traduce: textarea, inputs, contenido editable, código (pre, code) y todo lo que esté dentro
// de un elemento con `data-sin-inmersion` (el Markdown del contenido de estudio lo lleva).
import { useSyncExternalStore } from "react";
import { DICCIONARIO, PLANTILLAS } from "./inmersion-diccionario.js";

const CLAVE = "inmersion";
const ATRIBUTOS = ["placeholder", "aria-label", "title"];
// [lang] marca texto en otro idioma (el inglés que se estudia) y [class*=traduccion] su traducción
const IGNORAR =
  "pre, code, textarea, script, style, kbd, [contenteditable]:not([contenteditable='false']), [data-sin-inmersion], [lang]:not(html), [class*='traduccion']";
const EN_OTRO_IDIOMA = ":scope > [lang]:not(html)";
const NUMERO = /\d+(?:[.,]\d+)?/g;

// ---------- Traducción (pura) ----------

function porPlantilla(texto, plantillas) {
  if (!/\d/.test(texto)) return null;
  const numeros = texto.match(NUMERO);
  const plantilla = plantillas[texto.replace(NUMERO, "{n}")];
  if (!plantilla) return null;
  let i = 0;
  return plantilla.replace(/\{n\}/g, () => numeros[i++] ?? "");
}

const DIAS = { lunes: "Monday", martes: "Tuesday", miércoles: "Wednesday", jueves: "Thursday", viernes: "Friday", sábado: "Saturday", domingo: "Sunday" };
const MESES = {
  enero: "January", febrero: "February", marzo: "March", abril: "April", mayo: "May", junio: "June",
  julio: "July", agosto: "August", septiembre: "September", setiembre: "September", octubre: "October", noviembre: "November", diciembre: "December",
};

/** Fechas como "Viernes, 20 de noviembre" o "20 de noviembre de 2026" → "Friday, November 20". */
function porFecha(texto) {
  const m = texto.match(/^(?:(\p{L}+),?\s+)?(\d{1,2}) de (\p{L}+)(?: de (\d{4}))?$/u);
  if (!m) return null;
  const dia = m[1] && DIAS[m[1].toLowerCase()];
  const mes = MESES[m[3].toLowerCase()];
  if (!mes || (m[1] && !dia)) return null;
  return `${dia ? `${dia}, ` : ""}${mes} ${m[2]}${m[4] ? `, ${m[4]}` : ""}`;
}

function nucleo(texto, dic, plantillas, profundidad = 0) {
  if (Object.hasOwn(dic, texto)) return dic[texto];
  const plantilla = porPlantilla(texto, plantillas);
  if (plantilla != null) return plantilla;
  const fecha = porFecha(texto);
  if (fecha != null) return fecha;
  if (profundidad > 2) return null;
  const sub = (t) => nucleo(t, dic, plantillas, profundidad + 1);

  // Decoraciones a los lados: "← Volver", "+ Agregar", "Siguiente →", "Tema:", "Cargando..."
  const deco = texto.match(/^([←+✓·•]\s*)?(.*?)(\s*[→↗]|[:.…!?]+)?$/s);
  if (deco && (deco[1] || deco[3]) && deco[2]) {
    const medio = sub(deco[2]);
    if (medio != null) return (deco[1] ?? "") + medio + (deco[3] ?? "");
  }

  // Partes separadas por " · ": se traduce si todas las partes se entienden (o son números)
  if (texto.includes(" · ")) {
    const partes = texto.split(" · ");
    const traducidas = partes.map((p) => (/^[\d\s%/.,+-]*$/.test(p) ? p : sub(p)));
    if (traducidas.every((p) => p != null)) return traducidas.join(" · ");
  }

  // "Prefijo: resto" (por ejemplo "Repasa: Agrupar por propiedad"): se traduce el prefijo y el
  // resto queda igual, porque suele ser contenido (el título de un ejercicio o de una lección).
  const dos = texto.match(/^([^:]{1,40}):\s(.+)$/s);
  if (dos) {
    const prefijo = sub(dos[1]);
    if (prefijo != null) return `${prefijo}: ${sub(dos[2]) ?? dos[2]}`;
  }

  // Un número delante o detrás de un texto conocido: "390 ejercicios", "0/43 unidades", "Nivel 3"
  const delante = texto.match(/^([+-]?\d[\d.,/%]*)\s+(.+)$/s);
  if (delante) {
    const resto = sub(delante[2]);
    if (resto != null) return `${delante[1]} ${resto}`;
  }
  const detras = texto.match(/^(.+?)\s+([+-]?\d[\d.,/%]*)$/s);
  if (detras) {
    const resto = sub(detras[1]);
    if (resto != null) return `${resto} ${detras[2]}`;
  }

  return null;
}

/**
 * Traduce un texto de interfaz al inglés. Respeta los espacios de los lados.
 * @returns {string | null} la traducción, o null si no está en el diccionario
 */
export function traducir(texto, dic = DICCIONARIO, plantillas = PLANTILLAS) {
  if (typeof texto !== "string") return null;
  const m = texto.match(/^(\s*)(.*?)(\s*)$/s);
  const limpio = m[2].replace(/\s+/g, " ");
  if (!limpio || !/\p{L}/u.test(limpio)) return null;
  const t = nucleo(limpio, dic, plantillas);
  return t == null ? null : m[1] + t + m[3];
}

// ---------- Aplicarlo al DOM ----------

/** original y traducción de cada nodo de texto que cambiamos */
const textos = new WeakMap();
/** por elemento: { atributo: { original, traducido } } */
const atributos = new WeakMap();
let observador = null;

// Un texto junto a otro en inglés (<strong lang="en">word</strong> = palabra) es su significado:
// contenido de estudio, no interfaz.
const EN_LINEA = new Set(["SMALL", "EM", "SPAN", "I"]);
const juntoAlIngles = (el) =>
  Boolean(el.querySelector(EN_OTRO_IDIOMA) || (EN_LINEA.has(el.tagName) && el.parentElement?.querySelector(EN_OTRO_IDIOMA)));
const ignorado = (elemento) => !elemento || Boolean(elemento.closest(IGNORAR)) || juntoAlIngles(elemento);

function procesarTexto(nodo) {
  const valor = nodo.nodeValue;
  const previo = textos.get(nodo);
  if (previo && valor === previo.traducido) return; // ya es nuestra traducción
  if (ignorado(nodo.parentElement)) return;
  const t = traducir(valor);
  if (t == null || t === valor) {
    if (previo) textos.delete(nodo);
    return;
  }
  textos.set(nodo, { original: valor, traducido: t });
  nodo.nodeValue = t;
}

function procesarAtributo(elemento, nombre) {
  const valor = elemento.getAttribute(nombre);
  if (valor == null) return;
  const guardados = atributos.get(elemento) ?? {};
  if (guardados[nombre]?.traducido === valor) return;
  if (elemento.closest("[data-sin-inmersion], [contenteditable]:not([contenteditable='false'])")) return;
  const t = traducir(valor);
  if (t == null || t === valor) return;
  guardados[nombre] = { original: valor, traducido: t };
  atributos.set(elemento, guardados);
  elemento.setAttribute(nombre, t);
}

const SELECTOR_ATRIBUTOS = ATRIBUTOS.map((a) => `[${a}]`).join(",");

function procesarArbol(raiz) {
  if (raiz.nodeType === Node.TEXT_NODE) return procesarTexto(raiz);
  if (raiz.nodeType !== Node.ELEMENT_NODE) return;
  if (raiz.closest(IGNORAR)) return;
  const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = caminante.nextNode(); n; n = caminante.nextNode()) procesarTexto(n);
  const conAtributos = raiz.matches(SELECTOR_ATRIBUTOS) ? [raiz, ...raiz.querySelectorAll(SELECTOR_ATRIBUTOS)] : raiz.querySelectorAll(SELECTOR_ATRIBUTOS);
  for (const el of conAtributos) for (const a of ATRIBUTOS) if (el.hasAttribute(a)) procesarAtributo(el, a);
}

function alMutar(registros) {
  for (const r of registros) {
    if (r.type === "characterData") procesarTexto(r.target);
    else if (r.type === "attributes") procesarAtributo(r.target, r.attributeName);
    else for (const n of r.addedNodes) procesarArbol(n);
  }
  // Lo que queda en la cola son nuestros propios cambios: se descartan para no entrar en bucle
  observador?.takeRecords();
}

/** Aplica el modo al documento y empieza a mirar los cambios. */
export function aplicarInmersion(raiz = document.body) {
  if (observador) return;
  procesarArbol(raiz);
  observador = new MutationObserver(alMutar);
  observador.observe(raiz, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
}

/** Deja de traducir y devuelve cada texto cambiado a su original en español. */
export function quitarInmersion(raiz = document.body) {
  observador?.disconnect();
  observador = null;
  const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = caminante.nextNode(); n; n = caminante.nextNode()) {
    const previo = textos.get(n);
    if (previo && n.nodeValue === previo.traducido) n.nodeValue = previo.original;
    textos.delete(n);
  }
  for (const el of raiz.querySelectorAll(SELECTOR_ATRIBUTOS)) {
    const guardados = atributos.get(el);
    if (!guardados) continue;
    for (const [a, { original, traducido }] of Object.entries(guardados)) if (el.getAttribute(a) === traducido) el.setAttribute(a, original);
    atributos.delete(el);
  }
}

// ---------- Estado (guardado en el navegador) ----------

const oyentes = new Set();
const leerGuardado = () => {
  try {
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
};
let activo = typeof window !== "undefined" && leerGuardado();

/** ¿Está activo el modo inmersión? */
export const inmersionActiva = () => activo;

function aplicarEstado() {
  document.documentElement.lang = activo ? "en" : "es";
  if (activo) aplicarInmersion();
  else quitarInmersion();
}

/** Prende o apaga el modo y lo recuerda en este navegador. */
export function ponerInmersion(valor) {
  activo = Boolean(valor);
  try {
    localStorage.setItem(CLAVE, activo ? "1" : "0");
  } catch {
    // sin almacenamiento (modo privado): dura hasta cerrar la pestaña
  }
  aplicarEstado();
  for (const o of oyentes) o();
}

/** Al abrir la app: si quedó activo, se aplica desde el primer render. */
export function iniciarInmersion() {
  if (activo) aplicarEstado();
}

function suscribir(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Hook: si el modo está activo (para el interruptor y para textos que se parten en palabras). */
export function useInmersion() {
  return useSyncExternalStore(suscribir, inmersionActiva, () => false);
}

/** Hook: el texto ya traducido si el modo está activo (para componentes que parten el texto). */
export function useTraducido(texto) {
  const on = useInmersion();
  return on && typeof texto === "string" ? (traducir(texto) ?? texto) : texto;
}
