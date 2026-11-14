El panel principal de una tienda en línea necesita tres datos que vienen de servicios distintos: el usuario, sus pedidos y sus notificaciones. Cada uno tarda un poco. Si los pides **uno tras otro**, el usuario espera la suma de los tres tiempos; si los pides **a la vez**, espera solo el más lento.

Cada tarea es una **función** que, al llamarla, empieza el trabajo y devuelve una promesa:

```js
const tareas = [
  () => obtenerUsuario(7),        // tarda 30 ms
  () => obtenerPedidos(7),        // tarda 10 ms
  () => obtenerNotificaciones(7), // tarda 20 ms
];
```

Escribe dos funciones **asíncronas**:

1. `cargarTodo(tareas)`: arranca todas las tareas a la vez y devuelve un arreglo con sus resultados, **en el mismo orden** que las tareas. Si alguna falla, falla todo con ese error (no tiene sentido mostrar el panel a medias).
2. `cargarLoQueSePueda(tareas)`: arranca todas a la vez y **nunca falla**. Devuelve `{ exitos, fallos }`: `exitos` con los valores de las que salieron bien y `fallos` con los **mensajes** de error de las que fallaron, ambos en el orden de las tareas.

## Lo que necesitas

```js
await Promise.all([p1, p2, p3]);
// [v1, v2, v3]  o rechaza con el PRIMER error

await Promise.allSettled([p1, p2]);
// [{ status: "fulfilled", value: v1 }, { status: "rejected", reason: error }]
```

Las dos reciben un arreglo de **promesas** (no de funciones): primero llamas a cada tarea para que empiece, y luego esperas el conjunto.

## Reglas

- Todas las tareas deben **empezar antes de que termine cualquiera** (eso es "en paralelo").
- `cargarTodo([])` devuelve `[]`.
- `cargarLoQueSePueda` resuelve aunque fallen todas.

## Ejemplos

```js
await cargarTodo([() => usuario(), () => pedidos()]);
// [{ id: 7, nombre: "Ana" }, [{ id: 1, total: 50 }]]

await cargarTodo([() => usuario(), () => Promise.reject(new Error("Servicio caído"))]);
// Error: Servicio caído

await cargarLoQueSePueda([() => usuario(), () => Promise.reject(new Error("Servicio caído"))]);
// { exitos: [{ id: 7, nombre: "Ana" }], fallos: ["Servicio caído"] }
```
