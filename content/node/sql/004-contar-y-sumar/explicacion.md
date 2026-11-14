## Idea clave

Las **funciones de agregación** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) resumen muchas filas en un solo valor. Con `AS` le pones nombre a cada resultado y ese nombre es la propiedad del objeto en JavaScript. Como la consulta devuelve una fila, se ejecuta con `.get()`. Y cuando no hay filas, `SUM` y `AVG` devuelven `NULL`, que se arregla con `COALESCE`.

## Paso a paso

1. **Cuenta con `COUNT(*)`.** Cuenta filas:

   ```sql
   SELECT COUNT(*) FROM productos   -- 8
   ```

2. **Ponle nombre con `AS`.** Sin alias, la columna se llamaría literalmente `COUNT(*)` y en JavaScript tendrías `fila["COUNT(*)"]`. Con alias:

   ```sql
   SELECT COUNT(*) AS total FROM productos   -- { total: 8 }
   ```

3. **Agrega las otras cifras en la misma consulta**, separadas por coma. `ROUND(x, 2)` redondea a 2 decimales:

   ```sql
   SELECT COUNT(*) AS total,
          SUM(stock) AS stockTotal,
          ROUND(AVG(precio), 2) AS precioPromedio
   FROM productos
   ```

4. **Usa `.get()` en vez de `.all()`.** `.all()` siempre devuelve un arreglo, aunque tenga una sola fila: `[{ total: 8, ... }]`. `.get()` devuelve directamente la primera fila: `{ total: 8, ... }`. Si no hubiera ninguna fila, `.get()` devuelve `undefined`.

5. **Filtra por categoría con `WHERE`**, como en los ejercicios anteriores. El filtro se aplica **antes** de calcular: solo se cuentan y suman las filas que pasan.

6. **Cuida el caso vacío.** Si ninguna fila pasa el `WHERE`, `COUNT(*)` da 0, pero `SUM` y `AVG` dan `NULL` (en JavaScript, `null`). `COALESCE(a, b)` devuelve `a` si no es `NULL`, y si no, `b`:

   ```sql
   COALESCE(SUM(stock), 0) AS stockTotal
   ```

7. **Devuelve solo el número** cuando te lo piden. `.get()` te da `{ total: 3 }`; la función debe retornar `fila.total`.

## Por qué funciona

Recorrido de `resumenDeCategoria(db, "perifericos")`:

| Paso | Filas |
|---|---|
| `FROM productos` | las 8 |
| `WHERE categoria = 'perifericos'` | Teclado (189, 15), Mouse (59, 40), Webcam (149, 12) |
| `COUNT(*)` | 3 |
| `SUM(stock)` | 15 + 40 + 12 = 67 |
| `AVG(precio)` | (189 + 59 + 149) / 3 = 132.333... |
| `ROUND(..., 2)` | 132.33 |

Resultado: una sola fila `{ total: 3, stockTotal: 67, precioPromedio: 132.33 }`.

Con `"juguetes"` ninguna fila pasa el `WHERE`. Aun así la consulta devuelve **una fila** (las agregaciones sin `GROUP BY` siempre devuelven exactamente una): `COUNT(*)` = 0, `SUM` = `NULL`, `AVG` = `NULL`. Los `COALESCE` cambian los `NULL` por 0.

## Errores comunes

- **Usar `.all()`.** Devuelves `[{ total: 8, ... }]`, un arreglo. Lo reconoces en el test "devuelve un objeto, no un arreglo".
- **Olvidar los alias.** Las propiedades se llaman `"COUNT(*)"` y `"SUM(stock)"`. Lo reconoces en el test que revisa las claves.
- **No usar `COALESCE`.** En la categoría vacía devuelves `stockTotal: null`. El test dice `expected null to be 0`.
- **Devolver el objeto en `contarPedidosDeCliente`.** Devuelves `{ total: 3 }` en vez de `3`. Lo reconoces en el test `typeof ... toBe("number")`.
- **Traer las filas y sumar con `reduce`.** El resultado es correcto, pero traes todos los datos para usar uno. En una tabla de un millón de pedidos, la diferencia es enorme.
- **Confundir `COUNT(*)` con `COUNT(columna)`.** `COUNT(*)` cuenta filas; `COUNT(columna)` cuenta solo las filas donde esa columna **no es `NULL`**. Aquí da igual, pero en el ejercicio de `LEFT JOIN` la diferencia importa mucho.

## Otra forma de resolverlo

**Con JavaScript** (para que veas la diferencia):

```js
const filas = db.prepare("SELECT stock, precio FROM productos WHERE categoria = ?").all(categoria);
const total = filas.length;
const stockTotal = filas.reduce((s, f) => s + f.stock, 0);
const precioPromedio = total ? Math.round((filas.reduce((s, f) => s + f.precio, 0) / total) * 100) / 100 : 0;
return { total, stockTotal, precioPromedio };
```

Funciona y es más largo. Además tienes que acordarte del caso de cero filas (división entre 0). Conviene cuando ya tienes las filas en memoria por otra razón; si solo quieres la cifra, pídesela a la base.

**`TOTAL()` de SQLite**: es como `SUM` pero devuelve `0.0` en vez de `NULL` cuando no hay filas. Es propia de SQLite (no existe en PostgreSQL ni MySQL), por eso `COALESCE` es lo que conviene aprender.

## Cómo explicarlo en la entrevista

> "Uso funciones de agregación en una sola consulta: COUNT para la cantidad, SUM para el stock y AVG con ROUND para el promedio, cada una con un alias que se convierte en la propiedad del objeto. Como devuelve una sola fila, la ejecuto con get en vez de all. Tengo en cuenta que si el WHERE no deja ninguna fila, SUM y AVG devuelven NULL, así que los envuelvo con COALESCE para devolver cero. Hago el cálculo en la base para no traer filas que no necesito."

## Conceptos

- **Funciones de agregación**: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`; convierten muchas filas en un valor.
- **`COUNT(*)` vs `COUNT(columna)`**: filas totales vs filas donde la columna no es `NULL`.
- **Alias con `AS`**: el nombre de la columna en el resultado (y la propiedad en JavaScript).
- **`.get()` vs `.all()`**: primera fila como objeto (o `undefined`) vs todas las filas en un arreglo.
- **`NULL`**: "sin valor"; las agregaciones sobre cero filas lo devuelven (salvo `COUNT`).
- **`COALESCE(a, b)`**: primer valor que no es `NULL`.
- **`ROUND(x, 2)`**: redondeo a 2 decimales.
