## Idea clave

`JOIN ... ON` junta dos tablas fila con fila según una condición, normalmente "la clave foránea de una es igual al id de la otra" (`c.id = pe.cliente_id`). Así cada pedido trae los datos de su cliente y de su producto en una sola consulta. Cuando las tablas comparten nombres de columna (`id`, `nombre`), usas alias de tabla (`pe.id`, `c.nombre`) y alias de columna (`AS cliente`).

## Paso a paso

1. **Entiende la relación.** `pedidos.cliente_id` es una **clave foránea**: guarda el `id` de una fila de `clientes`. El pedido 2 tiene `cliente_id = 1`, o sea, es de Ana Torres.

2. **Junta pedidos con clientes.** En el `FROM` agregas la segunda tabla con `JOIN` y dices cómo se emparejan con `ON`. Las letras después de cada tabla son **alias** para escribir menos:

   ```sql
   FROM pedidos pe
   JOIN clientes c ON c.id = pe.cliente_id
   ```

3. **Junta también productos.** Puedes encadenar varios `JOIN`:

   ```sql
   JOIN productos pr ON pr.id = pe.producto_id
   ```

4. **Elige columnas con su tabla.** `id` existe en las tres tablas y `nombre` en dos. Si escribes solo `nombre`, SQLite no sabe cuál y lanza `ambiguous column name: nombre`. Escribe `c.nombre` y renómbralo con `AS` para que la propiedad se llame como pide el test:

   ```sql
   SELECT pe.id, pe.fecha, c.nombre AS cliente, pr.nombre AS producto,
          pe.cantidad, pe.cantidad * pr.precio AS total
   ```

5. **Ordena y, si hace falta, filtra.** Después de los `JOIN` puedes filtrar por columnas de cualquiera de las tablas: `WHERE c.ciudad = ?`.

## Por qué funciona

Mira cómo se arma el pedido 2. La base toma la fila de `pedidos` y busca la que cumple cada `ON`:

| pedidos (pe) | clientes (c) con `c.id = 1` | productos (pr) con `pr.id = 2` |
|---|---|---|
| id 2, cliente_id 1, producto_id 2, cantidad 2 | Ana Torres, Lima | Mouse inalámbrico, 59 |

Juntas forman una fila "ancha" con todas las columnas de las tres tablas. El `SELECT` elige las que quieres y calcula `2 * 59 = 118`:

```js
{ id: 2, fecha: "2026-10-02", cliente: "Ana Torres", producto: "Mouse inalámbrico", cantidad: 2, total: 118 }
```

En `pedidosDeCiudad(db, "Cusco")`, el `WHERE c.ciudad = ?` se aplica sobre esas filas anchas: solo pasan los pedidos 3 y 6, que son de Luis Quispe. Trujillo da `[]` porque Carla no tiene pedidos: un `JOIN` normal (`INNER JOIN`) solo devuelve filas que **tienen pareja en las dos tablas**. Eso es justo lo que cambia en el siguiente ejercicio.

## Errores comunes

- **Olvidar el `ON`** o poner una condición equivocada (`c.id = pe.producto_id`). Sin `ON` correcto, la base combina cada pedido con **todos** los clientes (9 × 6 = 54 filas) o con el cliente equivocado. Lo reconoces porque salen muchas más filas o nombres que no corresponden.
- **Columnas ambiguas.** `SELECT id, nombre ...` da `ambiguous column name`. Ponle siempre el alias de tabla.
- **No renombrar con `AS`.** Si pones `c.nombre, pr.nombre`, las dos columnas se llaman `nombre` y en el objeto una pisa a la otra: te queda una sola propiedad `nombre`.
- **Hacer una consulta por pedido** (traer los pedidos y luego, en un bucle, buscar cada cliente). Es el famoso problema **N+1**: 1 consulta para la lista y N más para los detalles. Con 1000 pedidos son 1001 consultas en vez de 1.
- **Meter la ciudad con `${ciudad}` en la plantilla.** En la solución la plantilla solo junta texto fijo escrito por ti; el valor del usuario siempre va en `?`.

## Otra forma de resolverlo

**`INNER JOIN` escrito completo**: `JOIN` y `INNER JOIN` son lo mismo. Algunos equipos escriben `INNER JOIN` para dejar claro que solo quedan las filas con pareja:

```sql
FROM pedidos pe
INNER JOIN clientes c ON c.id = pe.cliente_id
INNER JOIN productos pr ON pr.id = pe.producto_id
```

**Sintaxis antigua con comas** (la verás en código viejo):

```sql
FROM pedidos pe, clientes c, productos pr
WHERE c.id = pe.cliente_id AND pr.id = pe.producto_id
```

Da el mismo resultado, pero mezcla las condiciones de unión con los filtros y es fácil olvidar una. Prefiere `JOIN ... ON`: separa "cómo se relacionan las tablas" de "qué filas quiero".

## Cómo explicarlo en la entrevista

> "Los pedidos guardan el id del cliente y del producto, que son claves foráneas. Para mostrar los nombres hago un JOIN de pedidos con clientes por cliente_id y otro con productos por producto_id. Como varias tablas tienen columnas id y nombre, uso alias de tabla para evitar ambigüedad y alias de columna para que el resultado tenga nombres claros, y calculo el total en el mismo SELECT. Todo va en una sola consulta para evitar el problema N más uno de hacer una consulta por cada pedido."

## Conceptos

- **Clave foránea**: columna que guarda el `id` de una fila de otra tabla (`pedidos.cliente_id` apunta a `clientes.id`).
- **`JOIN ... ON`** (igual a `INNER JOIN`): junta filas que cumplen la condición; las que no tienen pareja se descartan.
- **Alias de tabla** (`pedidos pe`) y **alias de columna** (`c.nombre AS cliente`).
- **Columnas calculadas**: `pe.cantidad * pr.precio AS total`.
- **Normalización**: guardar cada dato en un solo lugar y relacionarlo por ids.
- **Problema N+1**: hacer una consulta por cada elemento de una lista en vez de un `JOIN`.
