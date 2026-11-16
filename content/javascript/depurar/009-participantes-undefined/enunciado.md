## El problema

En la página del evento, la tabla de participantes muestra **`undefined` en cada fila**. La cantidad de filas es la correcta. Revisaron la pestaña Red del navegador y la API responde bien: llegan los usuarios con su nombre.

## Qué debe hacer

`cargarNombres(ids, obtenerUsuario)` pide todos los usuarios **a la vez** (no uno tras otro) y devuelve una promesa con sus nombres, en el mismo orden que los ids, aunque las respuestas lleguen en otro orden.

```js
// obtenerUsuario(1) -> promesa de { id: 1, nombre: "Ana" }
// obtenerUsuario(2) -> promesa de { id: 2, nombre: "Luis" }

await cargarNombres([1, 2], obtenerUsuario); // ["Ana", "Luis"]
await cargarNombres([], obtenerUsuario);     // []
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
