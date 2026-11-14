## Idea clave

Para "los N mejores" ordenas al revés con `ORDER BY ... DESC` y cortas con `LIMIT n`. Para paginar, además saltas las filas de las páginas anteriores con `OFFSET`. Siempre ordena antes de cortar: sin `ORDER BY`, "los primeros" no significa nada.

## Paso a paso

1. **Ordena del más caro al más barato.** `DESC` (descendente) invierte el orden:

   ```sql
   SELECT nombre, precio FROM productos ORDER BY precio DESC
   ```

2. **Desempata.** Si dos productos cuestan lo mismo, la base puede devolverlos en cualquier orden. Agrega un segundo criterio, separado por coma. Solo se usa cuando el primero empata:

   ```sql
   ORDER BY precio DESC, nombre ASC
   ```

3. **Corta con `LIMIT`.** Va al final de la consulta y recibe la cantidad como parámetro:

   ```js
   db.prepare("SELECT nombre, precio FROM productos ORDER BY precio DESC, nombre ASC LIMIT ?").all(n);
   ```

4. **Paginación: calcula cuántas filas saltar.** La página 1 empieza en la fila 0, la página 2 en la fila `porPagina`, la página 3 en `2 * porPagina`. En general:

   ```js
   const saltar = (pagina - 1) * porPagina;
   ```

5. **Usa `LIMIT` y `OFFSET` juntos.** `LIMIT` dice cuántas traer y `OFFSET` cuántas saltar antes. Los parámetros se pasan en el orden en que aparecen los `?`:

   ```js
   db.prepare("SELECT id, nombre FROM productos ORDER BY id LIMIT ? OFFSET ?").all(porPagina, saltar);
   ```

## Por qué funciona

Recorrido de `masCaros(db, 3)` después de que el test agrega "Impresora láser" a S/ 999:

| Paso | Resultado |
|---|---|
| `ORDER BY precio DESC` | Laptop 2899, (Monitor 27 y Impresora, los dos 999, en cualquier orden), Monitor 24 649, ... |
| `, nombre ASC` | Laptop 2899, **Impresora** 999, **Monitor 27** 999, Monitor 24 649, ... |
| `LIMIT 3` | Laptop, Impresora, Monitor 27 |

Sin el desempate, el test podría pasar o fallar según el orden interno de la base: un error difícil de encontrar.

Recorrido de `paginaDeProductos(db, 3, 3)`:

- `saltar = (3 - 1) * 3 = 6`.
- `ORDER BY id`: 1, 2, 3, 4, 5, 6, 7, 8.
- `OFFSET 6` salta 1 a 6; quedan 7 y 8.
- `LIMIT 3` pediría 3, pero solo hay 2: devuelve `[7, 8]`. Para la página 4, `OFFSET 9` salta todo y queda `[]`.

## Errores comunes

- **Olvidar `DESC`.** Te salen los más baratos. Lo reconoces porque el primero es el Mouse a S/ 59.
- **No desempatar.** Funciona "casi siempre", hasta que hay dos precios iguales. Lo reconoces en el test del empate.
- **Calcular el salto como `pagina * porPagina`.** La página 1 saltaría 3 filas y empezaría en el id 4. Recuerda que las páginas empiezan en 1 y el salto en 0.
- **Invertir los parámetros** (`.all(saltar, porPagina)`). El primer `?` es el del `LIMIT`. Te devuelve otra cantidad de filas.
- **Poner `LIMIT` antes de `ORDER BY`.** Es un error de sintaxis: el orden de las partes es `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET`.
- **Traer todo y cortar en JavaScript con `.slice()`.** Da el resultado correcto, pero con 100 000 productos traes 100 000 filas para mostrar 10. Paginar en la base es justamente para no hacer eso.

## Otra forma de resolverlo

SQLite también acepta la forma corta `LIMIT salto, cantidad` (primero el salto):

```sql
SELECT id, nombre FROM productos ORDER BY id LIMIT ?, ?
```

Funciona igual, pero se confunde fácil el orden de los números. `LIMIT ? OFFSET ?` se lee solo y es la forma que entienden también PostgreSQL y MySQL.

Para listas muy largas existe la **paginación por cursor** (o "keyset"): en vez de saltar filas, pides las siguientes a partir del último id que viste:

```sql
SELECT id, nombre FROM productos WHERE id > ? ORDER BY id LIMIT ?
```

Es más rápida con millones de filas, porque `OFFSET` igual tiene que recorrer todas las que salta. Es lo que usan los "scroll infinito" de las redes sociales. Para un catálogo normal, `LIMIT` y `OFFSET` está bien.

## Cómo explicarlo en la entrevista

> "Para los N más caros ordeno por precio de forma descendente, agrego el nombre como segundo criterio para que el resultado sea estable si hay empates, y corto con LIMIT. Para paginar uso LIMIT con el tamaño de página y OFFSET con página menos uno por el tamaño. Lo hago en la base y no con slice en JavaScript para no traer filas que no voy a mostrar. Si la tabla fuera enorme, mencionaría la paginación por cursor, que evita recorrer las filas saltadas."

## Conceptos

- **`ORDER BY col DESC`**: orden descendente (de mayor a menor).
- **Varios criterios de orden**: `ORDER BY a DESC, b ASC`; el segundo solo decide en los empates del primero.
- **`LIMIT n`**: devuelve como máximo `n` filas.
- **`OFFSET k`**: salta las primeras `k` filas.
- **Paginación**: `OFFSET (pagina - 1) * porPagina`.
- **Orden de las cláusulas**: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET`.
