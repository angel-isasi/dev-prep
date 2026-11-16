## El problema

Una tienda en línea tiene el filtro "hasta S/ X". La función que lo resuelve ya está escrita y funciona. Te toca escribir **sus tests**, y aquí aparece algo nuevo: el resultado es un **arreglo de objetos**, y además la función **no debe modificar** el arreglo que recibe.

La app tiene **la función correcta y 5 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`productosBaratos(productos, precioMaximo)` recibe un arreglo de productos `{ id, nombre, precio }` y devuelve un **arreglo nuevo**:

- Solo con los productos cuyo precio es **menor o igual** a `precioMaximo`.
- Ordenados por precio, **de menor a mayor**.
- Con los productos **completos** (todas sus propiedades).
- **Sin modificar** el arreglo original: ni su orden ni su contenido.

```js
const catalogo = [
  { id: 1, nombre: "Monitor", precio: 500 },
  { id: 2, nombre: "Mouse", precio: 25 },
  { id: 3, nombre: "Teclado", precio: 100 },
  { id: 4, nombre: "Cable USB", precio: 9 },
];

productosBaratos(catalogo, 100);
// [
//   { id: 4, nombre: "Cable USB", precio: 9 },
//   { id: 2, nombre: "Mouse", precio: 25 },
//   { id: 3, nombre: "Teclado", precio: 100 },
// ]
// y catalogo sigue igual que antes
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, productosBaratos) {
  test("deja fuera los productos caros", () => {
    const productos = [
      { id: 1, nombre: "Mouse", precio: 30 },
      { id: 2, nombre: "Monitor", precio: 500 },
    ];
    expect(productosBaratos(productos, 100)).toEqual([{ id: 1, nombre: "Mouse", precio: 30 }]);
  });
}
```

Recuerda: para arreglos y objetos usa **`toEqual`**, que compara el contenido. `toBe` compara si es **el mismo** objeto en memoria, y dos arreglos con lo mismo adentro no lo son.

Escribe **al menos 3 tests**. Pregúntate también: después de llamar a la función, ¿el arreglo que le pasaste sigue igual?
