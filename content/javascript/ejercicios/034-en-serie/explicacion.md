## Idea clave

Recorre las tareas con `for...of` y haz `await tarea()` en cada vuelta. El `await` pausa la función completa (incluido el bucle) hasta que esa tarea termine, así que la siguiente vuelta, y la siguiente tarea, empiezan recién después.

## Paso a paso

1. **Prepara un arreglo vacío** para los resultados.
2. **Recorre las tareas con `for...of`**. Es un bucle normal que vive dentro de tu función `async`, así que un `await` dentro de él pausa todo.
3. **Llama a la tarea y espérala**: `await tarea()`. Llamarla la hace empezar; `await` espera a que su promesa termine y te da el valor.
4. **Guarda el resultado** con `push`. Como el orden de las vueltas es el orden de las tareas, los resultados quedan en orden.
5. **Devuelve el arreglo**. La función `async` lo convierte en una promesa cumplida con ese arreglo.

```js
export async function enSerie(tareas) {
  const resultados = [];
  for (const tarea of tareas) {
    resultados.push(await tarea());
  }
  return resultados;
}
```

## Por qué funciona

Línea de tiempo con `[lenta (30 ms), rápida (5 ms)]`:

| Momento | Qué pasa | `resultados` |
|---|---|---|
| t = 0 ms | Vuelta 1: `tarea()` hace empezar a "lenta". `await` pausa `enSerie`. | `[]` |
| t = 30 ms | "lenta" termina. Se reanuda la función: `push("lenta")`. | `["lenta"]` |
| t = 30 ms | Vuelta 2: recién ahora empieza "rápida". `await` pausa de nuevo. | `["lenta"]` |
| t = 35 ms | "rápida" termina: `push("rápida")`. Se acaba el bucle y se devuelve el arreglo. | `["lenta", "rápida"]` |

Tiempo total: 30 + 5 = 35 ms. En serie, **los tiempos se suman**.

¿Y si una tarea falla? `await` sobre una promesa rechazada **lanza** el error, como un `throw`. Ese error sale del bucle, sale de la función, y la promesa de `enSerie` queda rechazada. Las vueltas que faltaban nunca ocurren, por eso las tareas siguientes no se ejecutan.

**¿Por qué `forEach` no sirve?** `forEach` llama a tu callback por cada elemento, uno tras otro, **sin esperar** lo que devuelve. Si el callback es `async`, devuelve una promesa que `forEach` ignora. Resultado: todas las tareas empiezan a la vez en t = 0 y `forEach` termina antes de que ninguna acabe.

## Errores comunes

- **Usar `forEach` con `async`.** `tareas.forEach(async (t) => resultados.push(await t()))` arranca todas a la vez y devuelve `[]` porque nadie esperó. Lo reconoces porque recibes `[]` y en el registro aparece "empieza lenta, empieza rápida" al principio.
- **Usar `map` + `Promise.all`.** `Promise.all(tareas.map((t) => t()))` da los resultados en orden, pero las ejecuta **en paralelo**. Lo reconoces porque el test "cada tarea empieza solo cuando terminó la anterior" falla: las dos empiezan juntas y "rápida" termina primero.
- **Olvidar el `await`: `resultados.push(tarea())`.** Guardas promesas en vez de valores, y además todas empiezan a la vez. Lo reconoces porque recibes un arreglo de promesas (`[Promise {}, Promise {}]`) en vez de los nombres.
- **Guardar promesas y no llamar: `await tarea` sin paréntesis.** `await` sobre una función (que no es promesa) te devuelve la misma función. Recibes un arreglo de funciones.
- **Envolver en `try/catch` y seguir.** Si atrapas el error dentro del bucle y continúas, ejecutas tareas que no debías. El enunciado pide detenerse en el primer fallo.

## Otra forma de resolverlo

Con `reduce`, encadenando promesas sin `async/await` (así se hacía antes de que existiera `await`):

```js
export function enSerie(tareas) {
  return tareas.reduce(
    (cadena, tarea) =>
      cadena.then((resultados) => tarea().then((valor) => [...resultados, valor])),
    Promise.resolve([]),
  );
}
```

Empiezas con una promesa ya cumplida con `[]`. Cada vuelta del `reduce` agrega un eslabón: "cuando termine todo lo anterior, ejecuta esta tarea y agrega su valor". Como cada `.then` espera al anterior, quedan en serie.

**¿Cuál conviene?** El `for...of` con `await` es mucho más claro y es el que deberías escribir. La versión con `reduce` aparece en código antiguo y a veces la preguntan para ver si entiendes que `.then` encadena. Lo importante es tener clara la diferencia: **en serie** (`for...of` + `await`) los tiempos se suman; **en paralelo** (`Promise.all`) el tiempo total es el de la más lenta.

## Cómo explicarlo en la entrevista

> "Recorro las tareas con un `for...of` dentro de una función `async` y en cada vuelta hago `await` de la tarea. Así el bucle se pausa hasta que esa tarea termina, y la siguiente recién empieza después. Voy guardando cada resultado en un arreglo, que queda en orden. Si una tarea se rechaza, el `await` lanza el error y la función se detiene ahí. No uso `forEach` porque no espera a los callbacks `async`, ni `Promise.all` porque eso las corre en paralelo."

## Conceptos

- **En serie**: una operación empieza solo cuando terminó la anterior; el tiempo total es la suma.
- **En paralelo**: todas empiezan a la vez; el tiempo total es el de la más lenta.
- **`for...of` con `await`**: el `await` pausa el bucle completo, vuelta por vuelta.
- **`forEach` con `async`**: no espera; lanza todos los callbacks y termina de inmediato.
- **Tarea como función (`() => promesa`)**: permite decidir cuándo empieza; una promesa ya creada, en cambio, ya está corriendo.
- **`await` sobre una promesa rechazada**: lanza el error como si fuera un `throw`.
