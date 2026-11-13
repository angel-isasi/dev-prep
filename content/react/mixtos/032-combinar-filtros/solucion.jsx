// Junta varios predicados en uno: pasa si TODOS se cumplen.
export const todos = (...condiciones) => (item) => condiciones.every((cumple) => cumple(item));

// Cada fábrica recibe su configuración y devuelve un predicado (pizza) => boolean.
export const deCategoria = (categoria) => (pizza) => !categoria || pizza.categoria === categoria;

export const hastaPrecio = (max) => (pizza) => pizza.precio <= max;

export const conTexto = (texto) => (pizza) => pizza.nombre.toLowerCase().includes(texto.toLowerCase());
