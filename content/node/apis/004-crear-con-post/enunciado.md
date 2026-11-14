Exporta `crearApp()` con una API de usuarios que permite **listar** y **crear**. Cada llamada a `crearApp()` empieza con un solo usuario:

```js
[{ id: 1, nombre: "Ana", email: "ana@correo.com" }]
```

| Método | Ruta | Código | Respuesta |
|---|---|---|---|
| `GET` | `/usuarios` | `200` | la lista |
| `POST` | `/usuarios` | `201` | el usuario creado, con header `Location: /usuarios/<id>` |
| `POST` | `/usuarios` (datos inválidos) | `400` | `{ "error": "..." }` |

## POST y el cuerpo de la petición

`POST` es el método para **crear**. A diferencia de `GET`, los datos viajan en el **cuerpo** (body) de la petición, normalmente como JSON. Así lo envía el cliente:

```js
await fetch("/usuarios", {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // "lo que te mando es JSON"
  body: JSON.stringify({ nombre: "Beto", email: "beto@correo.com" }),
});
```

Express **no lee el cuerpo por defecto**. Tienes que activar el middleware `app.use(express.json())`: cuando llega una petición con `Content-Type: application/json`, lee el texto, lo convierte en objeto y lo deja en `req.body`. Si la petición no trae cuerpo JSON, en Express 5 `req.body` queda `undefined`.

## Los códigos de esta ruta

- `201 Created`: "lo creé". Es más preciso que 200 para un POST que crea algo. Se acompaña del header `Location` con la ruta del recurso nuevo.
- `400 Bad Request`: los datos que mandó el cliente no sirven. Nunca guardes nada en ese caso.

## Reglas

- `nombre`: texto que, sin espacios al inicio y al final (`trim`), no quede vacío. Si no, `400` con `{ "error": "El nombre es obligatorio" }`. Guarda el nombre ya recortado.
- `email`: texto que contenga `"@"`. Si no, `400` con `{ "error": "El email no es válido" }`.
- Valida primero el nombre y luego el email.
- Una petición sin cuerpo debe dar `400` (no puede romper con un error 500).
- El `id` nuevo es el siguiente número (el primero que crees será el `2`).
- Guarda **solo** `id`, `nombre` y `email`: si el cliente manda campos extra (por ejemplo `"rol": "admin"`), ignóralos.

## Ejemplos

```js
// POST /usuarios   { "nombre": "  Beto ", "email": "beto@correo.com", "rol": "admin" }
// 201   Location: /usuarios/2
{ "id": 2, "nombre": "Beto", "email": "beto@correo.com" }

// POST /usuarios   { "email": "x@correo.com" }
// 400
{ "error": "El nombre es obligatorio" }

// POST /usuarios   { "nombre": "Carla", "email": "carla.correo.com" }
// 400
{ "error": "El email no es válido" }
```
