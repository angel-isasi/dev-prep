En la pantalla "Editar perfil" el usuario cambia solo algunos campos: a veces el nombre, a veces el email y el estado. El formulario envía **solo lo que cambió**, y tú tienes que mezclarlo con los datos actuales.

Tienes esta interfaz:

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}
```

Escribe `actualizarUsuario(usuario, cambios)`:

- `usuario` es un `Usuario` completo.
- `cambios` tiene **algunas** propiedades de `Usuario`, todas opcionales. Su tipo es `Partial<Usuario>`.
- Devuelve un **usuario nuevo** con los cambios aplicados.

## Reglas

- **No modifiques** el usuario original (en React, mutar el estado hace que la pantalla no se actualice).
- El `id` nunca cambia, aunque venga en `cambios`.
- Si `cambios` está vacío, devuelve una copia igual al original.
- TypeScript debe rechazar propiedades que no existen (`{ edad: 20 }`) y tipos equivocados (`{ activo: "si" }`).

## Ejemplos

```ts
const ana = { id: 1, nombre: "Ana", email: "ana@correo.com", activo: true };

actualizarUsuario(ana, { nombre: "Ana María" });
// { id: 1, nombre: "Ana María", email: "ana@correo.com", activo: true }

actualizarUsuario(ana, { email: "ana.m@correo.com", activo: false });
// { id: 1, nombre: "Ana", email: "ana.m@correo.com", activo: false }

actualizarUsuario(ana, { id: 99 });   // el id sigue siendo 1
ana.nombre;                            // "Ana" (el original no cambió)

actualizarUsuario(ana, { edad: 20 });     // error de tipos
actualizarUsuario(ana, { activo: "si" }); // error de tipos
```
