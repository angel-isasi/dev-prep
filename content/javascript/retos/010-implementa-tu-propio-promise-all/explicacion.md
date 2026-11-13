## Idea clave

Creas una promesa nueva y te suscribes a cada elemento. Cada resultado se guarda **en su índice** y un **contador de pendientes** baja con cada éxito; cuando llega a cero, cumples con el arreglo completo. Al primer rechazo, rechazas.

## Paso a paso

1. **Devuelve `new Promise((resolver, rechazar) => ...)`**: tú decides cuándo se cumple o se rechaza.
2. **Prepara** `resultados = []` y `pendientes = promesas.length`.
3. **Caso vacío**: si no hay nada que esperar, `resolver([])` de inmediato. Sin esto, el contador nunca llegaría a cero "bajando" y la promesa quedaría pendiente para siempre.
4. **Recorre con `forEach((promesa, i) => ...)`** para tener el índice.
5. **Envuelve con `Promise.resolve(promesa)`**: si es una promesa, la deja igual; si es un valor como `2`, lo convierte en una promesa cumplida. Así todo tiene `.then`.
6. **En el `.then` de éxito**: guarda `resultados[i] = valor`, baja `pendientes` y, si llegó a 0, `resolver(resultados)`.
7. **Como segundo argumento de `.then`, pasa `rechazar`**: el primer error rechaza la promesa grande.

```js
export function promiseAll(promesas) {
  return new Promise((resolver, rechazar) => {
    const resultados = [];
    let pendientes = promesas.length;

    if (pendientes === 0) {
      resolver([]);
      return;
    }

    promesas.forEach((promesa, i) => {
      Promise.resolve(promesa).then((valor) => {
        resultados[i] = valor;
        pendientes--;
        if (pendientes === 0) resolver(resultados);
      }, rechazar);
    });
  });
}
```

## Por qué funciona

Línea de tiempo con `promiseAll([demora("a", 30), demora("b", 10), demora("c", 20)])`:

| Tiempo | Termina | `resultados` | `pendientes` |
|---|---|---|---|
| 0 ms | (nada) | `[]` | 3 |
| 10 ms | `"b"` (índice 1) | `[ , "b"]` | 2 |
| 20 ms | `"c"` (índice 2) | `[ , "b", "c"]` | 1 |
| 30 ms | `"a"` (índice 0) | `["a", "b", "c"]` | 0: se cumple |

Aunque `"b"` llegó primero, quedó en la posición 1 porque se guardó con su índice. Con `push` habrías obtenido `["b", "c", "a"]`.

¿Y si dos promesas fallan? Una promesa solo puede cambiar de estado **una vez**: el primer `rechazar` gana y las llamadas siguientes a `rechazar` o `resolver` se ignoran. Por eso no necesitas una bandera extra.

## Errores comunes

- **Usar `resultados.push(valor)`.** Los resultados quedan en orden de llegada. Lo reconoces porque el test del orden recibe `["b", "c", "a"]`.
- **Revisar `resultados.length === promesas.length` en vez de un contador.** Si la última en llegar es la de índice 2, `resultados[2] = valor` hace que `length` sea 3 aunque falten las de índice 0 y 1, y cumples antes de tiempo con huecos `undefined`.
- **Olvidar el caso vacío.** La promesa nunca se cumple y el test se queda esperando hasta el límite de tiempo.
- **Llamar `promesa.then` sin `Promise.resolve`.** Con un valor normal como `2` falla con "promesa.then is not a function".
- **No pasar `rechazar`.** El error se pierde y la promesa grande queda pendiente para siempre.
- **Usar `async/await` en un bucle: `for (const p of promesas) resultados.push(await p)`.** Funciona para los valores, pero no rechaza "de inmediato": espera a la lenta antes de ver el error. Lo reconoces porque el test del rechazo rápido llega con `error` todavía en `null`.

## Otra forma de resolverlo

Con `for...of` sobre `entries()` y `.catch`, sin `forEach`:

```js
export function promiseAll(promesas) {
  return new Promise((resolver, rechazar) => {
    const resultados = new Array(promesas.length);
    let pendientes = promesas.length;
    if (pendientes === 0) return resolver(resultados);

    for (const [i, promesa] of promesas.entries()) {
      Promise.resolve(promesa)
        .then((valor) => {
          resultados[i] = valor;
          if (--pendientes === 0) resolver(resultados);
        })
        .catch(rechazar);
    }
  });
}
```

`promesas.entries()` da pares `[índice, valor]` y `.catch(rechazar)` hace lo mismo que el segundo argumento de `.then`. Es cuestión de estilo: algunos encuentran más legible el `.then().catch()`. Lo importante en cualquier versión es el índice y el contador.

## Cómo explicarlo en la entrevista

> "Devuelvo una promesa nueva. Me suscribo a cada elemento envolviéndolo con `Promise.resolve`, para aceptar también valores que no son promesas. Guardo cada resultado en su índice original, no en el orden en que terminan, y llevo un contador de pendientes: cuando llega a cero, cumplo con el arreglo. Si cualquiera falla, rechazo de inmediato; como una promesa solo cambia de estado una vez, los demás resultados ya no importan. El arreglo vacío lo resuelvo al inicio, porque si no quedaría pendiente para siempre."

## Conceptos

- **`new Promise((resolver, rechazar) => ...)`**: crea una promesa que tú cumples o rechazas llamando a esas funciones.
- **`Promise.resolve(x)`**: convierte cualquier valor en promesa; si ya es promesa, la deja igual.
- **`.then(alCumplir, alRechazar)`**: el segundo argumento recibe el error.
- **Estados de una promesa**: pendiente, cumplida o rechazada; solo cambia una vez.
- **Contador de pendientes**: patrón para saber cuándo terminaron varias tareas asíncronas.
- **`Promise.all`**: espera a todas y falla rápido si una falla.
