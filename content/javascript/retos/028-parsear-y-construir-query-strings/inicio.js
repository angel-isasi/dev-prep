// Parsear y construir query strings
//
//   parsearQuery(qs) -> objeto con los valores ya decodificados
//   crearQuery(obj)  -> texto codificado, sin valores undefined ni ""
//
//   parsearQuery("?q=cortos%20ica&pagina=2")   // { q: "cortos ica", pagina: "2" }
//   crearQuery({ q: "cortos ica", pagina: 2 }) // "q=cortos+ica&pagina=2"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function parsearQuery(qs) {
  // Tu código aquí
}

export function crearQuery(obj) {
  // Tu código aquí
}
