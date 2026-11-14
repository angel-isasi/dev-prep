## Idea clave

`WHERE` filtra filas: solo pasan las que cumplen la condición. Las condiciones se combinan con `AND` (deben cumplirse las dos) y `OR` (basta una), y `LIKE` busca texto con comodines (`%` = cualquier cosa). Los valores siempre entran como **parámetros `?`**, nunca pegados al texto SQL: así se evita la **inyección SQL**.

## Paso a paso

1. **Igualdad.** "Productos de una categoría" se traduce a `WHERE categoria = ?`. En SQL la igualdad se escribe con **un solo** `=` (no `===`).

   ```js
   db.prepare("SELECT id, nombre, precio FROM productos WHERE categoria = ? ORDER BY precio").all(categoria);
   ```

   El orden de las partes importa: `SELECT`, `FROM`, `WHERE`, `ORDER BY`.

2. **Rango con `AND`.** "Entre mínimo y máximo, incluidos" son dos condiciones que deben cumplirse a la vez:

   ```sql
   WHERE precio >= ? AND precio <= ?
   ```

   Hay dos `?`, así que pasas dos valores **en el mismo orden**: `.all(minimo, maximo)`.

3. **"Contiene" con `LIKE`.** `LIKE` compara con un patrón donde `%` significa "cualquier texto, incluso vacío". `'%monitor%'` es "tiene monitor en cualquier parte". El `%` se pone **en el valor**, no en el SQL:

   ```js
   db.prepare("SELECT id, nombre FROM productos WHERE nombre LIKE ? ORDER BY nombre").all(`%${texto}%`);
   ```

   En SQLite, `LIKE` no distingue mayúsculas de minúsculas en letras sin tilde, por eso "monitor" encuentra "Monitor 24 pulgadas".

4. **"Una u otra" con `OR`:**

   ```sql
   WHERE ciudad = ? OR ciudad = ?
   ```

## Por qué funciona

Recorrido de `productosEnRango(db, 99, 149)`. Los `?` se llenan con 99 y 149, y la base revisa fila por fila:

| Producto | precio | `precio >= 99` | `precio <= 149` | ¿Pasa? |
|---|---|---|---|---|
| Teclado mecánico | 189 | sí | no | no |
| Mouse inalámbrico | 59 | no | sí | no |
| Audífonos con micrófono | 129 | sí | sí | **sí** |
| Parlante bluetooth | 99 | sí | sí | **sí** |
| Webcam HD | 149 | sí | sí | **sí** |
| (los demás cuestan más de 149) | | | | no |

Luego `ORDER BY precio` las deja en 99, 129, 149.

**Por qué los `?` te protegen.** Imagina que armas el SQL concatenando:

```js
// MAL
db.prepare("SELECT * FROM productos WHERE categoria = '" + categoria + "'").all();
```

Si alguien escribe `x' OR '1'='1` en el buscador, el SQL queda:

```sql
SELECT * FROM productos WHERE categoria = 'x' OR '1'='1'
```

`'1'='1'` siempre es verdadero, así que trae **todos** los productos. Con un `DELETE` podría borrar tu tabla entera. Con `?`, la base recibe el valor **por separado** y lo trata siempre como un dato: busca una categoría que se llame literalmente `x' OR '1'='1`, no la encuentra y devuelve `[]`. Por la misma razón, `"O'Higgins"` con concatenación rompe la consulta (el apóstrofo cierra el texto antes de tiempo) y con `?` funciona sin problema.

## Errores comunes

- **Concatenar o usar plantillas `${}` dentro del SQL.** Es la inyección SQL. Lo reconoces en el test del intento de inyección: devuelve productos en vez de `[]`.
- **Poner los `%` en el SQL junto al `?`** (`LIKE '%?%'`). Dentro de comillas, el `?` es un signo de interrogación literal, no un parámetro. Los `%` van en el valor.
- **Pasar los valores en otro orden.** `.all(maximo, minimo)` llena el primer `?` con el máximo. El rango sale vacío.
- **Usar `>` y `<` en vez de `>=` y `<=`.** Pierdes los extremos: el test de 99 a 149 no trae el parlante ni la webcam.
- **Escribir `ciudad = ? OR ?`.** Se lee bien en castellano pero en SQL el segundo `?` queda solo, como "verdadero o falso". Repite la columna: `ciudad = ? OR ciudad = ?`.
- **Usar comillas dobles para textos dentro del SQL** (`categoria = "audio"`). En SQL estándar, los textos van entre comillas simples; las dobles son para nombres de columnas. Con parámetros no te pasa, porque no escribes el texto.

## Otra forma de resolverlo

**`BETWEEN`** es un atajo para rangos con los dos extremos incluidos:

```sql
WHERE precio BETWEEN ? AND ?
```

**`IN`** es un atajo para "una de varias opciones":

```sql
WHERE ciudad IN (?, ?)
```

Los dos dan el mismo resultado que tus versiones con `AND` y `OR`. `BETWEEN` e `IN` se leen mejor; `AND` y `OR` son más flexibles cuando las condiciones son distintas (por ejemplo, `categoria = ? AND stock > 0`). Usa la que te resulte más clara.

**Parámetros con nombre**: en vez de `?`, `node:sqlite` acepta `:nombre` y un objeto, útil cuando hay muchos valores:

```js
db.prepare("SELECT nombre, precio FROM productos WHERE precio BETWEEN :min AND :max ORDER BY precio")
  .all({ min: minimo, max: maximo });
```

## Cómo explicarlo en la entrevista

> "Filtro con WHERE y combino condiciones con AND para el rango y con OR para las dos ciudades; para buscar texto uso LIKE con el comodín de porcentaje. Todos los valores los paso como parámetros con signo de interrogación, nunca concatenados, porque así la base los trata como datos y no como código: eso evita la inyección SQL, que es una de las vulnerabilidades más comunes. Por ejemplo, si alguien escribe comilla OR uno igual a uno, con parámetros simplemente no encuentra nada."

## Conceptos

- **`WHERE condición`**: filtra filas antes de devolverlas.
- **Operadores**: `=`, `<>` (distinto), `<`, `<=`, `>`, `>=`, `AND`, `OR`, `NOT`.
- **`LIKE` y `%`**: búsqueda por patrón; `%` es cualquier texto, `_` es un solo carácter.
- **Parámetros `?`**: valores que se pasan aparte a `.all(...)`, en el mismo orden.
- **Inyección SQL**: ataque que mete código SQL dentro de un valor; se evita con parámetros.
- **`BETWEEN` e `IN`**: atajos para rangos y listas de opciones.
