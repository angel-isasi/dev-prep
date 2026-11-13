Escribe la función `agruparPor(lista, clave)` que reciba un arreglo y devuelva un **objeto** donde cada propiedad es un grupo y su valor es el arreglo de elementos que pertenecen a ese grupo.

El segundo parámetro, `clave`, puede ser de dos tipos:

- Un **texto** con el nombre de una propiedad: agrupa por el valor de esa propiedad (`"ciudad"` agrupa por `item.ciudad`).
- Una **función**: agrupa por lo que devuelva al recibir cada elemento.

## Reglas

- Los grupos aparecen en el orden en que se encontró su primer elemento.
- Dentro de cada grupo, los elementos mantienen el orden original.
- Los elementos se guardan tal cual (no son copias).
- Una lista vacía devuelve `{}`.
- No uses `Object.groupBy`.

## Ejemplos

```js
const gente = [
  { n: "Ana", ciudad: "Ica" },
  { n: "Luis", ciudad: "Lima" },
  { n: "Rosa", ciudad: "Ica" },
];

agruparPor(gente, "ciudad");
// {
//   Ica:  [{ n: "Ana", ciudad: "Ica" }, { n: "Rosa", ciudad: "Ica" }],
//   Lima: [{ n: "Luis", ciudad: "Lima" }],
// }

agruparPor([1, 2, 3, 4], (x) => (x % 2 ? "impar" : "par"));
// { impar: [1, 3], par: [2, 4] }
```

## Por qué importa

Agrupar datos es constante en el frontend: pedidos por estado, mensajes por fecha, productos por categoría para pintar secciones. Es un ejercicio de entrevista muy común porque combina `reduce`, objetos como diccionario y funciones como parámetro.
