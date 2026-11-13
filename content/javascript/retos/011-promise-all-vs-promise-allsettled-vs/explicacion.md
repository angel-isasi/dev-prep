## Idea clave

Las cuatro combinan varias promesas, pero responden distinto a dos preguntas: **¿esperan a todas o a una?** y **¿qué hacen si alguna falla?**

| Método | Espera a | Se cumple con | Se rechaza cuando |
|---|---|---|---|
| `Promise.all` | todas | arreglo de valores | **una** falla (la primera) |
| `Promise.allSettled` | todas | arreglo de `{ status, value / reason }` | nunca |
| `Promise.race` | la primera en terminar | su valor | la primera en terminar falla |
| `Promise.any` | la primera que sale bien | su valor | **todas** fallan (`AggregateError`) |

## Paso a paso

1. `todasONada` devuelve `Promise.all(promesas)` tal cual.
2. `resumenDeEstados` espera `Promise.allSettled(promesas)`, que da objetos como `{ status: "fulfilled", value: "a" }` o `{ status: "rejected", reason: Error }`, y se queda solo con `status` usando `map`.
3. `primeraEnTerminar` devuelve `Promise.race(promesas)`.
4. `primeraExitosa` devuelve `Promise.any(promesas)`.

```js
export function todasONada(promesas) {
  return Promise.all(promesas);
}

export async function resumenDeEstados(promesas) {
  const resultados = await Promise.allSettled(promesas);
  return resultados.map((resultado) => resultado.status);
}

export function primeraEnTerminar(promesas) {
  return Promise.race(promesas);
}

export function primeraExitosa(promesas) {
  return Promise.any(promesas);
}
```

## Por qué funciona

Mira qué hace cada una con las mismas dos promesas: `ok("a", 5)` (sale bien a los 5 ms) y `ko("b", 1)` (falla a los 1 ms):

| Método | 1 ms: falla `b` | 5 ms: llega `a` | Resultado |
|---|---|---|---|
| `all` | se rechaza **ya** | se ignora | rechazo con "b" |
| `allSettled` | anota "rejected" | anota "fulfilled" | `["fulfilled", "rejected"]` (orden original, no de llegada) |
| `race` | gana `b` | se ignora | rechazo con "b" |
| `any` | la ignora y sigue esperando | gana `a` | `"a"` |

Fíjate en `race` y `any`: con las mismas promesas, una se rechaza y la otra se cumple. `race` no distingue éxito de fracaso: se queda con lo primero que pase. `any` solo cuenta los éxitos.

Cuando todas fallan, `any` se rechaza con un `AggregateError`, un error especial que trae la lista de todos los errores en su propiedad `errors`.

## Errores comunes

- **Usar `all` donde va `allSettled`.** Con una sola falla pierdes todos los demás resultados. Lo reconoces porque `resumenDeEstados` se rechaza en vez de devolver los estados.
- **Devolver directamente lo que da `allSettled`.** Recibes objetos `{ status, value }` en vez de textos. Lo reconoces porque el test muestra `[{ status: "fulfilled", value: "a" }, ...]`.
- **Confundir `race` con `any`.** Con `race`, si la más rápida falla, todo falla. Lo reconoces porque `primeraExitosa` se rechaza con "x".
- **Olvidar el `await` en `resumenDeEstados`.** Haces `.map` sobre una promesa y salta "map is not a function".
- **Pensar que `race` cancela las demás.** No las detiene: siguen corriendo, solo que su resultado se ignora.

## Otra forma de resolverlo

`resumenDeEstados` sin `async/await`, encadenando `.then`:

```js
export function resumenDeEstados(promesas) {
  return Promise.allSettled(promesas).then((resultados) => resultados.map((r) => r.status));
}
```

Es equivalente. Y un uso real de `race`, el **tiempo límite**:

```js
const limite = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("Tiempo agotado")), 5000));
const datos = await Promise.race([fetch("/api/cortos"), limite]);
```

Si la petición tarda más de 5 segundos, gana el rechazo. Conviene recordarlo para la entrevista: es el ejemplo típico que piden después de la teoría.

## Cómo explicarlo en la entrevista

> "`all` espera a todas y falla si una falla: lo uso cuando necesito todos los datos juntos, como el perfil y los pedidos para pintar la pantalla. `allSettled` espera a todas y me dice cuál salió bien y cuál mal: para operaciones independientes, como subir varias fotos. `race` se queda con la primera que termine, bien o mal: útil para poner un tiempo límite. `any` se queda con la primera que sale bien y solo falla si todas fallan, con un `AggregateError`: por ejemplo, para usar el primer servidor espejo que responda."

## Conceptos

- **`Promise.all`**: todas o nada; rechaza rápido con el primer error.
- **`Promise.allSettled`**: espera a todas y describe cada resultado con `status` (`"fulfilled"` o `"rejected"`), `value` o `reason`.
- **`Promise.race`**: el primero que termine decide, sea éxito o error.
- **`Promise.any`**: el primer éxito decide; si todas fallan, `AggregateError`.
- **`AggregateError`**: error que agrupa varios errores en su propiedad `errors`.
- **Estados de una promesa**: pendiente, cumplida (fulfilled) o rechazada (rejected).
