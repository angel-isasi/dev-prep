## En una frase

HTTP es una conversación de **petición y respuesta**: el cliente (tu app de React, el navegador, `fetch`) pide algo a una URL y el servidor contesta con un código de estado y datos; Express es la librería de Node que te deja escribir ese servidor en pocas líneas.

## Lo esencial

### Petición y respuesta

Cuando tu frontend hace `fetch("http://localhost:3000/productos?categoria=bebidas")`, viaja una **petición** y vuelve una **respuesta**:

```
PETICIÓN                                  RESPUESTA
GET /productos?categoria=bebidas          HTTP/1.1 200 OK
Host: localhost:3000                      Content-Type: application/json
Accept: application/json
                                          [{"id":1,"nombre":"Inca Kola"}]
(método + ruta + headers + cuerpo)        (código + headers + cuerpo)
```

- **Método**: qué quieres hacer.
- **Ruta** (path) y **query** (lo que va después de `?`): sobre qué.
- **Headers**: datos extra en formato `Nombre: valor` (tipo de contenido, token de sesión).
- **Cuerpo** (body): los datos que envías o recibes. Lo normal hoy es **JSON**.

### Métodos

| Método | Para qué | ¿Lleva cuerpo? |
|---|---|---|
| `GET` | Leer | No |
| `POST` | Crear | Sí |
| `PUT` | Reemplazar entero | Sí |
| `PATCH` | Modificar una parte | Sí |
| `DELETE` | Borrar | Normalmente no |

### Códigos de estado

El primer dígito te dice la familia:

| Familia | Significa | Ejemplos |
|---|---|---|
| 2xx | Salió bien | `200 OK`, `201 Created`, `204 No Content` |
| 3xx | Ve a otro lado | `301` / `304` |
| 4xx | **El cliente** se equivocó | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| 5xx | **El servidor** falló | `500 Internal Server Error` |

Ojo: `fetch` **no lanza error** con un 404 o un 500. Solo falla si no hubo respuesta (servidor apagado, sin red). Por eso se revisa `respuesta.ok` (true si es 2xx) o `respuesta.status`.

### Un servidor con Express

Node trae el módulo `node:http`, pero es de bajo nivel. **Express** (`npm install express`) organiza el servidor en **rutas**: "si llega este método a esta ruta, ejecuta esta función".

```js
import express from "express";

const app = express();

const productos = [
  { id: 1, nombre: "Inca Kola", categoria: "bebidas", precio: 5 },
  { id: 2, nombre: "Papas", categoria: "snacks", precio: 3 },
];

app.get("/productos", (req, res) => {
  res.json(productos); // status 200, Content-Type JSON y el array convertido a texto
});

app.listen(3000, () => console.log("Escuchando en http://localhost:3000"));
```

Cada ruta recibe dos objetos:
- `req` (request): lo que llegó. `req.params`, `req.query`, `req.headers`, `req.body`.
- `res` (response): lo que vas a contestar. `res.json(datos)`, `res.status(404)`, `res.send("texto")`.

Responde **una sola vez** por petición. Si no respondes, el cliente se queda esperando.

### Parámetros de ruta: `req.params`

Para una parte variable de la ruta, usa `:nombre`:

```js
app.get("/productos/:id", (req, res) => {
  const id = Number(req.params.id); // "2" → 2
  const producto = productos.find((p) => p.id === id);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(producto);
});
// GET /productos/2   → 200 { id: 2, nombre: "Papas", ... }
// GET /productos/99  → 404 { error: "Producto no encontrado" }
```

### Query: `req.query`

Lo que va después de `?` sirve para filtrar, ordenar o paginar. Es **opcional**: la misma ruta funciona con o sin query.

```js
app.get("/productos", (req, res) => {
  const { categoria, max } = req.query; // GET /productos?categoria=bebidas&max=4
  let lista = productos;
  if (categoria) lista = lista.filter((p) => p.categoria === categoria);
  if (max) lista = lista.filter((p) => p.precio <= Number(max));
  res.json(lista);
});
```

| | `req.params` | `req.query` |
|---|---|---|
| Se ve como | `/productos/2` | `/productos?categoria=bebidas` |
| Se declara | En la ruta: `"/productos/:id"` | No se declara |
| Uso típico | Identificar **un** recurso | Filtrar, ordenar, paginar una lista |

Los dos siempre traen **texto**: convierte con `Number(...)` cuando necesites un número.

### Separar la app del `listen`

Es buena práctica tener una función que **crea** la app y otra parte que la **arranca**. Así los tests pueden levantarla en un puerto libre:

```js
export function crearApp() {
  const app = express();
  app.get("/salud", (req, res) => res.json({ ok: true }));
  return app;
}
// server.js
crearApp().listen(3000);
```

## Errores típicos

**1. Comparar `req.params.id` con un número**

```js
productos.find((p) => p.id === req.params.id); // siempre undefined: 2 === "2" es false
```
Convierte: `Number(req.params.id)`.

**2. Responder dos veces**

```js
if (!producto) res.status(404).json({ error: "No existe" });
res.json(producto);
// Error: Cannot set headers after they are sent to the client
```
Pon `return` antes de la primera respuesta.

**3. Encadenar `status` sin enviar**

```js
res.status(404); // no envía nada: el cliente se queda esperando
```
`status` solo pone el código. Termina con `.json(...)`, `.send(...)` o usa `res.sendStatus(404)`.

**4. Creer que `fetch` falla con un 404**

```js
try { const r = await fetch(url); const datos = await r.json(); } catch { /* aquí NO llega un 404 */ }
```
Revisa `if (!r.ok)` tú mismo.

**5. Usar el código equivocado**

Devolver `200` con `{ error: "No existe" }` confunde al cliente. Si no existe, es `404`; si el cliente mandó datos inválidos, `400`.

## Chuleta

- `const app = express();` y `app.listen(puerto)`.
- `app.get(ruta, (req, res) => ...)`, igual con `post`, `put`, `patch`, `delete`.
- `"/productos/:id"` → `req.params.id` (texto).
- `?a=1&b=2` → `req.query.a`, `req.query.b` (texto, opcionales).
- `res.json(x)` = 200 + JSON. `res.status(404).json({ error })`. `res.sendStatus(204)`.
- `return res...` para no responder dos veces.
- 2xx bien, 4xx culpa del cliente, 5xx culpa del servidor.
- `fetch` solo falla sin respuesta: revisa `r.ok` y `r.status`.

## En la entrevista

**¿Qué pasa cuando escribes una URL o haces un `fetch`?**
El cliente arma una petición HTTP con un método, una ruta, headers y a veces un cuerpo, y la envía al servidor. El servidor la procesa y devuelve una respuesta con un código de estado, headers y un cuerpo, que normalmente es HTML o JSON.

**¿Qué diferencia hay entre los códigos 4xx y 5xx?**
Los 4xx indican que el error es del cliente: pidió algo que no existe (404), mandó datos inválidos (400) o no tiene permiso (401, 403). Los 5xx indican que el servidor falló procesando una petición válida (500).

**¿Qué es Express?**
Es una librería minimalista de Node para crear servidores HTTP. Permite definir rutas por método y URL, leer parámetros, query y cuerpo de la petición, y responder fácilmente con JSON, además de organizar el código con middlewares.

**¿Cuándo usas `req.params` y cuándo `req.query`?**
`params` para identificar un recurso concreto que es parte de la ruta, como `/usuarios/7`. `query` para opciones sobre una lista, como filtros, orden o página: `/usuarios?ciudad=Lima&pagina=2`.
