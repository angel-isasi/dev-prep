## Idea clave

JavaScript ejecuta **un solo código a la vez**. El orden es siempre: 1) todo el código síncrono, 2) **todas** las microtareas pendientes (`.then`, continuaciones de `await`), 3) **una** macrotarea (`setTimeout`) y vuelta al paso 2. Por eso una promesa resuelta va antes que un `setTimeout` de 0 ms.

## Paso a paso

1. **Recorre el fragmento de arriba abajo** y anota lo síncrono en el orden en que aparece.
2. **Anota en una cola de microtareas** cada `.then` de una promesa ya resuelta y cada continuación después de un `await`.
3. **Anota en una cola de macrotareas** cada `setTimeout`.
4. **Al terminar lo síncrono**, vacía las microtareas (si una crea otra microtarea, también se ejecuta en esta tanda).
5. **Toma una macrotarea**, ejecútala y vuelve a vaciar las microtareas que haya creado. Repite.

```js
export const prediccion1 = ["1 síncrono", "2 síncrono", "microtarea (promesa)", "macrotarea (setTimeout)"];
export const prediccion2 = ["A", "B", "C", "D"];
export const prediccion3 = ["A", "B", "C", "D"];
export const prediccion4 = ["M1", "T1", "M dentro de T1", "T2"];
```

## Por qué funciona

**Fragmento 1**: lo síncrono son `"1 síncrono"` y `"2 síncrono"`. El `setTimeout` va a macrotareas aunque sea de 0 ms; el `.then` va a microtareas. Al terminar lo síncrono se vacían las microtareas y recién después corre el `setTimeout`.

**Fragmento 2**: llamar a `tarea()` ejecuta su cuerpo **de forma síncrona** hasta el `await`: por eso `"B"` sale antes que `"C"`. El `await null` pausa la función y deja el resto (`registrar("D")`) como microtarea. El código de afuera sigue con `"C"`, y al final corre la microtarea: `"D"`.

**Fragmento 3**: la función que le pasas a `new Promise` (el "executor") se ejecuta **en el momento**, así que `"B"` es síncrono. `resolver()` resuelve la promesa, pero el `.then` igual va a la cola de microtareas: `"D"` sale después de `"C"`.

**Fragmento 4**:

| Paso | Qué corre | Cola de microtareas | Cola de macrotareas | Registrado |
|---|---|---|---|---|
| síncrono | programa T1, T2 y la microtarea M1 | M1 | T1, T2 | |
| microtareas | M1 | (vacía) | T1, T2 | M1 |
| macrotarea | T1, que crea una microtarea | M dentro de T1 | T2 | M1, T1 |
| microtareas | M dentro de T1 | (vacía) | T2 | ..., M dentro de T1 |
| macrotarea | T2 | | (vacía) | ..., T2 |

La clave del 4: entre una macrotarea y la siguiente **siempre** se vacían las microtareas. Por eso `"M dentro de T1"` se cuela antes que `"T2"`.

## Errores comunes

- **Poner el `setTimeout` de 0 ms antes que la promesa.** El 0 no significa "ahora": significa "en la próxima macrotarea, como pronto". Lo reconoces porque el test del fragmento 1 muestra la macrotarea al final.
- **Creer que todo lo de una función `async` es asíncrono.** Hasta el primer `await` es síncrono. Lo reconoces si predijiste `["A", "C", "B", "D"]`.
- **Creer que el cuerpo de `new Promise` espera.** Es síncrono; solo `.then`, `.catch` y `.finally` esperan. Lo reconoces si predijiste `"B"` después de `"C"`.
- **Ejecutar todas las macrotareas seguidas.** Lo reconoces si en el fragmento 4 pusiste `"T2"` antes que `"M dentro de T1"`.
- **Escribir los textos distinto.** El test compara textos exactos: `"microtarea (promesa)"` no es lo mismo que `"microtarea"`.

## Otra forma de resolverlo

Una técnica para no equivocarte en la entrevista: dibuja **tres columnas** en un papel y recorre el código una sola vez.

```
SÍNCRONO          MICROTAREAS              MACROTAREAS
1 síncrono        microtarea (promesa)     macrotarea (setTimeout)
2 síncrono
```

Después lees la primera columna completa, luego la segunda y luego la tercera, una fila a la vez, volviendo a mirar la columna de microtareas después de cada macrotarea por si apareció algo nuevo. Es más lento que hacerlo de cabeza, pero casi no falla, y explicarlo así en voz alta muestra que entiendes el modelo.

Un detalle que suma puntos: `queueMicrotask(fn)` agrega una microtarea directamente, igual que `Promise.resolve().then(fn)`. Y `setTimeout` en el navegador tiene un mínimo de unos 4 ms cuando se anida muchas veces.

## Cómo explicarlo en la entrevista

> "JavaScript tiene un solo hilo. Primero ejecuta todo el código síncrono. Cuando la pila de llamadas queda vacía, vacía la cola de microtareas, que son los `.then` de las promesas y lo que viene después de un `await`. Recién después toma una macrotarea, como un `setTimeout`, y al terminarla vuelve a vaciar las microtareas. Por eso una promesa resuelta va antes que un `setTimeout` de 0 ms. Ojo con dos trampas: el cuerpo de `new Promise` es síncrono, y una función `async` corre de forma síncrona hasta su primer `await`."

## Conceptos

- **Event loop**: el ciclo que decide qué código corre después de que termina lo síncrono.
- **Pila de llamadas (call stack)**: donde se ejecuta el código síncrono; el event loop solo actúa cuando está vacía.
- **Microtareas**: `.then`, `.catch`, `.finally`, continuaciones de `await` y `queueMicrotask`; se vacían todas de una vez.
- **Macrotareas**: `setTimeout`, `setInterval` y eventos del usuario; se toma una por vuelta.
- **Executor de `new Promise`**: la función que le pasas al constructor; se ejecuta al instante.
- **`async/await`**: una función `async` es síncrona hasta el primer `await`; lo demás es microtarea.
