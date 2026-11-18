import { useSyncExternalStore } from "react";

/** Color de la barra del sistema (celular) y de la ventana de la app instalada, por tema. */
const COLOR_BARRA = { oscuro: "#07070a", claro: "#f6f6f8" };

// El tema vive en <html data-tema>. Varios componentes lo leen a la vez (barra lateral,
// buscador, ajustes), así que comparten un solo valor y se avisan entre sí al cambiar.
const oyentes = new Set();
const leer = () => document.documentElement.dataset.tema ?? "oscuro";

function aplicar(tema) {
  document.documentElement.dataset.tema = tema;
  localStorage.setItem("tema", tema);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLOR_BARRA[tema] ?? COLOR_BARRA.oscuro);
  for (const oyente of oyentes) oyente();
}

// Al cargar: la barra del sistema toma el color del tema guardado
document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLOR_BARRA[leer()] ?? COLOR_BARRA.oscuro);

function suscribir(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Cambia entre claro y oscuro desde cualquier parte, sin necesitar el hook. */
export const alternarTema = () => aplicar(leer() === "oscuro" ? "claro" : "oscuro");

/** Tema claro/oscuro guardado en el navegador. */
export function useTema() {
  const tema = useSyncExternalStore(suscribir, leer);
  return { tema, alternar: alternarTema };
}
