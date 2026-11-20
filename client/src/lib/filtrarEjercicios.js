// Filtra la lista de la pantalla Practicar.
//
// lista:   [{ id, titulo, tema, nivel, estado, tags, patron? }, ...]
// filtros: { texto: "", tema: "", patron: "", nivel: "", estado: "", coleccion: "" }
//          Un filtro vacío ("") significa "todos".
//
// Devuelve un arreglo nuevo con los ejercicios que cumplen TODOS los filtros.
import { PATRONES } from "../../../scripts/items/unidades.js";

/** Minúsculas y sin tildes: "Árbol" -> "arbol". */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarEjercicios(lista, { texto = "", tema = "", patron = "", nivel = "", estado = "", coleccion = "" }) {
  // La búsqueda se prepara una sola vez, no en cada vuelta del filter.
  const buscado = normalizar(texto.trim());

  return lista.filter((ej) => {
    // `!tema ||` hace que un filtro vacío deje pasar todo.
    const temaOk = !tema || ej.tema === tema;
    const patronOk = !patron || ej.patron === patron; // solo los retos de algoritmos traen patrón
    // El <select> entrega "2" (texto) y el ejercicio tiene 2 (número).
    const nivelOk = !nivel || ej.nivel === Number(nivel);
    const estadoOk = !estado || ej.estado === estado;
    const coleccionOk = !coleccion || ej.coleccion === coleccion;
    const textoOk =
      !buscado ||
      normalizar(ej.titulo).includes(buscado) ||
      (ej.tags ?? []).some((tag) => normalizar(tag).includes(buscado));

    return temaOk && patronOk && nivelOk && estadoOk && coleccionOk && textoOk;
  });
}

/** Clave del grupo de un ejercicio: su patrón (con `porPatron`, si lo tiene) o su tema. */
export const claveGrupo = (ej, porPatron = false) => (porPatron && ej.patron ? `patron:${ej.patron}` : ej.tema);

/**
 * Agrupa la lista en secciones, respetando el orden del contenido dentro de cada una.
 * Por tema, en el orden en que aparecen; con `porPatron` (retos de algoritmos), por patrón y en el
 * orden de estudio de PATRONES ("Tabla hash" antes que "Ventana deslizante").
 * @returns {{ clave: string, tema: string, patron: string|null, lista: object[] }[]}
 */
export function agruparEjercicios(lista, { porPatron = false } = {}) {
  const grupos = new Map();
  for (const ej of lista) {
    const clave = claveGrupo(ej, porPatron);
    if (!grupos.has(clave)) grupos.set(clave, { clave, tema: ej.tema, patron: porPatron ? (ej.patron ?? null) : null, lista: [] });
    grupos.get(clave).lista.push(ej);
  }
  const resultado = [...grupos.values()];
  if (porPatron) {
    const pos = (g) => {
      const i = PATRONES.findIndex((p) => p.id === g.patron);
      return i === -1 ? PATRONES.length : i;
    };
    resultado.sort((a, b) => pos(a) - pos(b)); // sort es estable: los que no tienen patrón quedan en su orden
  }
  return resultado;
}
