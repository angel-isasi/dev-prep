## En una frase

Una base de datos relacional guarda la información en **tablas** (como hojas de Excel con reglas), y **SQL** es el lenguaje con el que le pides datos: `SELECT columnas FROM tabla WHERE condición`.

## Lo esencial

### Tablas, filas, columnas y clave primaria

```
Tabla: productos
┌────┬─────────────┬───────────┬────────┬───────┐
│ id │ nombre      │ categoria │ precio │ stock │   ← columnas (cada una con un tipo)
├────┼─────────────┼───────────┼────────┼───────┤
│  1 │ Inca Kola   │ bebidas   │    5.0 │    40 │   ← una fila = un producto
│  2 │ Papas Lays  │ snacks    │    3.5 │     0 │
│  3 │ Chicha      │ bebidas   │    4.0 │    12 │
│  4 │ Galletas    │ snacks    │    2.0 │    25 │
└────┴─────────────┴───────────┴────────┴───────┘
```

- **Columna**: un dato que tienen todas las filas, con un tipo (`INTEGER`, `TEXT`, `REAL`).
- **Fila** (registro): un elemento concreto.
- **Clave primaria** (`PRIMARY KEY`): la columna que identifica a cada fila sin repetirse, casi siempre `id`.

```sql
CREATE TABLE productos (
  id        INTEGER PRIMARY KEY,   -- en SQLite se numera solo si no lo envías
  nombre    TEXT NOT NULL,         -- NOT NULL: obligatorio
  categoria TEXT,
  precio    REAL NOT NULL,
  stock     INTEGER DEFAULT 0
);
```

"Relacional" significa que las tablas se **relacionan** entre sí por sus ids (lo ves en el siguiente tema).

### SELECT: pedir datos

```sql
SELECT * FROM productos;                         -- todas las columnas, todas las filas
SELECT nombre, precio FROM productos;            -- solo esas columnas
SELECT nombre, precio * 1.18 AS con_igv FROM productos; -- columna calculada con nombre
```

### WHERE: filtrar filas

```sql
SELECT nombre FROM productos WHERE categoria = 'bebidas';      -- texto con comillas simples
SELECT nombre FROM productos WHERE precio >= 3 AND stock > 0;
SELECT nombre FROM productos WHERE categoria = 'snacks' OR precio < 4;
SELECT nombre FROM productos WHERE categoria IN ('bebidas', 'snacks');
SELECT nombre FROM productos WHERE precio BETWEEN 2 AND 4;     -- incluye 2 y 4
SELECT nombre FROM productos WHERE nombre LIKE 'Ch%';          -- % = cualquier texto
SELECT nombre FROM productos WHERE categoria IS NULL;          -- nunca "= NULL"
```

Comparar se hace con **un solo** `=`, y `<>` o `!=` es "distinto".

### ORDER BY y LIMIT

```sql
SELECT nombre, precio FROM productos
ORDER BY precio DESC, nombre ASC   -- primero el más caro; si empatan, por nombre
LIMIT 3 OFFSET 0;                  -- los 3 primeros (OFFSET salta filas: paginación)
```

El orden de las partes es fijo: `SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...`. Sin `ORDER BY`, la base no garantiza ningún orden.

### Funciones de agregación

Resumen **muchas filas en un valor**:

```sql
SELECT COUNT(*) AS total FROM productos;                         -- 4
SELECT COUNT(*) AS agotados FROM productos WHERE stock = 0;      -- 1
SELECT SUM(stock) AS unidades, AVG(precio) AS promedio,
       MIN(precio) AS mas_barato, MAX(precio) AS mas_caro
FROM productos;                                                  -- 77, 3.625, 2.0, 5.0
```

`COUNT(*)` cuenta filas; `COUNT(columna)` cuenta solo las que no son `NULL`. Ponles nombre con `AS`: así se llamará la propiedad en JavaScript.

### SQL desde Node: `node:sqlite`

Node 24 trae SQLite incluido, sin instalar nada:

```js
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:"); // base en memoria (o "tienda.db" para un archivo)

db.exec(`CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL)`); // SQL sin resultados
// ...supongamos que ya se cargaron los 4 productos de la tabla de arriba

const consulta = db.prepare("SELECT * FROM productos WHERE precio <= ? ORDER BY precio");
consulta.all(4);          // array de objetos: [{ id: 4, nombre: "Galletas", precio: 2 }, ...]

db.prepare("SELECT * FROM productos WHERE id = ?").get(1);  // un objeto, o undefined si no hay
db.prepare("SELECT COUNT(*) AS total FROM productos").get().total; // 4
```

| Método | Devuelve | Para |
|---|---|---|
| `db.exec(sql)` | nada | Crear tablas, varias sentencias seguidas |
| `db.prepare(sql)` | una sentencia preparada | Todo lo demás |
| `.all(...params)` | array de objetos (vacío si no hay) | Varias filas |
| `.get(...params)` | un objeto o `undefined` | Una fila |
| `.run(...params)` | `{ changes, lastInsertRowid }` | INSERT, UPDATE, DELETE (tema 9) |

Si imprimes una fila verás `[Object: null prototype] { ... }`: es un objeto normal para leer y comparar.

### Parámetros `?` contra la inyección SQL

**Nunca** metas lo que escribe el usuario dentro del texto SQL:

```js
// MAL: el usuario controla el SQL
const nombre = "x' OR '1'='1";
db.prepare(`SELECT * FROM usuarios WHERE nombre = '${nombre}'`).all();
// SQL final: ... WHERE nombre = 'x' OR '1'='1'   → devuelve TODOS los usuarios

// BIEN: el valor viaja aparte y nunca se interpreta como SQL
db.prepare("SELECT * FROM usuarios WHERE nombre = ?").all(nombre); // []
```

Cada `?` se llena con los argumentos, en orden. También puedes usar nombres: `WHERE precio <= :max` con `.all({ max: 4 })`. Los parámetros sirven para **valores**, no para nombres de tablas o columnas.

## Errores típicos

**1. Concatenar valores en el SQL**

Abre la puerta a la inyección SQL y además falla con textos que tienen comillas (`O'Brien`). Usa `?`.

**2. Comillas dobles para textos**

En SQL los textos van con comillas **simples**: `'Lima'`. Las dobles son para nombres de columnas.

**3. `= NULL`**

```sql
SELECT * FROM productos WHERE categoria = NULL; -- 0 filas, siempre
```
`NULL` significa "desconocido" y nada es igual a él. Usa `IS NULL` o `IS NOT NULL`.

**4. Usar `all` cuando esperas una fila**

`all` devuelve un array: `db.prepare("... WHERE id = ?").all(1).nombre` es `undefined`. Para una fila usa `get`.

**5. Olvidar `AS` en las agregaciones**

Sin alias, la propiedad se llama `"COUNT(*)"`. Escribe `COUNT(*) AS total` y lee `.total`.

**6. Esperar un orden sin `ORDER BY`**

Hoy puede salir ordenado por casualidad y mañana no. Si el orden importa, pídelo.

## Chuleta

```sql
SELECT col1, col2 AS alias
FROM tabla
WHERE cond1 AND (cond2 OR cond3)   -- =, <>, <, >=, IN (...), BETWEEN a AND b, LIKE 'a%', IS NULL
ORDER BY col DESC
LIMIT 10 OFFSET 20;

COUNT(*), COUNT(col), SUM(col), AVG(col), MIN(col), MAX(col)
```

- `new DatabaseSync(":memory:")`, `db.exec(sql)`, `db.prepare(sql)`.
- `.all(...)` → array, `.get(...)` → objeto o `undefined`, `.run(...)` → `{ changes, lastInsertRowid }`.
- Valores del usuario siempre con `?` o `:nombre`.

## En la entrevista

**¿Qué es una base de datos relacional?**
Una base que guarda los datos en tablas con columnas de tipo fijo y filas, donde cada fila se identifica con una clave primaria y las tablas se relacionan entre sí mediante esas claves. Se consulta con SQL. Ejemplos: PostgreSQL, MySQL, SQLite.

**¿Qué es una clave primaria?**
La columna (o columnas) que identifica de forma única cada fila de una tabla: no se repite y no puede ser nula. Normalmente es un `id` numérico.

**¿Qué es la inyección SQL y cómo la evitas?**
Es un ataque en el que el usuario escribe texto que termina formando parte de la consulta SQL y cambia lo que hace, por ejemplo devolver todos los registros o borrar una tabla. Se evita con consultas parametrizadas: escribo `?` en el SQL y paso los valores aparte, así la base nunca los interpreta como código.

**¿Qué diferencia hay entre `COUNT(*)` y `COUNT(columna)`?**
`COUNT(*)` cuenta todas las filas; `COUNT(columna)` cuenta solo las filas donde esa columna no es `NULL`.
