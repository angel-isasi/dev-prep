// Rutas con path
//
// Arma y analiza rutas con el módulo path de Node (ya está importado).
// Usa path.join, path.extname, path.basename o path.parse: nada de "/" a mano.
//
//   tipoDeArchivo("logo.PNG")                  ->  "imagen"
//   nombreSinExtension("fotos/2026/playa.jpg") ->  "playa"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import path from "node:path";

export function rutaDeSubida(carpetaBase, usuario, archivo) {
  // Tu código aquí
}

export function tipoDeArchivo(nombre) {
  // Tu código aquí
}

export function nombreSinExtension(ruta) {
  // Tu código aquí
}

export function cambiarExtension(ruta, nuevaExtension) {
  // Tu código aquí
}
