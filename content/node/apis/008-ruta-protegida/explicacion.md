## Idea clave

La autenticación es un **middleware por ruta**: lee el header `Authorization: Bearer <token>`, y si no puede saber quién eres corta con **401**; si sí, guarda la sesión en `req.usuario` y llama a `next()`. Después, otro middleware (o la ruta) revisa el rol y corta con **403** si no alcanza. 401 es "no sé quién eres"; 403 es "sé quién eres, pero no puedes".

## Paso a paso

1. **Leer el header.** `req.get("Authorization")` devuelve el valor o `undefined`. Es lo mismo que `req.headers.authorization` (Node guarda los nombres en minúsculas).
2. **Tres comprobaciones en orden**, cada una con su mensaje y su `return`:
   - ¿Vino? Si no: `"Falta el token"`.
   - ¿Empieza con `"Bearer "` (con el espacio)? Si no: error de formato.
   - El token es lo que sigue: `cabecera.slice("Bearer ".length)`. ¿Está en `SESIONES`? Si no: `"Token inválido"`.
3. **El header `WWW-Authenticate`.** Todos los 401 lo llevan. Una función ayudante `noAutenticado(res, mensaje)` lo pone y responde, para no repetirlo tres veces.
4. **Dejar pasar.** `req.usuario = sesion; next();`. `req` es el mismo objeto durante toda la petición, así que lo que le agregas aquí lo ve el handler de la ruta.
5. **Middleware solo en ciertas rutas.** En vez de `app.use(autenticar)` (que bloquearía también `/publico`), lo pasas como argumento: `app.get("/perfil", autenticar, handler)`. Express ejecuta los argumentos de izquierda a derecha.
6. **El rol.** `soloRol("admin")` es una **fábrica**: devuelve un middleware que compara `req.usuario.rol`. Va **después** de `autenticar`, porque necesita `req.usuario`.

```js
app.get("/admin/usuarios", autenticar, soloRol("admin"), (req, res) => {
  res.json({ usuarios: Object.values(SESIONES).map((s) => s.nombre) });
});
```

## Por qué funciona

| Petición a `/admin/usuarios` con `Authorization:` | `autenticar` | `soloRol("admin")` | Respuesta |
|---|---|---|---|
| (nada) | `cabecera` es `undefined`, corta | no llega | `401` "Falta el token" |
| `token-ana-123` | no empieza con `"Bearer "`, corta | no llega | `401` formato |
| `Bearer token-falso` | `SESIONES["token-falso"]` es `undefined`, corta | no llega | `401` "Token inválido" |
| `Bearer token-beto-456` | sesión de Beto, `next()` | rol `"usuario"` no es `"admin"`, corta | `403` |
| `Bearer token-ana-123` | sesión de Ana, `next()` | rol `"admin"`, `next()` | `200` con `["Ana", "Beto"]` |

Cada eslabón decide: o responde (y la cadena se corta ahí) o llama a `next()`. Por eso el handler final puede asumir que el usuario existe y es admin, sin volver a comprobarlo.

`"Bearer token-ana-123".slice(7)` da `"token-ana-123"`: `"Bearer ".length` es 7 (seis letras más el espacio).

## Errores comunes

- **Responder 403 cuando falta el token.** Si no sabes quién es, es 401. El 403 es solo cuando ya lo identificaste. El test de Beto en `/admin` comprueba que no confundas los dos.
- **Usar `app.use(autenticar)` arriba de todo**: `/publico` también exige token y deja de ser pública.
- **Olvidar `return` antes de responder el error** y seguir hasta `next()`: Express intenta responder dos veces ("Cannot set headers after they are sent").
- **Cortar el token con `split(" ")[1]`** sin revisar el esquema: `"Basic token-ana-123"` pasaría como válido. Primero `startsWith("Bearer ")`.
- **Poner `soloRol` antes que `autenticar`**: `req.usuario` es `undefined` y `req.usuario.rol` lanza "Cannot read properties of undefined".
- **Comparar contra un token escrito en el código** (`if (token === "token-ana-123")`): no escala. Busca en la estructura de sesiones.

## Otra forma de resolverlo

**Revisar el rol dentro del handler**, sin fábrica:

```js
app.get("/admin/usuarios", autenticar, (req, res) => {
  if (req.usuario.rol !== "admin") return res.status(403).json({ error: "No tienes permiso" });
  res.json({ usuarios: Object.values(SESIONES).map((s) => s.nombre) });
});
```

Funciona igual y es más directo con una sola ruta de admin. La fábrica `soloRol(rol)` gana cuando tienes muchas rutas con distintos roles: `soloRol("admin")`, `soloRol("editor")`, sin repetir el `if`.

**En el trabajo**, el token suele ser un **JWT**: en vez de buscarlo en un objeto, el servidor verifica una firma (con una librería como `jsonwebtoken`) y lee del propio token el id y el rol. El middleware tiene exactamente la misma forma: leer `Authorization`, verificar, `req.usuario = ...`, `next()`.

## Cómo explicarlo en la entrevista

> "Hago un middleware de autenticación que lee el header Authorization, verifica que use el esquema Bearer, extrae el token y busca la sesión. Si falla cualquiera de esos pasos respondo 401 con el header WWW-Authenticate; si todo está bien guardo el usuario en req.usuario y llamo a next. Lo aplico solo a las rutas protegidas pasándolo como argumento de app.get. Para la autorización uso otro middleware que revisa el rol y responde 403. La diferencia es que 401 significa que no sé quién eres y 403 que sé quién eres pero no tienes permiso. Con JWT el middleware tendría la misma forma, solo cambia cómo verifico el token."

## Conceptos

- **Header `Authorization: Bearer <token>`**: cómo viaja la credencial.
- **`req.get(nombre)`**: leer un header de la petición (sin importar mayúsculas).
- **Autenticación vs autorización**: quién eres (401) vs qué puedes hacer (403).
- **Header `WWW-Authenticate`**: acompaña al 401.
- **Middleware por ruta**: `app.get(ruta, mw1, mw2, handler)`.
- **`req` como mochila**: lo que un middleware guarda (`req.usuario`) lo leen los siguientes.
- **Fábrica de middlewares**: `soloRol("admin")` devuelve un middleware configurado.
- **JWT**: el formato de token más usado en APIs reales.
