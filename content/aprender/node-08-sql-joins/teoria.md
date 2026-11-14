## En una frase

Los datos se reparten en varias tablas unidas por ids (**claves foráneas**); `JOIN` las vuelve a juntar en una sola consulta y `GROUP BY` resume las filas por grupos, por ejemplo "total gastado por cliente".

## Lo esencial

### Clave foránea: cómo se relacionan dos tablas

En vez de repetir el nombre del cliente en cada pedido, el pedido guarda **el id** del cliente:

```
clientes                pedidos
┌────┬────────┐         ┌────┬────────────┬───────┐
│ id │ nombre │         │ id │ cliente_id │ total │
├────┼────────┤         ├────┼────────────┼───────┤
│  1 │ Ana    │         │  1 │     1 (Ana)│    50 │
│  2 │ Luis   │         │  2 │     1 (Ana)│    30 │
│  3 │ Rosa   │         │  3 │    2 (Luis)│   120 │
└────┴────────┘         └────┴────────────┴───────┘
        cliente_id apunta a clientes.id   (Rosa no tiene pedidos)
```

`pedidos.cliente_id` es una **clave foránea** (foreign key): apunta a la clave primaria de otra tabla. Es una relación **uno a muchos**: un cliente tiene muchos pedidos, un pedido es de un cliente.

```sql
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  total      REAL NOT NULL
);
```

Con `REFERENCES`, la base protege la relación: no te deja crear un pedido para el cliente 99 que no existe, ni borrar un cliente que tiene pedidos (`FOREIGN KEY constraint failed`). `node:sqlite` tiene esta revisión activada por defecto.

¿Por qué no repetir el nombre? Si Ana cambia de nombre, lo cambias en **un** lugar.

### INNER JOIN: solo las filas que coinciden

```sql
SELECT c.nombre, p.total
FROM clientes AS c
INNER JOIN pedidos AS p ON p.cliente_id = c.id;
```

```
nombre │ total
Ana    │ 50
Ana    │ 30
Luis   │ 120
```

`ON` dice cómo emparejar las filas. `c` y `p` son **alias** para no escribir el nombre completo de la tabla. Rosa **no aparece**: no tiene ningún pedido con el que emparejarse. `JOIN` a secas es lo mismo que `INNER JOIN`.

### LEFT JOIN: todas las filas de la izquierda

```sql
SELECT c.nombre, p.total
FROM clientes AS c
LEFT JOIN pedidos AS p ON p.cliente_id = c.id;
```

```
nombre │ total
Ana    │ 50
Ana    │ 30
Luis   │ 120
Rosa   │ NULL     ← aparece aunque no tenga pedidos
```

Dibujado como conjuntos:

```
   clientes      pedidos             clientes      pedidos
   ┌───────┬───┬───────┐             ┌───────┬───┬───────┐
   │       │███│       │             │███████│███│       │
   └───────┴───┴───────┘             └───────┴───┴───────┘
        INNER JOIN                        LEFT JOIN
  (solo lo que coincide)       (toda la izquierda + lo que coincide)
```

La tabla de la "izquierda" es la que está en `FROM`. Cuando no hay pareja, las columnas de la derecha vienen en `NULL`.

Truco frecuente: "clientes **sin** pedidos" = LEFT JOIN y quedarte con los que no tienen pareja:

```sql
SELECT c.nombre FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;      -- Rosa
```

### GROUP BY: resumir por grupos

Las agregaciones del tema anterior (`COUNT`, `SUM`, `AVG`) daban **un** valor para toda la tabla. Con `GROUP BY` dan un valor **por grupo**:

```sql
SELECT c.nombre,
       COUNT(p.id)           AS pedidos,
       COALESCE(SUM(p.total), 0) AS gastado
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id
ORDER BY gastado DESC;
```

```
nombre │ pedidos │ gastado
Luis   │ 1       │ 120
Ana    │ 2       │ 80
Rosa   │ 0       │ 0
```

- Cada grupo se vuelve **una fila** del resultado.
- En el `SELECT` pon solo columnas del `GROUP BY` o agregaciones.
- `COUNT(p.id)` y no `COUNT(*)`: con LEFT JOIN, Rosa tiene una fila (con `NULL`) y `COUNT(*)` contaría 1.
- `COALESCE(x, 0)` devuelve `0` si `x` es `NULL` (la suma de nada es `NULL`).

### HAVING: filtrar grupos

`WHERE` filtra **filas antes** de agrupar. `HAVING` filtra **grupos después** de agrupar, y puede usar agregaciones:

```sql
SELECT c.nombre, SUM(p.total) AS gastado
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.total >= 20          -- 1) descarta pedidos chicos
GROUP BY c.id                -- 2) agrupa por cliente
HAVING SUM(p.total) > 100;   -- 3) se queda con los que gastaron más de 100
-- Luis │ 120
```

El orden completo: `SELECT ... FROM ... JOIN ... ON ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT`.

## Errores típicos

**1. INNER JOIN cuando necesitabas a todos**

"Lista todos los clientes con su cantidad de pedidos" con `INNER JOIN` hace desaparecer a los que tienen 0. Usa `LEFT JOIN`.

**2. `COUNT(*)` con LEFT JOIN**

Cuenta 1 para quien no tiene pedidos. Cuenta una columna de la tabla derecha: `COUNT(p.id)`.

**3. Agregación en el `WHERE`**

```sql
SELECT cliente_id FROM pedidos WHERE SUM(total) > 100 GROUP BY cliente_id;
-- Error: misuse of aggregate: SUM()
```
Las condiciones sobre agregaciones van en `HAVING`.

**4. Olvidar el `ON`**

Sin condición, cada cliente se combina con cada pedido (3 × 3 = 9 filas sin sentido).

**5. Nombres de columna ambiguos**

```sql
SELECT id FROM clientes JOIN pedidos ON ...; -- Error: ambiguous column name: id
```
Las dos tablas tienen `id`: escribe `c.id` o `p.id`.

**6. Filtrar la tabla derecha en el `WHERE` de un LEFT JOIN**

`WHERE p.total > 40` elimina las filas con `NULL` y tu LEFT JOIN se vuelve un INNER JOIN. Si quieres conservar a todos, pon esa condición en el `ON`: `LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.total > 40`.

## Chuleta

| Necesito | Uso |
|---|---|
| Datos de dos tablas, solo los que se relacionan | `INNER JOIN ... ON a.id = b.a_id` |
| Todos los de la izquierda, tengan o no pareja | `LEFT JOIN ... ON ...` |
| Los que **no** tienen pareja | `LEFT JOIN` + `WHERE derecha.id IS NULL` |
| Un resumen por grupo | `GROUP BY columna` + `COUNT`/`SUM`/`AVG` |
| Filtrar filas antes de agrupar | `WHERE` |
| Filtrar grupos por su resumen | `HAVING SUM(...) > x` |
| Cambiar `NULL` por un valor | `COALESCE(x, 0)` |

## En la entrevista

**¿Qué es una clave foránea?**
Una columna que guarda la clave primaria de otra tabla para relacionarlas, como `pedidos.cliente_id`. La base puede impedir que apunte a un registro que no existe, lo que mantiene los datos consistentes.

**¿Qué diferencia hay entre INNER JOIN y LEFT JOIN?**
`INNER JOIN` devuelve solo las filas que tienen pareja en las dos tablas. `LEFT JOIN` devuelve todas las filas de la tabla izquierda y, si no tienen pareja, llena las columnas de la derecha con `NULL`.

**¿Qué diferencia hay entre WHERE y HAVING?**
`WHERE` filtra filas individuales antes de agrupar y no puede usar agregaciones. `HAVING` filtra los grupos después del `GROUP BY` y sí puede usar `COUNT`, `SUM`, etc.

**¿Cómo obtendrías los clientes que nunca hicieron un pedido?**
Con un `LEFT JOIN` de clientes a pedidos y `WHERE pedidos.id IS NULL`: quedan solo los clientes que no encontraron ningún pedido.
