## El problema

Cuando no hay internet, el formulario de registro **se queda congelado** en "Guardando…" y en la consola aparece:

```
Uncaught (in promise) Error: Sin conexión
```

Debería mostrar el mensaje "Sin conexión" debajo del botón. Tu compañero insiste: "Imposible, la función tiene un `try/catch`. Y lo probé con un error de validación que se lanza al toque, y ese sí lo atrapa".

## Qué debe hacer

`guardarSeguro(guardar, datos)` llama a `guardar(datos)`, que devuelve una promesa.

- Si sale bien, devuelve lo mismo que devolvió `guardar`.
- Si falla (al instante o después), **no lanza**: devuelve `{ ok: false, mensaje }` con el mensaje del error.

```js
await guardarSeguro(guardarBien, { nombre: "Ana" });  // { ok: true, id: 7, nombre: "Ana" }
await guardarSeguro(guardarSinInternet, {});          // { ok: false, mensaje: "Sin conexión" }
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
