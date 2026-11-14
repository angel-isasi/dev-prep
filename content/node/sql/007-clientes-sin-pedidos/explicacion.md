## Idea clave

`LEFT JOIN` conserva **todas** las filas de la tabla de la izquierda. Si una fila no tiene pareja en la derecha, las columnas de la derecha vienen en `NULL`. Por eso "clientes sin pedidos" es `LEFT JOIN` + `WHERE pe.id IS NULL`. Y para contar pedidos por cliente sin perder a los de cero, se usa `COUNT(pe.id)`, que ignora los `NULL`.

## Paso a paso

1. **Prueba primero con `JOIN` normal** (mentalmente): `clientes JOIN pedidos` solo devuelve clientes con al menos un pedido. Carla y Diego desaparecen. No sirve.

2. **Cámbialo por `LEFT JOIN`.** La tabla escrita antes (`clientes`) es la "izquierda" y se conserva entera:

   ```sql
   FROM clientes c
   LEFT JOIN pedidos pe ON pe.cliente_id = c.id
   ```

   Ana sale 3 veces (una por pedido) y Carla sale **una vez**, con `pe.id`, `pe.fecha`, etc. en `NULL`.

3. **Quédate con los que no tienen pareja:**

   ```sql
   WHERE pe.id IS NULL
   ```

   Se usa `IS NULL` porque `NULL` significa "sin valor" y cualquier comparación con `=` contra `NULL` da "desconocido", nunca verdadero.

4. **Para contar por cliente**, agrupa por cliente y cuenta una columna de `pedidos`:

   ```sql
   SELECT c.nombre, COUNT(pe.id) AS pedidos
   FROM clientes c
   LEFT JOIN pedidos pe ON pe.cliente_id = c.id
   GROUP BY c.id
   ORDER BY pedidos DESC, c.nombre ASC
   ```

   Se agrupa por `c.id` y no por `c.nombre` porque dos clientes podrían llamarse igual; el id es único.

## Por qué funciona

Así queda la tabla intermedia del `LEFT JOIN` (resumida):

| c.id | c.nombre | pe.id |
|---|---|---|
| 1 | Ana Torres | 1 |
| 1 | Ana Torres | 2 |
| 1 | Ana Torres | 8 |
| 2 | Luis Quispe | 3 |
| 2 | Luis Quispe | 6 |
| 3 | María Rojas | 4 |
| 3 | María Rojas | 7 |
| 4 | Jorge Mendoza | 5 |
| 4 | Jorge Mendoza | 9 |
| 5 | Carla Huamán | **NULL** |
| 6 | Diego Flores | **NULL** |

- `WHERE pe.id IS NULL` deja las dos últimas: Carla y Diego.
- Al agrupar por cliente, el grupo de Carla tiene **una fila** con `pe.id = NULL`. `COUNT(pe.id)` cuenta los valores no nulos: **0**. `COUNT(*)` contaría filas: **1**, y estaría mal.
- La suma de todos los conteos es 3 + 2 + 2 + 2 + 0 + 0 = 9, la cantidad de pedidos. Es una buena forma de comprobar que no contaste de más.

## Errores comunes

- **Usar `JOIN` en vez de `LEFT JOIN`.** Los clientes sin pedidos nunca aparecen: `clientesSinPedidos` devuelve `[]` y `pedidosPorCliente` devuelve 4 filas en vez de 6.
- **Escribir `WHERE pe.id = NULL`.** Nunca es verdadero; devuelve `[]`. Siempre `IS NULL` o `IS NOT NULL`.
- **`COUNT(*)` en vez de `COUNT(pe.id)`.** Carla y Diego salen con 1 pedido. Lo reconoces en el test "también a los de 0 pedidos" y en el de la suma (da 11 en vez de 9).
- **Invertir las tablas** (`FROM pedidos LEFT JOIN clientes`). Ahora la izquierda es `pedidos` y se conservan todos los pedidos, no todos los clientes. El orden de las tablas en un `LEFT JOIN` importa.
- **Filtrar la tabla de la derecha en el `WHERE`** cuando quieres conservar a todos (por ejemplo `WHERE pe.fecha >= '2026-10-15'` en el conteo). Las filas con `NULL` no pasan ese filtro y pierdes a los clientes sin pedidos. Ese tipo de condición va dentro del `ON`: `ON pe.cliente_id = c.id AND pe.fecha >= ?`.

## Otra forma de resolverlo

**`NOT EXISTS`** (subconsulta): "clientes para los que no existe ningún pedido":

```sql
SELECT c.id, c.nombre, c.email
FROM clientes c
WHERE NOT EXISTS (SELECT 1 FROM pedidos pe WHERE pe.cliente_id = c.id)
ORDER BY c.nombre
```

**`NOT IN`**:

```sql
SELECT id, nombre, email FROM clientes
WHERE id NOT IN (SELECT cliente_id FROM pedidos)
ORDER BY nombre
```

Las tres dan lo mismo aquí. `NOT EXISTS` se lee casi como la frase en castellano y es muy eficiente. `NOT IN` es la más corta, pero tiene una trampa: si la subconsulta devuelve algún `NULL`, el resultado queda vacío. `LEFT JOIN ... IS NULL` es la que más se pregunta en entrevistas, porque demuestra que entiendes qué hace el `LEFT JOIN` con las filas sin pareja.

## Cómo explicarlo en la entrevista

> "Un INNER JOIN descartaría a los clientes sin pedidos, así que uso LEFT JOIN, que conserva todas las filas de clientes y pone NULL en las columnas de pedidos cuando no hay pareja. Para quedarme con los que no compraron filtro con pe.id IS NULL, porque igual a NULL nunca es verdadero. Para contar pedidos por cliente agrupo por el id del cliente y uso COUNT de pe.id en vez de COUNT asterisco, porque COUNT de una columna ignora los NULL y así los clientes sin pedidos salen con cero y no con uno."

## Conceptos

- **`INNER JOIN` vs `LEFT JOIN`**: solo filas con pareja vs todas las de la izquierda (con `NULL` si no hay pareja).
- **`IS NULL` / `IS NOT NULL`**: la única forma correcta de preguntar por `NULL`.
- **`COUNT(*)` vs `COUNT(columna)`**: cuenta filas vs cuenta valores no nulos.
- **`GROUP BY` por la clave primaria**: agrupa por algo único (`c.id`), no por un nombre que podría repetirse.
- **Anti-join**: encontrar filas sin pareja (`LEFT JOIN ... IS NULL`, `NOT EXISTS`, `NOT IN`).
