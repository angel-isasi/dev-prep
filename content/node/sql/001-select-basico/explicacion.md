## Idea clave

Una base de datos guarda la información en **tablas** (columnas con nombre y filas con datos). Con **SQL** le haces preguntas: `SELECT` elige las columnas, `FROM` elige la tabla y `ORDER BY` decide el orden. Desde Node, `db.prepare(sql).all()` ejecuta la consulta y te da un arreglo de objetos, uno por fila.

## Paso a paso

1. **Entiende la tabla.** `productos` tiene 5 columnas (`id`, `nombre`, `categoria`, `precio`, `stock`) y 8 filas. Cada fila es un producto. La columna `id` es la **clave primaria**: un número único que identifica a cada fila, como el DNI de una persona.

2. **Elige las columnas con `SELECT`.** Solo te piden nombre y precio:

   ```sql
   SELECT nombre, precio
   ```

3. **Di de qué tabla con `FROM`:**

   ```sql
   SELECT nombre, precio FROM productos
   ```

   Esta consulta ya funciona: devuelve las 8 filas, pero en el orden en que la base las tenga guardadas, que **no está garantizado**.

4. **Ordena con `ORDER BY`.** Si no pones nada más, ordena de menor a mayor (eso se llama `ASC`, ascendente):

   ```sql
   SELECT nombre, precio FROM productos ORDER BY precio
   ```

5. **Ejecútala desde JavaScript.** `db` es la conexión a la base. `prepare` recibe el texto SQL y `all()` lo ejecuta:

   ```js
   export function listarProductos(db) {
     return db.prepare("SELECT nombre, precio FROM productos ORDER BY precio").all();
   }
   ```

6. **Clientes, igual**, pero ordenando por un texto. Con texto, `ORDER BY` ordena alfabéticamente:

   ```js
   export function listarClientes(db) {
     return db.prepare("SELECT nombre, ciudad FROM clientes ORDER BY nombre").all();
   }
   ```

## Por qué funciona

La base ejecuta la consulta en este orden lógico (distinto del orden en que se escribe):

1. `FROM productos`: toma las 8 filas de la tabla.
2. `ORDER BY precio`: las ordena por precio: 59, 99, 129, 149, 189, 649, 999, 2899.
3. `SELECT nombre, precio`: de cada fila se queda solo con esas dos columnas.

Node convierte cada fila en un objeto cuyas propiedades son las columnas del `SELECT`:

| Fila en la base | Objeto en JavaScript |
|---|---|
| 2, Mouse inalámbrico, perifericos, 59, 40 | `{ nombre: "Mouse inalámbrico", precio: 59 }` |
| 6, Parlante bluetooth, audio, 99, 22 | `{ nombre: "Parlante bluetooth", precio: 99 }` |
| ... | ... |

Por eso el test "solo nombre y precio" pasa: `categoria`, `stock` e `id` nunca llegan a JavaScript. Y como la consulta lee la tabla **cada vez que la llamas**, el test que inserta "Pad para mouse" (S/ 25) lo encuentra en primer lugar sin que cambies nada.

## Errores comunes

- **Olvidar el `return`.** La función ejecuta la consulta pero devuelve `undefined`. El test dice algo como "expected undefined to be an array".
- **Olvidar `.all()`.** `db.prepare(...)` solo prepara la consulta: devuelve un objeto "sentencia", no las filas. Sin `.all()` no hay datos.
- **Usar `SELECT *`.** Trae todas las columnas (`id`, `categoria`, `stock`...). Lo reconoces en el test "solo nombre y precio". En el trabajo también se evita: pides solo lo que usas.
- **Ordenar en JavaScript con `.sort()`.** Funciona aquí, pero es trabajo que la base hace mejor y más rápido, sobre todo con miles de filas. Aprende a pedirle el orden a SQL.
- **Escribir mal un nombre de columna o tabla** (`producto` en vez de `productos`). SQLite lanza un error como `no such table: producto` o `no such column: precios`. Léelo: te dice exactamente qué nombre no encontró.
- **Copiar los datos a mano en un arreglo.** Pasaría algunos tests, pero el último inserta un producto nuevo y falla.

## Otra forma de resolverlo

Puedes escribir el orden explícito con `ASC` (ascendente, de menor a mayor). Es igual a no ponerlo, pero algunos equipos lo prefieren porque se lee más claro:

```sql
SELECT nombre, precio FROM productos ORDER BY precio ASC
```

Cuando la consulta crece, es común escribirla en varias líneas con una plantilla de texto (comillas invertidas). A SQL no le importan los saltos de línea:

```js
return db
  .prepare(`
    SELECT nombre, precio
    FROM productos
    ORDER BY precio ASC
  `)
  .all();
```

Las palabras de SQL (`SELECT`, `FROM`) pueden ir en minúsculas, pero la costumbre es escribirlas en mayúsculas para distinguirlas de los nombres de tus tablas y columnas.

## Cómo explicarlo en la entrevista

> "Uso un SELECT con las dos columnas que necesito, en vez de SELECT asterisco, para no traer datos de más. Indico la tabla con FROM y el orden con ORDER BY, que por defecto es ascendente. Desde Node preparo la consulta con db.prepare y la ejecuto con all, que me devuelve un arreglo de objetos, uno por fila, con las columnas como propiedades. Dejo que la base ordene en vez de hacerlo en JavaScript porque es su trabajo y lo hace de forma eficiente."

## Conceptos

- **Tabla, fila y columna**: la tabla agrupa registros del mismo tipo; cada fila es un registro y cada columna un dato con nombre y tipo.
- **Clave primaria (`id`)**: identifica de forma única cada fila.
- **`SELECT ... FROM ...`**: qué columnas y de qué tabla.
- **`ORDER BY columna [ASC | DESC]`**: ordena el resultado; `ASC` es el valor por defecto.
- **`node:sqlite`**: módulo de Node 24 para usar SQLite sin instalar nada. `db.prepare(sql).all()` devuelve todas las filas como arreglo de objetos.
