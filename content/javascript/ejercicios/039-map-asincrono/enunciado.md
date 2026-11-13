Escribe la función `mapAsync(lista, fn)`. Es como `lista.map(fn)`, pero `fn` es una función **asíncrona** (devuelve una promesa). `mapAsync` debe devolver una promesa que se cumpla con el arreglo de **valores ya resueltos**, no con un arreglo de promesas.

## Reglas

- Aplica `fn` a cada elemento y espera todos los resultados.
- Las llamadas corren **en paralelo**: todas empiezan a la vez, no una después de otra.
- Los resultados van en el **orden de la lista**, aunque terminen en otro orden.
- `fn` recibe lo mismo que en un `map` normal: `(elemento, indice)`.
- Si la lista está vacía, se cumple con `[]`.
- Si alguna llamada falla, la promesa de `mapAsync` se rechaza con ese error.

## Ejemplos

```js
const doblar = async (n) => {
  await esperar(5);   // la del ejercicio "Esperar": simula una petición lenta
  return n * 2;
};

await mapAsync([1, 2, 3], doblar);                // [2, 4, 6]
await mapAsync(["a", "b"], async (x, i) => x + i); // ["a0", "b1"]
await mapAsync([], doblar);                        // []

// Lo que pasa con un map normal:
[1, 2, 3].map(doblar);   // [Promise, Promise, Promise]  (¡no son números!)
```

## Por qué importa

Es lo que haces cuando tienes una lista de ids y necesitas pedir el detalle de cada uno a una API: `mapAsync(ids, obtenerProducto)`. El error de usar `map` con una función `async` y recibir un arreglo de promesas es de los más frecuentes en juniors, y en las entrevistas lo saben.
