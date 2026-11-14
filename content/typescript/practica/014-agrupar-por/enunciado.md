En un tablero de tareas agrupas las tareas por estado; en una tienda, los productos por categoría. Es la misma operación: **agrupar una lista por el valor de una propiedad**.

Escribe la función genérica `agruparPor(lista, clave)`:

- `lista` es un arreglo de objetos de cualquier tipo `T`.
- `clave` es el **nombre de una propiedad que exista en `T`**: si pasas una propiedad inventada, TypeScript debe marcar el error.
- Devuelve un objeto donde cada clave es un valor de esa propiedad (convertido a texto con `String`) y cada valor es la lista de elementos que lo tienen. El tipo de retorno es `Record<string, T[]>`.

La firma que buscas tiene dos parámetros de tipo:

```ts
function agruparPor<T, K extends keyof T>(lista: T[], clave: K): Record<string, T[]>
```

## Reglas

- Dentro de cada grupo, los elementos van en el mismo orden que en la lista original.
- No modifiques la lista.
- Lista vacía: devuelve `{}`.
- Los valores se convierten a texto: un campo booleano produce grupos `"true"` y `"false"`.

## Ejemplos

```ts
const productos = [
  { nombre: "Polo", categoria: "ropa", precio: 30 },
  { nombre: "Mouse", categoria: "tecnologia", precio: 50 },
  { nombre: "Jean", categoria: "ropa", precio: 90 },
];

agruparPor(productos, "categoria");
// {
//   ropa: [{ nombre: "Polo", ... }, { nombre: "Jean", ... }],
//   tecnologia: [{ nombre: "Mouse", ... }],
// }

agruparPor(tareas, "hecha");   // { false: [...], true: [...] }
agruparPor(productos, "color"); // error de tipos: "color" no es una clave de producto
```
