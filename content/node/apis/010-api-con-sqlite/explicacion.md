## Idea clave

La API tiene la misma forma que con un arreglo, pero los datos los guarda y lee una **base de datos**: cada ruta prepara una consulta SQL con `db.prepare` y la ejecuta con `all`, `get` o `run`. Todo valor que viene del cliente va como **parámetro `?`**, nunca pegado al texto del SQL, para evitar la inyección SQL.

## Paso a paso

1. **Recibir la base.** `crearApp(db)` no crea la base: la recibe. Así los tests usan una base en memoria nueva para cada caso y, en producción, le pasarías una base en archivo. Se llama **inyección de dependencias**.
2. **Preparar las consultas.** `db.prepare(sql)` compila la consulta y devuelve un objeto reutilizable. Puedes prepararlas una vez al crear la app y usarlas en cada petición.
3. **Listar.** `SELECT * FROM libros ORDER BY id` con `.all()` devuelve un arreglo de objetos (una fila = un objeto con las columnas como propiedades). Si vino `?autor=`, usas otra consulta con `WHERE autor = ?` y le pasas el valor: `.all(autor)`.
4. **Uno por id.** `SELECT * FROM libros WHERE id = ?` con `.get(id)` devuelve la fila o `undefined`. Si es `undefined`, 404.
5. **Crear.** Validas igual que en el ejercicio 004. Luego `INSERT INTO libros (titulo, autor, anio) VALUES (?, ?, ?)` con `.run(titulo, autor, anio)`. No mandas el `id`: la columna `AUTOINCREMENT` lo pone.
6. **Responder lo guardado.** `run` devuelve `{ changes: 1, lastInsertRowid: 4 }`. Con ese id haces un `get` y respondes `201` con la fila real, tal como quedó en la base.

```js
const porId = db.prepare("SELECT * FROM libros WHERE id = ?");
const insertar = db.prepare("INSERT INTO libros (titulo, autor, anio) VALUES (?, ?, ?)");

app.post("/libros", (req, res) => {
  const { titulo, autor, anio } = req.body ?? {};
  // ...validación, 400 si algo falla...
  const { lastInsertRowid } = insertar.run(titulo.trim(), autor.trim(), anio);
  res.status(201).json(porId.get(lastInsertRowid));
});
```

## Por qué funciona

Qué le llega a SQLite en cada caso (la consulta y los parámetros viajan **separados**):

| Petición | Consulta | Parámetros | Resultado |
|---|---|---|---|
| `GET /libros?autor=Mario%20Vargas%20Llosa` | `... WHERE autor = ?` | `["Mario Vargas Llosa"]` | filas 2 y 3 |
| `GET /libros?autor=' OR '1'='1` | `... WHERE autor = ?` | `["' OR '1'='1"]` | ninguna: busca un autor que se llame literalmente así |
| `POST` `{ titulo: "L'Étranger", ... }` | `INSERT ... VALUES (?, ?, ?)` | `["L'Étranger", "Albert Camus", 1942]` | fila 4, la comilla se guarda tal cual |
| `GET /libros/99` | `... WHERE id = ?` | `[99]` | `undefined`, 404 |

Si en cambio armaras el SQL con un template string, el segundo caso produciría `WHERE autor = '' OR '1'='1'`: la condición `'1'='1'` siempre es verdadera y devolverías **todos** los libros. Con un `DELETE` o un `UPDATE`, el daño sería mucho peor. Y el tercer caso fallaría con un error de sintaxis, porque la comilla de `L'Étranger` cerraría el texto antes de tiempo.

Con parámetros, la base primero entiende la **estructura** de la consulta y después recibe los valores como **datos**. Un dato nunca puede convertirse en código.

## Errores comunes

- **Concatenar o usar template strings** (`` `... WHERE autor = '${autor}'` ``): el test de inyección devuelve los 3 libros y el de `L'Étranger` revienta con un error de SQL (500).
- **Confundir `get` y `all`**: `all` siempre devuelve un arreglo (aunque tenga una fila), así que `if (!libro)` nunca detecta el 404 porque `[]` es truthy. Para una fila, `get`.
- **Pasar los parámetros como arreglo** (`.run([titulo, autor, anio])`): `node:sqlite` los espera como argumentos separados, `.run(titulo, autor, anio)`.
- **Responder con `req.body` en vez de leer la fila**: te falta el `id` (o devuelves campos que no se guardaron). Lee lo que quedó en la base.
- **Olvidar `ORDER BY id`**: SQLite suele devolverlas en orden de inserción, pero SQL no lo garantiza sin `ORDER BY`. Si el orden importa, pídelo.
- **Crear la base dentro de `crearApp`** (`new DatabaseSync(":memory:")`): la tabla no existe y el test no puede ver lo que insertaste.
- **Validar `anio` con `typeof anio === "number"`**: deja pasar `1963.5`. Usa `Number.isInteger`.

## Otra forma de resolverlo

**Una sola consulta para listar**, con el filtro opcional resuelto en SQL:

```js
const listar = db.prepare("SELECT * FROM libros WHERE (? IS NULL OR autor = ?) ORDER BY id");
app.get("/libros", (req, res) => {
  const autor = req.query.autor || null;
  res.json(listar.all(autor, autor));
});
```

Si `autor` es `NULL`, la primera condición es verdadera y no filtra. Es compacto, pero con varios filtros se vuelve difícil de leer; muchos equipos prefieren armar la lista de condiciones y de parámetros en JavaScript (siempre con `?`).

**`RETURNING`**: SQLite (y PostgreSQL) permiten `INSERT ... VALUES (?, ?, ?) RETURNING *`, que inserta y devuelve la fila en un solo paso con `.get(...)`. Te ahorras el segundo `SELECT`.

**En el trabajo** usarías PostgreSQL o MySQL con su librería (`pg`, `mysql2`) o un ORM como Prisma. Las consultas son `async` (con `await`), pero la idea es idéntica: SQL con parámetros (en PostgreSQL se escriben `$1`, `$2`).

## Cómo explicarlo en la entrevista

> "La app recibe la conexión a la base como parámetro, así en los tests le paso una SQLite en memoria. Cada ruta usa una consulta preparada: SELECT con all para la lista, get para un registro y 404 si devuelve undefined, e INSERT con run, que me da el lastInsertRowid para leer la fila creada y responder 201. Todos los valores del cliente van como parámetros con signo de interrogación, nunca concatenados, porque así la base los trata como datos y no como código: eso previene la inyección SQL, y de paso los textos con comillas no rompen la consulta."

## Conceptos

- **`node:sqlite`**: `DatabaseSync`, `prepare`, `all`, `get`, `run`.
- **SQL básico**: `SELECT ... WHERE ... ORDER BY`, `INSERT INTO ... VALUES`.
- **Consultas parametrizadas (`?`)**: valores separados del código SQL.
- **Inyección SQL**: por qué nunca concatenar entradas del usuario.
- **`lastInsertRowid`** y `AUTOINCREMENT`: el id lo asigna la base.
- **Inyección de dependencias**: `crearApp(db)` recibe la base, no la crea.
- **Codificación de URL**: `encodeURIComponent` y `%20` para espacios.
