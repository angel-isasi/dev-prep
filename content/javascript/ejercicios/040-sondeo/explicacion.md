## Idea clave

Un `for` con un máximo de `intentos` vueltas dentro de una función `async`. En cada vuelta consultas con `await`; si la respuesta es verdadera, sales con `return`; si no, esperas `intervalo` ms con una promesa de `setTimeout` (salvo en la última vuelta) y repites. Si el bucle se acaba, lanzas el error.

## Paso a paso

1. **Prepara una función `esperar(ms)`** que devuelva una promesa con `setTimeout` (la del ejercicio "Esperar"). Es la que te permite pausar entre consultas con `await`.
2. **Recorre con `for (let i = 0; i < intentos; i++)`**. Cada vuelta es una consulta. Usas un `for` con contador porque necesitas saber cuál es la última.
3. **Consulta y espera la respuesta**: `const resultado = await consultar()`.
4. **Si está listo, sal**: `if (resultado) return resultado`. El `return` termina la función (y el bucle) y la promesa de `sondear` se cumple con ese valor.
5. **Si no, espera antes de la siguiente**, pero solo si quedan intentos: `if (!esUltimo) await esperar(intervalo)`.
6. **Si el bucle termina**, ninguna consulta tuvo éxito: `throw new Error("Se agotaron los intentos")`, que rechaza la promesa de `sondear`.

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function sondear(consultar, intervalo, intentos) {
  for (let i = 0; i < intentos; i++) {
    const resultado = await consultar();
    if (resultado) return resultado;

    const esUltimo = i === intentos - 1;
    if (!esUltimo) await esperar(intervalo);
  }

  throw new Error("Se agotaron los intentos");
}
```

## Por qué funciona

Línea de tiempo con `sondear(consultar, 100, 3)` y una `consultar` que responde `"publicado"` en la tercera llamada:

| Momento | `i` | Qué pasa |
|---|---|---|
| t = 0 ms | 0 | Consulta 1 → `null`. No es la última: `await esperar(100)` pausa la función. |
| t = 100 ms | 1 | El temporizador cumple la espera. Consulta 2 → `null`. Espera otros 100 ms. |
| t = 200 ms | 2 | Consulta 3 → `"publicado"`. `return "publicado"`: la promesa se cumple. |

Y con una `consultar` que nunca responde, `sondear(consultar, 100, 2)`:

| Momento | `i` | Qué pasa |
|---|---|---|
| t = 0 ms | 0 | Consulta 1 → `null`. Espera 100 ms. |
| t = 100 ms | 1 | Consulta 2 → `null`. Es la última (`i === 1`): **no espera**. |
| t = 100 ms | | El bucle termina: `throw`. La promesa se rechaza a los 100 ms. |

Sin la condición `esUltimo`, el rechazo llegaría a los 200 ms: esperarías 100 ms para nada, porque después ya no consultas.

Mientras la función está pausada en un `await esperar(...)`, el programa no está bloqueado: el event loop sigue atendiendo clics, otras peticiones, lo que sea. La función "despierta" cuando el temporizador cumple la promesa.

## Errores comunes

- **Usar `setInterval`.** Parece natural ("cada X ms"), pero tienes que acordarte de pararlo con `clearInterval` en todos los caminos, y si `consultar` tarda más que el intervalo, las consultas se pisan. Con `await` en un bucle, la siguiente consulta empieza recién cuando terminó la anterior.
- **Olvidar el `await` en `consultar()`.** `resultado` es una promesa, y una promesa **siempre** es truthy. Devuelves la promesa en la primera vuelta. Lo reconoces porque el test del valor dice "llamadas: expected 1 to be 3".
- **Esperar también después de la última consulta.** El resultado es correcto, pero rechaza tarde. Lo reconoces porque falla el test "no espera después de la última consulta".
- **Esperar antes de la primera consulta.** La primera debe ser inmediata. Lo reconoces porque el test dice que a los 0 ms `consultar` se llamó 0 veces.
- **Llamar a `esperar(intervalo)` sin `await`.** Creas la promesa pero no la esperas: todas las consultas salen seguidas, sin pausa. Lo reconoces porque a los 0 ms ya hubo 3 llamadas.

## Otra forma de resolverlo

Con recursión: cada consulta, si falla, programa la siguiente llamándose a sí misma con un intento menos.

```js
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

export async function sondear(consultar, intervalo, intentos) {
  const resultado = await consultar();
  if (resultado) return resultado;
  if (intentos <= 1) throw new Error("Se agotaron los intentos");

  await esperar(intervalo);
  return sondear(consultar, intervalo, intentos - 1);
}
```

Cada llamada hace una consulta. Si no hay éxito y quedan intentos, espera y se llama de nuevo con `intentos - 1`. El caso base (`intentos <= 1`) es la última consulta: ahí se rechaza sin esperar.

En código real, el sondeo suele llevar también **retroceso exponencial** (*exponential backoff*): esperar cada vez más (100, 200, 400 ms...) para no saturar el servidor. Con el bucle es un cambio pequeño: `await esperar(intervalo * 2 ** i)`.

**¿Cuál conviene?** El bucle `for` es más directo, no acumula llamadas y es fácil agregarle el retroceso exponencial; es el que deberías escribir. La recursiva es elegante y muestra que dominas la recursión con promesas, pero cuesta un poco más seguirla en voz alta.

## Cómo explicarlo en la entrevista

> "Hago un bucle `for` con el máximo de intentos dentro de una función `async`. En cada vuelta llamo a `consultar` con `await`; si devuelve algo verdadero, salgo con ese valor. Si no, espero el intervalo con una promesa que envuelve un `setTimeout`, excepto en la última vuelta, porque ahí ya no voy a volver a consultar. Si el bucle se acaba, lanzo un error, que rechaza la promesa. Prefiero esto a `setInterval` porque cada consulta empieza recién cuando terminó la anterior y no tengo que acordarme de limpiar el intervalo. En producción le agregaría retroceso exponencial."

## Conceptos

- **Sondeo (polling)**: preguntar cada cierto tiempo si algo terminó, con un límite de intentos.
- **`await` dentro de un `for`**: pausa el bucle completo; cada vuelta empieza cuando terminó la anterior.
- **`esperar(ms)`**: promesa que envuelve un `setTimeout`, para pausar una función `async`.
- **`return` dentro del bucle**: termina la función y cumple su promesa con ese valor.
- **`throw` en una función `async`**: rechaza la promesa que devuelve.
- **Truthy / falsy**: `null`, `false`, `0`, `""` y `undefined` cuentan como "todavía no"; casi todo lo demás cuenta como "listo".
- **Retroceso exponencial**: aumentar la espera en cada intento para no saturar al servidor.
