// Guardar sin romper la página
//
// Llama a guardar(datos), que devuelve una promesa con { ok: true, id }.
// Si guardar falla, NO debe lanzar el error: devuelve { ok: false, mensaje }
// con el mensaje del error, para mostrarlo en el formulario.
//
//   await guardarSeguro(guardar, { nombre: "Ana" })  ->  { ok: true, id: 7 }
//   (sin internet)                                   ->  { ok: false, mensaje: "Sin conexión" }

export async function guardarSeguro(guardar, datos) {
  try {
    return await guardar(datos); // sin await, el rechazo llega cuando el try ya terminó
  } catch (error) {
    return { ok: false, mensaje: error.message };
  }
}
