## Idea clave

Una app de Express es una **lista de rutas**: cada ruta es un par "método + camino" con una función (handler) que arma la respuesta. `app.get("/hola", handler)` significa "cuando llegue un `GET /hola`, ejecuta `handler`", y `res.json(objeto)` envía ese objeto como JSON con código 200.

## Paso a paso

1. **Crear la app.** `express()` devuelve un objeto `app`. Todavía no escucha en ningún puerto: solo guarda configuración.
2. **Registrar la primera ruta.** `app.get` recibe la ruta y una función con dos parámetros:
   - `req` (request): todo lo que llegó. Método, ruta, headers, parámetros, cuerpo.
   - `res` (response): el objeto con el que construyes y envías la respuesta.
3. **Responder JSON.** `res.json({ mensaje: "Hola, mundo" })` hace tres cosas: convierte el objeto a texto con `JSON.stringify`, pone el header `Content-Type: application/json; charset=utf-8` y envía todo con código 200.
4. **Segunda ruta** igual, con otro objeto.
5. **Devolver la app sin `listen`.** Separar "crear la app" de "levantarla" es un patrón muy usado: en producción alguien hace `crearApp().listen(3000)`, y en los tests `crearApp().listen(0)` para usar un puerto libre.

```js
import express from "express";

export function crearApp() {
  const app = express();

  app.get("/hola", (req, res) => {
    res.json({ mensaje: "Hola, mundo" });
  });

  app.get("/estado", (req, res) => {
    res.json({ ok: true, version: "1.0.0" });
  });

  return app;
}
```

## Por qué funciona

Recorrido de una petición real, `fetch("http://127.0.0.1:51234/hola")`:

| Paso | Qué pasa |
|---|---|
| 1 | `fetch` envía el texto `GET /hola HTTP/1.1` más algunos headers al puerto 51234. |
| 2 | Express recorre sus rutas en orden. `GET /hola` coincide en método **y** en camino. |
| 3 | Ejecuta el handler: `res.json({ mensaje: "Hola, mundo" })`. |
| 4 | Sale la respuesta: código `200`, header `Content-Type: application/json; charset=utf-8`, cuerpo `{"mensaje":"Hola, mundo"}`. |
| 5 | En el test, `r.status` es `200` y `await r.json()` vuelve a convertir el texto en objeto. |

Con `fetch(url + "/no-existe")` ninguna ruta coincide, así que Express responde solo con un `404` y una pequeña página de error. Lo mismo con `POST /hola`: el camino existe, pero solo registraste el método `GET`, y para Express "método + camino" es lo que identifica una ruta.

## Errores comunes

- **Llamar a `app.listen(3000)` dentro de `crearApp`.** Los tests levantan otra vez la app en otro puerto, y el 3000 queda ocupado o choca entre ejecuciones. Lo reconoces por el error `EADDRINUSE`.
- **Olvidar el `return app`.** El test hace `crearApp().listen(0)` y falla con "Cannot read properties of undefined (reading 'listen')".
- **Usar `res.send(JSON.stringify(obj))`.** Funciona a medias: el header queda como `text/html`, y el test del `Content-Type` falla. Usa `res.json`.
- **Escribir la ruta sin la barra inicial** (`app.get("hola", ...)`). Las rutas empiezan con `/`.
- **Responder dos veces** (`res.json(...)` y luego otro `res.json(...)`). Express lanza "Cannot set headers after they are sent to the client": una petición tiene una sola respuesta.

## Otra forma de resolverlo

Con el módulo `node:http` que viene en Node, sin Express:

```js
import http from "node:http";

export function crearApp() {
  return http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/hola") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ mensaje: "Hola, mundo" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
}
```

También tiene `.listen(0)`, así que los tests funcionarían. Pero tienes que comparar método y URL a mano, poner los headers y convertir a JSON tú mismo. Express existe para ahorrarte eso: conviene saber que debajo está `http`, pero en el trabajo usarás Express (o algo parecido).

## Cómo explicarlo en la entrevista

> "Creo la app con express() y registro las rutas con app.get, que recibe el camino y un handler con req y res. En cada handler respondo con res.json, que serializa el objeto, pone el Content-Type de JSON y manda código 200 por defecto. La función devuelve la app sin llamar a listen, así puedo levantarla en el puerto que quiera en producción y en un puerto libre en los tests. Si llega una ruta o un método que no registré, Express responde 404 solo."

## Conceptos

- **HTTP**: petición (método, ruta, headers, cuerpo) y respuesta (código, headers, cuerpo).
- **Métodos**: `GET` para leer. Una ruta se identifica por método **y** camino.
- **Códigos de estado**: `200` OK, `404` no encontrado, `500` error del servidor.
- **JSON**: texto con forma de objeto; `res.json` lo envía y `r.json()` lo lee.
- **Header `Content-Type`**: dice qué formato tiene el cuerpo.
- **`express()`, `app.get`, `req`, `res`**: lo mínimo para una API.
- **Separar crear y levantar**: `crearApp()` sin `listen`, para poder probarla.
