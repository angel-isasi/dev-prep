## En una frase

Un middleware es una función que se ejecuta **en medio** de la petición y la respuesta: puede revisar o modificar `req`, responder y cortar ahí, o llamar a `next()` para que siga la siguiente función de la fila.

## Lo esencial

### Qué es un middleware

En Express, cada petición pasa por una **fila de funciones**, en el orden en que las registraste. Cada una recibe `(req, res, next)`:

```js
function registrar(req, res, next) {
  console.log(req.method, req.url); // GET /productos
  next(); // "listo, que siga el siguiente"
}

app.use(registrar);          // para TODAS las rutas
app.use(express.json());     // también es un middleware: llena req.body
app.get("/productos", (req, res) => res.json([])); // la ruta también es parte de la fila
```

Cada middleware hace **una** de dos cosas:
- Llama a `next()` para pasar al siguiente.
- Responde (`res.json`, `res.status(...).json`) y la fila se corta ahí.

Si no hace ninguna, la petición se queda colgada.

### El orden importa

```
petición → registrar → express.json() → soloConToken → ruta → respuesta
```

```js
app.use(express.json());
app.post("/tareas", (req, res) => { /* aquí req.body ya existe */ });

app.post("/notas", (req, res) => { /* aquí req.body es undefined... */ });
app.use(express.json()); // ...porque este se registró DESPUÉS
```

Puedes usar un middleware solo en algunas rutas, pasándolo antes del manejador:

```js
app.get("/perfil", soloConToken, (req, res) => res.json(req.usuario));
```

### Errores: un solo lugar para manejarlos

Un middleware con **cuatro parámetros** `(err, req, res, next)` es el manejador de errores. Va **al final**, después de todas las rutas:

```js
app.get("/productos/:id", async (req, res) => {
  const producto = await buscarProducto(req.params.id); // si esto lanza un error...
  res.json(producto);
});

// 404 para cualquier ruta que no coincidió
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ...Express lo trae aquí
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  res.status(status).json({ error: status === 500 ? "Error interno" : err.message });
});
```

- En Express 5, un `throw` dentro de una ruta (incluso `async`) llega solo al manejador de errores.
- También puedes mandarlo a mano: `next(error)`.
- Al cliente no le envíes detalles internos de un 500 (rutas de archivos, SQL): lo detallado va a la consola.

Un patrón útil es crear errores con su código:

```js
class ErrorHttp extends Error {
  constructor(status, mensaje) { super(mensaje); this.status = status; }
}
if (!producto) throw new ErrorHttp(404, "Producto no encontrado");
```

### Autenticación con token

**Autenticación** = ¿quién eres? **Autorización** = ¿tienes permiso para esto?

El flujo típico:
1. El usuario hace login: `POST /login` con email y contraseña.
2. Si son correctos, el servidor responde con un **token** (un texto largo).
3. El frontend lo guarda y lo manda en cada petición en el header `Authorization`.
4. Un middleware revisa el token antes de las rutas protegidas.

```js
// frontend
fetch("/api/perfil", { headers: { Authorization: `Bearer ${token}` } });

// servidor
function soloConToken(req, res, next) {
  const header = req.headers.authorization ?? ""; // Express pone los headers en minúscula
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const usuario = token && sesiones.get(token);   // ¿es un token válido?
  if (!usuario) return res.status(401).json({ error: "Necesitas iniciar sesión" });
  req.usuario = usuario; // lo dejo listo para la ruta
  next();
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== "admin") return res.status(403).json({ error: "No tienes permiso" });
  next();
}

app.delete("/usuarios/:id", soloConToken, soloAdmin, borrarUsuario);
```

| Código | Significa |
|---|---|
| `401 Unauthorized` | No sé quién eres: falta el token o no es válido |
| `403 Forbidden` | Sé quién eres, pero no tienes permiso |

### ¿Qué es un JWT?

Un **JWT** (JSON Web Token) es un formato de token muy usado. Tiene tres partes separadas por puntos: `cabecera.datos.firma`.
- Los **datos** (por ejemplo `{ "id": 7, "rol": "admin" }`) van en Base64: **cualquiera puede leerlos**, no están cifrados. Nunca pongas contraseñas ahí.
- La **firma** se calcula con una clave secreta que solo tiene el servidor. Si alguien cambia los datos, la firma ya no coincide y el servidor lo rechaza.
- Así el servidor puede confiar en el token sin guardarlo en una base de datos. Suelen tener fecha de vencimiento (`exp`).

En la práctica se usa una librería (como `jsonwebtoken`) para firmarlos y verificarlos.

### CORS en una frase

El navegador bloquea que una página en `localhost:5173` lea respuestas de una API en otro origen (`localhost:3000`) salvo que la API lo permita con headers como `Access-Control-Allow-Origin` (en Express, con el middleware `cors`); es una regla del navegador, por eso `fetch` desde Node o Postman no la sufre.

## Errores típicos

**1. Olvidar `next()`**

```js
app.use((req, res, next) => { console.log(req.url); }); // y no llama next()
```
Todas las peticiones se quedan colgadas hasta que el cliente se cansa.

**2. Llamar a `next()` y además responder**

```js
if (!token) res.status(401).json({ error: "..." });
next(); // sigue a la ruta: "Cannot set headers after they are sent"
```
Usa `return res.status(401)...`.

**3. Manejador de errores con tres parámetros o al inicio**

Express lo reconoce por tener **exactamente cuatro** parámetros, y solo atrapa errores de lo que está antes. Va al final y con `(err, req, res, next)`, aunque no uses `next`.

**4. Confundir 401 con 403**

Sin token o token inválido: `401`. Token válido pero sin permiso: `403`.

**5. Creer que un JWT está cifrado**

Cualquiera puede decodificar sus datos. La firma evita que los **cambien**, no que los **lean**.

## Chuleta

- Middleware: `(req, res, next) => { ...; next(); }` o responde y corta.
- `app.use(fn)` para todas las rutas; `app.get(ruta, fn1, fn2, manejador)` para una.
- Se ejecutan en el orden de registro: `express.json()` antes de las rutas.
- 404 general: `app.use((req, res) => res.status(404)...)` después de las rutas.
- Errores: `app.use((err, req, res, next) => ...)` al final de todo.
- Token: `Authorization: Bearer <token>` → `req.headers.authorization`.
- `401` sin identidad, `403` sin permiso.
- JWT = cabecera.datos.firma; datos legibles, firma con clave secreta.

## En la entrevista

**¿Qué es un middleware en Express?**
Es una función con `(req, res, next)` que se ejecuta entre que llega la petición y se envía la respuesta. Puede leer o modificar la petición, responder y cortar la cadena, o llamar a `next()` para pasar a la siguiente. Se usan para leer JSON, registrar peticiones, autenticar o manejar errores.

**¿Cómo manejas los errores en una API de Express?**
Con un middleware de cuatro parámetros `(err, req, res, next)` registrado al final. Las rutas lanzan errores o llaman a `next(error)`, y ese único lugar decide el código de estado y el mensaje, sin mostrar detalles internos al cliente.

**¿Cómo funciona la autenticación con token?**
El usuario hace login, el servidor verifica sus datos y le entrega un token. El cliente lo envía en el header `Authorization: Bearer ...` en cada petición, y un middleware lo valida antes de las rutas protegidas; si no es válido responde 401.

**¿Qué es un JWT?**
Un token con tres partes, cabecera, datos y firma. Los datos se pueden leer, pero la firma, hecha con una clave secreta del servidor, garantiza que nadie los modificó. Así el servidor confía en el token sin consultarlo en una base de datos.

**¿Qué es CORS?**
Una regla de seguridad del navegador que bloquea que una página lea respuestas de otro origen, salvo que el servidor lo autorice con el header `Access-Control-Allow-Origin`.
