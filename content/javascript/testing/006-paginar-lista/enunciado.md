## El problema

Casi toda lista larga en una web se muestra por páginas: resultados de búsqueda, pedidos, comentarios. La función que corta la lista ya está escrita y funciona. Te toca escribir **sus tests**.

La app tiene **la función correcta y 5 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`paginar(lista, pagina, porPagina)` devuelve un objeto `{ items, pagina, totalPaginas }`:

- Las páginas **empiezan en 1**. La página 1 trae los primeros `porPagina` elementos.
- `totalPaginas` se **redondea hacia arriba**: 10 elementos de 3 en 3 son 4 páginas (la última trae solo 1).
- Una lista vacía tiene **1 página**, sin elementos.
- Si `pagina` es **menor que 1**, se muestra la página 1. Si es **mayor que `totalPaginas`**, se muestra la última.
- En el resultado, `pagina` es la página que **realmente** se muestra.

```js
const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

paginar(numeros, 1, 3);   // { items: [1, 2, 3], pagina: 1, totalPaginas: 4 }
paginar(numeros, 4, 3);   // { items: [10], pagina: 4, totalPaginas: 4 }
paginar(numeros, 99, 3);  // { items: [10], pagina: 4, totalPaginas: 4 }
paginar(numeros, 0, 3);   // { items: [1, 2, 3], pagina: 1, totalPaginas: 4 }
paginar([], 1, 3);        // { items: [], pagina: 1, totalPaginas: 1 }
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, paginar) {
  const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("la página 2 trae los elementos del 4 al 6", () => {
    expect(paginar(numeros, 2, 3).items).toEqual([4, 5, 6]);
  });
}
```

Como el resultado es un objeto, compáralo con `toEqual`. Comparar el objeto entero revisa `items`, `pagina` y `totalPaginas` de una vez.

Escribe **al menos 3 tests**. Piensa en qué tipos de página existen: la primera, una del medio, la última, una que no existe por arriba y una que no existe por abajo.
