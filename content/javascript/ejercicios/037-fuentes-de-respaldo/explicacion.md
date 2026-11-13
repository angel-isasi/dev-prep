## Idea clave

Recorre las fuentes con un `for...of` y envuelve cada intento en `try/catch`. Dentro del `try`, `return await fuente()`: si la fuente funciona, sales de la función con su valor; si falla, el `await` lanza el error, el `catch` lo atrapa, lo guardas y el bucle sigue con la siguiente. Si se acaban las fuentes, lanzas el último error.

## Paso a paso

1. **Prepara el error por defecto**: `let ultimoError = new Error("No hay fuentes")`. Si la lista está vacía, el bucle no da ninguna vuelta y se lanza este.
2. **Recorre las fuentes en orden** con `for...of`, para poder hacer `await` y para poder salir con `return` en medio del bucle.
3. **Intenta la fuente**: `return await fuente()`. El `await` espera el resultado; si se cumple, el `return` termina la función ahí mismo y las demás fuentes nunca se llaman.
4. **Si falla**, `await` lanza el error dentro del `try`, el `catch` lo recibe y lo guardas en `ultimoError`. El bucle pasa a la siguiente vuelta.
5. **Si el bucle termina**, es que ninguna funcionó: `throw ultimoError`. En una función `async`, un `throw` rechaza su promesa.

```js
export async function intentarEnOrden(fuentes) {
  let ultimoError = new Error("No hay fuentes");

  for (const fuente of fuentes) {
    try {
      return await fuente();
    } catch (error) {
      ultimoError = error;
    }
  }

  throw ultimoError;
}
```

## Por qué funciona

Recorrido con `[caido, respaldo, otra]`:

| Vuelta | Fuente | Qué pasa | `ultimoError` |
|---|---|---|---|
| inicio | | | `Error("No hay fuentes")` |
| 1 | `caido` | su promesa se rechaza; `await` lanza; el `catch` lo atrapa | `Error("caído")` |
| 2 | `respaldo` | su promesa se cumple con `"respaldo"`; `return` sale de la función | `Error("caído")` |
| 3 | `otra` | nunca llega a ejecutarse | |

**¿Por qué `return await` y no solo `return`?** Es la clave del ejercicio. Mira la diferencia:

- `return fuente()` devuelve la promesa **tal cual**, todavía pendiente. La función sale del `try` en ese mismo instante. Cuando, más tarde, esa promesa se rechace, ya no estás dentro del `try`: el `catch` no se entera y el rechazo sale directo hacia quien llamó a `intentarEnOrden`.
- `return await fuente()` **espera** a la promesa mientras sigue dentro del `try`. Si se rechaza, el `await` lanza el error ahí mismo, dentro del `try`, y el `catch` lo atrapa.

Regla práctica: `try/catch` solo atrapa errores de promesas que esperas con `await` dentro del bloque.

## Errores comunes

- **Escribir `return fuente()` sin `await`.** El `catch` nunca se ejecuta. Lo reconoces porque con `[caido, respaldo]` recibes el error "caído" en vez de `"respaldo"`.
- **Comprobar el resultado con `if (resultado)`.** Si una fuente devuelve `0`, `""` o `null` lo tomas como fallo y sigues probando. El éxito se define por **no rechazar**, no por el valor. Lo reconoces porque falla el test del resultado "falsy".
- **Usar `Promise.any(fuentes.map((f) => f()))`.** Devuelve la primera que funcione, pero llama a todas **a la vez**. Lo reconoces porque el test "no llama a las fuentes que vienen después" dice que `respaldo` sí fue llamada.
- **Usar `forEach` con un callback `async`.** No puedes salir de la función con `return` desde dentro del callback, y además `forEach` no espera. Terminas lanzando todas a la vez y devolviendo `undefined`.
- **Olvidar el caso vacío.** Si inicias `let ultimoError;` sin valor y la lista está vacía, terminas haciendo `throw undefined`. Lo reconoces porque el test de la lista vacía dice que el error recibido no tiene mensaje.

## Otra forma de resolverlo

Con `.catch` encadenados, sin `async/await`: cada fuente se intenta solo si la anterior falló.

```js
export function intentarEnOrden(fuentes) {
  return fuentes.reduce(
    (cadena, fuente) => cadena.catch(() => fuente()),
    Promise.reject(new Error("No hay fuentes")),
  );
}
```

Empiezas con una promesa ya rechazada. Cada `.catch` dice "si lo anterior falló, prueba esta fuente". Si una fuente funciona, la cadena pasa a estar cumplida y los `.catch` siguientes ya no se ejecutan (un `.catch` solo corre cuando hay un rechazo), así que las demás fuentes no se llaman. Si todas fallan, queda el rechazo de la última.

Y si **sí** quisieras correrlas todas a la vez y quedarte con la primera que funcione, existe `Promise.any`, que rechaza con un `AggregateError` si todas fallan.

**¿Cuál conviene?** El `for...of` con `try/catch` se lee como el enunciado y es fácil de depurar; es el que deberías escribir. La de `reduce` con `.catch` es elegante y sirve para mostrar que entiendes cómo se encadenan los rechazos. `Promise.any` es para otro problema: cuando la velocidad importa más que no molestar a los servidores de respaldo.

## Cómo explicarlo en la entrevista

> "Recorro las fuentes en orden con un `for...of` y en cada vuelta hago `return await fuente()` dentro de un `try`. Si se cumple, salgo con el resultado y no llamo a las demás. Si se rechaza, el `await` lanza el error dentro del `try`, lo atrapo, lo guardo y paso a la siguiente. Si se acaban, lanzo el último error. El `await` es clave: sin él, la función devolvería la promesa pendiente y saldría del `try` antes de que se rechace, y el `catch` nunca la vería."

## Conceptos

- **`try/catch` con `await`**: un rechazo esperado con `await` dentro del `try` se comporta como un `throw` y lo atrapa el `catch`.
- **`return await` dentro de `try`**: necesario para que el rechazo ocurra mientras sigues dentro del bloque.
- **`throw` en una función `async`**: rechaza la promesa que devuelve la función.
- **Salir del bucle con `return`**: en `for...of` puedes terminar la función en medio del recorrido; en `forEach` no.
- **`Promise.any`**: corre todas en paralelo y se cumple con la primera que se cumpla.
- **`.catch(fn)`**: solo se ejecuta si la promesa anterior se rechazó; si estaba cumplida, deja pasar el valor.
