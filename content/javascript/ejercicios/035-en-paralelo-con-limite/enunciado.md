Escribe la función `conLimite(tareas, limite)`. Recibe un arreglo de **tareas** (funciones sin argumentos que devuelven una promesa) y un número `limite`. Debe ejecutarlas en paralelo, pero con **como máximo `limite` corriendo a la vez**, y devolver una promesa con todos los resultados en el orden original.

## Reglas

- Nunca puede haber más de `limite` tareas corriendo al mismo tiempo.
- Pero tampoco menos de las que se puede: apenas una termina, empieza la siguiente que estaba esperando. No esperes a que termine "el grupo" completo.
- Los resultados van en el **orden de las tareas**, no en el orden en que terminaron.
- Si `limite` es mayor que la cantidad de tareas, corren todas a la vez.
- Si el arreglo está vacío, se cumple con `[]`.
- No necesitas manejar tareas que fallen.

## Ejemplos

```js
// Helper para los ejemplos: una tarea que tarda `ms` y devuelve `valor`
const tarea = (valor, ms) => () =>
  new Promise((resolver) => setTimeout(() => resolver(valor), ms));

await conLimite([tarea("A", 30), tarea("B", 10), tarea("C", 10), tarea("D", 10)], 2);
// ["A", "B", "C", "D"]
// t = 0:  empiezan A y B (límite 2)
// t = 10: termina B, empieza C
// t = 20: termina C, empieza D
// t = 30: terminan A y D

await conLimite([tarea(1, 5), tarea(2, 5)], 10);   // [1, 2] (las dos a la vez)
await conLimite([], 3);                             // []
```

## Por qué importa

Si tienes que descargar 500 imágenes o llamar 1000 veces a una API, lanzarlas todas con `Promise.all` puede saturar el servidor o hacer que te bloquee. Hacerlas en serie es demasiado lento. Lo profesional es un punto medio: un "pool" de, por ejemplo, 5 a la vez. Es una pregunta clásica de entrevista para medir si entiendes de verdad las promesas.
