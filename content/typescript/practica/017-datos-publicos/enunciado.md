El usuario completo que guarda tu sistema tiene su `password`. Ese dato **nunca** debe llegar a la pantalla ni a la respuesta de una API. Además, la barra de navegación solo necesita el `id` y el `nombre`.

Tienes esta interfaz:

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "cliente";
}
```

Escribe:

1. El tipo `UsuarioPublico`: todo `Usuario` **menos** `password`. Usa `Omit`.
2. El tipo `ResumenUsuario`: **solo** `id` y `nombre`. Usa `Pick`.
3. `datosPublicos(usuario)`: devuelve un `UsuarioPublico`, un objeto nuevo sin la propiedad `password`.
4. `resumen(usuario)`: devuelve un `ResumenUsuario`, un objeto nuevo solo con `id` y `nombre`.

## Reglas

- La propiedad `password` no debe existir en el resultado (no vale dejarla en `undefined` ni en `""`).
- `resumen` no debe incluir ninguna otra propiedad.
- No modifiques el usuario original.
- Con los tipos bien hechos, `datosPublicos(u).password` es un **error de tipos**.

## Ejemplos

```ts
const ana = { id: 1, nombre: "Ana", email: "ana@correo.com", password: "secreta123", rol: "cliente" };

datosPublicos(ana);
// { id: 1, nombre: "Ana", email: "ana@correo.com", rol: "cliente" }

resumen(ana);
// { id: 1, nombre: "Ana" }

datosPublicos(ana).password; // error de tipos: no existe en UsuarioPublico
```
