Crea tu primera API con **Express**. Exporta la función `crearApp()` que construye la app, le agrega dos rutas y la **devuelve sin llamar a `listen`** (los tests se encargan de levantarla en un puerto libre).

| Método | Ruta | Código | Respuesta (JSON) |
|---|---|---|---|
| `GET` | `/hola` | `200` | `{ "mensaje": "Hola, mundo" }` |
| `GET` | `/estado` | `200` | `{ "ok": true, "version": "1.0.0" }` |

## Antes de empezar: cómo habla una API

Una API web es un programa que espera **peticiones** (requests) por HTTP y devuelve **respuestas** (responses). Cuando tu app de React hace `fetch("/api/productos")`, del otro lado hay un servidor como el que vas a escribir.

Una **petición** HTTP tiene:
- **Método**: qué quieres hacer. `GET` es "dame algo" (leer). Más adelante verás `POST` (crear), `PUT` (reemplazar) y `DELETE` (borrar).
- **Ruta** (path): sobre qué recurso, por ejemplo `/hola`.
- **Headers** (cabeceras): datos extra en forma `Nombre: valor`, por ejemplo qué formato aceptas.
- **Body** (cuerpo): datos que envías. Un `GET` normalmente no lleva cuerpo.

Una **respuesta** HTTP tiene:
- **Código de estado**: un número que resume cómo fue. `200` = todo bien, `404` = no existe esa ruta o recurso, `500` = el servidor falló.
- **Headers**: por ejemplo `Content-Type: application/json`, que avisa "lo que va en el cuerpo es JSON".
- **Body**: los datos. En las APIs modernas casi siempre es **JSON**: texto con la forma de un objeto de JavaScript (`{"ok":true}`).

## Reglas

- No llames a `app.listen` dentro de `crearApp`: solo crea la app y la devuelves.
- Responde con `res.json(...)`: convierte el objeto a texto JSON y pone el header `Content-Type: application/json` por ti. El código `200` es el que va por defecto.
- Cualquier otra ruta (o el método equivocado, como `POST /hola`) debe dar `404`. Express ya lo hace solo si no defines nada para ella.

## Ejemplos

```js
// GET http://localhost:3000/hola
// 200  Content-Type: application/json
{ "mensaje": "Hola, mundo" }

// GET http://localhost:3000/estado
// 200
{ "ok": true, "version": "1.0.0" }

// GET http://localhost:3000/no-existe
// 404
```

## Reto extra

Agrega una ruta `GET /hora` que devuelva `{ "hora": "..." }` con `new Date().toISOString()`. Pruébala en el navegador: corre en una terminal `node -e "import('./solucion.js').then(m => m.crearApp().listen(3000))"` y abre `http://localhost:3000/hora`.
