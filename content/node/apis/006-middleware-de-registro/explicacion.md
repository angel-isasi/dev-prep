## Idea clave

Un middleware es una función `(req, res, next)` que Express ejecuta **antes** de tus rutas. Hace algo (registrar, agregar un header, revisar algo) y llama a `next()` para que la petición siga por la fila. Como la fila respeta el orden en que registras las cosas, los middlewares globales se ponen **arriba** de las rutas.

## Paso a paso

1. **Dónde va.** Si lo pones después de las rutas, una petición a `/saludo` ya fue respondida por la ruta y nunca llega al middleware. Por eso va arriba.
2. **`app.use` sin ruta.** `app.use(fn)` aplica a **todas** las peticiones, de cualquier método y camino. (`app.get` solo aplica a GET y a una ruta concreta.)
3. **Registrar.** `req.method` es el método (`"GET"`, `"POST"`, ...) y `req.path` el camino sin query string. Haces `registro.push({ metodo: req.method, ruta: req.path })`.
4. **El header.** `res.set("X-Api-Version", "1")` guarda el header en la respuesta que todavía no se envió. Cuando más adelante la ruta haga `res.json(...)`, el header sale junto con el resto.
5. **`next()`.** Es la señal de "terminé, que siga el siguiente". Sin ella, la petición nunca llega a la ruta y el cliente espera hasta rendirse.

```js
app.use((req, res, next) => {
  registro.push({ metodo: req.method, ruta: req.path });
  next();
});

app.use((req, res, next) => {
  res.set("X-Api-Version", "1");
  next();
});

app.get("/saludo", (req, res) => res.json({ mensaje: "Hola" }));
```

## Por qué funciona

La fila de Express para esta app es:

```
[registro] -> [versión] -> [GET /saludo] -> [GET /productos] -> (404 automático de Express)
```

| Petición | Recorrido | `registro` después | Respuesta |
|---|---|---|---|
| `GET /saludo` | registro, `next` -> versión, `next` -> GET /saludo responde | `[GET /saludo]` | `200`, `X-Api-Version: 1` |
| `GET /productos?orden=precio` | registro (`req.path` = `/productos`) -> versión -> salta /saludo (no coincide) -> GET /productos responde | `[..., GET /productos]` | `200`, header |
| `GET /no-existe` | registro -> versión -> ninguna ruta coincide -> Express responde 404 | `[..., GET /no-existe]` | `404`, header (ya estaba puesto) |

El header llega incluso en el 404 porque el middleware lo puso en `res` **antes** de que nadie respondiera; el 404 automático de Express usa el mismo `res`.

El arreglo `registro` lo crea el test y se lo pasa a `crearApp`. Como los arreglos se pasan por **referencia**, el `push` dentro del middleware modifica el mismo arreglo que el test revisa después.

## Errores comunes

- **Olvidar `next()`**: la petición queda colgada y los tests terminan por tiempo (timeout). Es el error número uno con middlewares.
- **Poner los middlewares después de las rutas**: `/saludo` responde sin pasar por ellos y el registro queda vacío, pero `/no-existe` sí se registra. Si ves ese comportamiento "a medias", revisa el orden.
- **Usar `req.url` o `req.originalUrl`**: incluyen la query string (`/productos?orden=precio`). Falla el test "sin la query string".
- **Poner el header después de responder**: si haces `res.set` cuando la ruta ya hizo `res.json`, Express lanza "Cannot set headers after they are sent".
- **Llamar a `next()` y además responder**: si haces `res.json(...)` y luego `next()`, la siguiente ruta intenta responder otra vez y aparece el mismo error de headers.
- **Crear un arreglo nuevo** (`registro = []`) dentro de `crearApp`: rompes la referencia y el test ve su arreglo vacío.

## Otra forma de resolverlo

**Un solo middleware** que haga las dos cosas:

```js
app.use((req, res, next) => {
  registro.push({ metodo: req.method, ruta: req.path });
  res.set("X-Api-Version", "1");
  next();
});
```

Es más corto. Separarlos tiene la ventaja de que cada uno hace **una** cosa y lo puedes mover, reutilizar o quitar por separado. En proyectos reales se escriben como funciones con nombre en otro archivo:

```js
const registrar = (registro) => (req, res, next) => { registro.push(/* ... */); next(); };
app.use(registrar(registro));
```

Esa forma (una función que **devuelve** el middleware) se llama *fábrica de middlewares* y te permite configurarlos. `express.json()` es justo eso: lo llamas y te devuelve el middleware. En el trabajo, para logs se usa una librería como **morgan**, que es un middleware de registro ya hecho.

## Cómo explicarlo en la entrevista

> "Un middleware en Express es una función que recibe req, res y next y se ejecuta en la cadena antes de las rutas. Express procesa todo en el orden en que se registra, así que los pongo con app.use arriba de las rutas para que apliquen a cualquier método y camino. Uno registra método y path en el arreglo, el otro agrega el header con res.set, y ambos terminan llamando a next para pasar el control. Si olvidara next, la petición se quedaría colgada. Así se implementan cosas transversales como logs, CORS o autenticación sin repetir código en cada ruta."

## Conceptos

- **Middleware**: `(req, res, next)`, se ejecuta en cadena.
- **`next()`**: pasar al siguiente; sin él, la petición se cuelga.
- **Orden de registro**: Express recorre todo en el orden en que lo escribiste.
- **`app.use` vs `app.get`**: todas las peticiones vs un método y ruta.
- **`req.method`, `req.path`** (sin query) **vs `req.originalUrl`** (con query).
- **Headers de respuesta**: `res.set`, y la convención `X-` para los propios.
- **Fábrica de middlewares**: función que devuelve un middleware configurado.
