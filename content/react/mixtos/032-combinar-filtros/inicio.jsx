// Combinar filtros
//
// deCategoria, hastaPrecio y conTexto reciben su configuración y devuelven
// un predicado (pizza) => true/false. todos(...condiciones) devuelve un
// predicado que se cumple solo si se cumplen todas.
//
//   const filtro = todos(deCategoria("clásica"), hastaPrecio(35), conTexto("mar"));
//   pizzas.filter(filtro);
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function todos(...condiciones) {
  // Tu código aquí: devuelve una función (item) => boolean
}

export function deCategoria(categoria) {
  // Tu código aquí
}

export function hastaPrecio(max) {
  // Tu código aquí
}

export function conTexto(texto) {
  // Tu código aquí
}
