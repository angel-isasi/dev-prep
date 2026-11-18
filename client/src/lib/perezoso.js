// Carga perezosa de pantallas: el código de cada página se descarga recién cuando se abre,
// en vez de venir todo junto en un solo archivo. Con la app instalada (PWA) esos trozos ya
// están guardados, así que sin internet abre igual.
import { lazy } from "react";

const CLAVE = "devprep-recarga-trozo";

/**
 * @param {() => Promise<Record<string, unknown>>} cargar por ejemplo () => import("./pages/Inicio.jsx")
 * @param {string} nombre nombre con que la página se exporta en ese archivo
 */
export function perezoso(cargar, nombre) {
  return lazy(async () => {
    try {
      const modulo = await cargar();
      sessionStorage.removeItem(CLAVE);
      return { default: modulo[nombre] };
    } catch (error) {
      // Tras publicar una versión nueva, una pestaña vieja puede pedir un trozo que ya no existe.
      // Se recarga una sola vez para traer la versión actual; si vuelve a fallar, se muestra el error.
      if (!sessionStorage.getItem(CLAVE)) {
        sessionStorage.setItem(CLAVE, "1");
        location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
