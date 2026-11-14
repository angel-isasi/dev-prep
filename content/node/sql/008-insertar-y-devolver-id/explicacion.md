## Idea clave

`INSERT INTO tabla (columnas) VALUES (?, ?, ?)` agrega una fila. Se ejecuta con `.run()`, que devuelve `{ changes, lastInsertRowid }`: cuántas filas cambió y el `id` que la base generó. Antes de insertar, **validas** en JavaScript para dar errores claros y no guardar basura.

## Paso a paso

1. **Limpia los datos.** Lo que llega de un formulario suele traer espacios de más. `.trim()` los quita del inicio y del final. El `?? ""` cubre el caso en que la propiedad no venga:

   ```js
   const nombre = (datos.nombre ?? "").trim();
   ```

2. **Valida en el orden pedido.** Un texto vacío es "falsy", así que `!nombre` es verdadero cuando no hay nombre. Lanzar un `Error` corta la función: la base no se toca.

   ```js
   if (!nombre) throw new Error("El nombre es obligatorio");
   if (!email.includes("@")) throw new Error("El email no es válido");
   if (!ciudad) throw new Error("La ciudad es obligatoria");
   ```

3. **Pregunta si el email ya existe.** `.get()` devuelve la primera fila o `undefined` si no hay:

   ```js
   const existente = db.prepare("SELECT id FROM clientes WHERE email = ?").get(email);
   if (existente) throw new Error("El email ya está registrado");
   ```

4. **Inserta sin `id`.** Una columna `INTEGER PRIMARY KEY` en SQLite se llena sola con el siguiente número si no la mandas. Lista las columnas que sí envías y pon un `?` por cada una:

   ```js
   const resultado = db
     .prepare("INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)")
     .run(nombre, email, ciudad);
   ```

5. **Devuelve el id nuevo:** `resultado.lastInsertRowid`. `node:sqlite` lo da como número (o como `BigInt` si activas la opción de enteros grandes); `Number(...)` asegura que siempre sea un número normal.

## Por qué funciona

Recorrido de `crearCliente(db, { nombre: "  Pedro Salas ", email: " pedro.salas@correo.pe ", ciudad: " Ica " })`:

| Paso | Valor |
|---|---|
| `trim` | `"Pedro Salas"`, `"pedro.salas@correo.pe"`, `"Ica"` |
| validaciones | las tres pasan |
| `SELECT ... WHERE email = ?` | `undefined` (nadie lo tiene) |
| `INSERT ... .run(...)` | `{ changes: 1, lastInsertRowid: 7 }` |
| retorno | `7` |

Con `{ nombre: "Otra Ana", email: "ana.torres@correo.pe", ... }` el `SELECT` encuentra `{ id: 1 }` y se lanza el error antes del `INSERT`: la tabla sigue con 6 filas.

¿Y el apóstrofo de `O'Neill`? Con concatenación, el SQL quedaría `VALUES ('Rosa O'Neill', ...)` y el apóstrofo cerraría el texto antes de tiempo: error de sintaxis, o peor, inyección. Con `?` la base recibe el texto aparte y lo guarda tal cual.

## Errores comunes

- **Usar `.all()` o `.get()` para el `INSERT`.** Un `INSERT` no devuelve filas. `.run()` es el método para escribir y es el que trae `lastInsertRowid`.
- **Mandar el `id` a mano** (por ejemplo, contar filas y sumar 1). Si alguien borró un cliente o dos personas se registran a la vez, chocan los ids. Deja que la base lo genere.
- **Validar después de insertar.** El cliente inválido ya quedó guardado. Lo reconoces en los tests que revisan que sigan habiendo 6 clientes.
- **Devolver el resultado completo** (`{ changes, lastInsertRowid }`) en vez del id. El test dice `expected { changes: 1, ... } to be 7`.
- **Olvidar el `trim` antes de validar.** `"   "` no es un texto vacío, así que `!nombre` es falso y se guarda un cliente con nombre en blanco.
- **No listar las columnas** (`INSERT INTO clientes VALUES (?, ?, ?)`). SQLite espera un valor para **cada** columna, incluido el `id`, y da `table clientes has 4 columns but 3 values were supplied`.

## Otra forma de resolverlo

**Dejar que la restricción `UNIQUE` detecte el duplicado.** La tabla ya prohíbe emails repetidos: si intentas insertar uno, SQLite lanza un error con el texto `UNIQUE constraint failed: clientes.email`. Puedes atraparlo y traducirlo:

```js
try {
  const r = db.prepare("INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?)").run(nombre, email, ciudad);
  return Number(r.lastInsertRowid);
} catch (error) {
  if (String(error.message).includes("UNIQUE")) throw new Error("El email ya está registrado");
  throw error;
}
```

Esta versión es más segura cuando muchos usuarios escriben a la vez: entre tu `SELECT` y tu `INSERT` otra petición podría registrar el mismo email, y la restricción lo frena igual. La versión con `SELECT` previo es más fácil de leer y da el error antes. En un proyecto real se usan **las dos**: validación en el código para mensajes claros y restricción en la base como última defensa.

**`RETURNING`**: SQLite (y PostgreSQL) permiten pedir columnas de la fila insertada en el mismo `INSERT`:

```js
const fila = db.prepare("INSERT INTO clientes (nombre, email, ciudad) VALUES (?, ?, ?) RETURNING id").get(nombre, email, ciudad);
return fila.id;
```

## Cómo explicarlo en la entrevista

> "Primero limpio los textos con trim y valido en el código, lanzando errores claros antes de tocar la base. Compruebo si el email ya existe con un SELECT y, si todo está bien, hago un INSERT con parámetros, sin mandar el id, para que la base lo genere. Lo ejecuto con run, que me devuelve lastInsertRowid, y ese es el id que retorno para que el frontend pueda redirigir. Además la columna email es UNIQUE en la base, que es la última defensa si dos registros llegan al mismo tiempo."

## Conceptos

- **`INSERT INTO tabla (cols) VALUES (?, ...)`**: agrega una fila.
- **`.run()`**: ejecuta sentencias que escriben; devuelve `{ changes, lastInsertRowid }`.
- **`INTEGER PRIMARY KEY`**: en SQLite, la base asigna el id automáticamente.
- **Restricciones** (`NOT NULL`, `UNIQUE`): reglas que la base hace cumplir siempre.
- **Validar antes de escribir**: errores claros y datos limpios.
- **`RETURNING`**: devuelve columnas de la fila recién insertada.
