En la página de inicio de la tienda quieren mostrar "Los más caros" y, en el catálogo, los productos **por páginas** (como los botones 1, 2, 3 al pie de una lista). Las dos cosas se resuelven con `ORDER BY` y `LIMIT`.

## La tabla

**productos** (8 filas)

| id | nombre | categoria | precio | stock |
|---|---|---|---|---|
| 1 | Teclado mecánico | perifericos | 189 | 15 |
| 2 | Mouse inalámbrico | perifericos | 59 | 40 |
| 3 | Monitor 24 pulgadas | monitores | 649 | 8 |
| 4 | Laptop 14 pulgadas | computadoras | 2899 | 5 |
| 5 | Audífonos con micrófono | audio | 129 | 0 |
| 6 | Parlante bluetooth | audio | 99 | 22 |
| 7 | Webcam HD | perifericos | 149 | 12 |
| 8 | Monitor 27 pulgadas | monitores | 999 | 3 |

## Qué hacer

1. `masCaros(db, n)`: devuelve `nombre` y `precio` de los `n` productos más caros, del más caro al más barato. Si dos cuestan lo mismo, van por **nombre** de la A a la Z.
2. `paginaDeProductos(db, pagina, porPagina)`: devuelve `id` y `nombre` de los productos de esa página, ordenados por `id`. La primera página es la **1**.

## Reglas

- `n` y los datos de la página llegan como parámetros `?`.
- Si `n` es mayor que la cantidad de productos, devuelve todos. Si es 0, devuelve `[]`.
- Una página que no tiene productos devuelve `[]`.

## Ejemplos

```js
masCaros(db, 3);
// [{ nombre: "Laptop 14 pulgadas", precio: 2899 },
//  { nombre: "Monitor 27 pulgadas", precio: 999 },
//  { nombre: "Monitor 24 pulgadas", precio: 649 }]

paginaDeProductos(db, 1, 3);   // [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
paginaDeProductos(db, 2, 3);   // ids 4, 5 y 6
paginaDeProductos(db, 3, 3);   // ids 7 y 8   (la última página puede venir incompleta)
paginaDeProductos(db, 4, 3);   // []
```
