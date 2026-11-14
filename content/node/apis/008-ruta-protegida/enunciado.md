Exporta `crearApp()` con una ruta pública y dos rutas **protegidas**: solo responden si la petición trae un token válido, y una de ellas además exige rol de administrador.

Las sesiones válidas ya vienen en el archivo de inicio:

```js
const SESIONES = {
  "token-ana-123": { nombre: "Ana", rol: "admin" },
  "token-beto-456": { nombre: "Beto", rol: "usuario" },
};
```

## Cómo viaja el token

Cuando inicias sesión, el servidor te da un **token** (un texto secreto). En cada petición siguiente, el cliente lo manda en el header `Authorization` con el esquema **Bearer** ("el portador de este token"):

```js
await fetch("/perfil", {
  headers: { Authorization: "Bearer token-ana-123" },
});
```

En Express lo lees con `req.get("Authorization")` (los nombres de headers no distinguen mayúsculas). Si no vino, devuelve `undefined`.

## 401 vs 403

Pregunta clásica de entrevista:
- `401 Unauthorized`: **no sé quién eres**. Falta el token, viene mal escrito o no es válido. Se acompaña del header `WWW-Authenticate: Bearer`, que le dice al cliente cómo autenticarse.
- `403 Forbidden`: **sé quién eres, pero no puedes hacer esto**. El token es válido, pero tu rol no alcanza.

## Lo que tienes que hacer

| Ruta | Quién entra | Respuesta |
|---|---|---|
| `GET /publico` | cualquiera (ya está hecha) | `200` `{ "mensaje": "Esto lo ve cualquiera" }` |
| `GET /perfil` | cualquier token válido | `200` `{ "nombre": "...", "rol": "..." }` |
| `GET /admin/usuarios` | token válido **con rol admin** | `200` `{ "usuarios": ["Ana", "Beto"] }` |

Errores (todos como `{ "error": "..." }`):

| Situación | Código | Mensaje |
|---|---|---|
| No vino el header `Authorization` | `401` | `"Falta el token"` |
| El header no empieza con `"Bearer "` | `401` | `"Formato inválido: usa Bearer <token>"` |
| El token no está en `SESIONES` | `401` | `"Token inválido"` |
| Token válido, pero no es admin (solo en `/admin/usuarios`) | `403` | `"No tienes permiso"` |

## Reglas

- Escribe la autenticación como **middleware** (`autenticar`) y úsalo solo en las rutas protegidas: `app.get("/perfil", autenticar, (req, res) => ...)`. Si el token es válido, guarda la sesión en `req.usuario` y llama a `next()`.
- Toda respuesta `401` lleva el header `WWW-Authenticate: Bearer`.
- La lista de `/admin/usuarios` se arma con los nombres de `SESIONES`.

## Ejemplos

```js
// GET /perfil   Authorization: Bearer token-beto-456
// 200 { "nombre": "Beto", "rol": "usuario" }

// GET /perfil   (sin header)
// 401 { "error": "Falta el token" }          WWW-Authenticate: Bearer

// GET /admin/usuarios   Authorization: Bearer token-beto-456
// 403 { "error": "No tienes permiso" }
```
