En el formulario de registro de una app, el usuario escribe su nombre, su email y, si quiere, su teléfono. Tu función recibe esos datos y arma el objeto `Usuario` que se guarda.

Define dos interfaces:

1. `DatosUsuario` (lo que llega del formulario):
   - `nombre`: texto
   - `email`: texto
   - `telefono`: texto **opcional**
2. `Usuario` (lo que se guarda):
   - `id`: número **de solo lectura** (`readonly`): una vez creado, nadie lo puede cambiar.
   - `nombre`, `email`: texto
   - `telefono`: texto **opcional**
   - `activo`: booleano

Y la función `crearUsuario(id: number, datos: DatosUsuario): Usuario`.

## Reglas

- `nombre` se guarda sin espacios al inicio ni al final (`trim`).
- `email` se guarda sin espacios y en minúsculas.
- `telefono` se guarda (con `trim`) **solo si vino** y no queda vacío. Si no vino, el objeto no debe tener la propiedad `telefono`.
- `activo` empieza en `true`.
- Llamar sin `email`, o intentar `usuario.id = 5`, debe ser un **error de tipos**.

## Ejemplos

```ts
crearUsuario(1, { nombre: "  Ana Torres ", email: "Ana@Correo.PE " });
// { id: 1, nombre: "Ana Torres", email: "ana@correo.pe", activo: true }

crearUsuario(2, { nombre: "Luis", email: "luis@correo.pe", telefono: " 987654321 " });
// { id: 2, nombre: "Luis", email: "luis@correo.pe", telefono: "987654321", activo: true }

crearUsuario(3, { nombre: "Rosa" });   // error de TypeScript: falta email

const u = crearUsuario(1, { nombre: "Ana", email: "ana@correo.pe" });
u.nombre = "Ana María";   // bien
u.id = 5;                 // error de TypeScript: id es de solo lectura
```

## Reto extra

Pasa el cursor sobre `u.telefono` en VS Code: su tipo es `string | undefined`. Una propiedad opcional es eso: puede estar o no estar, y si no está, al leerla obtienes `undefined`.
