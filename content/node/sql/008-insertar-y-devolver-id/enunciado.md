Hasta ahora solo leíste datos. Ahora vas a **escribir**: el formulario "Crear cuenta" de la tienda llama a una función que guarda al cliente nuevo y devuelve su `id`, para que el frontend pueda redirigir a `/clientes/7`.

## La tabla

**clientes** (6 filas)

| id | nombre | email | ciudad |
|---|---|---|---|
| 1 | Ana Torres | ana.torres@correo.pe | Lima |
| 2 | Luis Quispe | luis.quispe@correo.pe | Cusco |
| 3 | María Rojas | maria.rojas@correo.pe | Arequipa |
| 4 | Jorge Mendoza | jorge.mendoza@correo.pe | Lima |
| 5 | Carla Huamán | carla.huaman@correo.pe | Trujillo |
| 6 | Diego Flores | diego.flores@correo.pe | Lima |

Así se creó la tabla:

```sql
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,         -- la base asigna el número solo
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,     -- no puede haber dos clientes con el mismo email
  ciudad TEXT NOT NULL
);
```

## Qué hacer

Escribe `crearCliente(db, datos)`, donde `datos` es `{ nombre, email, ciudad }`:

1. **Valida antes de insertar**, en este orden, y lanza un `Error` con el mensaje exacto:
   - `nombre` vacío o solo espacios: `"El nombre es obligatorio"`.
   - `email` sin `@`: `"El email no es válido"`.
   - `ciudad` vacía o solo espacios: `"La ciudad es obligatoria"`.
   - Ya existe un cliente con ese email: `"El email ya está registrado"`.
2. Guarda los tres textos **sin espacios sobrantes** al inicio y al final.
3. Devuelve el **id** que la base le asignó al cliente nuevo (un número).

## Reglas

- No le pases el `id` en el `INSERT`: deja que la base lo genere.
- Valores siempre con `?`. Un nombre como `Rosa O'Neill` tiene apóstrofo y no debe romper nada.
- Si la validación falla, no se guarda nada.

## Ejemplos

```js
crearCliente(db, { nombre: "Rosa Paredes", email: "rosa.paredes@correo.pe", ciudad: "Piura" });
// 7

crearCliente(db, { nombre: "  Pedro Salas ", email: "pedro@correo.pe", ciudad: " Ica " });
// 8   (se guarda como "Pedro Salas" y "Ica")

crearCliente(db, { nombre: "", email: "x@correo.pe", ciudad: "Lima" });
// Error: El nombre es obligatorio

crearCliente(db, { nombre: "Otra Ana", email: "ana.torres@correo.pe", ciudad: "Lima" });
// Error: El email ya está registrado
```

Para ejecutar un `INSERT` se usa `.run()`, que devuelve `{ changes, lastInsertRowid }`.
