Escribe la función `enSerie(tareas)`. Recibe un arreglo de **tareas**: cada tarea es una función sin argumentos que, al llamarla, devuelve una promesa. Debes ejecutarlas **una después de otra** (la segunda empieza solo cuando terminó la primera) y devolver una promesa con el arreglo de resultados.

## Reglas

- Una tarea no empieza hasta que la anterior terminó. Nunca hay dos corriendo a la vez.
- Los resultados van en el mismo orden que las tareas.
- Si el arreglo está vacío, se cumple con `[]`.
- Si una tarea falla (su promesa se rechaza), `enSerie` se rechaza con ese mismo error y **no ejecuta** las tareas que faltaban.

## Ejemplos

```js
// Helper para los ejemplos: una tarea que tarda `ms` y devuelve `nombre`
const tarea = (nombre, ms) => () =>
  new Promise((resolver) => setTimeout(() => resolver(nombre), ms));

await enSerie([tarea("lenta", 30), tarea("rápida", 5)]);
// ["lenta", "rápida"]  (la rápida empezó recién a los 30 ms)

await enSerie([]);   // []

const falla = () => Promise.reject(new Error("se cayó"));
await enSerie([tarea("a", 5), falla, tarea("b", 5)]);
// lanza Error("se cayó"), y la tarea "b" nunca se ejecutó
```

## Por qué importa

Hay operaciones que **no pueden** ir en paralelo: guardar pasos en orden, subir archivos uno por uno a un servidor que no aguanta varios a la vez, migraciones de base de datos. Además, este ejercicio te enseña la trampa más famosa de la asincronía: `forEach` con `async` no espera.
