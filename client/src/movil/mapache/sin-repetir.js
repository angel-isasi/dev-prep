// Que Map no repita lo que dice. Este dispositivo recuerda qué frases ya mostró, por grupo (las de
// cada estado, la charla, los sueños, la expresión del día), y cada grupo se ordena así:
//   1. primero las que todavía no viste (en un orden que cambia cada día);
//   2. después las vistas, de la que salió hace más tiempo a la más reciente.
// Así una frase no vuelve hasta que pasaron las demás de su grupo; cuando ya viste todas, vuelve la
// más antigua (es como reiniciar, pero sin que salga justo la última que viste).
// La frase del día se fija la primera vez que se pide en el día: si recargas, sigue siendo la misma.
// Se guarda en localStorage (no se sincroniza: es solo para no aburrirte en este dispositivo).
import { hash } from "./reglas.js";

export const CLAVE_VISTAS = "devprep-mapache-vistas";
/** Cuántas vistas recuerda por grupo (más que las frases de cualquier grupo). */
export const MAX_POR_GRUPO = 300;

/** Id estable de una frase: sale de su texto en inglés (antes de cambiar {w} y {n}). */
export const idFrase = (f) => hash(String(f?.en ?? "")).toString(36);

/**
 * Ordena un grupo: las no vistas primero, luego las vistas de la más antigua a la más reciente.
 * @param {{ en: string }[]} lista
 * @param {string[]} vistas  ids vistos, el más reciente al final
 * @param {string} semilla   cambia el orden de las no vistas (por ejemplo, el día)
 */
export function ordenSinRepetir(lista, vistas = [], semilla = "") {
  const cuando = new Map(vistas.map((id, i) => [id, i]));
  const nuevas = [];
  const viejas = [];
  for (const f of lista) (cuando.has(idFrase(f)) ? viejas : nuevas).push(f);
  nuevas.sort((a, b) => hash(semilla + a.en) - hash(semilla + b.en));
  viejas.sort((a, b) => cuando.get(idFrase(a)) - cuando.get(idFrase(b)));
  return [...nuevas, ...viejas];
}

/**
 * La memoria de lo que ya dijo Map.
 * @param {{ getItem: (k: string) => string|null, setItem: (k: string, v: string) => void } | null} almacen
 */
export function crearMemoriaFrases(almacen) {
  const vacio = () => ({ vistas: {}, delDia: {} });
  const leer = () => {
    try {
      const d = JSON.parse(almacen?.getItem(CLAVE_VISTAS) ?? "null");
      return d && typeof d === "object" ? { vistas: d.vistas ?? {}, delDia: d.delDia ?? {} } : vacio();
    } catch {
      return vacio();
    }
  };
  const escribir = (d) => {
    try {
      almacen?.setItem(CLAVE_VISTAS, JSON.stringify(d));
    } catch {
      // Sin espacio o sin almacén: Map puede repetir, pero nada se rompe
    }
  };
  const anotar = (d, grupo, id) => {
    const lista = (d.vistas[grupo] ?? []).filter((x) => x !== id);
    lista.push(id);
    d.vistas[grupo] = lista.slice(-MAX_POR_GRUPO);
  };

  return {
    vistas: (grupo) => leer().vistas[grupo] ?? [],

    /** Ya se mostró: pasa al final de su grupo. */
    marcar(grupo, id) {
      if (!grupo || !id) return;
      const d = leer();
      anotar(d, grupo, id);
      escribir(d);
    },

    /** El grupo en el orden en que conviene mostrarlo (no vistas primero). */
    ordenar: (grupo, lista, semilla = "") => ordenSinRepetir(lista, leer().vistas[grupo] ?? [], semilla + grupo),

    /**
     * La frase del día de un grupo: la primera vez del día se elige entre las no vistas y se anota;
     * el resto del día devuelve la misma.
     */
    delDia(grupo, hoy, lista, semilla = hoy) {
      if (!lista?.length) return null;
      const d = leer();
      const fijada = d.delDia[grupo];
      if (fijada?.fecha === hoy) {
        const f = lista.find((x) => idFrase(x) === fijada.id);
        if (f) return f;
      }
      const f = ordenSinRepetir(lista, d.vistas[grupo] ?? [], semilla + grupo)[0];
      d.delDia[grupo] = { fecha: hoy, id: idFrase(f) };
      anotar(d, grupo, idFrase(f));
      escribir(d);
      return f;
    },
  };
}
