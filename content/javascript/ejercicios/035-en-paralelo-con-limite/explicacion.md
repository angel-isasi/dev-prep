## Idea clave

Crea `limite` **trabajadores** que sacan tareas de la misma fila. Cada trabajador es una función `async` con un bucle: toma la siguiente tarea, la espera, guarda el resultado en su índice y vuelve a tomar otra, hasta que la fila se vacía. Como hay exactamente `limite` trabajadores y cada uno hace una tarea a la vez, nunca corren más de `limite`; y como cada uno toma otra apenas termina, nunca hay un carril ocioso.

## Paso a paso

1. **Prepara el arreglo de resultados** con el tamaño final: `new Array(tareas.length)`. Así puedes guardar cada resultado en su posición, aunque termine en otro orden.
2. **Crea un contador compartido** `siguiente = 0`: el índice de la próxima tarea que nadie ha tomado.
3. **Define el trabajador**: mientras `siguiente < tareas.length`, toma su índice con `const i = siguiente++` (lo lee y lo avanza en una sola instrucción), ejecuta `await tareas[i]()` y guarda en `resultados[i]`.
4. **Lanza los trabajadores**: `Math.min(limite, tareas.length)` de ellos. Cada llamada a `trabajador()` empieza a correr al instante y devuelve una promesa que se cumple cuando ese trabajador se queda sin tareas.
5. **Espera a todos** con `Promise.all(trabajadores)` y devuelve `resultados`.

```js
export async function conLimite(tareas, limite) {
  const resultados = new Array(tareas.length);
  let siguiente = 0;

  async function trabajador() {
    while (siguiente < tareas.length) {
      const i = siguiente++;
      resultados[i] = await tareas[i]();
    }
  }

  const cantidad = Math.min(limite, tareas.length);
  const trabajadores = Array.from({ length: cantidad }, () => trabajador());
  await Promise.all(trabajadores);
  return resultados;
}
```

## Por qué funciona

Línea de tiempo con `[A (100 ms), B (10 ms), C (10 ms), D (10 ms)]` y límite 2. Llamemos T1 y T2 a los trabajadores:

| Momento | T1 | T2 | `siguiente` |
|---|---|---|---|
| t = 0 ms | toma i = 0, empieza A | toma i = 1, empieza B | 2 |
| t = 10 ms | sigue con A | B termina, `resultados[1] = "B"`; toma i = 2, empieza C | 3 |
| t = 20 ms | sigue con A | C termina; toma i = 3, empieza D | 4 |
| t = 30 ms | sigue con A | D termina; `siguiente` (4) ya no es menor que 4: sale del `while` y termina | 4 |
| t = 100 ms | A termina, `resultados[0] = "A"`; no quedan tareas, termina | | 4 |

`Promise.all` se cumple a los 100 ms, cuando terminaron los dos trabajadores, y `resultados` es `["A", "B", "C", "D"]` porque cada valor se guardó en su índice.

**¿Por qué `siguiente++` es seguro?** JavaScript ejecuta tu código en **un solo hilo**: un trabajador corre hasta llegar a un `await` y recién ahí cede el control. La línea `const i = siguiente++` no tiene ningún `await` en medio, así que nadie puede "colarse" entre leer el valor y aumentarlo. Dos trabajadores nunca toman el mismo índice. En lenguajes con hilos de verdad (Java, C++) esto necesitaría un candado.

**¿Por qué no hacerlo por grupos?** Partir las tareas en grupos de 2 y hacer `Promise.all` por grupo funciona, pero desperdicia tiempo: el grupo `[A, B]` espera a A (100 ms) aunque B terminó a los 10. Con trabajadores, el carril de B sigue trabajando mientras A corre.

## Errores comunes

- **Hacer `Promise.all(tareas.map((t) => t()))`.** Corre todas a la vez e ignora el límite. Lo reconoces porque el test del límite dice "expected 5 to be 2".
- **Llamar las tareas antes de tiempo: `tareas.map((t) => t())` para "tenerlas listas".** En cuanto llamas a una tarea, ya empezó. Las tareas son funciones justamente para que tú decidas cuándo arrancan.
- **Guardar con `push` en vez de por índice.** Los resultados quedan en el orden en que terminaron: `["b", "c", "d", "a"]`. Lo reconoces porque el test del orden falla con los valores mezclados.
- **Procesar por grupos con `Promise.all` por lote.** Respeta el límite pero no lo aprovecha. Lo reconoces porque el test "apenas una termina, empieza la siguiente" falla: a los 30 ms C todavía no empezó porque se espera a A.
- **Crear `limite` trabajadores aunque haya menos tareas.** Con este `while` no pasa nada malo (los sobrantes salen al toque), pero si en tu versión cada trabajador toma una tarea sin revisar, llamarías `tareas[5]()` sobre `undefined` y explotaría con "is not a function".

## Otra forma de resolverlo

Con un conjunto de promesas "en vuelo" y `Promise.race`: lanzas tareas hasta llenar el límite y, cuando está lleno, esperas a que termine cualquiera para lanzar la siguiente.

```js
export async function conLimite(tareas, limite) {
  const resultados = new Array(tareas.length);
  const enVuelo = new Set();

  for (let i = 0; i < tareas.length; i++) {
    const promesa = tareas[i]().then((valor) => {
      resultados[i] = valor;
      enVuelo.delete(promesa);
    });
    enVuelo.add(promesa);
    if (enVuelo.size >= limite) await Promise.race(enVuelo);
  }

  await Promise.all(enVuelo);
  return resultados;
}
```

`Promise.race` se cumple apenas **una** de las promesas termina. El bucle se pausa ahí cuando el cupo está lleno, y continúa (lanzando la siguiente tarea) cuando se libera un lugar.

**¿Cuál conviene?** La de trabajadores es más corta y más fácil de razonar: no hay que manejar un `Set` ni pensar en cuándo se borra cada promesa. La de `Promise.race` es útil si quieres ir procesando resultados a medida que llegan. En proyectos reales se suele usar una librería como `p-limit`, pero en entrevista esperan que lo escribas tú.

## Cómo explicarlo en la entrevista

> "Uso un patrón de pool de trabajadores. Creo tantos trabajadores como el límite, y cada uno es una función `async` con un bucle que toma el siguiente índice de un contador compartido, ejecuta esa tarea con `await` y guarda el resultado en su posición, para conservar el orden. Cuando un trabajador termina una tarea, toma otra de inmediato, así que siempre hay `limite` corriendo mientras queden tareas. Espero a todos con `Promise.all`. El contador compartido es seguro porque JavaScript es de un solo hilo y no hay `await` entre leerlo y aumentarlo."

## Conceptos

- **Concurrencia limitada (pool)**: correr varias operaciones a la vez, pero con un tope.
- **Trabajador**: función `async` con un bucle que va tomando tareas de una fila compartida.
- **`Promise.all(promesas)`**: espera a que se cumplan todas y devuelve sus valores en orden; si una falla, rechaza.
- **`Promise.race(promesas)`**: se resuelve con la primera que termine, sea cumplida o rechazada.
- **Un solo hilo**: el código entre dos `await` corre sin interrupciones, por eso `siguiente++` no tiene carreras.
- **`Array.from({ length: n }, fn)`**: crea un arreglo de `n` elementos llamando a `fn` para cada uno.
- **`new Array(n)`**: arreglo con `n` posiciones vacías que puedes llenar por índice en cualquier orden.
