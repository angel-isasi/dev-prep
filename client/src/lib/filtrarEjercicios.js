// Filtra la lista de la pantalla Practicar.
//
// lista:   [{ id, titulo, tema, nivel, estado, tags }, ...]
// filtros: { texto: "", tema: "", nivel: "", estado: "" }
//          Un filtro vacío ("") significa "todos".
//
// Devuelve un arreglo nuevo con los ejercicios que cumplen TODOS los filtros.

/** Minúsculas y sin tildes: "Árbol" -> "arbol". */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filtrarEjercicios(lista, { texto = "", tema = "", nivel = "", estado = "" }) {
  // La búsqueda se prepara una sola vez, no en cada vuelta del filter.
  const buscado = normalizar(texto.trim());

  return lista.filter((ej) => {
    // `!tema ||` hace que un filtro vacío deje pasar todo.
    const temaOk = !tema || ej.tema === tema;
    // El <select> entrega "2" (texto) y el ejercicio tiene 2 (número).
    const nivelOk = !nivel || ej.nivel === Number(nivel);
    const estadoOk = !estado || ej.estado === estado;
    const textoOk =
      !buscado ||
      normalizar(ej.titulo).includes(buscado) ||
      (ej.tags ?? []).some((tag) => normalizar(tag).includes(buscado));

    return temaOk && nivelOk && estadoOk && textoOk;
  });
}
