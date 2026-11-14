Exporta `crearApp(db)`: una API de libros que guarda y lee los datos de una **base de datos SQLite** en vez de un arreglo. El test crea la base (en memoria) con esta tabla y te la pasa:

```sql
CREATE TABLE libros (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,  -- la base pone el id sola
  titulo TEXT NOT NULL,
  autor  TEXT NOT NULL,
  anio   INTEGER NOT NULL
);
-- 1  Cien años de soledad          Gabriel García Márquez  1967
-- 2  La ciudad y los perros        Mario Vargas Llosa      1963
-- 3  Conversación en La Catedral   Mario Vargas Llosa      1969
```

| Método | Ruta | Código | Respuesta |
|---|---|---|---|
| `GET` | `/libros` | `200` | todos, ordenados por `id` |
| `GET` | `/libros?autor=...` | `200` | solo los de ese autor (comparación exacta) |
| `GET` | `/libros/:id` | `200` / `404` | el libro, o `{ "error": "Libro no encontrado" }` |
| `POST` | `/libros` | `201` / `400` | el libro creado (con su `id`), o `{ "error": "Envía titulo, autor (texto) y anio (entero)" }` |

## node:sqlite en 30 segundos

Node 24 trae SQLite incluido. `db` es un `DatabaseSync`, y todo se hace igual: **preparas** la consulta y la **ejecutas**.

```js
db.prepare("SELECT * FROM libros ORDER BY id").all();            // arreglo de filas (objetos)
db.prepare("SELECT * FROM libros WHERE id = ?").get(2);          // una fila, o undefined
db.prepare("INSERT INTO libros (titulo, autor, anio) VALUES (?, ?, ?)")
  .run("Rayuela", "Julio Cortázar", 1963);                       // { changes: 1, lastInsertRowid: 4 }
```

Cada `?` es un **parámetro**: un hueco que se llena con los argumentos de `all`, `get` o `run`, en orden. `lastInsertRowid` es el id que la base le dio a la fila nueva.

## Nunca concatenes texto en SQL

Esto es **inyección SQL**, uno de los fallos de seguridad más conocidos:

```js
// MAL: el usuario escribe parte de tu consulta
db.prepare(`SELECT * FROM libros WHERE autor = '${req.query.autor}'`).all();
// Con ?autor=' OR '1'='1 la consulta queda:
//   SELECT * FROM libros WHERE autor = '' OR '1'='1'   -> ¡devuelve TODO!
```

Con `?`, el valor viaja **aparte** de la consulta y la base lo trata siempre como dato, nunca como código. Además, un título con comilla (`L'Étranger`) no rompe nada.

## Reglas

- Usa **siempre** parámetros `?` para los valores que vienen del cliente.
- `POST`: `titulo` y `autor` deben ser texto no vacío (tras `trim`) y `anio` un número entero. Si no, `400` y no insertes nada.
- Tras insertar, responde `201` con el libro **leído de la base** (con el `id` que le asignó).
- Un autor sin libros devuelve `200` con `[]`.

## Ejemplos

```js
// GET /libros?autor=Mario%20Vargas%20Llosa      (%20 es el espacio dentro de una URL)
[{ id: 2, titulo: "La ciudad y los perros", ... }, { id: 3, titulo: "Conversación en La Catedral", ... }]

// POST /libros   { "titulo": "Rayuela", "autor": "Julio Cortázar", "anio": 1963 }
// 201
{ "id": 4, "titulo": "Rayuela", "autor": "Julio Cortázar", "anio": 1963 }

// GET /libros/99
// 404 { "error": "Libro no encontrado" }
```
