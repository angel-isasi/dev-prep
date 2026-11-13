// "Hace cuánto" con Intl
//
// haceCuanto(fecha, ahora): "hace 3 días", "ayer", "hace 2 horas", "ahora mismo"...
// Publicado({ fecha, ahora }): <time dateTime={fecha}>{texto relativo}</time>
//
//   const ahora = Date.parse("2026-11-12T12:00:00Z");
//   haceCuanto("2026-11-11T12:00:00Z", ahora); // "ayer"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function haceCuanto(fecha, ahora = Date.now()) {
  // Tu código aquí
  return "";
}

export function Publicado({ fecha, ahora }) {
  // Tu código aquí
  return null;
}
