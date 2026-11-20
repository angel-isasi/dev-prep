// Carga perezosa de pantallas: el código de cada página se descarga recién cuando se abre,
// en vez de venir todo junto en un solo archivo. Con la app instalada (PWA) esos trozos ya
// están guardados, así que sin internet abre igual.
import { lazy } from "react";

const CLAVE = "devprep-recarga-trozo";

/** Borra la copia guardada de la app (no tu progreso, que vive en otro lado) y su service worker. */
async function descartarCopiaGuardada() {
  try {
    const registros = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(registros.map((r) => r.unregister()));
    const nombres = (await globalThis.caches?.keys?.()) ?? [];
    await Promise.all(nombres.map((n) => caches.delete(n)));
  } catch {
    // si no se puede, igual se recarga
  }
}

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
      // 1.er fallo: se recarga para traer la versión actual.
      // 2.º fallo: la copia guardada está mal; se descarta entera y se recarga desde internet.
      // 3.er fallo: se muestra el error (sin internet, por ejemplo), para no recargar sin fin.
      const intentos = Number(sessionStorage.getItem(CLAVE)) || 0;
      if (intentos < 2) {
        sessionStorage.setItem(CLAVE, String(intentos + 1));
        if (intentos === 1) await descartarCopiaGuardada();
        location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
