El panel de administración permite cambiar precios, lanzar descuentos por categoría y limpiar el catálogo. Eso es `UPDATE` (modificar filas) y `DELETE` (borrarlas). Las dos sentencias tienen un peligro enorme: si olvidas el `WHERE`, afectan a **todas** las filas de la tabla.

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

1. `cambiarPrecio(db, productoId, nuevoPrecio)`: cambia el precio de **ese** producto. Devuelve `true` si lo encontró y lo cambió, `false` si no existe ese id. Si `nuevoPrecio` no es un número mayor que 0, lanza `Error("El precio debe ser mayor que cero")` sin cambiar nada.
2. `aplicarDescuento(db, categoria, porcentaje)`: baja el precio de todos los productos de esa categoría en ese porcentaje, **redondeado a 2 decimales**. Devuelve **cuántos** productos cambió. Si `porcentaje` no está entre 1 y 99, lanza `Error("El porcentaje debe estar entre 1 y 99")`.
3. `borrarAgotados(db)`: borra los productos con `stock` igual a 0. Devuelve cuántos borró.

## Reglas

- Valores siempre con `?`.
- Cada `UPDATE` y `DELETE` lleva su `WHERE`: los tests revisan que las demás filas **no cambien**.
- Para saber cuántas filas se afectaron, usa `changes`, que viene en el resultado de `.run()`.

## Ejemplos

```js
cambiarPrecio(db, 2, 49);       // true   (el Mouse ahora cuesta 49)
cambiarPrecio(db, 99, 49);      // false  (no hay producto 99)
cambiarPrecio(db, 2, 0);        // Error: El precio debe ser mayor que cero

aplicarDescuento(db, "perifericos", 10);
// 3   Teclado 189 -> 170.1, Mouse 59 -> 53.1, Webcam 149 -> 134.1

aplicarDescuento(db, "juguetes", 10);   // 0

borrarAgotados(db);   // 1   (se borran los Audífonos, que tienen stock 0)
borrarAgotados(db);   // 0   (ya no queda ninguno)
```
