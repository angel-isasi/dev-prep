En el ejercicio anterior resumiste **toda** una tabla (o una categoría) en una fila. Ahora el gerente quiere un reporte con **una fila por categoría**: cuántas ventas hubo y cuánto se vendió en cada una. Eso es `GROUP BY`.

## La tabla

**ventas**: el registro de la caja, una fila por cada venta.

| id | producto | categoria | monto | fecha |
|---|---|---|---|---|
| 1 | Teclado mecánico | perifericos | 189 | 2026-10-02 |
| 2 | Mouse inalámbrico | perifericos | 118 | 2026-10-02 |
| 3 | Laptop 14 pulgadas | computadoras | 2899 | 2026-10-05 |
| 4 | Monitor 24 pulgadas | monitores | 1298 | 2026-10-07 |
| 5 | Parlante bluetooth | audio | 297 | 2026-10-10 |
| 6 | Mouse inalámbrico | perifericos | 59 | 2026-10-12 |
| 7 | Webcam HD | perifericos | 149 | 2026-10-15 |
| 8 | Monitor 27 pulgadas | monitores | 999 | 2026-10-20 |
| 9 | Teclado mecánico | perifericos | 189 | 2026-10-22 |
| 10 | Audífonos con micrófono | audio | 129 | 2026-10-25 |

Las fechas son texto con formato `AAAA-MM-DD`, así que se pueden comparar con `>=` como cualquier texto.

## Qué hacer

1. `ventasPorCategoria(db)`: una fila por categoría con `categoria`, `ventas` (cuántas ventas) y `total` (suma de los montos), ordenadas de **mayor a menor total**.
2. `categoriasQueSuperan(db, minimo)`: `categoria` y `total` de las categorías cuyo total es **mayor o igual** que `minimo`, de mayor a menor total.
3. `ventasDesde(db, fecha)`: como `ventasPorCategoria`, pero contando **solo las ventas con fecha mayor o igual** a `fecha`.

## Reglas

- Una sola consulta por función, con parámetros `?`.
- Piensa bien cuál filtro va antes de agrupar (`WHERE`) y cuál después (`HAVING`).

## Ejemplos

```js
ventasPorCategoria(db);
// [{ categoria: "computadoras", ventas: 1, total: 2899 },
//  { categoria: "monitores",    ventas: 2, total: 2297 },
//  { categoria: "perifericos",  ventas: 5, total: 704 },
//  { categoria: "audio",        ventas: 2, total: 426 }]

categoriasQueSuperan(db, 1000);
// [{ categoria: "computadoras", total: 2899 }, { categoria: "monitores", total: 2297 }]

ventasDesde(db, "2026-10-15");
// [{ categoria: "monitores",   ventas: 1, total: 999 },
//  { categoria: "perifericos", ventas: 2, total: 338 },
//  { categoria: "audio",       ventas: 1, total: 129 }]
```
