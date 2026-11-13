## Idea clave

JavaScript ejecuta primero **todo el código síncrono**. Cuando termina, vacía **toda la cola de microtareas** (callbacks de promesas y lo que sigue a un `await`). Recién después toma **una** macrotarea (por ejemplo, un `setTimeout`), la ejecuta, vuelve a vaciar las microtareas, y repite. Las microtareas siempre se cuelan antes que el siguiente temporizador.

## Paso a paso

1. **Recorre el código de arriba abajo** y anota lo que se ejecuta ya (síncrono). Ojo: el executor de `new Promise` y el inicio de una función `async` (hasta el primer `await`) también son síncronos.
2. **Anota en una cola de microtareas** cada `.then` cuya promesa ya esté cumplida, y cada continuación después de un `await`, en el orden en que se registran.
3. **Anota en una cola de macrotareas** cada `setTimeout`.
4. **Al terminar lo síncrono**, ejecuta las microtareas en orden. Si alguna agrega otra microtarea (un `.then` encadenado), va **al final** de la cola, pero se ejecuta en esta misma ronda.
5. **Ejecuta una macrotarea** y vuelve al paso 4 por si dejó microtareas nuevas.

```js
// Fragmento 1: síncrono (A, D), microtarea (C), macrotarea (B).
export const prediccion1 = ["A", "D", "C", "B"];

// Fragmento 2: síncrono (A, E), microtareas en orden de llegada (C, luego lo que sigue al await: D), macrotarea (B).
export const prediccion2 = ["A", "E", "C", "D", "B"];

// Fragmento 3: el executor de new Promise es síncrono (B, C). Microtareas: D, G y recién después E. Macrotarea: F.
export const prediccion3 = ["A", "B", "C", "H", "D", "G", "E", "F"];

// Fragmento 4: síncrono (D). Primer timer (A) y sus microtareas (B) antes del segundo timer (C).
export const prediccion4 = ["D", "A", "B", "C"];
```

## Por qué funciona

**Fragmento 1.** Síncrono: `A`, `D`. Al terminar, microtareas: `[C]`. Macrotareas: `[B]`. Orden: `A D C B`. Aunque el `setTimeout` tiene 0 ms, **nunca** se adelanta a una promesa.

**Fragmento 2.** Recorrido con las colas:

| Paso | Qué se ejecuta | Microtareas | Macrotareas | Impreso |
|---|---|---|---|---|
| 1 | `principal()` empieza: `log("A")` | | | A |
| 2 | `setTimeout` | | B | A |
| 3 | `Promise.resolve().then(...)` | C | B | A |
| 4 | `await null`: pausa `principal` y encola su continuación | C, D | B | A |
| 5 | `principal` devolvió el control: `log("E")` | C, D | B | A E |
| 6 | Se acaba lo síncrono: microtareas | | B | A E C D |
| 7 | Macrotarea | | | A E C D B |

Fíjate en el paso 4: `await` no espera "nada" aunque le pases `null`. Siempre pausa la función y deja el resto para una microtarea. Por eso `E` sale antes que `D`.

**Fragmento 3.** El que más confunde:

| Paso | Qué pasa | Microtareas | Macrotareas | Impreso |
|---|---|---|---|---|
| 1 | `log("A")` | | | A |
| 2 | El executor corre **ya**: `log("B")`, `resolver()`, `log("C")`. `resolver` no corta la función. | | | A B C |
| 3 | `promesa.then(D)`: la promesa ya está cumplida, así que D entra a la cola. El `.then(E)` queda **esperando** a que D termine. | D | | A B C |
| 4 | `setTimeout` | D | F | A B C |
| 5 | `Promise.resolve().then(G)` | D, G | F | A B C |
| 6 | `log("H")` | D, G | F | A B C H |
| 7 | Microtarea D. Al terminar, su promesa se cumple y **ahora sí** E entra a la cola, al final. | G, E | F | ... H D |
| 8 | Microtarea G | E | F | ... H D G |
| 9 | Microtarea E | | F | ... H D G E |
| 10 | Macrotarea F | | | ... E F |

Resultado: `A B C H D G E F`.

**Fragmento 4.** Síncrono: solo `D`. Macrotareas: `[timer1, timer2]`. Se ejecuta timer1: imprime `A` y encola la microtarea `B`. **Antes** de pasar a timer2, se vacían las microtareas: sale `B`. Luego timer2: `C`. Resultado: `D A B C`.

## Errores comunes

- **Creer que `setTimeout(fn, 0)` es inmediato.** El 0 es el tiempo **mínimo**: igual va a la cola de macrotareas y espera a todo lo síncrono y a todas las microtareas. Si pones `B` antes que `C` en el fragmento 1, es este error.
- **Pensar que el executor de `new Promise` es asíncrono.** Corre al instante, en el mismo momento en que creas la promesa. Y llamar a `resolver()` no detiene la función: `C` se imprime igual. Lo reconoces si pusiste `B` o `C` después de `H` en el fragmento 3.
- **Poner los `.then` encadenados seguidos.** En el fragmento 3, `E` no entra a la cola junto con `D`: entra cuando `D` termina, y para entonces `G` ya estaba esperando. Si escribiste `D E G`, es este error.
- **Creer que `await` de algo que no es promesa no pausa.** `await null` igual pausa la función y continúa en una microtarea. Si en el fragmento 2 pusiste `D` antes que `E`, es este error.
- **Ejecutar todos los temporizadores juntos.** Entre un `setTimeout` y el siguiente se vacían las microtareas. Si en el fragmento 4 pusiste `A C B`, es este error.

## Otra forma de resolverlo

Otra forma de verlo, útil para explicarlo en voz alta, es pensar en tres "carriles" con prioridad:

```text
1. Pila de llamadas (código síncrono)       -> siempre primero, hasta vaciarse
2. Cola de microtareas (promesas, await)    -> se vacía COMPLETA cada vez que la pila queda vacía
3. Cola de macrotareas (setTimeout, eventos) -> se toma UNA, y se vuelve al carril 2
```

Y si quieres comprobar tu razonamiento **después** de predecir, puedes pegar cualquier fragmento en un archivo con `const log = console.log;` y ejecutarlo con `node archivo.js`. Úsalo para confirmar, no para adivinar: en la entrevista no vas a tener la consola.

**¿Cuál conviene?** Para fragmentos cortos, el modelo de tres carriles basta. Para los que tienen `.then` encadenados o `await` dentro de funciones, dibuja la tabla de colas paso a paso como arriba: es más lento pero no falla.

## Cómo explicarlo en la entrevista

> "Primero se ejecuta todo lo síncrono, incluido el executor de `new Promise` y el inicio de una función `async` hasta su primer `await`. Cuando la pila de llamadas queda vacía, el event loop vacía la cola de microtareas completa: ahí van los callbacks de `.then` y las continuaciones de los `await`, en el orden en que se encolaron. Recién después toma una macrotarea, como un `setTimeout`, y después de cada una vuelve a vaciar las microtareas. Por eso un `setTimeout` con 0 ms siempre sale después de una promesa ya resuelta."

## Conceptos

- **Event loop**: el ciclo que, cuando la pila está vacía, ejecuta microtareas y luego macrotareas, una por una.
- **Pila de llamadas (call stack)**: donde corre el código síncrono; mientras tenga algo, nada más se ejecuta.
- **Microtarea**: callbacks de `.then`/`.catch`/`.finally`, continuaciones de `await` y `queueMicrotask`; se vacían todas juntas.
- **Macrotarea**: callbacks de `setTimeout`, `setInterval` y eventos; se ejecuta una por vuelta del event loop.
- **Executor de `new Promise`**: la función que le pasas al constructor; se ejecuta de forma síncrona.
- **`await`**: siempre pausa la función `async` y la retoma en una microtarea, aunque el valor no sea una promesa.
- **`.then` encadenado**: entra a la cola solo cuando la promesa anterior de la cadena se cumple.
