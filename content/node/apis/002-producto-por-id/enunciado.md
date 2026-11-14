Exporta `crearApp()` con una API de productos de solo lectura. Los datos ya vienen en el archivo de inicio:

```js
const PRODUCTOS = [
  { id: 1, nombre: "Teclado", precio: 120 },
  { id: 2, nombre: "Mouse", precio: 45 },
  { id: 3, nombre: "Monitor", precio: 650 },
];
```

| Método | Ruta | Código | Respuesta |
|---|---|---|---|
| `GET` | `/productos` | `200` | el arreglo completo |
| `GET` | `/productos/:id` | `200` | el producto con ese id |
| `GET` | `/productos/:id` (no existe) | `404` | `{ "error": "Producto no encontrado" }` |

## Parámetros de ruta

En `/productos/:id`, el `:id` es un **parámetro de ruta**: un hueco que acepta cualquier valor. Si llega `GET /productos/2`, Express ejecuta tu handler y te deja el valor en `req.params.id`.

Ojo: lo que viene en la URL **siempre es texto**. `req.params.id` vale `"2"`, no `2`, y `"2" === 2` es `false`.

## El código 404

`404 Not Found` significa "lo que pediste no existe". Express ya responde 404 cuando la **ruta** no existe, pero aquí la ruta sí existe (`/productos/:id`) y lo que falta es el **producto**. Ese 404 lo decides tú: `res.status(404).json({ ... })`. `res.status(codigo)` cambia el código y devuelve el mismo `res`, por eso se puede encadenar.

## Reglas

- Si el id no corresponde a ningún producto (`/productos/99` o `/productos/abc`), responde `404` con `{ "error": "Producto no encontrado" }`.
- Con `return` corta el handler después de responder, para no enviar dos respuestas.

## Ejemplos

```js
// GET /productos/2
// 200
{ "id": 2, "nombre": "Mouse", "precio": 45 }

// GET /productos/99
// 404
{ "error": "Producto no encontrado" }

// GET /productos/abc
// 404
{ "error": "Producto no encontrado" }
```
