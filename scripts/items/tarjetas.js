// Ítems "tarjeta": una por ejercicio con solución. El cliente arma el frente (enunciado) y el
// reverso (idea clave, solución, "Cómo explicarlo") desde col/<coleccion>.json.

/** @param {{ ej: { id: string, titulo: string }, unidad: string }} p */
export function generarTarjeta({ ej, unidad }) {
  return {
    clave: `ej:${ej.id}`,
    tipo: "tarjeta",
    unidad,
    fuente: { tipo: "ejercicio", id: ej.id, titulo: ej.titulo },
    ejercicio: ej.id,
  };
}
