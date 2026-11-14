## Idea clave

`GROUP BY columna` junta las filas que tienen el mismo valor en esa columna y las agregaciones (`COUNT`, `SUM`) se calculan **por grupo**: obtienes una fila por categoría. `WHERE` filtra **filas** antes de agrupar; `HAVING` filtra **grupos** después de agrupar, y por eso puede usar `SUM` o `COUNT`.

## Paso a paso

1. **Agrupa.** `GROUP BY categoria` arma un "montón" por cada categoría distinta. En el `SELECT` puedes poner la columna del grupo y agregaciones:

   ```sql
   SELECT categoria, COUNT(*) AS ventas, SUM(monto) AS total
   FROM ventas
   GROUP BY categoria
   ```

2. **Ordena por el total.** Puedes usar el alias en `ORDER BY`:

   ```sql
   ORDER BY total DESC
   ```

3. **Filtra grupos con `HAVING`.** "Categorías que vendieron 1000 o más" es una condición sobre la **suma**, que solo existe después de agrupar:

   ```sql
   GROUP BY categoria
   HAVING SUM(monto) >= ?
   ```

4. **Filtra filas con `WHERE`.** "Solo ventas desde una fecha" mira cada venta suelta, así que va antes de agrupar:

   ```sql
   FROM ventas
   WHERE fecha >= ?
   GROUP BY categoria
   ```

5. **Respeta el orden de las cláusulas:** `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`.

## Por qué funciona

La base trabaja en este orden lógico: `FROM`, `WHERE`, `GROUP BY`, agregaciones, `HAVING`, `SELECT`, `ORDER BY`.

Recorrido de `categoriasQueSuperan(db, 1000)`:

| Grupo | Montos | `COUNT(*)` | `SUM(monto)` | `HAVING >= 1000` |
|---|---|---|---|---|
| perifericos | 189, 118, 59, 149, 189 | 5 | 704 | no |
| computadoras | 2899 | 1 | 2899 | **sí** |
| monitores | 1298, 999 | 2 | 2297 | **sí** |
| audio | 297, 129 | 2 | 426 | no |

Quedan computadoras y monitores; `ORDER BY total DESC` los deja 2899, 2297.

Recorrido de `ventasDesde(db, "2026-10-15")`: el `WHERE` deja solo las ventas 7, 8, 9 y 10 (Webcam, Monitor 27, Teclado y Audífonos). Recién entonces se agrupa: perifericos = 149 + 189 = 338 (2 ventas), monitores = 999, audio = 129. Las computadoras desaparecen porque su única venta fue antes.

Las fechas funcionan con `>=` porque el formato `AAAA-MM-DD` ordena igual como texto que como fecha: `"2026-10-15" < "2026-10-20"`.

## Errores comunes

- **Usar `WHERE SUM(monto) >= ?`.** SQLite responde `misuse of aggregate function sum()`. Cuando el `WHERE` se ejecuta todavía no hay grupos ni sumas. Las condiciones sobre agregaciones van en `HAVING`.
- **Poner el filtro de fecha en `HAVING`** (`HAVING fecha >= ?`). Dentro de un grupo hay varias fechas y SQLite toma una cualquiera: el resultado es impredecible. Lo que mira una fila suelta va en `WHERE`.
- **Poner en el `SELECT` una columna que no está en el `GROUP BY` ni en una agregación** (por ejemplo `producto`). SQLite no da error, pero te devuelve el producto de una fila cualquiera del grupo. PostgreSQL directamente lo rechaza. Regla: en el `SELECT` van las columnas del `GROUP BY` y agregaciones.
- **Olvidar `GROUP BY`.** `SELECT categoria, SUM(monto) FROM ventas` devuelve **una sola fila** con la suma total y una categoría cualquiera. Lo reconoces en el test "una fila por categoría".
- **Escribir `HAVING` antes de `GROUP BY`.** Error de sintaxis.

## Otra forma de resolverlo

**`HAVING` con el alias**: SQLite permite `HAVING total >= ?`. Se lee mejor, pero PostgreSQL no lo acepta; `HAVING SUM(monto) >= ?` funciona en todas las bases.

**Subconsulta**: puedes agrupar primero y filtrar el resultado como si fuera una tabla:

```sql
SELECT categoria, total
FROM (SELECT categoria, SUM(monto) AS total FROM ventas GROUP BY categoria)
WHERE total >= ?
ORDER BY total DESC
```

Da lo mismo. `HAVING` es más corto y es lo que se espera ver en una entrevista; la subconsulta sirve cuando el cálculo intermedio es más complejo.

**Con tablas separadas (lo normal en una base real)**: aquí `ventas` repite la categoría en cada fila para que te concentres en `GROUP BY`. En una base bien diseñada la categoría vive en `productos` y la juntas con un `JOIN`, que es justamente el siguiente ejercicio:

```sql
SELECT pr.categoria, SUM(pe.cantidad * pr.precio) AS total
FROM pedidos pe JOIN productos pr ON pr.id = pe.producto_id
GROUP BY pr.categoria
```

## Cómo explicarlo en la entrevista

> "Agrupo por categoría con GROUP BY, así COUNT y SUM se calculan por grupo y obtengo una fila por categoría. Para quedarme con las que superan un mínimo uso HAVING, porque la condición es sobre la suma y esa suma solo existe después de agrupar. En cambio, el filtro por fecha mira cada venta, así que va en el WHERE, antes de agrupar. La diferencia clave es que WHERE filtra filas y HAVING filtra grupos."

## Conceptos

- **`GROUP BY columna`**: una fila de resultado por cada valor distinto de la columna.
- **Agregaciones por grupo**: `COUNT(*)`, `SUM`, `AVG` se calculan dentro de cada grupo.
- **`WHERE` vs `HAVING`**: filas antes de agrupar vs grupos después de agrupar.
- **Orden lógico de ejecución**: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`.
- **Fechas como texto `AAAA-MM-DD`**: se comparan y ordenan correctamente como texto.
