## Idea clave

Las rutas se ocupan del camino feliz y **lanzan** los errores (`throw`). Un único **middleware de errores**, con cuatro parámetros `(err, req, res, next)` y registrado al final, los convierte en respuestas JSON: usa `err.status` o 500, y en los 500 responde un mensaje genérico para no filtrar secretos. Express 5 atrapa solo los errores de los handlers `async`.

## Paso a paso

1. **Validar y lanzar.** En `/productos/:id`, convierte el id y revisa `Number.isInteger(id) && id > 0`. Si no, `throw errorHttp(400, "...")`. Lanzar corta la función igual que un `return`, pero en vez de responder, le pasa el problema a Express.
2. **Buscar con `await`.** `buscarProducto` es `async` (como una base de datos real). Si devuelve `null`, `throw errorHttp(404, "Producto no encontrado")`.
3. **Errores inesperados.** En `/reporte` no hay ningún `throw` tuyo: el error viene de `leerReporte()`. Como el handler es `async`, el `await` rechazado hace que la función devuelva una promesa rechazada, y **Express 5** la atrapa y llama al middleware de errores con ese error.
4. **El 404 de rutas.** Un `app.use((req, res) => ...)` **después** de todas las rutas solo se alcanza si ninguna respondió. Ahí respondes el 404 en JSON. (Sin esto, Express manda una página HTML.)
5. **El middleware de errores, al final.** Express lo distingue por tener 4 parámetros. Calcula `status = err.status ?? 500`. Si `status >= 500`, el mensaje es genérico; si no, `err.message` (los 4xx son mensajes pensados para el cliente).

```js
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  const mensaje = status >= 500 ? "Error interno del servidor" : err.message;
  res.status(status).json({ error: mensaje });
});
```

## Por qué funciona

La fila de Express: `[GET /reporte] -> [GET /productos/:id] -> [404 de rutas] -> [errores]`. El middleware de errores solo se usa cuando alguien lanzó algo.

| Petición | Qué pasa | `err` | Respuesta |
|---|---|---|---|
| `GET /productos/1` | valida, busca, responde | (ninguno) | `200` Teclado |
| `GET /productos/1.5` | `Number.isInteger(1.5)` es `false`, lanza | `status: 400` | `400` con su mensaje |
| `GET /productos/99` | busca, `null`, lanza | `status: 404` | `404` con su mensaje |
| `GET /reporte` | `leerReporte` rechaza; Express 5 lo atrapa | `Error` **sin** `status` | `500` genérico |
| `GET /usuarios` | ninguna ruta coincide, llega al 404 de rutas | (ninguno) | `404` JSON |

En `/reporte`, `err.message` es `"Conexión rechazada: postgres://admin:clave123@..."`. Como `err.status` es `undefined`, `status` vale 500 y el mensaje se reemplaza: el cliente nunca ve la clave.

¿Por qué no basta con el manejo por defecto? Express también responde 500, pero con una página **HTML** y, fuera de producción, con el mensaje y la traza del error. Los tests lo detectan: piden JSON y que no aparezca `clave123`.

## Errores comunes

- **Escribir el middleware de errores con 3 parámetros** (`(err, req, res)`): Express lo cuenta como middleware normal (y `err` sería en realidad `req`). Siempre los 4, aunque no uses `next`.
- **Registrarlo antes de las rutas**: los errores que se lanzan después no llegan a él. Va al final de todo.
- **Poner el 404 de rutas antes de las rutas**: responde 404 a todo, incluso a `/productos/1`.
- **Responder `err.message` siempre**: el 500 filtra la cadena de conexión con la clave. Es un fallo de seguridad real y el test lo marca.
- **Usar `res.status(404).json(...)` en la ruta y además `throw`**: respondes dos veces. Elige una: aquí, lanzar.
- **`if (!id)` para validar**: deja pasar `1.5` y `-3`. `Number.isInteger(id) && id > 0` cubre todo.
- **Creer que en Express 4 funciona igual**: allí un `async` que falla deja la petición colgada (o tumba el proceso). Si ves un proyecto con Express 4, envuelve con `try/catch` y `next(err)`.

## Otra forma de resolverlo

**Una clase de error** en vez de la función `errorHttp`:

```js
class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
throw new ErrorHttp(404, "Producto no encontrado");
```

Y en el middleware puedes preguntar `if (err instanceof ErrorHttp)` para separar "errores que yo lancé a propósito" de "errores inesperados". Es lo que hacen muchos proyectos reales.

**Responder directo en la ruta** (como en los ejercicios anteriores) también es válido. El middleware central gana cuando hay muchas rutas: el formato de error es uno solo, los 500 se ocultan siempre y en un único lugar agregas el `console.error(err)` o el envío a un servicio de monitoreo.

**En Express 4** la ruta sería:

```js
app.get("/reporte", async (req, res, next) => {
  try {
    res.json(await leerReporte());
  } catch (err) {
    next(err); // pasar el error a mano
  }
});
```

## Cómo explicarlo en la entrevista

> "Centralizo los errores en un middleware de cuatro parámetros registrado al final. Las rutas solo manejan el camino feliz y lanzan errores con un status, por ejemplo 400 o 404. En el middleware tomo err.status o 500; para los 4xx devuelvo el mensaje, y para los 500 uno genérico, porque el mensaje real puede traer datos internos como credenciales. En Express 5 los handlers async que fallan llegan solos a ese middleware; en Express 4 tendría que usar try/catch y next(err). Además agrego un middleware de 404 después de las rutas para responder JSON en rutas inexistentes."

## Conceptos

- **Middleware de errores**: `(err, req, res, next)`, siempre al final.
- **`throw` en handlers**: Express 5 atrapa errores síncronos y promesas rechazadas.
- **`next(err)`**: la forma manual de mandar un error (Express 4 o callbacks).
- **404 de rutas**: `app.use` sin ruta, después de todas las rutas.
- **500 Internal Server Error**: falla del servidor; mensaje genérico, nunca detalles.
- **4xx vs 5xx**: error del cliente (mensaje útil) vs error del servidor (mensaje genérico).
- **`Number.isInteger`**: validar enteros.
- **Errores con propiedades**: `error.status` para saber qué código responder.
