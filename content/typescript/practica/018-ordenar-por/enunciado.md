Una tabla de productos se puede ordenar haciendo clic en la cabecera de cualquier columna: por nombre, por precio, por stock, de menor a mayor o al revés. Y el filtro lateral muestra la lista de valores de una columna.

Escribe dos funciones genéricas:

1. `ordenarPor(lista, campo, direccion)`: devuelve una **copia** de la lista ordenada por `campo`.
   - `campo` tiene que ser una clave de `T` (`K extends keyof T`).
   - `direccion` es `"asc"` (de menor a mayor, el valor por defecto) o `"desc"`. Crea el tipo `Direccion` para eso.
   - Si los valores son textos, compáralos con `localeCompare` (ordena bien las tildes y la ñ). Si no, compáralos con `<` y `>`.
2. `valoresDe(lista, campo)`: devuelve un arreglo con el valor de ese campo en cada elemento. Su tipo de retorno es `T[K][]`: si el campo es `precio` (número), el resultado es `number[]`.

## Reglas

- No modifiques la lista original (`sort` modifica el arreglo sobre el que se llama).
- Si dos elementos tienen el mismo valor, conservan su orden original.
- TypeScript debe rechazar un campo que no existe y una dirección que no sea `"asc"` ni `"desc"`.

## Ejemplos

```ts
const productos = [
  { nombre: "teclado", precio: 120, stock: 5 },
  { nombre: "mouse", precio: 45, stock: 20 },
  { nombre: "audífonos", precio: 80, stock: 5 },
];

ordenarPor(productos, "precio");          // mouse (45), audífonos (80), teclado (120)
ordenarPor(productos, "precio", "desc");  // teclado, audífonos, mouse
ordenarPor(productos, "nombre");          // audífonos, mouse, teclado

valoresDe(productos, "precio");  // [120, 45, 80]   tipo number[]
valoresDe(productos, "nombre");  // ["teclado", "mouse", "audífonos"]   tipo string[]

ordenarPor(productos, "color");            // error de tipos
ordenarPor(productos, "precio", "arriba"); // error de tipos
```
