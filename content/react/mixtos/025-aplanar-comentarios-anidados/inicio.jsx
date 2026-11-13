// Aplanar comentarios anidados
//
// aplanar(comentarios, nivel = 0): árbol de { id, texto, respuestas? } ->
// lista plana de { id, texto, nivel } en orden de lectura.
// Hilo({ comentarios }): <ul> con un <li> por comentario y marginLeft de
// 24px por nivel.
//
//   aplanar([{ id: 1, texto: "Hola", respuestas: [{ id: 2, texto: "Qué tal" }] }])
//   // [{ id: 1, texto: "Hola", nivel: 0 }, { id: 2, texto: "Qué tal", nivel: 1 }]
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function aplanar(comentarios, nivel = 0) {
  // Tu código aquí
  return [];
}

export function Hilo({ comentarios }) {
  // Tu código aquí
  return null;
}
