## El problema

La encargada de la tienda en línea reporta: "Si en el catálogo elijo **'Ordenar por precio'** y después vuelvo a **'Destacados'**, la lista se queda ordenada por precio. El orden de Destacados se pierde hasta que recargo la página".

## Qué debe hacer

`ordenarPorPrecio(productos)` devuelve un arreglo **nuevo**, ordenado de menor a mayor precio. El arreglo que recibe no se modifica: es el catálogo en el orden de Destacados.

```js
const catalogo = [
  { nombre: "Polo", precio: 45 },
  { nombre: "Gorra", precio: 25 },
  { nombre: "Casaca", precio: 120 },
];

ordenarPorPrecio(catalogo); // Gorra (25), Polo (45), Casaca (120)
catalogo;                   // sigue igual: Polo, Gorra, Casaca
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
