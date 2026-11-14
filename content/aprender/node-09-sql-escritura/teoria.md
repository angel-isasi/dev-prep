## En una frase

`INSERT` agrega filas, `UPDATE` las cambia y `DELETE` las borra; los dos últimos afectan a **todas** las filas que cumplan el `WHERE` (o a toda la tabla si lo olvidas), y una **transacción** agrupa varios cambios para que se guarden todos o ninguno.

## Lo esencial

### INSERT: agregar

```js
const insertar = db.prepare("INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)");

const r = insertar.run("Inca Kola", 5, 40);
r.changes;          // 1  (filas afectadas)
r.lastInsertRowid;  // 1  (el id que le tocó: así sabes cuál se creó)

insertar.run("Chicha", 4, 12); // una sentencia preparada se reutiliza
```

- Nombra las columnas: si mañana agregan una columna, tu `INSERT` sigue funcionando.
- No envíes el `id` si es `INTEGER PRIMARY KEY`: la base lo asigna.
- Si una columna es `NOT NULL` y no la mandas, falla con `NOT NULL constraint failed`.

### UPDATE: cambiar

```js
db.prepare("UPDATE productos SET precio = ? WHERE id = ?").run(5.5, 1);
// { changes: 1 }

db.prepare("UPDATE productos SET stock = stock - ? WHERE id = ?").run(3, 2);
// stock - ? usa el valor actual de la fila: no hace falta leerlo antes
```

### DELETE: borrar

```js
const r = db.prepare("DELETE FROM productos WHERE id = ?").run(7);
r.changes; // 0 si no existía el 7, 1 si lo borró
```

`changes` es tu forma de saber si la fila existía: en una API, `changes === 0` significa `404`.

### El peligro de olvidar el WHERE

```sql
UPDATE productos SET precio = 0;   -- ¡TODOS los productos ahora cuestan 0!
DELETE FROM pedidos;               -- ¡borraste TODOS los pedidos!
```

La base no pregunta "¿seguro?". Hábitos que te salvan:
1. Escribe primero el `SELECT` con el mismo `WHERE` y mira qué filas salen.
2. Después cambia `SELECT *` por `UPDATE ... SET` o `DELETE`.
3. Revisa `changes`: si esperabas 1 y salió 300, algo anda mal.

### Transacciones: todo o nada

Al vender, tienes que **registrar la venta** y **descontar el stock**. Si se guarda una y la otra falla, los datos quedan inconsistentes (una venta sin descuento de stock). Una transacción lo evita:

```js
function vender(db, productoId, cantidad) {
  db.exec("BEGIN");                  // empieza: nada es definitivo todavía
  try {
    const r = db
      .prepare("UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?")
      .run(cantidad, productoId, cantidad);
    if (r.changes === 0) throw new Error("Stock insuficiente o producto inexistente");

    db.prepare("INSERT INTO ventas (producto_id, cantidad) VALUES (?, ?)").run(productoId, cantidad);

    db.exec("COMMIT");               // todo salió bien: se guarda junto
  } catch (error) {
    db.exec("ROLLBACK");             // algo falló: se deshace TODO desde el BEGIN
    throw error;
  }
}
```

```
BEGIN ──► UPDATE stock ──► INSERT venta ──► COMMIT   (se guardan las dos)
               │                 │
               └──── error ──────┴────► ROLLBACK     (no se guarda ninguna)
```

Las transacciones también hacen mucho más rápido insertar cientos de filas seguidas.

### Una API de Express con base de datos

Juntando todo: la ruta valida, consulta con parámetros y elige el código según el resultado.

```js
import express from "express";

export function crearApp(db) {     // recibe la base: los tests le pasan una en memoria
  const app = express();
  app.use(express.json());

  app.get("/productos/:id", (req, res) => {
    const p = db.prepare("SELECT * FROM productos WHERE id = ?").get(Number(req.params.id));
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
  });

  app.post("/productos", (req, res) => {
    const { nombre, precio } = req.body ?? {};
    if (typeof nombre !== "string" || !nombre.trim() || typeof precio !== "number" || precio <= 0) {
      return res.status(400).json({ error: "nombre y precio (mayor que 0) son obligatorios" });
    }
    const r = db.prepare("INSERT INTO productos (nombre, precio) VALUES (?, ?)").run(nombre.trim(), precio);
    const creado = db.prepare("SELECT * FROM productos WHERE id = ?").get(r.lastInsertRowid);
    res.status(201).json(creado);
  });

  app.delete("/productos/:id", (req, res) => {
    const r = db.prepare("DELETE FROM productos WHERE id = ?").run(Number(req.params.id));
    if (r.changes === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.sendStatus(204);
  });

  return app;
}
```

Así trabaja una app real: React hace `fetch` → Express valida → SQL lee o escribe → Express responde con JSON y un código.

## Errores típicos

**1. UPDATE o DELETE sin WHERE**

Afecta a toda la tabla. Prueba antes con un `SELECT` y revisa `changes`.

**2. Concatenar los valores**

```js
db.prepare(`UPDATE usuarios SET nombre = '${nombre}' WHERE id = ${id}`).run();
```
Inyección SQL otra vez. Usa `SET nombre = ? WHERE id = ?` y `.run(nombre, id)`.

**3. Olvidar el ROLLBACK**

Si hay un error después del `BEGIN` y no haces `ROLLBACK`, la transacción queda abierta y el siguiente `BEGIN` falla con `cannot start a transaction within a transaction`.

**4. Leer y luego escribir sin cuidado**

```js
const { stock } = db.prepare("SELECT stock FROM productos WHERE id = ?").get(id);
db.prepare("UPDATE productos SET stock = ? WHERE id = ?").run(stock - 1, id);
```
Funciona, pero son dos pasos donde se puede colar otro cambio. `SET stock = stock - 1` lo hace en uno solo.

**5. No revisar `changes`**

Un `UPDATE ... WHERE id = 99` sobre un id inexistente **no lanza error**: solo da `changes: 0`. Si no lo revisas, tu API responde 200 como si hubiera actualizado algo.

## Chuleta

```sql
INSERT INTO tabla (col1, col2) VALUES (?, ?);
UPDATE tabla SET col1 = ?, col2 = col2 + 1 WHERE id = ?;
DELETE FROM tabla WHERE id = ?;
```

- `.run(...)` → `{ changes, lastInsertRowid }`.
- `changes === 0` → no existía (404 en una API).
- `lastInsertRowid` → id de la fila recién creada.
- Antes de un UPDATE o DELETE: el mismo `WHERE` en un `SELECT`.
- Transacción: `BEGIN` → cambios → `COMMIT`; si algo falla, `ROLLBACK` y relanzar el error.

## En la entrevista

**¿Qué pasa si ejecutas un UPDATE sin WHERE?**
Se actualizan todas las filas de la tabla. Por eso conviene probar primero el `WHERE` con un `SELECT`, trabajar dentro de una transacción si es delicado y revisar cuántas filas cambiaron.

**¿Qué es una transacción?**
Un grupo de operaciones que se ejecuta como una sola: o se guardan todas (`COMMIT`) o no se guarda ninguna (`ROLLBACK`). Sirve cuando varios cambios deben ir juntos, como registrar una venta y descontar el stock.

**¿Qué significa ACID?**
Son las garantías de una transacción: Atomicidad (todo o nada), Consistencia (los datos cumplen las reglas al terminar), Aislamiento (las transacciones simultáneas no se pisan) y Durabilidad (lo confirmado no se pierde aunque se apague el servidor).

**¿Cómo conectarías una API de Express con una base de datos?**
Cada ruta valida la entrada, ejecuta una consulta parametrizada y responde según el resultado: si `get` no encuentra la fila o `changes` es 0, devuelve 404; si creó algo, 201 con el recurso usando el id de `lastInsertRowid`. Paso la base como parámetro a `crearApp` para poder probarla con una base en memoria.
